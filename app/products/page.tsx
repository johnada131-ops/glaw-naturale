
import { createClient } from "@/lib/supabase/server";
import ProductSearch from "./ProductSearch";

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

type ProductsPageProps = {
  searchParams: Promise<{ search?: string }>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const { search } = await searchParams;
  const searchTerm = search?.trim() ?? "";
  const supabase = await createClient();

  const { data, error } = await supabase
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
            GLAW Naturale
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

  const products: Product[] = data ?? [];

  return (
    <main className="min-h-screen bg-[#f8f8f6]">
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

      <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <ProductSearch
            products={products}
            initialSearch={searchTerm}
          />
        </div>
      </section>
    </main>
  );
}
