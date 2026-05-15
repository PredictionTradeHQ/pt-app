"use client";

import Link from "next/link";
import { Trophy, GraduationCap, TrendingUp, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

const socialLinks = [
  {
    icon: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
    name: "Instagram",
    handle: "@predictiontradeonline",
    descEn: "Daily market calls & prediction highlights",
    descEs: "Predicciones diarias y highlights del mercado",
    href: "https://www.instagram.com/predictiontradeonline/",
    external: true,
  },
  {
    icon: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    name: "YouTube",
    handle: "@PredictionTrade",
    descEn: "Market breakdowns, forecasting tips & strategy",
    descEs: "Análisis de mercados, consejos y estrategia",
    href: "https://www.youtube.com/@PredictionTrade",
    external: true,
  },
];

const platformFeatures = [
  {
    icon: Trophy,
    titleEn: "Leaderboard",
    titleEs: "Ranking",
    descEn: "See the top forecasters ranked by accuracy and streak. Your public profile goes live after your first prediction.",
    descEs: "Los mejores predictores por precisión y racha. Tu perfil público se activa con tu primera predicción.",
    href: "/leaderboard",
    external: false,
  },
  {
    icon: GraduationCap,
    titleEn: "Forecasting Academy",
    titleEs: "Academia",
    descEn: "Free lessons on how prediction markets work — probabilities, signals, and how to read community consensus.",
    descEs: "Lecciones gratis sobre mercados de predicción — probabilidades, señales y consenso de la comunidad.",
    href: "/academy",
    external: false,
  },
  {
    icon: TrendingUp,
    titleEn: "Live Markets",
    titleEs: "Mercados en vivo",
    descEn: "Browse real-world events powered by Polymarket. Make your call, build your record, share when you're right.",
    descEs: "Eventos reales del mundo con datos de Polymarket. Haz tu predicción, construye tu historial, comparte cuando aciertes.",
    href: "/markets",
    external: false,
  },
];

export function Community() {
  const { language } = useLanguage();
  const isEs = language === "es";

  return (
    <section id="community" className="py-24 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-medium tracking-wider uppercase mb-4">
            {isEs ? "Comunidad" : "Community"}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            {isEs ? "Tu reputación es pública" : "Your reputation is public"}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            {isEs
              ? "Cada predicción que haces construye tu historial. Los mejores predictores aparecen en el ranking y pueden compartir su perfil."
              : "Every prediction you make builds your track record. Top forecasters get featured on the leaderboard and can share their profile."}
          </p>
        </div>

        {/* Platform feature cards */}
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {platformFeatures.map((feature) => {
            const title = isEs ? feature.titleEs : feature.titleEn;
            const desc = isEs ? feature.descEs : feature.descEn;
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="group p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </Link>
            );
          })}
        </div>

        {/* Social links */}
        <div className="border-t border-border/50 pt-12">
          <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">
            {isEs ? "Síguenos" : "Follow us"}
          </p>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {socialLinks.map((social, idx) => {
              const desc = isEs ? social.descEs : social.descEn;
              return (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                      <social.icon />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold mb-1 group-hover:text-primary transition-colors">
                    {social.name}
                  </h3>
                  <p className="text-primary text-sm mb-2">{social.handle}</p>
                  <p className="text-muted-foreground text-sm">{desc}</p>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
