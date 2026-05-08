"use client";

import { Play, Target, BarChart3 } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export function HowItWorks() {
  const { language } = useLanguage();
  const isEs = language === "es";

  const steps = [
    {
      icon: Play,
      step: "01",
      title: isEs ? "Recibe $100.000 virtuales" : "Get $100,000 Virtual",
      description: isEs
        ? "Empieza al instante con $100.000 en fondos de práctica. Sin cartera, sin depósitos, sin riesgo."
        : "Start instantly with $100,000 in paper trading funds. No wallet needed, no deposits, no risk.",
    },
    {
      icon: Target,
      step: "02",
      title: isEs ? "Opera en mercados reales" : "Trade Real Markets",
      description: isEs
        ? "Coloca operaciones de práctica sobre eventos en vivo de Polymarket. Mismos precios, mismas probabilidades, cero consecuencias."
        : "Place paper trades on live Polymarket events. Same prices, same odds, zero consequences.",
    },
    {
      icon: BarChart3,
      step: "03",
      title: isEs ? "Domina el juego" : "Master the Game",
      description: isEs
        ? "Sigue tu P&L y tu tasa de aciertos. Cuando aquí seas rentable, estarás listo para operar de verdad."
        : "Track your P&L and win rate. When you're profitable here, you're ready for the real thing.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-medium tracking-wider uppercase mb-4">
            {isEs ? "Trading de práctica" : "Paper Trading"}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            {isEs ? "Aprende antes de ganar" : "Learn Before You Earn"}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            {isEs
              ? "La mayoría de traders pierde dinero al empezar. El trading de práctica te permite cometer errores gratis y desarrollar estrategias ganadoras con datos reales de Polymarket."
              : "Most traders lose money when they start. Paper trading lets you make mistakes for free and develop winning strategies with real Polymarket data."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.step} className="relative group">
              <div className="p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors h-full">
                <span className="text-7xl font-bold text-border absolute top-4 right-4 group-hover:text-primary/20 transition-colors">
                  {step.step}
                </span>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 rounded-2xl border border-border bg-card/30 backdrop-blur-sm">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-primary mb-2">
                {isEs ? "$100.000" : "$100,000"}
              </p>
              <p className="text-muted-foreground">
                {isEs ? "Balance inicial" : "Starting Balance"}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary mb-2">100+</p>
              <p className="text-muted-foreground">
                {isEs ? "Mercados en vivo" : "Live Markets"}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary mb-2">$0</p>
              <p className="text-muted-foreground">
                {isEs ? "Dinero real en riesgo" : "Real Money at Risk"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
