import Hero from "@/components/home/Hero";
import ProductsSection from "@/components/home/ProductsSection";
import About from "@/components/home/About";
import Blog from "@/components/home/Blog";
import Testimonials from "@/components/home/testimonials";
import Trusted from "@/components/home/trusted";

export default function Home() {
  return (
    <main>
      <Hero />
      <ProductsSection />
      <About />
      <Blog />
      <Testimonials />
      <Trusted />
    </main>
  );
}