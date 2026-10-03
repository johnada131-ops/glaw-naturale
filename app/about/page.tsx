import Image from "next/image";
import Link from "next/link";

const address =
  "Glaw Naturale N More Limited, Rivtaf Golf Estate, GT 37B, Phase 2, Peter Odili Road, Okuruama, Port Harcourt, Rivers State, Nigeria";

const mapLink =
  "https://www.google.com/maps/search/?api=1&query=Glaw+Naturale+N+More+Limited%2C+Rivtaf+Golf+Estate%2C+GT+37B%2C+Phase+2%2C+Peter+Odili+Road%2C+Okuruama%2C+Port+Harcourt%2C+Rivers+State%2C+Nigeria";

export default function AboutPage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className="order-1">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red">
                About GLAW Naturale
              </p>

              <h1 className="mt-4 text-4xl font-bold tracking-tight text-navy sm:text-5xl lg:text-6xl">
                Where healthier living meets everyday convenience.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-gray-600 sm:text-lg">
                GLAW Naturale N More is a health and wellness-focused company
                created to make healthy drinks and healthier lifestyle choices
                more convenient for everyday people.
              </p>

              <p className="mt-5 max-w-2xl text-base leading-8 text-gray-600">
                Founded on August 11, 2020, GLAW Naturale was born during the
                COVID-19 period from a desire to meet the healthy needs of the
                local community and encourage practical lifestyle change.
              </p>
            </div>

            <div className="order-2 relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-white">
              <Image
                src="/about/grace-glaw-naturale.jpg"
                alt="Grace Oladipo, founder of GLAW Naturale"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue">
              Our Story
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Born from a need for healthier everyday living.
            </h2>

            <p className="mt-5 text-sm font-medium text-red">
              August 11, 2020
            </p>
          </div>

          <div className="space-y-5 text-base leading-8 text-gray-600">
            <p>
              GLAW Naturale was birthed during COVID-19 from a place of meeting
              the healthy needs of people within the local community.
            </p>

            <p>
              From the beginning, the vision was connected to lifestyle
              modification — encouraging people to exercise, eat right and stay
              hydrated as part of a healthier way of living.
            </p>

            <p>
              The idea also grew from a desire to support women working toward
              returning to their pre-wedding sizes through sustainable changes
              in everyday lifestyle rather than focusing on one part of
              wellbeing alone.
            </p>

            <p>
              That vision became the foundation for GLAW Naturale N More:
              providing healthy drinks while encouraging people to make
              healthier choices in their everyday lives.
            </p>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red">
              What We Do
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Healthy drinks made for real everyday life.
            </h2>

            <p className="mt-5 text-base leading-8 text-gray-600">
              GLAW Naturale N More provides freshly squeezed fruit and vegetable
              drinks, alongside tigernut milk, with convenience at the heart
              of the experience.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            <article className="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red/10 text-red">
                <span className="text-lg font-bold">01</span>
              </div>

              <h3 className="mt-6 text-xl font-semibold text-navy">
                Fresh Fruit Drinks
              </h3>

              <p className="mt-3 text-sm leading-7 text-gray-600">
                Freshly prepared fruit drinks created to make healthier
                refreshment easier to enjoy.
              </p>
            </article>

            <article className="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue/10 text-blue">
                <span className="text-lg font-bold">02</span>
              </div>

              <h3 className="mt-6 text-xl font-semibold text-navy">
                Vegetable Drinks
              </h3>

              <p className="mt-3 text-sm leading-7 text-gray-600">
                Fresh vegetable-based drinks created as part of a more
                intentional approach to everyday choices.
              </p>
            </article>

            <article className="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red/10 text-red">
                <span className="text-lg font-bold">03</span>
              </div>

              <h3 className="mt-6 text-xl font-semibold text-navy">
                Tigernut Milk
              </h3>

              <p className="mt-3 text-sm leading-7 text-gray-600">
                Tigernut milk made available as another natural drink option
                within the GLAW Naturale range.
              </p>
            </article>
          </div>

          <div className="mt-10 rounded-[2rem] bg-navy px-6 py-8 sm:px-10 sm:py-10">
            <p className="max-w-3xl text-base leading-8 text-white/80">
              GLAW Naturale is tailored to serve working people who may not
              always have time for market runs, while remaining accessible to
              both the elite and the masses. The goal is to bring together
              health, wellbeing, convenience and premium enjoyment.
            </p>
          </div>
        </div>
      </section>

      {/* Healthy Living */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-surface">
            <Image
              src="/about/grace-fitness.jpg"
              alt="Grace Oladipo during a fitness and wellness session"
              fill
              className="object-cover"
            />
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue">
              Healthy Living
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              More than what is in the bottle.
            </h2>

            <div className="mt-6 space-y-5 text-base leading-8 text-gray-600">
              <p>
                GLAW Naturale saw the need to help individuals pursue healthier
                lifestyles through practical lifestyle modification.
              </p>

              <p>
                Alongside its healthy drinks, the brand has shared daily
                exercise videos and motivational content with people in its
                community.
              </p>

              <p>
                The wider vision is simple: encourage people to pay attention
                to the everyday choices that contribute to how they live,
                move, eat and stay hydrated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className="order-2 lg:order-1">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red">
                Meet the Founder
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
                Grace Oladipo
              </h2>

              <p className="mt-2 text-sm font-semibold text-blue">
                Founder, GLAW Naturale N More
              </p>

              <div className="mt-6 space-y-5 text-base leading-8 text-gray-600">
                <p>
                  Grace Oladipo is the founder of GLAW Naturale N More and a
                  fitness and wellness coach, entrepreneur and event host.
                </p>

                <p>
                  Her work brings together her interest in healthy living,
                  fitness, people and meaningful experiences. That wider
                  professional journey helped shape the vision behind GLAW
                  Naturale.
                </p>

                <p>
                  Through GLAW Naturale, Grace has created a platform that
                  connects healthy drinks with the everyday lifestyle choices
                  that support wellbeing.
                </p>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-navy shadow-sm">
                  Fitness & Wellness
                </span>

                <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-navy shadow-sm">
                  Entrepreneur
                </span>

                <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-navy shadow-sm">
                  Event Host & MC
                </span>
              </div>
            </div>

            <div className="order-1 relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-white lg:order-2">
              <Image
                src="/about/grace-main.jpg"
                alt="Grace Oladipo, founder of GLAW Naturale"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue">
            Our Team
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Different roles. One shared purpose.
          </h2>

          <p className="mt-5 text-base leading-8 text-gray-600">
            GLAW Naturale is supported by a team working across production,
            digital visibility, customer supply and financial management.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TeamCard
            role="CEO / Founder"
            description="Curates and develops fruit and vegetable combinations to suit client needs while overseeing production."
          />

          <TeamCard
            role="Digital Brand Strategist"
            description="Strategically positions the GLAW Naturale brand for visibility across social media."
          />

          <TeamCard
            role="Digital Marketer"
            description="Keeps products and services consistently and timely represented online."
          />

          <TeamCard
            role="Production Assistant"
            description="Supports the CEO with the production of GLAW Naturale drinks."
          />

          <TeamCard
            role="Sales Representative"
            description="Helps supply GLAW Naturale products to customers and maintain customer connections."
          />

          <TeamCard
            role="Accountant / Financial Advisor"
            description="Supports the financial management and financial direction of the business."
          />
        </div>
      </section>

      {/* Community */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red">
              Growing With Our Community
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Meeting people where healthier choices matter.
            </h2>

            <p className="mt-5 text-base leading-8 text-gray-600">
              GLAW Naturale connects with potential customers through a
              combination of digital visibility and direct community
              engagement.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CommunityCard title="Social Media" />
            <CommunityCard title="Sponsored Advertising" />
            <CommunityCard title="Gyms & Fitness Centres" />
            <CommunityCard title="Wellness Clubs" />
            <CommunityCard title="Workplaces" />
            <CommunityCard title="Hospitals & Events" />
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue">
            Our Mission
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-navy sm:text-4xl lg:text-5xl">
            To detoxify, energize, nourish, revitalize and hydrate.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-gray-600">
            GLAW Naturale is committed to making healthy drinks and healthier
            lifestyle choices more convenient and accessible while encouraging
            people to live intentionally.
          </p>
        </div>
      </section>

      {/* Location */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
          <div className="rounded-[2rem] border border-gray-100 bg-surface p-6 sm:p-8 lg:p-10">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red">
                  Find Us
                </p>

                <h2 className="mt-2 text-2xl font-bold text-navy">
                  GLAW Naturale N More
                </h2>

                <a
                  href={mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex max-w-2xl items-start gap-2 text-sm leading-7 text-gray-600 transition-colors hover:text-red"
                  aria-label="View GLAW Naturale address on Google Maps"
                >
                  <span aria-hidden="true">📍</span>
                  <span>{address}</span>
                </a>
              </div>

              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit shrink-0 items-center justify-center rounded-full border border-navy px-5 py-3 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
              >
                View on Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Statement */}
      <section className="bg-navy">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
            GLAW Naturale
          </p>

          <blockquote className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Where health meets convenience,
            <br className="hidden sm:block" />
            and nature meets your glass.
          </blockquote>

          <p className="mt-6 text-lg font-semibold text-white">
            A Drink For Your Health.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex flex-col gap-6 rounded-[2rem] bg-surface px-6 py-10 sm:px-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red">
              Explore GLAW Naturale
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
              Discover the drinks.
            </h2>
          </div>

          <Link
            href="/products"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-red px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-navy"
          >
            Explore Products
          </Link>
        </div>
      </section>
    </main>
  );
}

function TeamCard({
  role,
  description,
}: {
  role: string;
  description: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
      <div className="h-1.5 w-10 rounded-full bg-red" />

      <h3 className="mt-5 text-lg font-semibold text-navy">{role}</h3>

      <p className="mt-3 text-sm leading-7 text-gray-600">{description}</p>
    </article>
  );
}

function CommunityCard({ title }: { title: string }) {
  return (
    <div className="rounded-[1.5rem] border border-gray-100 bg-white px-5 py-5 shadow-sm">
      <p className="text-sm font-semibold text-navy">{title}</p>
    </div>
  );
}