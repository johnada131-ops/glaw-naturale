import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
};

function formatDate(date: string | null) {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPage() {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, image_url, is_published, published_at, created_at"
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading blog posts:", error);
  }

  const blogPosts: BlogPost[] = posts ?? [];

  return (
    <main className="bg-white text-[#111827]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#061B3A] px-6 py-24 text-white sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#E63946]">
              GLAW Naturale Journal
            </p>

            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Healthy living, made simpler.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
              Practical insights, healthy living tips, recipes, wellness
              ideas, and stories from GLAW Naturale.
            </p>
          </div>
        </div>
      </section>

      {/* Blog posts */}
      <section className="px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          {blogPosts.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-16 text-center">
              <h2 className="text-2xl font-bold text-[#061B3A]">
                Articles coming soon
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-gray-600">
                We are preparing useful content around healthy living,
                nutrition, wellness, recipes, and everyday healthier choices.
              </p>

              <Link
                href="/products"
                className="mt-8 inline-flex rounded-full bg-[#E63946] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#c92f3b]"
              >
                Explore Our Drinks
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-12">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E63946]">
                  Latest Articles
                </p>

                <h2 className="mt-3 text-3xl font-bold text-[#061B3A] sm:text-4xl">
                  From GLAW Naturale
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {blogPosts.map((post) => (
                  <article
                    key={post.id}
                    className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* Image */}
                    {post.image_url ? (
                      <Link
                        href={`/blog/${post.slug}`}
                        className="relative block aspect-[16/10] overflow-hidden bg-gray-100"
                      >
                        <Image
                          src={post.image_url}
                          alt={post.title}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      </Link>
                    ) : (
                      <Link
                        href={`/blog/${post.slug}`}
                        className="flex aspect-[16/10] items-center justify-center bg-[#061B3A] px-8"
                      >
                        <span className="text-center text-lg font-semibold text-white">
                          GLAW Naturale
                        </span>
                      </Link>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      {post.published_at && (
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#E63946]">
                          {formatDate(post.published_at)}
                        </p>
                      )}

                      <h3 className="mt-3 text-xl font-bold leading-snug text-[#061B3A]">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="transition hover:text-[#E63946]"
                        >
                          {post.title}
                        </Link>
                      </h3>

                      {post.excerpt && (
                        <p className="mt-3 line-clamp-3 text-sm leading-7 text-gray-600">
                          {post.excerpt}
                        </p>
                      )}

                      <Link
                        href={`/blog/${post.slug}`}
                        className="mt-6 inline-flex items-center text-sm font-semibold text-[#061B3A] transition hover:text-[#E63946]"
                      >
                        Read Article
                        <span className="ml-2 transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}