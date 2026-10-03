import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiCheck, FiImage } from "react-icons/fi";
import { createClient } from "@/lib/supabase/server";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ingredients: string | null;
  benefits: string | null;
  price: number | null;
  currency: string;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
};

type ProductVariant = {
  id: string;
  size: string;
  price: number | null;
  currency: string;
  is_available: boolean;
  sort_order: number;
};

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const fallbackWhatsappNumber = "2348069161689";

async function getProduct(slug: string): Promise<Product | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
        id,
        name,
        slug,
        description,
        ingredients,
        benefits,
        price,
        currency,
        image_url,
        is_available,
        is_featured
      `
    )
    .eq("slug", slug)
    .eq("is_available", true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Product;
}

async function getProductVariants(
  productId: string
): Promise<ProductVariant[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("product_variants")
    .select(
      "id, size, price, currency, is_available, sort_order"
    )
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (data ?? []) as ProductVariant[];
}

async function getOrderWhatsappNumber(): Promise<string> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("order_whatsapp_number")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "Error loading order WhatsApp number:",
      error
    );

    return fallbackWhatsappNumber;
  }

  const whatsappNumber =
    data?.order_whatsapp_number?.replace(/\D/g, "");

  return whatsappNumber || fallbackWhatsappNumber;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found | GLAW Naturale",
      description:
        "The requested GLAW Naturale product could not be found.",
    };
  }

  const description =
    product.description ||
    `${product.name} from GLAW Naturale. Natural drinks made for healthier everyday choices.`;

  const productUrl = `${siteUrl}/products/${product.slug}`;

  return {
    title: `${product.name} | GLAW Naturale`,
    description,

    alternates: {
      canonical: productUrl,
    },

    openGraph: {
      title: `${product.name} | GLAW Naturale`,
      description,
      url: productUrl,
      siteName: "GLAW Naturale",
      type: "website",
      images: product.image_url
        ? [
            {
              url: product.image_url,
              alt: `${product.name} - GLAW Naturale`,
            },
          ]
        : [],
    },

    twitter: {
      card: "summary_large_image",
      title: `${product.name} | GLAW Naturale`,
      description,
      images: product.image_url
        ? [product.image_url]
        : [],
    },
  };
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const [variants, whatsappNumber] = await Promise.all([
    getProductVariants(product.id),
    getOrderWhatsappNumber(),
  ]);

  const whatsappMessage = encodeURIComponent(
    `Hello GLAW Naturale, I would like to order ${product.name}.`
  );

  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const benefits: string[] = product.benefits
    ? product.benefits
        .split("\n")
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0)
    : [];

  const productUrl = `${siteUrl}/products/${product.slug}`;

  const availableVariants = variants.filter(
    (variant: ProductVariant) =>
      variant.is_available && variant.price !== null
  );

  const offers =
    availableVariants.length > 0
      ? availableVariants.map((variant: ProductVariant) => ({
          "@type": "Offer",
          priceCurrency: variant.currency,
          price: Number(variant.price),
          availability: "https://schema.org/InStock",
          url: productUrl,
          itemCondition: "https://schema.org/NewCondition",
        }))
      : product.price !== null
        ? [
            {
              "@type": "Offer",
              priceCurrency: product.currency,
              price: Number(product.price),
              availability: "https://schema.org/InStock",
              url: productUrl,
              itemCondition: "https://schema.org/NewCondition",
            },
          ]
        : [];

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.description ||
      `${product.name} from GLAW Naturale.`,
    url: productUrl,

    ...(product.image_url
      ? {
          image: [product.image_url],
        }
      : {}),

    brand: {
      "@type": "Brand",
      name: "GLAW Naturale",
    },

    ...(product.ingredients
      ? {
          additionalProperty: [
            {
              "@type": "PropertyValue",
              name: "Ingredients",
              value: product.ingredients,
            },
          ],
        }
      : {}),

    ...(offers.length > 0
      ? {
          offers:
            offers.length === 1 ? offers[0] : offers,
        }
      : {}),
  };

  return (
    <main className="min-h-screen bg-[#f8f8f6]">
      {/* Product structured data for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />

      <section className="px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy transition-colors hover:text-red"
          >
            <FiArrowLeft size={16} />
            Back to Products
          </Link>

          <div className="mt-10 grid items-start gap-10 lg:grid-cols-2 lg:gap-20">
            {/* Product Image */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-white">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted">
                  <FiImage size={42} />
                </div>
              )}

              {product.is_featured && (
                <span className="absolute left-5 top-5 rounded-full bg-red px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white">
                  Featured
                </span>
              )}
            </div>

            {/* Product Details */}
            <div className="lg:pt-4">
              <p className="font-[var(--font-montserrat)] text-xs font-semibold uppercase tracking-[0.2em] text-red">
                GLAW Naturale
              </p>

              <h1 className="mt-4 font-[var(--font-montserrat)] text-3xl font-bold leading-tight text-navy sm:text-4xl lg:text-5xl">
                {product.name}
              </h1>

              {product.description && (
                <p className="mt-6 max-w-xl text-sm leading-7 text-muted sm:text-base">
                  {product.description}
                </p>
              )}

              {/* Available Sizes */}
              {variants.length > 0 ? (
                <div className="mt-8">
                  <h2 className="font-[var(--font-montserrat)] text-sm font-bold uppercase tracking-wider text-navy">
                    Available Sizes
                  </h2>

                  <div className="mt-4 space-y-3">
                    {variants.map(
                      (variant: ProductVariant) => (
                        <div
                          key={variant.id}
                          className={`flex items-center justify-between rounded-xl border px-4 py-4 ${
                            variant.is_available
                              ? "border-border bg-white"
                              : "border-border bg-gray-50 opacity-60"
                          }`}
                        >
                          <div>
                            <p className="font-[var(--font-montserrat)] text-sm font-bold text-navy">
                              {variant.size}
                            </p>

                            {!variant.is_available && (
                              <p className="mt-1 text-xs text-muted">
                                Currently unavailable
                              </p>
                            )}
                          </div>

                          <p className="font-[var(--font-montserrat)] text-sm font-bold text-navy">
                            {variant.price !== null
                              ? `${variant.currency} ${Number(
                                  variant.price
                                ).toLocaleString()}`
                              : "Price unavailable"}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : product.price !== null ? (
                <div className="mt-8">
                  <p className="font-[var(--font-montserrat)] text-2xl font-bold text-navy">
                    {product.currency}{" "}
                    {Number(product.price).toLocaleString()}
                  </p>
                </div>
              ) : null}

              {/* Ingredients */}
              {product.ingredients && (
                <div className="mt-10 border-t border-border pt-8">
                  <h2 className="font-[var(--font-montserrat)] text-sm font-bold uppercase tracking-wider text-navy">
                    Ingredients
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-muted">
                    {product.ingredients}
                  </p>
                </div>
              )}

              {/* Benefits */}
              {benefits.length > 0 && (
                <div className="mt-8 border-t border-border pt-8">
                  <h2 className="font-[var(--font-montserrat)] text-sm font-bold uppercase tracking-wider text-navy">
                    Benefits
                  </h2>

                  <div className="mt-4 space-y-3">
                    {benefits.map(
                      (
                        benefit: string,
                        index: number
                      ) => (
                        <div
                          key={`${benefit}-${index}`}
                          className="flex items-start gap-3"
                        >
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red/10 text-red">
                            <FiCheck size={12} />
                          </span>

                          <p className="text-sm leading-6 text-muted">
                            {benefit}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Order Button */}
              <div className="mt-10">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-full bg-red px-7 py-3.5 text-sm font-semibold !text-white transition-all duration-300 hover:-translate-y-1 hover:bg-navy hover:shadow-lg sm:w-auto"
                >
                  Order This Product
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}