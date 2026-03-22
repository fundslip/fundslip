"use client";

import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { Features } from "@/components/home/features";
import { CTA } from "@/components/home/cta";

export default function HomePage() {
  return (
    <Providers>
      <Navbar />
      <main className="pt-[72px] flex-1">
        <Hero />
        <Features />
        <CTA />
      </main>
      <Footer />
    </Providers>
  );
}
