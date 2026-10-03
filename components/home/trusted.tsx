const trustedNames = [
  "Wellness Communities",
  "Fitness Professionals",
  "Healthy Living Brands",
  "Families",
  "Health Advocates",
];

export default function Trusted() {
  return (
    <section className="overflow-hidden border-y border-gray-100 bg-[#F8FAFC] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1E4F91]">
            Trusted By
          </p>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#14213D] sm:text-3xl">
            A healthier choice, shared by many
          </h2>

          <p className="mt-4 text-base leading-7 text-gray-600">
            GLAW Naturale is made for people who value better choices,
            refreshing taste, and everyday wellness.
          </p>
        </div>
      </div>

      {/* Moving names — left to right */}
      <div className="relative mt-12 overflow-hidden">
        <div className="flex w-max animate-[trusted-scroll-reverse_25s_linear_infinite] items-center gap-4 px-6 hover:[animation-play-state:paused]">
          {[...trustedNames, ...trustedNames].map((name, index) => (
            <div
              key={`${name}-${index}`}
              className="flex h-16 items-center rounded-full border border-gray-200 bg-white px-7 shadow-sm"
            >
              <span className="whitespace-nowrap text-sm font-semibold text-[#14213D] sm:text-base">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}