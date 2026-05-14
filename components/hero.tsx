"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flame, Shield, Globe, Zap, UserPlus, LogIn } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

// Paper Trading for Polymarket - Simulator Component
export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
      
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        {/* Polymarket Badge */}
        <a 
          href="https://polymarket.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm mb-8 hover:bg-primary/20 transition-colors group"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium text-primary">{t("poweredByPolymarketApi")}</span>
          <span className="text-sm text-muted-foreground">{t("liveData")}</span>
        </a>

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 text-balance">
          <span className="text-foreground">{t("heroTitleLine1")}</span>
          <br />
          <span className="text-primary">{t("heroTitleLine2")}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance leading-relaxed">
          {t("heroSubtitle")}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Button asChild size="lg" className="text-lg px-8 py-6 gap-2">
            <Link href="/markets">
              <Zap className="w-5 h-5" />
              {t("startPredicting")}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
            <Link href="/markets">
              {t("browseMarkets")}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>

        {/* Social proof */}
        <p className="text-sm text-muted-foreground mb-6">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>4,200+ predictions made · <Link href="/auth/sign-up" className="text-primary hover:underline font-medium">Join free →</Link></span>
          </span>
        </p>

        {/* Auth Buttons */}
        <div className="flex items-center justify-center gap-3 mb-16">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href="/auth/login">
              <LogIn className="w-4 h-4" />
              {t("signIn")}
            </Link>
          </Button>
          <span className="text-muted-foreground">{t("or")}</span>
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href="/auth/sign-up">
              <UserPlus className="w-4 h-4" />
              {t("createAccount")}
            </Link>
          </Button>
        </div>
        
        {/* Demo Notice */}
        <p className="text-sm text-muted-foreground mb-16">
          {t("accountHint")}
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="w-5 h-5 text-primary" />
            <span>{t("zeroRisk")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe className="w-5 h-5 text-primary" />
            <span>{t("realPrices")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Flame className="w-5 h-5 text-primary" />
            <span>{t("paperMode")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
