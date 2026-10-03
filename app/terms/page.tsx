import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="bg-white">
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red">
            Terms of Use
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-navy sm:text-5xl">
            Using the GLAW Naturale website.
          </h1>

          <p className="mt-6 text-base leading-8 text-gray-600 sm:text-lg">
            These terms describe the general conditions for using the GLAW
            Naturale website and its available content and features.
          </p>

          <p className="mt-4 text-sm text-gray-500">
            Last updated: October 2026
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="space-y-10 text-gray-600">
          <section>
            <h2 className="text-2xl font-bold text-navy">
              Use of this website
            </h2>

            <p className="mt-4 text-sm leading-7 sm:text-base">
              You may use this website for lawful purposes and in accordance
              with these terms. You should not use the website in a way that
              could damage, disable, overburden, or interfere with the website
              or its availability to other users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy">
              Website content
            </h2>

            <p className="mt-4 text-sm leading-7 sm:text-base">
              Content published on this website, including text, images,
              graphics, logos, branding, and other materials, belongs to GLAW
              Naturale or is used with appropriate permission unless otherwise
              stated.
            </p>

            <p className="mt-4 text-sm leading-7 sm:text-base">
              Website content should not be copied, reproduced, modified, or
              commercially reused without appropriate permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy">
              Product information
            </h2>

            <p className="mt-4 text-sm leading-7 sm:text-base">
              Product information presented on the website is provided for
              general informational purposes. Product availability,
              ingredients, pricing, packaging, and other details may change.
              Please contact GLAW Naturale directly for current information
              before placing an order.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy">
              Orders and enquiries
            </h2>

            <p className="mt-4 text-sm leading-7 sm:text-base">
              Links provided on the website may direct you to WhatsApp or other
              third-party services for orders and enquiries. Any transaction
              or communication completed through those services may also be
              subject to their respective terms and policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy">
              Third-party links
            </h2>

            <p className="mt-4 text-sm leading-7 sm:text-base">
              This website may contain links to third-party websites and
              services. GLAW Naturale is not responsible for the content,
              availability, or policies of websites that it does not control.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy">
              Website availability
            </h2>

            <p className="mt-4 text-sm leading-7 sm:text-base">
              We aim to keep the website available and accurate, but we do not
              guarantee that the website will always be available, error-free,
              or completely up to date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy">
              Changes to these terms
            </h2>

            <p className="mt-4 text-sm leading-7 sm:text-base">
              These terms may be updated as the website, products, and services
              develop. Updated terms will be published on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy">
              Contact GLAW Naturale
            </h2>

            <p className="mt-4 text-sm leading-7 sm:text-base">
              If you have questions about these terms, please contact GLAW
              Naturale through the available contact options.
            </p>

            <Link
              href="/contact"
              className="mt-5 inline-flex rounded-full bg-red px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy"
            >
              Contact GLAW Naturale
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}