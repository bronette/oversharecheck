import Link from "next/link";
import { auth, signIn } from "@/auth";

export async function SignInCta({
  label = "Scan your first site free →",
  className = "rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700",
}: {
  label?: string;
  className?: string;
}) {
  const session = await auth();
  if (session) {
    return (
      <Link href="/scan" className={className}>
        Scan a site →
      </Link>
    );
  }
  return (
    <form
      action={async () => {
        "use server";
        await signIn("microsoft-entra-id", { redirectTo: "/scan" });
      }}
    >
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
