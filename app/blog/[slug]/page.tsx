import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getPost(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, content, image_url, is_published, published_at, created_at"
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    console.error("Error loading blog article:", error);
    return null;
  }

  return data as BlogPost | null;
}

function formatDate(date: string | null) {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Article Not Found | GLAW Naturale",
    };
  }

  return {
    title: `${post.title} | GLAW Naturale`,
    description:
      post.excerpt ||
      "Healthy living, nutrition, wellness, and lifestyle insights from GLAW Naturale.",
    openGraph: {
      title: `${post.title} | GLAW Naturale`,
      description:
        post.excerpt ||
        "Healthy living, nutrition, wellness, and lifestyle insights from GLAW Naturale.",
      type: "article",
      ...(post.image_url
        ? {
            images: [
              {
                url: post.image_url,
                alt: post.title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: post.image_url ? "summary_large_image" : "summary",
      title: `${post.title} | GLAW Naturale`,
      description:
        post.excerpt ||
        "Healthy living, nutrition, wellness, and lifestyle insights from GLAW Naturale.",
      ...(post.image_url
        ? {
            images: [post.image_url],
          }
        : {}),
    },
  };
}

export default async function BlogArticlePage({
  params,
}: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="bg-white text-[#111827]">
      {/* Article Header */}
      <section className="bg-[#061B3A] px-6 py-16 text-white sm:px-10 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm font-medium text-white/70 transition hover:text-white"
          >
            ← Back to Blog
          </Link>

          <div className="mt-10">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E63946]">
              GLAW Naturale Journal
            </p>

            <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            {post.published_at && (
              <p className="mt-6 text-sm text-white/65">
                Published {formatDate(post.published_at)}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Article */}
      <article className="px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-4xl">
          {/* Featured Image */}
          {post.image_url && (
            <div className="relative mb-12 aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100">
              <Image
                src={post.image_url}
                alt={post.title}
                fill
                priority
                className="object-cover"
              />
            </div>
          )}

          {/* Excerpt */}
          {post.excerpt && (
            <p className="mb-10 border-l-4 border-[#E63946] pl-5 text-lg font-medium leading-8 text-gray-700 sm:text-xl">
              {post.excerpt}
            </p>
          )}

          {/* Content */}
          <div className="text-base leading-8 text-gray-700 sm:text-lg">
            {post.content.split(/\n\s*\n/).map((paragraph, index) => (
              <p
                key={index}
                className="mb-7 whitespace-pre-line"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Bottom navigation */}
          <div className="mt-14 border-t border-gray-200 pt-8">
            <Link
              href="/blog"
              className="inline-flex items-center rounded-full bg-[#061B3A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0a2854]"
            >
              ← Back to Blog
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}