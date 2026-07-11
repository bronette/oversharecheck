import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { auth, signIn, signOut } from "@/auth";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OverShare Check — Find SharePoint oversharing before Copilot does",
  description:
    "Scan a SharePoint site for anonymous links, org-wide sharing, and external guests. Read-only, nothing stored. Get a shareable exposure report in minutes.",
};

async function Header() {
  const session = await auth();
  return (
    <header className="no-print border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-sm text-white">
            OS
          </span>
          OverShare Check
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {session ? (
            <>
              <Link href="/scan" className="text-slate-600 hover:text-slate-900">
                Scan
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="text-slate-500 hover:text-slate-900">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("microsoft-entra-id", { redirectTo: "/scan" });
              }}
            >
              <button className="rounded-lg bg-blue-600 px-3 py-1.5 font-medium text-white hover:bg-blue-700">
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
        <footer className="no-print border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
          OverShare Check · Read-only SharePoint exposure scanning · we store
          nothing
        </footer>
      </body>
    </html>
  );
}
