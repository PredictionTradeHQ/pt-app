"use client";

import { Zap, Target, Users, BarChart3, BookOpen, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export function WhyUs() {
  const { language } = useLanguage();
  const isEs = language === "es";

  const features = [
    {
      icon: BookOpen,
      title: isEs ? "Predice sin riesgo" : "Predict Risk-Free",
      description: isEs
        ? "Construye tu historial con un saldo virtual. Sin depósitos, sin dinero real — solo predicciones."
        : "Build your track record with a virtual balance. No deposits, no real money — just predictions.",
    },
    {
      icon: Zap,
      title: isEs ? "Datos reales del mercado" : "Real Market Data",
      description: isEs
        ? "Precios y volúmenes en vivo de Polymarket. Predice sobre mercados que existen de verdad."
        : "Live prices and volumes from Polymarket. Call markets that actually exist.",
    },
    {
      icon: BarChart3,
      title: isEs ? "Sigue tu precisión" : "Track Your Accuracy",
      description: isEs
        ? "Consulta tu historial completo y tu precisión por categoría. Descubre dónde tu instinto le gana al consenso."
        : "See your full prediction history and per-category accuracy. Find out where your instinct beats the crowd.",
    },
    {
      icon: Sparkles,
      title: isEs ? "Interfaz intuitiva" : "Intuitive Interface",
      description: isEs
        ? "Diseño limpio y fácil de usar. Perfecto para principiantes que aprenden mercados de predicción."
        : "Clean and easy-to-use design. Perfect for beginners learning prediction markets.",
    },
    {
      icon: Users,
      title: isEs ? "Comunidad de predictores" : "Forecaster Community",
      description: isEs
        ? "Compara tu precisión con miles de predictores. Sube en el ranking, comparte tus aciertos."
        : "Compare your accuracy with thousands of other forecasters. Climb the leaderboard, share your calls.",
    },
    {
      icon: Target,
      title: isEs ? "Perfil público" : "Public Profile",
      description: isEs
        ? "Tu precisión, tu racha y tus mejores predicciones viven en un perfil público. Compártelo, enlázalo, construye tu reputación."
        : "Your accuracy, streak, and best calls live on a public profile. Share it, link to it, build your reputation.",
    },
  ];

  return (
    <section id="why-us" className="py-24 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-medium tracking-wider uppercase mb-4">
            {isEs ? "Por qué Prediction Trade" : "Why Prediction Trade"}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            {isEs ? "La forma más inteligente de empezar a predecir" : "The Smartest Way to Start Forecasting"}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            {isEs
              ? "Construye tu reputación como predictor a la vista de todos. Mercados reales, precisión pública y un ranking que registra quién acierta de verdad."
              : "Build your forecasting reputation in the open. Real markets, public accuracy, and a leaderboard that tracks who actually calls it right."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm text-center">
          <p className="text-sm text-muted-foreground mb-2">
            {isEs ? "Datos provistos por" : "Data powered by"}
          </p>
          <p className="text-2xl font-bold text-foreground">
            {isEs
              ? "Polymarket • Precios en tiempo real • Actualizaciones en vivo"
              : "Polymarket • Real-Time Prices • Live Market Updates"}
          </p>
        </div>
      </div>
    </section>
  );
}
