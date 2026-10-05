import Image from "next/image";
import Link from "next/link";
import {
  FiArrowRight,
  FiCheckCircle,
  FiMapPin,
  FiMessageCircle,
} from "react-icons/fi";

const teamMembers = [
  {
    name: "Grace Oladipo",
    role: "Founder & CEO",
    image: "/images/team/founder-grace.jpg",
  },
  {
    name: "Wisdom Bradford",
    role: "Digital Brand Strategist",
    image: "/images/team/digital-brand-strategist.jpg",
  },
  {
    name: "David Anthony",
    role: "Production Manager",
    image: "/images/team/production-manager.jpg",
  },
  {
    name: "Janet Zakka",
    role: "Procurement & Quality Manager",
    image: "/images/team/procurement-quality-manager.jpg",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-white text-navy">
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
          <div className="max-w-4xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-blue">
              About GLAW Naturale
            </p>

            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Where health meets convenience, and nature meets your glass.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-gray-600 sm:text-lg">
              GLAW Naturale N More is a natural wellness brand established to
              make healthy living more practical, accessible, and enjoyable
              through fresh natural drinks and lifestyle-focused wellness
              solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-center">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-blue">
                Our Story
              </p>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                A healthier choice, born from a personal journey.
              </h2>
            </div>

            <div className="space-y-5 text-base leading-8 text-gray-600">
              <p>
                GLAW Naturale N More began on August 11, 2020, from a personal
                desire to live healthier and make better lifestyle choices.
              </p>

              <p>
                What started as a personal journey grew into a brand focused
                on helping people make healthier choices without making
                wellness feel complicated or inaccessible.
              </p>

              <p>
                Today, GLAW Naturale creates fresh fruit and vegetable juices
                and tigernut milk while also encouraging healthy living,
                lifestyle modification, fitness, and better everyday choices.
              </p>

              <p>
                At the heart of the brand is a simple belief: choosing
                something healthier should be convenient enough to become part
                of everyday life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-blue">
              What We Do
            </p>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Making natural wellness easier to choose.
            </h2>

            <p className="mt-5 text-base leading-8 text-gray-600">
              We produce fresh natural drinks designed to support healthier
              everyday living while making wellness more convenient for busy
              people and families.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-white p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue/10 text-blue">
                <FiCheckCircle size={21} />
              </div>

              <h3 className="text-lg font-bold">Natural Drinks</h3>

              <p className="mt-3 text-sm leading-7 text-gray-600">
                Fresh fruit and vegetable juices, tigernut milk, and other
                natural drink options made with wellness in mind.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue/10 text-blue">
                <FiCheckCircle size={21} />
              </div>

              <h3 className="text-lg font-bold">Healthy Living</h3>

              <p className="mt-3 text-sm leading-7 text-gray-600">
                We encourage practical lifestyle choices that help people
                build healthier routines and sustain them.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue/10 text-blue">
                <FiCheckCircle size={21} />
              </div>

              <h3 className="text-lg font-bold">Lifestyle Support</h3>

              <p className="mt-3 text-sm leading-7 text-gray-600">
                Our brand extends beyond drinks into fitness, motivational
                content, and lifestyle modification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Stand For */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="relative overflow-hidden rounded-3xl bg-surface">
              <div className="relative aspect-[4/5]">
                <Image
                  src="/about/grace-fitness.jpg"
                  alt="Grace Oladipo promoting healthy living and fitness"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-blue">
                What We Stand For
              </p>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Wellness should become a way of life.
              </h2>

              <div className="mt-6 space-y-5 text-base leading-8 text-gray-600">
                <p>
                  GLAW Naturale is built around the idea that healthy living
                  should not be reserved for special occasions. It should be
                  something people can practice consistently in their everyday
                  lives.
                </p>

                <p>
                  From the drinks we make to the lifestyle conversations we
                  encourage, our goal is to make healthier choices easier to
                  understand and easier to maintain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div className="mx-auto w-full max-w-md">
              <div className="relative overflow-hidden rounded-3xl bg-white">
                <div className="relative aspect-square">
                  <Image
                    src="/images/team/founder-grace.jpg"
                    alt="Grace Oladipo, Founder and CEO of GLAW Naturale"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 400px"
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-blue">
                Our Founder
              </p>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Grace Oladipo
              </h2>

              <p className="mt-2 text-sm font-semibold text-blue">
                Founder & CEO
              </p>

              <div className="mt-6 space-y-5 text-base leading-8 text-gray-600">
                <p>
                  Grace Oladipo is the founder and driving force behind GLAW
                  Naturale N More.
                </p>

                <p>
                  Her personal journey toward healthier living became the
                  foundation for a brand that seeks to help others make
                  healthier choices in a practical and sustainable way.
                </p>

                <p>
                  Through GLAW Naturale, that vision has grown into a business
                  focused on natural drinks, wellness, fitness, and lifestyle
                  modification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-blue">
              The People Behind GLAW Naturale
            </p>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              A team working behind the brand.
            </h2>

            <p className="mt-5 text-base leading-8 text-gray-600">
              GLAW Naturale is supported by people who contribute across
              leadership, brand strategy, production, procurement, and quality
              management.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <div key={member.name} className="text-center">
                <div className="mx-auto h-40 w-40 overflow-hidden rounded-full border-4 border-surface bg-surface shadow-sm sm:h-44 sm:w-44">
                  <Image
                    src={member.image}
                    alt={`${member.name}, ${member.role}`}
                    width={176}
                    height={176}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="mt-5">
                  <h3 className="text-lg font-bold text-navy">
                    {member.name}
                  </h3>

                  <p className="mt-1 text-sm font-medium text-blue">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-blue">
              Our Community
            </p>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              More than a drink. A healthier community.
            </h2>

            <p className="mt-6 text-base leading-8 text-gray-600">
              GLAW Naturale exists to contribute to healthier communities by
              making natural products accessible while encouraging people to
              take their health and lifestyle choices seriously.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 text-center">
              <p className="text-3xl font-bold text-blue">1,800+</p>
              <p className="mt-2 text-sm text-gray-500">Clients reached</p>
            </div>

            <div className="rounded-2xl bg-white p-6 text-center">
              <p className="text-3xl font-bold text-blue">63,000+</p>
              <p className="mt-2 text-sm text-gray-500">Bottles sold</p>
            </div>

            <div className="rounded-2xl bg-white p-6 text-center">
              <p className="text-3xl font-bold text-blue">90%</p>
              <p className="mt-2 text-sm text-gray-500">Repeat orders</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8 lg:px-10 lg:py-24">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-blue">
            Our Vision
          </p>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Promoting healthier living.
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-gray-600">
            Our vision is to promote healthy living, improve the quality of
            life within our communities, and become a go-to brand for healthy
            living, lifestyle modification, and fitness.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8 lg:px-10 lg:py-24">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-blue">
            Our Mission
          </p>

          <h2 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            To DETOXIFY, ENERGIZE, NOURISH, REVITALIZE, HYDRATE Our Community.
          </h2>
        </div>
      </section>

      {/* Location */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="rounded-3xl border border-border bg-surface p-8 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div className="max-w-2xl">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue/10 text-blue">
                <FiMapPin size={21} />
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue">
                Find Us
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Our Location
              </h2>

              <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
                Glaw Naturale N More Limited, Rivtaf Golf Estate, GT 37B,
                Phase 2, Peter Odili Road, Okuruama, Port Harcourt, Rivers
                State, Nigeria.
              </p>
            </div>

            <div className="mt-7 lg:mt-0">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Glaw+Naturale+N+More+Limited+Rivtaf+Golf+Estate+Port+Harcourt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue sm:w-auto"
              >
                View on Google Maps
                <FiArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Statement */}
      <section className="bg-surface">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8 lg:px-10 lg:py-24">
          <p className="text-2xl font-bold leading-relaxed tracking-tight text-navy sm:text-3xl">
            Where health meets convenience, and nature meets your glass.
          </p>

          <p className="mt-4 text-sm font-medium text-blue">
            A drink for your health.
          </p>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-gray-600">
            Fresh natural choices for people who want to make healthier living
            part of everyday life.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue sm:w-auto"
            >
              Explore Our Products
              <FiArrowRight size={16} />
            </Link>

            <a
              href="https://wa.me/2348069161689"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue sm:w-auto"
            >
              <FiMessageCircle size={16} />
              Order on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}