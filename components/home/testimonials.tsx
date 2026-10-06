"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Testimonial = {
  id: string;
  media_type: "image";
  media_url: string;
  created_at: string;
};

export default function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadTestimonials() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("testimonials")
        .select("id, media_type, media_url, created_at")
        .eq("status", "approved")
        .eq("media_type", "image")
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        console.error("Failed to load homepage testimonials:", error);
        setLoaded(true);
        return;
      }

      setTestimonials((data || []) as Testimonial[]);
      setLoaded(true);
    }

    loadTestimonials();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const track = trackRef.current;

    if (!track || testimonials.length === 0) return;

    let animationFrame: number;
    let position = 0;
    let previousTimestamp = 0;

    const animate = (timestamp: number) => {
      if (!track.children.length) return;

      const elapsed = previousTimestamp
        ? Math.min(timestamp - previousTimestamp, 32)
        : 16;

      previousTimestamp = timestamp;

      position -= 0.35 * (elapsed / 16);

      const firstCard = track.children[0] as HTMLElement | undefined;

      if (firstCard) {
        const cardWidth =
          firstCard.getBoundingClientRect().width + 24;

        if (cardWidth > 24 && Math.abs(position) >= cardWidth) {
          track.appendChild(firstCard);
          position += cardWidth;
        }
      }

      track.style.transform = `translateX(${position}px)`;

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [testimonials]);

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

      {/* Image testimonial carousel */}
      <div className="relative">
        {testimonials.length > 0 ? (
          <div
            ref={trackRef}
            className="flex w-max gap-6 pl-6 sm:pl-8 lg:pl-12"
          >
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.id}
                className="w-[300px] shrink-0 overflow-hidden rounded-2xl sm:w-[360px] lg:w-[390px]"
              >
                <img
                  src={testimonial.media_url}
                  alt="GLAW Naturale customer testimonial"
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full rounded-2xl object-contain"
                />
              </article>
            ))}

            {/* Duplicate images for continuous movement */}
            {testimonials.map((testimonial) => (
              <article
                key={`duplicate-${testimonial.id}`}
                aria-hidden="true"
                className="w-[300px] shrink-0 overflow-hidden rounded-2xl sm:w-[360px] lg:w-[390px]"
              >
                <img
                  src={testimonial.media_url}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full rounded-2xl object-contain"
                />
              </article>
            ))}
          </div>
        ) : (
          <div className="px-6 text-center">
            <p className="text-sm text-gray-500">
              {loaded
                ? "Customer experiences will appear here soon."
                : "Loading customer experiences..."}
            </p>
          </div>
        )}
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