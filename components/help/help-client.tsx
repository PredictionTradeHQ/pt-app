"use client";

import Link from "next/link";
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
import { useLanguage } from "@/contexts/language-context";

const faqs = {
  en: [
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
  ],
  es: [
    {
      q: "¿Qué es PredictionTrade?",
      a: "PredictionTrade es un simulador gratuito y sin riesgo para mercados de predicción. Recibes $100.000 en fondos virtuales para practicar trading con datos en tiempo real de Polymarket — sin dinero real.",
    },
    {
      q: "¿Tengo que pagar para usarlo?",
      a: "No. La plataforma es 100% gratuita. Regístrate con un correo y al instante recibes $100.000 virtuales para empezar a practicar.",
    },
    {
      q: "¿De dónde vienen los datos del mercado?",
      a: "Todos los precios y probabilidades vienen en directo de la API Gamma de Polymarket. Los datos que ves en el simulador son los mismos que en el mercado real.",
    },
    {
      q: "¿Puedo perder dinero real?",
      a: "No. Todas las operaciones se simulan con fondos virtuales. Nada en esta plataforma involucra dinero real ni trading real.",
    },
    {
      q: "¿Cómo reinicio mi balance virtual?",
      a: "Ve a tu panel de Trading demo. Hay una opción de reinicio que devuelve tu balance a $100.000 y borra todas las posiciones.",
    },
    {
      q: "¿Qué es la Academia?",
      a: "La Academia es nuestro sistema gratuito de educación en trading. Las lecciones cubren gestión de riesgo, psicología del mercado, dimensionamiento de posiciones y más — diseñadas para principiantes.",
    },
    {
      q: "¿Qué es el Juego (Prediction Flash)?",
      a: "Prediction Flash es un mini-juego rápido tipo arcade donde predices movimientos de precio a corto plazo. Está diseñado para entrenar la toma de decisiones bajo presión.",
    },
    {
      q: "¿Mis datos están seguros?",
      a: "Solo almacenamos lo mínimo necesario para tu cuenta: correo y datos de juego. Nunca vendemos ni compartimos tu información. La autenticación la gestiona Supabase.",
    },
  ],
};

export function HelpClient() {
  const { language } = useLanguage();
  const isEs = language === "es";

  const quickStart = [
    {
      icon: Wallet,
      title: isEs ? "1. Regístrate gratis" : "1. Sign up free",
      desc: isEs
        ? "Crea una cuenta y recibe al instante $100.000 en fondos virtuales."
        : "Create an account and instantly receive $100,000 in virtual funds.",
      href: "/auth/sign-up",
      cta: isEs ? "Crear cuenta" : "Sign up",
    },
    {
      icon: TrendingUp,
      title: isEs ? "2. Explora mercados" : "2. Browse markets",
      desc: isEs
        ? "Explora mercados de predicción en vivo de Polymarket — política, cripto, deportes."
        : "Explore live prediction markets from Polymarket — politics, crypto, sports.",
      href: "/markets",
      cta: isEs ? "Ver mercados" : "View markets",
    },
    {
      icon: GraduationCap,
      title: isEs ? "3. Aprende lo básico" : "3. Learn the basics",
      desc: isEs
        ? "Toma lecciones gratuitas en la Academia para construir tu base de trading."
        : "Take free lessons in the Academy to build your trading foundation.",
      href: "/academy",
      cta: isEs ? "Abrir academia" : "Open Academy",
    },
    {
      icon: Zap,
      title: isEs ? "4. Pon a prueba tus reflejos" : "4. Test your reflexes",
      desc: isEs
        ? "Prueba Prediction Flash — el mini-juego rápido de predicción."
        : "Try Prediction Flash — the fast-paced prediction mini-game.",
      href: "/play",
      cta: isEs ? "Jugar ahora" : "Play now",
    },
  ];

  const items = isEs ? faqs.es : faqs.en;

  return (
    <main className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mb-4">
          <HelpCircle className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-3">
          {isEs ? "Centro de ayuda" : "Help Center"}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {isEs
            ? "Todo lo que necesitas para empezar con PredictionTrade."
            : "Everything you need to get started with PredictionTrade."}
        </p>
      </div>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">
          {isEs ? "Inicio rápido" : "Quick start"}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {quickStart.map((step) => (
            <Card
              key={step.title}
              className="hover:border-primary/50 transition-colors"
            >
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
        <h2 className="text-2xl font-bold mb-6">
          {isEs ? "Preguntas frecuentes" : "Frequently asked questions"}
        </h2>
        <div className="space-y-3">
          {items.map((faq) => (
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
        <h2 className="text-2xl font-bold mb-6">
          {isEs ? "¿Necesitas más ayuda?" : "Still need help?"}
        </h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-6">
              {isEs
                ? "Escríbenos en redes sociales o por correo — solemos responder en menos de 24 horas."
                : "Reach out on social media or send us a message — we usually reply within 24 hours."}
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
                  {isEs ? "Escríbenos" : "Email us"}
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
