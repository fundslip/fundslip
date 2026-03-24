import { Hero } from "@/components/home/hero";
import { Features } from "@/components/home/features";
import { CTA } from "@/components/home/cta";

export default function HomePage() {
  return (
    <main className="flex-1">
      <Hero />
      <Features />
      <CTA />
    </main>
  );
}
