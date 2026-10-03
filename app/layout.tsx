import type { Metadata } from "next";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "GLAW Naturale",
  description:
    "Natural drinks made for healthier everyday choices. GLAW Naturale — A Drink For Your Health.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />

        {children}

        <Footer />
      </body>
    </html>
  );
}