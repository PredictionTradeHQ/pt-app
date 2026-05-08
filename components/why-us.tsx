"use client";

import { Zap, Target, Users, BarChart3, BookOpen, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export function WhyUs() {
  const { language } = useLanguage();
  const isEs = language === "es";

  const features = [
    {
      icon: BookOpen,
      title: isEs ? "Aprende sin riesgo" : "Learn Risk-Free",
      description: isEs
        ? "Practica con fondos virtuales. Comete errores, aprende estrategias, todo sin perder dinero real."
        : "Practice with virtual funds. Make mistakes, learn strategies, all without losing real money.",
    },
    {
      icon: Zap,
      title: isEs ? "Datos reales del mercado" : "Real Market Data",
      description: isEs
        ? "Precios y volúmenes en vivo de Polymarket. Entrénate con condiciones reales de mercado."
        : "Live prices and volumes from Polymarket. Train with real-world market conditions.",
    },
    {
      icon: BarChart3,
      title: isEs ? "Sigue tu precisión" : "Track Your Accuracy",
      description: isEs
        ? "Consulta tu historial de predicciones y tu tasa de aciertos. Identifica qué funciona antes de operar en real."
        : "See your prediction history and win rate. Identify what works before going live.",
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
      title: isEs ? "Comunidad activa" : "Active Community",
      description: isEs
        ? "Únete a miles de aprendices que comparten análisis y estrategias de predicción."
        : "Join thousands of learners who share analysis and prediction strategies.",
    },
    {
      icon: Target,
      title: isEs ? "¿Listo para operar de verdad?" : "Ready for Real Trading?",
      description: isEs
        ? "Cuando te sientas seguro, da el salto a Polymarket y opera con fondos reales."
        : "When you feel confident, transition to Polymarket to trade with real funds.",
    },
  ];

  return (
    <section id="why-us" className="py-24 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-medium tracking-wider uppercase mb-4">
            {isEs ? "Por qué practicar aquí" : "Why Practice Here"}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            {isEs ? "La forma más inteligente de aprender" : "The Smartest Way to Learn"}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            {isEs
              ? "La mayoría de traders pierde dinero al empezar. Nuestro simulador te permite desarrollar tus habilidades de predicción con datos reales antes de arriesgar capital."
              : "Most traders lose money when they start. Our simulator lets you develop your prediction skills with real data before risking actual capital."}
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
