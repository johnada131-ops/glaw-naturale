import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  image_url: string | null;
  published_at: string | null;
  created_at: string;
};

async function getRecentPosts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, image_url, published_at, created_at"
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error loading homepage blog posts:", error);
    return [];
  }

  return (data || []) as BlogPost[];
}

function formatDate(date: string | null) {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function Blog() {
  const posts = await getRecentPosts();

  return (
    <section
      id="blog"
      className="bg-white px-5 py-20 sm:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-[var(--font-montserrat)] text-xs font-semibold uppercase tracking-[0.2em] text-red">
              From Our Journal
            </p>

            <h2 className="mt-3 font-[var(--font-montserrat)] text-3xl font-bold leading-tight text-navy sm:text-4xl lg:text-5xl">
              Healthy living,
              <br className="hidden sm:block" />
              one article at a time.
            </h2>
          </div>

          {/* Desktop carousel controls */}
          {posts.length > 1 && (
            <div className="hidden gap-2 sm:flex">
              <button
                type="button"
                onClick={() => {
                  const carousel = document.getElementById(
                    "homepage-blog-carousel"
                  );

                  if (!carousel) return;

                  carousel.scrollBy({
                    left: -carousel.clientWidth * 0.75,
                    behavior: "smooth",
                  });
                }}
                aria-label="Previous articles"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-navy text-navy transition-all duration-300 hover:-translate-y-0.5 hover:border-red hover:bg-red hover:text-white"
              >
                ←
              </button>

              <button
                type="button"
                onClick={() => {
                  const carousel = document.getElementById(
                    "homepage-blog-carousel"
                  );

                  if (!carousel) return;

                  carousel.scrollBy({
                    left: carousel.clientWidth * 0.75,
                    behavior: "smooth",
                  });
                }}
                aria-label="Next articles"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-navy text-navy transition-all duration-300 hover:-translate-y-0.5 hover:border-red hover:bg-red hover:text-white"
              >
                →
              </button>
            </div>
          )}
        </div>

        {/* Blog carousel */}
        {posts.length > 0 ? (
          <div
            id="homepage-blog-carousel"
            className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-5 scrollbar-hide"
          >
            {posts.map((post) => (
              <article
                key={post.id}
                className="group min-w-[80%] snap-start sm:min-w-[43%] lg:min-w-[31%]"
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  {/* Article image */}
                  <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-[#f3f3f3]">
                    {post.image_url ? (
                      <Image
                        src={post.image_url}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-navy px-6 text-center">
                        <span className="font-[var(--font-montserrat)] text-lg font-bold text-white">
                          GLAW Naturale Journal
                        </span>
                      </div>
                    )}

                    {/* Image overlay */}
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />

                    {/* Read article */}
                    <div className="absolute inset-x-0 bottom-0 translate-y-full p-4 transition-transform duration-300 ease-out group-hover:translate-y-0">
                      <div className="w-full rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-navy shadow-lg transition-all duration-300 group-hover:bg-red group-hover:text-white">
                        Read Article
                      </div>
                    </div>
                  </div>

                  {/* Article information */}
                  <div className="pt-5">
                    {post.published_at && (
                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-red">
                        {formatDate(post.published_at)}
                      </p>
                    )}

                    <h3 className="mt-2 font-[var(--font-montserrat)] text-lg font-bold leading-tight text-navy transition-colors duration-300 group-hover:text-red sm:text-xl">
                      {post.title}
                    </h3>

                    {post.excerpt && (
                      <p className="mt-2 line-clamp-3 max-w-sm text-sm leading-6 text-muted">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl bg-[#f7f7f7] px-6 py-14 text-center">
            <p className="font-[var(--font-montserrat)] text-lg font-semibold text-navy">
              Articles coming soon.
            </p>

            <p className="mt-2 text-sm text-muted">
              Check back soon for healthy living, wellness, and lifestyle
              insights from GLAW Naturale.
            </p>
          </div>
        )}

        {/* Mobile swipe hint */}
        {posts.length > 1 && (
          <p className="mt-2 text-center text-xs text-muted sm:hidden">
            Swipe to explore our articles →
          </p>
        )}

        {/* View all */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/blog"
            className="rounded-full bg-navy px-6 py-3 text-sm font-semibold !text-white transition-all duration-300 hover:-translate-y-1 hover:bg-red hover:shadow-lg"
          >
            View All Articles
          </Link>
        </div>
      </div>
    </section>
  );
}