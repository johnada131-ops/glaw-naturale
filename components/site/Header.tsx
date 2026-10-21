
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
  { name: "Testimonies", href: "/testimonies" },
  { name: "Contact", href: "/contact" },
];

const fallbackWhatsappNumber = "2348069161689";

const whatsappMessage = encodeURIComponent(
  "Hello GLAW Naturale, I would like to place an order."
);

type SearchProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function levenshtein(a: string, b: string): number {
  const previous = Array.from(
    { length: b.length + 1 },
    (_, index) => index
  );

  for (let i = 1; i <= a.length; i++) {
    let diagonal = previous[0];
    previous[0] = i;

    for (let j = 1; j <= b.length; j++) {
      const above = previous[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + cost
      );

      diagonal = above;
    }
  }

  return previous[b.length];
}

function matchesProduct(
  product: SearchProduct,
  search: string
): boolean {
  const query = search.trim().toLowerCase();

  if (!query) return false;

  const name = product.name.toLowerCase();
  const slug = product.slug.replace(/-/g, " ").toLowerCase();
  const description = (product.description ?? "").toLowerCase();

  // Prioritize text that directly matches the product.
  if (
    name.includes(query) ||
    slug.includes(query) ||
    description.includes(query)
  ) {
    return true;
  }

  // Permit common spelling variations in product names.
  const queryWords = query.split(/[^a-z0-9]+/).filter(Boolean);
  const productWords = `${name} ${slug}`
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  return queryWords.every((queryWord) => {
    const maxDistance =
      queryWord.length >= 8 ? 2 : queryWord.length >= 5 ? 1 : 0;

    return productWords.some((word) => {
      if (word.includes(queryWord)) return true;

      if (
        maxDistance > 0 &&
        Math.abs(word.length - queryWord.length) <= maxDistance &&
        levenshtein(word, queryWord) <= maxDistance
      ) {
        return true;
      }

      return false;
    });
  });
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState(
    fallbackWhatsappNumber
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const isAdminLogin = pathname === "/admin/login";
  const isAdminPage = pathname.startsWith("/admin");
  const showSearch = !isAdminPage;

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function loadHeaderData() {
      const [userResult, settingsResult, productsResult] =
        await Promise.all([
          supabase.auth.getUser(),
          supabase
            .from("site_settings")
            .select("order_whatsapp_number")
            .limit(1)
            .maybeSingle(),
          supabase
            .from("products")
            .select("id, name, slug, description, image_url")
            .eq("is_available", true)
            .order("sort_order", { ascending: true })
            .limit(100),
        ]);

      if (!mounted) return;

      setIsAuthenticated(!!userResult.data.user);
      setAuthChecked(true);

      const savedNumber =
        settingsResult.data?.order_whatsapp_number?.replace(/\D/g, "");

      if (savedNumber) {
        setWhatsappNumber(savedNumber);
      }

      if (!productsResult.error) {
        setProducts(productsResult.data ?? []);
      }
    }

    loadHeaderData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setIsAuthenticated(!!session?.user);
      setAuthChecked(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const showAdminNavigation =
    authChecked && isAuthenticated && !isAdminLogin;

  const showOrderButton =
    authChecked && !isAuthenticated && !isAdminLogin;

  const whatsappHref =
    `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const normalizedSearch = normalize(searchTerm.trim());

  // Exact name or slug matches always take priority.
  const exactMatches = products.filter((product) => {
    return (
      normalize(product.name) === normalizedSearch ||
      normalize(product.slug) === normalizedSearch
    );
  });

  // If there is an exact match, never show unrelated products.
  const suggestions = !normalizedSearch
    ? []
    : exactMatches.length > 0
      ? exactMatches
      : products
          .filter((product) => matchesProduct(product, searchTerm))
          .sort((a, b) => {
            const query = searchTerm.trim().toLowerCase();

            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();

            const aStarts = aName.startsWith(query) ? 0 : 1;
            const bStarts = bName.startsWith(query) ? 0 : 1;

            return aStarts - bStarts;
          })
          .slice(0, 6);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = searchTerm.trim();

    setSearchOpen(false);
    setMenuOpen(false);

    if (query) {
      router.push(`/products?search=${encodeURIComponent(query)}`);
    } else {
      router.push("/products");
    }
  }

  function selectProduct(product: SearchProduct) {
    setSearchOpen(false);
    setSearchTerm("");
    setMenuOpen(false);
    router.push(`/products/${product.slug}`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center gap-3 px-4 sm:h-[82px] sm:gap-5 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href={showAdminNavigation ? "/admin" : "/"}
          className="shrink-0"
          aria-label={
            showAdminNavigation
              ? "GLAW Naturale admin dashboard"
              : "GLAW Naturale home"
          }
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/brand/glaw-naturale-logo.svg"
            alt="GLAW Naturale"
            width={170}
            height={55}
            priority
            className="h-auto w-[100px] sm:w-[140px] lg:w-[155px]"
          />
        </Link>

        {/* Search bar */}
        {showSearch && (
          <div
            ref={searchRef}
            className="relative min-w-0 flex-1 lg:max-w-[250px] xl:mx-2"
          >
            <form
              onSubmit={handleSearch}
              role="search"
              className="flex h-10 w-full items-center gap-2 rounded-full border border-gray-200 bg-white px-3 transition-colors focus-within:border-navy sm:h-11"
            >
              <FiSearch
                size={17}
                className="shrink-0 text-gray-500"
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search drinks..."
                aria-label="Search drinks"
                aria-expanded={searchOpen && !!normalizedSearch}
                className="w-full min-w-0 bg-transparent text-[12px] text-navy outline-none placeholder:text-gray-400 sm:text-sm"
              />

              {searchTerm && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearchTerm("");
                    setSearchOpen(false);
                  }}
                  className="shrink-0 text-lg leading-none text-gray-400 hover:text-navy"
                >
                  ×
                </button>
              )}
            </form>

            {/* Search suggestions */}
            {searchOpen && normalizedSearch && (
              <div className="absolute left-0 right-0 top-full z-[60] mt-2 max-h-[360px] min-w-[245px] overflow-y-auto rounded-xl border border-gray-200 bg-white py-2 shadow-xl sm:min-w-[300px]">
                {suggestions.length > 0 ? (
                  <>
                    {suggestions.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => selectProduct(product)}
                        className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-gray-50"
                      >
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-gray-400">
                              GLAW
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-navy">
                            {product.name}
                          </p>

                          {product.description && (
                            <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={handleSearch as unknown as () => void}
                      className="w-full border-t border-gray-100 px-4 py-3 text-left text-sm font-semibold text-red hover:bg-gray-50"
                    >
                      See all search results →
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-4">
                    <p className="text-sm font-medium text-navy">
                      No matching drinks found
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Try another spelling or search for an ingredient.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Desktop navigation */}
        <nav
          className="hidden items-center gap-4 xl:flex"
          aria-label={
            showAdminNavigation
              ? "Authenticated navigation"
              : "Main navigation"
          }
        >
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="whitespace-nowrap text-sm font-medium text-navy transition-colors hover:text-red"
            >
              {item.name}
            </Link>
          ))}

          {showAdminNavigation && (
            <Link
              href="/admin"
              className="whitespace-nowrap text-sm font-medium text-navy transition-colors hover:text-red"
            >
              Admin
            </Link>
          )}

          {showOrderButton && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap rounded-full bg-red px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy"
            >
              Order Now
            </a>
          )}
        </nav>

        {/* Hamburger menu */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-navy transition-colors hover:bg-surface lg:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span className="sr-only">
            {menuOpen ? "Close menu" : "Open menu"}
          </span>

          <div className="flex w-5 flex-col gap-1.5">
            <span
              className={`block h-0.5 w-full bg-current transition-transform duration-200 ${
                menuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-full bg-current transition-opacity duration-200 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-full bg-current transition-transform duration-200 ${
                menuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile navigation links */}
      {menuOpen && (
        <div className="border-t border-border bg-white lg:hidden">
          <nav
            className="mx-auto flex max-w-7xl flex-col px-5 py-3 sm:px-6"
            aria-label={
              showAdminNavigation
                ? "Authenticated mobile navigation"
                : "Mobile navigation"
            }
          >
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-border py-3 text-base font-medium text-navy transition-colors hover:text-red"
              >
                {item.name}
              </Link>
            ))}

            {showAdminNavigation && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="border-b border-border py-3 text-base font-medium text-navy transition-colors hover:text-red"
              >
                Admin
              </Link>
            )}

            {showOrderButton && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="mt-4 rounded-full bg-red px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-navy"
              >
                Order Now
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
