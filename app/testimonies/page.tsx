import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Testimonials | GLAW Naturale",
  description:
    "See real testimonials and experiences shared by GLAW Naturale customers.",
  robots: {
    index: true,
    follow: true,
  },
};

type Testimonial = {
  id: string;
  media_type: "image" | "video";
  media_url: string;
  created_at: string;
};

export default async function TestimoniesPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("testimonials")
    .select("id, media_type, media_url, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const testimonials = (data || []) as Testimonial[];

  return (
    <main className="min-h-screen bg-white">
      {/* HEADER */}
      <section className="px-5 pb-12 pt-16 sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#d62828]">
              Customer Experiences
            </p>

            <h1 className="text-3xl font-bold text-[#0d3b66] sm:text-4xl">
              Testimonials
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              Real experiences shared by people who have enjoyed GLAW
              Naturale.
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-5 pb-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          {error ? (
            <div className="rounded-2xl bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">
                Testimonials are temporarily unavailable.
              </p>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-10 text-center">
              <p className="text-sm text-slate-500">
                Testimonials will appear here soon.
              </p>
            </div>
          ) : (
            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
              {testimonials.map((testimonial) => (
                <article
                  key={testimonial.id}
                  className="mb-6 break-inside-avoid overflow-hidden rounded-2xl bg-slate-50"
                >
                  {testimonial.media_type === "image" ? (
                    <img
                      src={testimonial.media_url}
                      alt="GLAW Naturale customer testimonial"
                      className="block h-auto w-full"
                      loading="lazy"
                    />
                  ) : testimonial.media_type === "video" ? (
                    <video
                      controls
                      playsInline
                      preload="none"
                      className="block h-auto w-full"
                      aria-label="GLAW Naturale customer video testimonial"
                    >
                      <source
                        src={testimonial.media_url}
                        type="video/mp4"
                      />
                      Your browser does not support video playback.
                    </video>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}