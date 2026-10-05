"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
} from "react-icons/fa";
import { createClient } from "@/lib/supabase/client";

type SiteSettings = {
  email: string | null;
  business_phone: string | null;
  business_address: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;
  tiktok_url: string | null;
  order_whatsapp_number: string | null;
};

const fallbackWhatsappNumber = "2348069161689";

const whatsappMessage = encodeURIComponent(
  "Hello GLAW Naturale, I would like to get in touch."
);

const fallbackAddress =
  "Glaw Naturale N More Limited, Rivtaf Golf Estate, GT 37B, Phase 2, Peter Odili Road, Okuruama, Port Harcourt, Rivers State, Nigeria";

const fallbackMapLink =
  "https://www.google.com/maps/search/?api=1&query=Glaw+Naturale+N+More+Limited%2C+Rivtaf+Golf+Estate%2C+GT+37B%2C+Phase+2%2C+Peter+Odili+Road%2C+Okuruama%2C+Port+Harcourt%2C+Rivers+State%2C+Nigeria";

export default function ContactPage() {
  const supabase = createClient();

  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      const { data, error } = await supabase
        .from("site_settings")
        .select(
          `
            email,
            business_phone,
            business_address,
            instagram_url,
            facebook_url,
            linkedin_url,
            tiktok_url,
            order_whatsapp_number
          `
        )
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error loading site settings:", error);
        return;
      }

      setSettings(data);
    }

    loadSettings();
  }, [supabase]);

  const whatsappNumber =
    settings?.order_whatsapp_number?.replace(/\D/g, "") ||
    fallbackWhatsappNumber;

  const businessPhone =
    settings?.business_phone?.trim() || "+234 806 916 1689";

  const businessEmail = settings?.email?.trim() || "";

  const address =
    settings?.business_address?.trim() || fallbackAddress;

  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;

  const socialLinks = [
    {
      name: "Instagram",
      href: settings?.instagram_url || "",
      icon: FaInstagram,
    },
    {
      name: "LinkedIn",
      href: settings?.linkedin_url || "",
      icon: FaLinkedinIn,
    },
    {
      name: "Facebook",
      href: settings?.facebook_url || "",
      icon: FaFacebookF,
    },
    {
      name: "TikTok",
      href: settings?.tiktok_url || "",
      icon: FaTiktok,
    },
  ].filter((social) => Boolean(social.href));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (!name || !email || !subject || !message) {
      setErrorMessage("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      subject,
      message,
    });

    if (error) {
      console.error("Error submitting contact message:", error);

      setErrorMessage(
        `Error: ${error.message}${
          error.details ? ` — ${error.details}` : ""
        }`
      );

      setIsSubmitting(false);
      return;
    }

    form.reset();

    setSuccessMessage(
      "Your message has been sent successfully. We'll get back to you soon."
    );

    setIsSubmitting(false);
  };

  return (
    <main className="bg-white">
      {/* HERO */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red">
              Contact GLAW Naturale
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-navy sm:text-5xl lg:text-6xl">
              Let’s connect.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-gray-600 sm:text-lg">
              Have a question, want to place an order, or simply want to learn
              more about GLAW Naturale? Get in touch with us.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT CONTENT */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          {/* CONTACT DETAILS */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue">
              Get In Touch
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              We’d love to hear from you.
            </h2>

            <p className="mt-5 text-sm leading-7 text-gray-600 sm:text-base">
              For orders, enquiries, collaborations, or general questions,
              reach GLAW Naturale directly.
            </p>

            {/* WHATSAPP */}
            <a
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex items-center justify-between rounded-2xl border border-gray-100 bg-surface p-5 transition-all duration-200 hover:border-red/30 hover:shadow-sm"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
                  WhatsApp
                </p>

                <p className="mt-2 text-base font-semibold text-navy">
                  {businessPhone}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Chat with GLAW Naturale
                </p>
              </div>

              <span className="rounded-full bg-red px-4 py-2 text-xs font-semibold text-white">
                Message
              </span>
            </a>

            {/* EMAIL */}
            {businessEmail && (
              <a
                href={`mailto:${businessEmail}`}
                className="mt-4 block rounded-2xl border border-gray-100 bg-surface p-5 transition-all duration-200 hover:border-red/30 hover:shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
                  Email
                </p>

                <p className="mt-2 break-all text-sm font-semibold text-navy">
                  {businessEmail}
                </p>

                <p className="mt-1 text-xs font-medium text-red">
                  Send us an email →
                </p>
              </a>
            )}

            {/* LOCATION */}
            <a
              href={mapLink || fallbackMapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block rounded-2xl border border-gray-100 bg-surface p-5 transition-all duration-200 hover:border-red/30 hover:shadow-sm"
              aria-label="View GLAW Naturale location on Google Maps"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
                Location
              </p>

              <p className="mt-2 text-sm font-semibold leading-6 text-navy">
                📍 {address}
              </p>

              <p className="mt-2 text-xs font-medium text-red">
                View on Google Maps →
              </p>
            </a>

            {/* SOCIALS */}
            {socialLinks.length > 0 && (
              <div className="mt-10">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
                  Follow GLAW Naturale
                </p>

                <div className="mt-4 flex items-center gap-3">
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
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-navy transition-all duration-200 hover:border-red hover:bg-red hover:text-white"
                      >
                        <Icon className="h-[17px] w-[17px]" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* CONTACT FORM */}
          <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red">
                Send a Message
              </p>

              <h2 className="mt-3 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                How can we help?
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-navy"
                >
                  Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  required
                  disabled={isSubmitting}
                  className="mt-2 min-h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-navy outline-none transition-colors placeholder:text-gray-400 focus:border-navy disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-navy"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Your email address"
                  required
                  disabled={isSubmitting}
                  className="mt-2 min-h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-navy outline-none transition-colors placeholder:text-gray-400 focus:border-navy disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="text-sm font-medium text-navy"
                >
                  Subject
                </label>

                <input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="What is this about?"
                  required
                  disabled={isSubmitting}
                  className="mt-2 min-h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-navy outline-none transition-colors placeholder:text-gray-400 focus:border-navy disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="text-sm font-medium text-navy"
                >
                  Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  placeholder="Write your message..."
                  required
                  disabled={isSubmitting}
                  className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-navy outline-none transition-colors placeholder:text-gray-400 focus:border-navy disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-red/20 bg-red/5 px-4 py-3 text-sm leading-6 text-red">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="rounded-xl border border-blue/20 bg-blue/5 px-4 py-3 text-sm leading-6 text-navy">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-red px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-navy disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* BRAND CTA */}
      <section className="bg-navy">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
            GLAW Naturale
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Where health meets convenience, and nature meets your glass.
          </h2>

          <p className="mt-5 text-lg font-semibold text-white">
            A Drink For Your Health.
          </p>

          <Link
            href="/products"
            className="mt-7 inline-flex rounded-full bg-red px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-navy"
          >
            Explore Products
          </Link>
        </div>
      </section>
    </main>
  );
}