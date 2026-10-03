"use client";

import { useRef } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
};

type ProductsProps = {
  products: Product[];
};

export default function Products({ products }: ProductsProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;

    const amount = carouselRef.current.clientWidth * 0.75;

    carouselRef.current.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section
      id="products"
      className="bg-white px-5 py-20 sm:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-[var(--font-montserrat)] text-xs font-semibold uppercase tracking-[0.2em] text-red">
              Our Drinks
            </p>

            <h2 className="mt-3 font-[var(--font-montserrat)] text-3xl font-bold leading-tight text-navy sm:text-4xl lg:text-5xl">
              Made for your
              <br className="hidden sm:block" />
              everyday wellness.
            </h2>
          </div>

          {/* Desktop carousel controls */}
          {products.length > 1 && (
            <div className="hidden gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scrollCarousel("left")}
                aria-label="Previous products"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-navy text-navy transition-all duration-300 hover:-translate-y-0.5 hover:border-red hover:bg-red hover:text-white"
              >
                ←
              </button>

              <button
                type="button"
                onClick={() => scrollCarousel("right")}
                aria-label="Next products"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-navy text-navy transition-all duration-300 hover:-translate-y-0.5 hover:border-red hover:bg-red hover:text-white"
              >
                →
              </button>
            </div>
          )}
        </div>

        {/* Product carousel */}
        {products.length > 0 ? (
          <div
            ref={carouselRef}
            className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-5 scrollbar-hide"
          >
            {products.map((product) => (
              <article
                key={product.id}
                className="group min-w-[80%] snap-start sm:min-w-[43%] lg:min-w-[31%]"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[#f3f3f3]">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#f3f3f3] px-6 text-center">
                      <span className="font-[var(--font-montserrat)] text-lg font-bold text-navy">
                        {product.name}
                      </span>
                    </div>
                  )}

                  {/* Image overlay */}
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />

                  {/* View product */}
                  <div className="absolute inset-x-0 bottom-0 translate-y-full p-4 transition-transform duration-300 ease-out group-hover:translate-y-0">
                    <Link
                      href={`/products/${product.slug}`}
                      className="block w-full rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-navy shadow-lg transition-all duration-300 hover:bg-red hover:text-white"
                    >
                      View Product
                    </Link>
                  </div>
                </div>

                {/* Product information */}
                <div className="pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-[var(--font-montserrat)] text-lg font-bold leading-tight text-navy sm:text-xl">
                      {product.name}
                    </h3>

                    <span className="mt-1 shrink-0 text-xs font-medium uppercase tracking-[0.12em] text-red">
                      GLAW
                    </span>
                  </div>

                  {product.description && (
                    <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
                      {product.description}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl bg-[#f7f7f7] px-6 py-14 text-center">
            <p className="font-[var(--font-montserrat)] text-lg font-semibold text-navy">
              Products coming soon.
            </p>

            <p className="mt-2 text-sm text-muted">
              Our drinks will be available here soon.
            </p>
          </div>
        )}

        {/* Mobile swipe hint */}
        {products.length > 1 && (
          <p className="mt-2 text-center text-xs text-muted sm:hidden">
            Swipe to explore our drinks →
          </p>
        )}

        {/* View all */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/products"
            className="rounded-full bg-navy px-6 py-3 text-sm font-semibold !text-white transition-all duration-300 hover:-translate-y-1 hover:bg-red hover:shadow-lg"
          >
            View All Drinks
          </Link>
        </div>
      </div>
    </section>
  );
}