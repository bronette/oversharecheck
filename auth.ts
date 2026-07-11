import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
      authorization: {
        params: {
          // Delegated, read-only. offline_access gives us a refresh token.
          scope: "openid profile email offline_access Sites.Read.All",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign-in: capture tokens from the provider.
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        return token;
      }

      // Still valid (60s early margin)? Use as-is.
      if (
        typeof token.expiresAt === "number" &&
        Date.now() < (token.expiresAt - 60) * 1000
      ) {
        return token;
      }

      // Expired — rotate using the refresh token.
      if (!token.refreshToken) {
        return { ...token, error: "NoRefreshToken" };
      }
      try {
        const res = await fetch(
          "https://login.microsoftonline.com/common/oauth2/v2.0/token",
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              grant_type: "refresh_token",
              client_id: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
              client_secret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
              refresh_token: token.refreshToken as string,
              scope: "openid profile email offline_access Sites.Read.All",
            }),
          },
        );
        const refreshed = await res.json();
        if (!res.ok) throw refreshed;
        return {
          ...token,
          accessToken: refreshed.access_token,
          expiresAt: Math.floor(Date.now() / 1000) + refreshed.expires_in,
          // Entra rotates refresh tokens — keep the new one if present.
          refreshToken: refreshed.refresh_token ?? token.refreshToken,
          error: undefined,
        };
      } catch {
        return { ...token, error: "RefreshFailed" };
      }
    },
    async session({ session, token }) {
      // Expose the Graph access token to server-side route handlers only.
      const s = session as { accessToken?: string; error?: string };
      s.accessToken = token.accessToken as string | undefined;
      s.error = token.error as string | undefined;
      return session;
    },
  },
});
