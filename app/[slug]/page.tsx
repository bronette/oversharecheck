import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SEO_PAGES, SEO_SLUGS } from "@/lib/seo-content";
import { SignInCta } from "@/components/sign-in-cta";

export function generateStaticParams() {
  return SEO_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = SEO_PAGES[slug];
  if (!page) return {};
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: `/${slug}` },
    openGraph: { title: page.metaTitle, description: page.metaDescription },
  };
}

export default async function SeoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = SEO_PAGES[slug];
  if (!page) notFound();

  const cta =
    "grad-accent inline-block rounded-lg px-6 py-3 font-medium text-white shadow-lg shadow-blue-500/25 transition hover:brightness-110";
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {page.title}
      </h1>
      <p className="mt-4 text-lg text-slate-300">{page.intro}</p>

      <div className="mt-8">
        <SignInCta className={cta} />
      </div>

      <div className="mt-12 space-y-8">
        {page.sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-xl font-semibold text-white">{s.h}</h2>
            <p className="mt-2 text-slate-400">{s.p}</p>
          </section>
        ))}
      </div>

      <div className="mt-14 rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center">
        <h2 className="text-lg font-semibold text-white">
          Scan your first site free
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Read-only · nothing stored · no credit card
        </p>
        <div className="mt-4 flex justify-center">
          <SignInCta className={cta} />
        </div>
      </div>

      <p className="mt-10 text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-300">
          ← OverShare Check home
        </Link>
      </p>
    </main>
  );
}
