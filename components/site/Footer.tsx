import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaEnvelope,
} from "react-icons/fa";
import { getSiteSettings } from "@/lib/site-settings";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
  { name: "Testimonies", href: "/testimonies" },
  { name: "Contact", href: "/contact" },
];

const defaultWhatsappNumber = "2348069161689";

const whatsappMessage = encodeURIComponent(
  "Hello GLAW Naturale, I would like to place an order."
);

const defaultAddress =
  "Glaw Naturale N More Limited, Rivtaf Golf Estate, GT 37B, Phase 2, Peter Odili Road, Okuruama, Port Harcourt, Rivers State, Nigeria";

const defaultMapLink =
  "https://www.google.com/maps/search/?api=1&query=Glaw+Naturale+N+More+Limited%2C+Rivtaf+Golf+Estate%2C+GT+37B%2C+Phase+2%2C+Peter+Odili+Road%2C+Okuruama%2C+Port+Harcourt%2C+Rivers+State%2C+Nigeria";

export default async function Footer() {
  const settings = await getSiteSettings();

  const whatsappNumber =
    settings?.order_whatsapp_number?.trim() || defaultWhatsappNumber;

  const address = settings?.business_address?.trim() || defaultAddress;

  const mapLink = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        address
      )}`
    : defaultMapLink;

  const socialLinks = [
    {
      name: "Instagram",
      href: settings?.instagram_url,
      icon: FaInstagram,
    },
    {
      name: "LinkedIn",
      href: settings?.linkedin_url,
      icon: FaLinkedinIn,
    },
    {
      name: "Facebook",
      href: settings?.facebook_url,
      icon: FaFacebookF,
    },
    {
      name: "TikTok",
      href: settings?.tiktok_url,
      icon: FaTiktok,
    },
  ].filter(
    (
      social
    ): social is {
      name: string;
      href: string;
      icon: typeof FaInstagram;
    } => Boolean(social.href)
  );

  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_1.2fr] lg:gap-16">
          {/* BRAND / CONTACT */}
          <div>
            <Link href="/" aria-label="GLAW Naturale home">
              <Image
                src="/brand/glaw-naturale-logo.svg"
                alt="GLAW Naturale"
                width={170}
                height={55}
                className="h-auto w-[145px] brightness-0 invert sm:w-[155px]"
              />
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-6 text-white/70">
              Refreshing natural drinks made to support healthier choices,
              everyday wellness, and a better way to enjoy what you drink.
            </p>

            <p className="mt-4 text-sm font-medium text-white">
              A Drink For Your Health.
            </p>

            {settings?.email && (
              <a
                href={`mailto:${settings.email}`}
                className="mt-5 flex w-fit items-center gap-2 text-sm text-white/65 transition-colors hover:text-white"
                aria-label={`Email GLAW Naturale at ${settings.email}`}
              >
                <FaEnvelope className="h-3.5 w-3.5 shrink-0" />
                <span>{settings.email}</span>
              </a>
            )}

            <a
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 block max-w-sm text-sm leading-6 text-white/65 transition-colors hover:text-white"
              aria-label="View GLAW Naturale location on Google Maps"
            >
              <span className="mr-1" aria-hidden="true">
                📍
              </span>
              {address}
            </a>

            {socialLinks.length > 0 && (
              <div className="mt-6 flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;

                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`GLAW Naturale on ${social.name}`}
                      title={social.name}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition-all duration-200 hover:border-white hover:bg-white hover:text-navy"
                    >
                      <Icon className="h-[17px] w-[17px]" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* NAVIGATION / ORDER */}
          <div className="grid grid-cols-2 gap-8 lg:block">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">
                Explore
              </h2>

              <nav
                className="mt-5 flex flex-col gap-3"
                aria-label="Footer navigation"
              >
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="w-fit text-sm text-white/65 transition-colors hover:text-white"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="mt-0 lg:mt-8">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">
                Order
              </h2>

              <a
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex rounded-full bg-red px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-navy"
              >
                Order via WhatsApp
              </a>
            </div>
          </div>

          {/* NEWSLETTER */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">
              Stay Connected
            </h2>

            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Get wellness in your inbox.
            </h3>

            <p className="mt-3 max-w-md text-sm leading-6 text-white/70">
              Sign up for healthy tips, recipes, wellness ideas, and updates
              from GLAW Naturale.
            </p>

            <form className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>

              <input
                id="newsletter-email"
                type="email"
                placeholder="Your email address"
                required
                className="min-h-11 flex-1 rounded-full border border-white/20 bg-white px-5 text-sm text-navy outline-none placeholder:text-gray-400 focus:border-white"
              />

              <button
                type="submit"
                className="min-h-11 rounded-full bg-red px-6 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-navy"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-xs text-white/50 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>
            © {new Date().getFullYear()} GLAW Naturale. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="transition-colors hover:text-white"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}