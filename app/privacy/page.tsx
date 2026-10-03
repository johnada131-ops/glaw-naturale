import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="bg-white">
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red">
            Privacy Policy
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-navy sm:text-5xl">
            Your privacy matters.
          </h1>

          <p className="mt-6 text-base leading-8 text-gray-600 sm:text-lg">
            This Privacy Policy explains how GLAW Naturale may collect, use,
            and protect information provided when you interact with this
            website.
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
              Information we may collect
            </h2>

            <p className="mt-4 text-sm leading-7 sm:text-base">
              When you use this website, you may choose to provide information
              such as your name, email address, phone number, or other details
              when contacting GLAW Naturale, subscribing to communications, or
              making an enquiry.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy">
              How we may use your information
            </h2>

            <p className="mt-4 text-sm leading-7 sm:text-base">
              Information you provide may be used to respond to enquiries,
              communicate with you about GLAW Naturale, provide requested
              information, process orders or requests, and improve the website
              and customer experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy">
              Newsletter communications
            </h2>

            <p className="mt-4 text-sm leading-7 sm:text-base">
              If you subscribe to the GLAW Naturale newsletter, your email
              address may be used to send wellness information, recipes,
              updates, and other communications related to GLAW Naturale. You
              should be able to unsubscribe from marketing communications when
              the newsletter system is connected.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy">
              Third-party services
            </h2>

            <p className="mt-4 text-sm leading-7 sm:text-base">
              Some website features may use third-party services, such as
              social media platforms, mapping services, messaging services, or
              future email and website tools. Those services may process
              information according to their own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy">
              Data protection
            </h2>

            <p className="mt-4 text-sm leading-7 sm:text-base">
              GLAW Naturale intends to take reasonable steps to protect
              information provided through the website. However, no internet
              transmission or electronic storage system can be guaranteed to
              be completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy">
              Changes to this policy
            </h2>

            <p className="mt-4 text-sm leading-7 sm:text-base">
              This Privacy Policy may be updated as the website and its
              services develop. Any updated version will be published on this
              page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy">
              Contact GLAW Naturale
            </h2>

            <p className="mt-4 text-sm leading-7 sm:text-base">
              If you have questions about this Privacy Policy or how your
              information is handled, please contact GLAW Naturale through the
              contact options available on this website.
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