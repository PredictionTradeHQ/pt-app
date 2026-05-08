import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { FeaturesGrid } from "@/components/features-grid";
import { HowItWorks } from "@/components/how-it-works";
import { LiveMarketsPreview } from "@/components/live-markets-preview";
import { WhyUs } from "@/components/why-us";
import { Community } from "@/components/community";
import { Footer } from "@/components/footer";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <FeaturesGrid />
        <LiveMarketsPreview />
        <section id="how-it-works">
          <HowItWorks />
        </section>
        <section id="advantages">
          <WhyUs />
        </section>
        <section id="community">
          <Community />
        </section>
      </main>
      <Footer />
    </div>
  );
}
