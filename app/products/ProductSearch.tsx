
"use client";

import Link from "next/link";
import { useState } from "react";
import { FiArrowRight, FiImage, FiSearch, FiX } from "react-icons/fi";

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

type ProductSearchProps = {
  products: Product[];
  initialSearch: string;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function editDistance(a: string, b: string): number {
  const previous = Array.from(
    { length: b.length + 1 },
    (_, index) => index
  );

  for (let i = 1; i <= a.length; i++) {
    let diagonal = previous[0];
    previous[0] = i;

    for (let j = 1; j <= b.length; j++) {
      const oldValue = previous[j];
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      diagonal = oldValue;
    }
  }

  return previous[b.length];
}

function getMatchScore(product: Product, search: string): number {
  const query = normalize(search);
  if (!query) return 0;

  const name = normalize(product.name);
  const description = normalize(product.description ?? "");
  const fullText = `${name} ${description}`;

  if (name === query) return 100;
  if (name.startsWith(query)) return 90;
  if (name.includes(query)) return 80;
  if (fullText.includes(query)) return 70;

  const queryWords = query.split(" ");
  const nameWords = name.split(" ");
  const allWords = fullText.split(" ");

  let matchedWords = 0;

  for (const queryWord of queryWords) {
    if (
      allWords.some(
        (word) =>
          word.includes(queryWord) ||
          queryWord.includes(word)
      )
    ) {
      matchedWords++;
      continue;
    }

    if (queryWord.length >= 4) {
      const tolerance = queryWord.length >= 7 ? 2 : 1;

      const hasTypoMatch = allWords.some(
        (word) =>
          Math.abs(word.length - queryWord.length) <= tolerance &&
          editDistance(queryWord, word) <= tolerance
      );

      if (hasTypoMatch) matchedWords++;
    }
  }

  if (matchedWords === queryWords.length) {
    return nameWords.some((word) => word.startsWith(queryWords[0]))
      ? 60
      : 50;
  }

  if (matchedWords > 0) return 30 + matchedWords;

  return 0;
}

export default function ProductSearch({
  products,
  initialSearch,
}: ProductSearchProps) {
  const [search, setSearch] = useState(initialSearch);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const rankedProducts = products
    .map((product) => ({
      product,
      score: getMatchScore(product, search),
    }))
    .filter((item) => search.trim() === "" || item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.product.sort_order - b.product.sort_order;
    });

  const filteredProducts = rankedProducts.map((item) => item.product);
  const suggestions = rankedProducts.slice(0, 5).map((item) => item.product);

  function clearSearch() {
    setSearch("");
    setShowSuggestions(false);
    window.location.href = "/products";
  }

  return (
    <>
      <form
        action="/products"
        method="GET"
        className="mb-10"
        autoComplete="off"
        onSubmit={() => setShowSuggestions(false)}
      >
        <label
          htmlFor="product-search"
          className="mb-3 block font-[var(--font-montserrat)] text-lg font-bold text-navy"
        >
          Find your drink
        </label>

        <div className="relative max-w-2xl">
          <div className="flex gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 focus-within:border-navy focus-within:ring-2 focus-within:ring-navy/10">
              <FiSearch className="shrink-0 text-gray-500" size={20} />

              <input
                id="product-search"
                type="search"
                name="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {
                  window.setTimeout(() => setShowSuggestions(false), 150);
                }}
                placeholder="Search drinks by name or description..."
                className="w-full min-w-0 py-3 text-sm text-gray-900 outline-none"
                aria-autocomplete="list"
                aria-controls="product-search-suggestions"
              />

              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="shrink-0 rounded-full p-1 text-gray-500 hover:bg-gray-100"
                >
                  <FiX size={18} />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="rounded-lg bg-red px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Search
            </button>
          </div>

          {showSuggestions && search.trim() && (
            <div
              id="product-search-suggestions"
              role="listbox"
              className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
            >
              {suggestions.length > 0 ? (
                <>
                  {suggestions.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      role="option"
                      aria-selected={false}
                      className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0 hover:bg-gray-50"
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-400">
                            <FiImage size={20} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-navy">
                          {product.name}
                        </p>
                        {product.price !== null && (
                          <p className="mt-1 text-xs text-gray-500">
                            {product.currency}{" "}
                            {Number(product.price).toLocaleString()}
                          </p>
                        )}
                      </div>

                      <FiArrowRight
                        size={16}
                        className="shrink-0 text-red"
                      />
                    </Link>
                  ))}

                  <button
                    type="submit"
                    className="w-full bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-red hover:bg-gray-100"
                  >
                    View all matching results
                  </button>
                </>
              ) : (
                <p className="px-4 py-5 text-sm text-gray-600">
                  No matching drinks yet. Try another spelling or search term.
                </p>
              )}
            </div>
          )}
        </div>

        {search.trim() && (
          <p className="mt-3 text-sm text-muted">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "product" : "products"} found
            {" for "}
            &ldquo;{search}&rdquo;.
            {" "}
            <Link
              href="/products"
              className="font-semibold text-red underline"
            >
              Clear search
            </Link>
          </p>
        )}
      </form>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-8">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group block"
            >
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
            {search.trim() ? "No matching drinks found" : "Products coming soon"}
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted">
            {search.trim()
              ? "Try another product name or search term."
              : "Our product catalogue is being updated. Please check back shortly."}
          </p>

          {search.trim() && (
            <button
              type="button"
              onClick={clearSearch}
              className="mt-6 inline-flex rounded-full bg-red px-6 py-3 text-sm font-semibold text-white"
            >
              View all drinks
            </button>
          )}
        </div>
      )}
    </>
  );
}
