"use client";

import { useEffect, useRef } from "react";

const testimonials = [
  {
    quote:
      "GLAW Naturale has become part of my healthy routine. The drinks are refreshing, natural, and actually taste good.",
    name: "Amaka O.",
    role: "Customer",
  },
  {
    quote:
      "I love knowing that I can enjoy something refreshing while still being intentional about what I put into my body.",
    name: "Sarah A.",
    role: "Customer",
  },
  {
    quote:
      "The taste is amazing, and the quality is even better. GLAW Naturale is one of those brands I keep coming back to.",
    name: "Chioma E.",
    role: "Customer",
  },
  {
    quote:
      "From the first bottle, I could tell there was something different about GLAW Naturale. Fresh, enjoyable, and made with care.",
    name: "Blessing N.",
    role: "Customer",
  },
];

export default function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;

    if (!track) return;

    let animationFrame: number;
    let position = 0;

    const animate = () => {
      position -= 0.35;

      const firstCard = track.children[0] as HTMLElement;

      if (firstCard) {
        const cardWidth = firstCard.offsetWidth + 24;

        if (Math.abs(position) >= cardWidth) {
          track.appendChild(firstCard);
          position += cardWidth;
        }
      }

      track.style.transform = `translateX(${position}px)`;
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <section className="overflow-hidden bg-white py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Section heading */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#1E4F91]">
            What People Say
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-[#14213D] sm:text-4xl lg:text-5xl">
            Loved by people who choose wellness
          </h2>

          <p className="mt-4 text-base leading-7 text-gray-600 sm:text-lg">
            Real experiences from people making healthier choices with GLAW
            Naturale.
          </p>
        </div>
      </div>

      {/* Testimonial carousel */}
      <div className="relative">
        <div
          ref={trackRef}
          className="flex w-max gap-6 pl-6 sm:pl-8 lg:pl-12"
        >
          {testimonials.map((testimonial, index) => (
            <article
              key={`${testimonial.name}-${index}`}
              className="w-[300px] shrink-0 rounded-2xl border border-gray-100 bg-[#F8FAFC] p-7 shadow-sm sm:w-[360px] sm:p-8 lg:w-[390px]"
            >
              {/* Quote mark */}
              <div className="mb-5 text-4xl font-serif leading-none text-[#C62828]">
                “
              </div>

              <p className="min-h-[120px] text-base leading-7 text-gray-700">
                {testimonial.quote}
              </p>

              <div className="mt-7 border-t border-gray-200 pt-5">
                <p className="font-semibold text-[#14213D]">
                  {testimonial.name}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {testimonial.role}
                </p>
              </div>
            </article>
          ))}

          {/* Duplicate cards for smoother continuous movement */}
          {testimonials.map((testimonial, index) => (
            <article
              key={`duplicate-${testimonial.name}-${index}`}
              className="w-[300px] shrink-0 rounded-2xl border border-gray-100 bg-[#F8FAFC] p-7 shadow-sm sm:w-[360px] sm:p-8 lg:w-[390px]"
            >
              <div className="mb-5 text-4xl font-serif leading-none text-[#C62828]">
                “
              </div>

              <p className="min-h-[120px] text-base leading-7 text-gray-700">
                {testimonial.quote}
              </p>

              <div className="mt-7 border-t border-gray-200 pt-5">
                <p className="font-semibold text-[#14213D]">
                  {testimonial.name}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {testimonial.role}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Small note */}
      <div className="mx-auto mt-12 max-w-7xl px-6 text-center sm:px-8 lg:px-12">
        <p className="text-sm text-gray-500">
          Your health journey deserves something good.
        </p>
      </div>
    </section>
  );
}