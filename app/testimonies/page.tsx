import Link from "next/link";

const testimonies = [
  {
    quote:
      "GLAW Naturale has become one of those simple choices that fits naturally into my everyday routine.",
    name: "Customer Name",
    role: "Customer",
  },
  {
    quote:
      "The drinks are refreshing, convenient, and easy to enjoy as part of a healthier lifestyle.",
    name: "Customer Name",
    role: "Customer",
  },
  {
    quote:
      "I love having a natural option that I can easily include in my day.",
    name: "Customer Name",
    role: "Customer",
  },
  {
    quote:
      "GLAW Naturale makes choosing something refreshing and health-conscious feel simple.",
    name: "Customer Name",
    role: "Customer",
  },
  {
    quote:
      "The experience has been great, and the drinks are genuinely enjoyable.",
    name: "Customer Name",
    role: "Customer",
  },
  {
    quote:
      "A convenient option when you want something refreshing without moving away from healthier choices.",
    name: "Customer Name",
    role: "Customer",
  },
];

export default function TestimoniesPage() {
  return (
    <main className="bg-white">
      {/* HERO */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red">
              Testimonies
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-navy sm:text-5xl lg:text-6xl">
              What people are saying about GLAW Naturale.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-gray-600 sm:text-lg">
              Real experiences from people who have enjoyed GLAW Naturale and
              made it part of their everyday choices.
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIES */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonies.map((testimony, index) => (
            <article
              key={index}
              className="flex min-h-[280px] flex-col rounded-[2rem] border border-gray-100 bg-white p-7 shadow-sm sm:p-8"
            >
              {/* QUOTE MARK */}
              <div className="text-4xl font-bold leading-none text-red">
                “
              </div>

              <blockquote className="mt-5 flex-1 text-base leading-7 text-gray-600">
                {testimony.quote}
              </blockquote>

              <div className="mt-8 border-t border-gray-100 pt-5">
                <p className="text-sm font-semibold text-navy">
                  {testimony.name}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {testimony.role}
                </p>
              </div>
            </article>
          ))}
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