"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState(
    fallbackWhatsappNumber
  );

  const pathname = usePathname();

  const isAdminLogin = pathname === "/admin/login";

  useEffect(() => {
    const supabase = createClient();

    let mounted = true;

    async function loadHeaderData() {
      const [
        {
          data: { user },
        },
        { data: settings },
      ] = await Promise.all([
        supabase.auth.getUser(),

        supabase
          .from("site_settings")
          .select("order_whatsapp_number")
          .limit(1)
          .maybeSingle(),
      ]);

      if (!mounted) {
        return;
      }

      setIsAuthenticated(!!user);
      setAuthChecked(true);

      const savedWhatsappNumber =
        settings?.order_whatsapp_number?.replace(/\D/g, "");

      if (savedWhatsappNumber) {
        setWhatsappNumber(savedWhatsappNumber);
      }
    }

    loadHeaderData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) {
        return;
      }

      setIsAuthenticated(!!session?.user);
      setAuthChecked(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const showAdminNavigation =
    authChecked && isAuthenticated && !isAdminLogin;

  const showOrderButton =
    authChecked && !isAuthenticated && !isAdminLogin;

  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
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
            className="h-auto w-[145px] sm:w-[165px]"
          />
        </Link>

        <nav
          className="hidden items-center gap-7 lg:flex"
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
              className="text-sm font-medium text-navy transition-colors duration-200 hover:text-red"
            >
              {item.name}
            </Link>
          ))}

          {showAdminNavigation && (
            <Link
              href="/admin"
              className="text-sm font-medium text-navy transition-colors duration-200 hover:text-red"
            >
              Admin
            </Link>
          )}

          {showOrderButton && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-red px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-navy"
            >
              Order Now
            </a>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-full text-navy transition-colors hover:bg-surface lg:hidden"
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

      {menuOpen && (
        <div className="border-t border-border bg-white lg:hidden">
          <nav
            className="mx-auto flex max-w-7xl flex-col px-5 py-5 sm:px-6"
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
                className="border-b border-border py-4 text-base font-medium text-navy transition-colors hover:text-red"
              >
                {item.name}
              </Link>
            ))}

            {showAdminNavigation && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="border-b border-border py-4 text-base font-medium text-navy transition-colors hover:text-red"
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
                className="mt-5 rounded-full bg-red px-5 py-3.5 text-center text-sm font-semibold text-white transition-colors duration-200 hover:bg-navy"
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