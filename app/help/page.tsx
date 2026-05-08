import { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/app-shell/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  TrendingUp,
  Wallet,
  GraduationCap,
  Zap,
  Mail,
  Instagram,
  Youtube,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Help Center — PredictionTrade",
  description:
    "Get started with PredictionTrade. Learn how to use the simulator, paper trade with $100,000 virtual funds, and master prediction markets.",
};

const faqs = [
  {
    q: "What is PredictionTrade?",
    a: "PredictionTrade is a free risk-free simulator for prediction markets. You get $100,000 in virtual funds to practice trading with real-time market data from Polymarket — no real money involved.",
  },
  {
    q: "Do I need to pay to use it?",
    a: "No. The platform is 100% free. Sign up with an email and you instantly get $100,000 virtual to start practicing.",
  },
  {
    q: "Where does the market data come from?",
    a: "All prices and odds come live from the Polymarket Gamma API. The data you see in the simulator is the same as the real market.",
  },
  {
    q: "Can I lose real money?",
    a: "No. All trades are simulated using virtual funds. Nothing on this platform involves real money or real trading.",
  },
  {
    q: "How do I reset my virtual balance?",
    a: "Go to your Demo Trading dashboard. There's a reset option that returns your balance to $100,000 and clears all positions.",
  },
  {
    q: "What is the Academy?",
    a: "The Academy is our free trading education system. Lessons cover risk management, market psychology, position sizing, and more — designed for beginners.",
  },
  {
    q: "What is the Game (Prediction Flash)?",
    a: "Prediction Flash is a fast-paced arcade-style mini-game where you predict short-term price movements. It's designed to train quick decision-making under pressure.",
  },
  {
    q: "Is my data safe?",
    a: "We only store the minimum needed for your account: email and gameplay data. We never sell or share your information. Authentication is handled by Supabase.",
  },
];

const quickStart = [
  {
    icon: Wallet,
    title: "1. Sign up free",
    desc: "Create an account and instantly receive $100,000 in virtual funds.",
    href: "/auth/sign-up",
    cta: "Sign up",
  },
  {
    icon: TrendingUp,
    title: "2. Browse markets",
    desc: "Explore live prediction markets from Polymarket — politics, crypto, sports.",
    href: "/markets",
    cta: "View markets",
  },
  {
    icon: GraduationCap,
    title: "3. Learn the basics",
    desc: "Take free lessons in the Academy to build your trading foundation.",
    href: "/academy",
    cta: "Open Academy",
  },
  {
    icon: Zap,
    title: "4. Test your reflexes",
    desc: "Try Prediction Flash — the fast-paced prediction mini-game.",
    href: "/play",
    cta: "Play now",
  },
];

export default function HelpPage() {
  return (
    <AppShell requireAuth={false}>
      <main className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Help Center</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to get started with PredictionTrade.
          </p>
        </div>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Quick start</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {quickStart.map((step) => (
              <Card key={step.title} className="hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{step.desc}</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href={step.href}>{step.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Frequently asked questions</h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <Card key={faq.q}>
                <CardHeader>
                  <CardTitle className="text-base">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Still need help?</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-6">
                Reach out on social media or send us a message — we usually reply within 24 hours.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline" className="gap-2">
                  <a
                    href="https://www.instagram.com/predictiontradeonline/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </a>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <a
                    href="https://www.youtube.com/@PredictionTrade"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Youtube className="w-4 h-4" />
                    YouTube
                  </a>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <a href="mailto:predictionmarkets.solutions@gmail.com">
                    <Mail className="w-4 h-4" />
                    Email us
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </AppShell>
  );
}
