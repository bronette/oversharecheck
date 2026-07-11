import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { auth, signIn, signOut } from "@/auth";
import { Logo } from "@/components/logo";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://oversharecheck.com"),
  title: {
    default: "OverShare Check — Find SharePoint oversharing before Copilot does",
    template: "%s | OverShare Check",
  },
  description:
    "Scan a SharePoint site for anonymous links, org-wide sharing, and external guests. Read-only, nothing stored. Get a shareable exposure report in minutes.",
  openGraph: { siteName: "OverShare Check", type: "website" },
};

async function Header() {
  const session = await auth();
  return (
    <header className="no-print sticky top-0 z-10 border-b border-white/10 bg-[#070b16]/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {session ? (
            <>
              <Link href="/scan" className="text-slate-300 hover:text-white">
                Scan
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="text-slate-400 hover:text-white">Sign out</button>
              </form>
            </>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("microsoft-entra-id", { redirectTo: "/scan" });
              }}
            >
              <button className="grad-accent rounded-lg px-3.5 py-1.5 font-medium text-white shadow-lg shadow-blue-500/20 transition hover:brightness-110">
                Sign in
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <footer className="no-print border-t border-white/10 py-8 text-center text-xs text-slate-500">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-6">
            <Logo className="opacity-70" />
            <p>Read-only SharePoint exposure scanning · we store nothing.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
