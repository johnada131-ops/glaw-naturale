"use client";

import { useEffect, useState } from "react";

const heroImages = [
  "/images/hero-1.jpg",
  "/images/hero-2.jpg",
  "/images/hero-3.jpg",
  "/images/hero-4.jpg",
  "/images/hero-5.jpg",
  "/images/hero-6.jpg",
  "/images/hero-7.jpg",
  "/images/hero-8.jpg",
  "/images/hero-9.jpg",
];

export default function Hero() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((previous) => (previous + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[85vh] overflow-hidden sm:min-h-[90vh]">
      {/* Background product images */}
      {heroImages.map((image, index) => (
        <img
          key={image}
          src={image}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1800ms] ease-in-out ${
            index === currentImage ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Hero content */}
      <div className="relative z-10 flex min-h-[85vh] items-center justify-center px-6 text-center sm:min-h-[90vh] sm:px-10">
        <div className="w-full max-w-4xl">
          {/* Brand name */}
          <h1 className="font-[var(--font-montserrat)] text-5xl font-extrabold leading-none tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
            GLAW{" "}
            <span className="text-navy">
              Naturale
            </span>
          </h1>

          {/* Slogan */}
          <h2 className="mt-5 font-[var(--font-montserrat)] text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
            A Drink For Your Health.
          </h2>

          {/* Brand statement */}
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-white/90 sm:text-base sm:leading-7 lg:text-lg">
            Where health meets convenience, and nature meets your glass.
          </p>

          {/* Buttons */}
          <div className="mt-7 flex flex-wrap justify-center gap-3 sm:mt-8 sm:gap-4">
            <a
              href="#products"
              className="rounded-full bg-navy px-5 py-3 text-xs font-semibold !text-white transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-red hover:shadow-lg sm:px-6 sm:py-3 sm:text-sm"
            >
              Explore Our Drinks
            </a>

            <a
              href="#about"
              className="rounded-full border border-white px-5 py-3 text-xs font-semibold !text-white transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-red hover:bg-red hover:shadow-lg sm:px-6 sm:py-3 sm:text-sm"
            >
              Discover GLAW
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}