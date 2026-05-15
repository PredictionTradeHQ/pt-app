"use client";

import Link from "next/link";
import { TrendingUp, Zap, GraduationCap, Trophy, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

const FEATURES = [
  {
    icon: TrendingUp,
    titleEn: "Live Markets",
    titleEs: "Mercados en vivo",
    descEn: "Browse real prediction markets and make your call. Every prediction builds your public track record.",
    descEs: "Explora mercados reales y haz tu predicción. Cada predicción construye tu historial público.",
    href: "/markets",
    accent: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Zap,
    titleEn: "Prediction Flash",
    titleEs: "Prediction Flash",
    descEn: "Fast-paced prediction rounds to sharpen your instincts. See how you rank against other forecasters.",
    descEs: "Rondas rápidas para afinar tu intuición. Comprueba cómo te comparas con otros predictores.",
    href: "/play",
    accent: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    icon: GraduationCap,
    titleEn: "Academy",
    titleEs: "Academia",
    descEn: "Free lessons on how prediction markets work. Learn to read signals before you make your first call.",
    descEs: "Lecciones gratis sobre cómo funcionan los mercados de predicción. Aprende antes de tu primera predicción.",
    href: "/academy",
    accent: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Trophy,
    titleEn: "Leaderboard",
    titleEs: "Ranking",
    descEn: "See the top forecasters ranked by accuracy, streak, and badges. Your profile is public — own it.",
    descEs: "Los mejores predictores clasificados por precisión, racha y badges. Tu perfil es público — demuéstralo.",
    href: "/leaderboard",
    accent: "text-primary",
    bg: "bg-primary/10",
  },
];

export function FeaturesGrid() {
  const { language } = useLanguage();
  const isEs = language === "es";

  return (
    <section id="features" className="py-24 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-medium tracking-wider uppercase mb-4">
            {isEs ? "Todo lo que ofrece la plataforma" : "What you get"}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            {isEs ? "Construye tu reputación como predictor" : "Build your forecasting reputation"}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            {isEs
              ? "Predice, compite y demuestra que tienes razón. Tu historial te sigue a todas partes."
              : "Predict, compete, and prove you're right. Your track record follows you everywhere."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="group relative p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card transition-all"
            >
              <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-5 ${f.accent} group-hover:scale-110 transition-transform`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {isEs ? f.titleEs : f.titleEn}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                {isEs ? f.descEs : f.descEn}
              </p>
              <div className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                {isEs ? "Abrir" : "Open"}
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
