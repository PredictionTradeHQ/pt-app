import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { LiveMarketsPreview } from "@/components/live-markets-preview";
import { Markets } from "@/components/markets";
import { WhyUs } from "@/components/why-us";
import { RiseInLeaderboard } from "@/components/rise-in-leaderboard";
import { Community } from "@/components/community";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        {/* Live Markets with Search & Filters - Right after Hero */}
        <LiveMarketsPreview />
        <section id="leaderboard">
          <RiseInLeaderboard />
        </section>
        <section id="como-funciona">
          <HowItWorks />
        </section>
        <section id="mercados">
          <Markets />
        </section>
        <section id="ventajas">
          <WhyUs />
        </section>
        <section id="comunidad">
          <Community />
        </section>
        <section id="contacto">
          <Contact />
        </section>
      </main>
      <Footer />
    </div>
  );
}
