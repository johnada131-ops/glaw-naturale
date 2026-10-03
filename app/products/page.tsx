import Link from "next/link";
import { FiArrowRight, FiImage } from "react-icons/fi";
import { createClient } from "@/lib/supabase/server";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  currency: string;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
};

export default async function ProductsPage() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, description, price, currency, image_url, is_available, is_featured, sort_order"
    )
    .eq("is_available", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-[#f8f8f6] px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-[var(--font-montserrat)] text-xs font-semibold uppercase tracking-[0.2em] text-red">
            Products
          </p>

          <h1 className="mt-4 font-[var(--font-montserrat)] text-3xl font-bold text-navy sm:text-4xl">
            Our Products
          </h1>

          <p className="mt-4 text-sm leading-7 text-muted">
            We could not load our products right now. Please try again shortly.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f8f6]">
      {/* Hero */}
      <section className="bg-navy px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="font-[var(--font-montserrat)] text-xs font-semibold uppercase tracking-[0.2em] text-red">
            GLAW Naturale
          </p>

          <h1 className="mt-4 max-w-3xl font-[var(--font-montserrat)] text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            Natural drinks for healthier everyday living.
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
            Fresh fruit and vegetable drinks, tigernut milk and more — made to
            make healthier choices more convenient.
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-7xl">
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-8">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group block"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-white">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted">
                        <FiImage size={30} />
                      </div>
                    )}

                    {product.is_featured && (
                      <span className="absolute left-3 top-3 rounded-full bg-red px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="mt-4">
                    <h2 className="font-[var(--font-montserrat)] text-base font-bold text-navy transition-colors group-hover:text-red sm:text-lg">
                      {product.name}
                    </h2>

                    {product.description && (
                      <p className="mt-2 line-clamp-2 text-xs leading-6 text-muted sm:text-sm">
                        {product.description}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between gap-3">
                      {product.price !== null ? (
                        <p className="font-[var(--font-montserrat)] text-sm font-bold text-navy sm:text-base">
                          {product.currency}{" "}
                          {Number(product.price).toLocaleString()}
                        </p>
                      ) : (
                        <p className="text-sm font-medium text-muted">
                          View product
                        </p>
                      )}

                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red sm:text-sm">
                        View
                        <FiArrowRight
                          size={14}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-white px-6 py-16 text-center">
              <h2 className="font-[var(--font-montserrat)] text-2xl font-bold text-navy">
                Products coming soon
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted">
                Our product catalogue is being updated. Please check back
                shortly.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}