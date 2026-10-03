export default function About() {
  return (
    <section id="about" className="bg-[#f8f8f6] px-5 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* Brand story */}
          <div className="order-2 lg:order-1">
            <p className="font-[var(--font-montserrat)] text-xs font-semibold uppercase tracking-[0.2em] text-red">
              The Story Behind GLAW Naturale
            </p>

            <h2 className="mt-4 font-[var(--font-montserrat)] text-3xl font-bold leading-tight text-navy sm:text-4xl lg:text-5xl">
              Born from a need for healthier everyday living.
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-7 text-muted sm:text-base">
              GLAW Naturale was birthed on August 11, 2020, during the COVID-19
              period from a desire to meet the healthy needs of people in the
              local community.
            </p>

            <p className="mt-4 max-w-xl text-sm leading-7 text-muted sm:text-base">
              What began around exercise, eating right and staying hydrated
              grew into a brand creating fresh fruit and vegetable drinks and
              tigernut milk — making healthier choices more convenient for
              everyday life.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="font-[var(--font-montserrat)] text-sm font-semibold text-navy">
                Founded August 11, 2020
              </span>

              <span className="hidden h-1 w-1 rounded-full bg-red sm:block" />

              <span className="text-sm text-muted">
                Port Harcourt, Rivers State
              </span>
            </div>

            <p className="mt-4 text-sm text-muted">
              Founded by{" "}
              <span className="font-semibold text-navy">Grace Oladipo</span>,
              founder, fitness and wellness coach, and entrepreneur.
            </p>

            <div className="mt-8">
              <a
                href="/about"
                className="inline-flex rounded-full bg-navy px-6 py-3 text-sm font-semibold !text-white transition-all duration-300 hover:-translate-y-1 hover:bg-red hover:shadow-lg"
              >
                Discover Our Story
              </a>
            </div>
          </div>

          {/* Grace portrait */}
          <div className="order-1 lg:order-2">
            <div className="relative mx-auto max-w-xl">
              <div className="relative overflow-hidden rounded-sm">
                <img
                  src="/images/grace-glaw-about.jpg"
                  alt="Grace Oladipo, founder of GLAW Naturale"
                  className="h-full w-full object-cover"
                />

                {/* Subtle brand overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>

              {/* Brand accent */}
              <div className="absolute -bottom-3 -left-3 h-16 w-16 border-b-2 border-l-2 border-red sm:-bottom-4 sm:-left-4 sm:h-20 sm:w-20" />

              <div className="absolute -right-3 -top-3 bg-navy px-4 py-3 sm:-right-4 sm:-top-4 sm:px-5 sm:py-4">
                <p className="font-[var(--font-montserrat)] text-xs font-semibold uppercase tracking-[0.18em] text-white">
                  GLAW Naturale
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}