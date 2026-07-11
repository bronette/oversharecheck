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

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {page.title}
      </h1>
      <p className="mt-4 text-lg text-slate-600">{page.intro}</p>

      <div className="mt-8">
        <SignInCta />
      </div>

      <div className="mt-12 space-y-8">
        {page.sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-xl font-semibold text-slate-900">{s.h}</h2>
            <p className="mt-2 text-slate-600">{s.p}</p>
          </section>
        ))}
      </div>

      <div className="mt-14 rounded-xl border border-slate-200 bg-white p-6 text-center">
        <h2 className="text-lg font-semibold text-slate-900">
          Scan your first site free
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Read-only · nothing stored · no credit card
        </p>
        <div className="mt-4 flex justify-center">
          <SignInCta />
        </div>
      </div>

      <p className="mt-10 text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-600">
          ← OverShare Check home
        </Link>
      </p>
    </main>
  );
}
