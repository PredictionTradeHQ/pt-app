"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap, User, LogOut, LayoutDashboard, Activity } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/language-context";
import { LanguageToggle } from "@/components/language-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string; display_name?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  const { t, language } = useLanguage();
  const isEs = language === "es";

  const navLinks = [
    { name: t("navMarkets"), href: "/markets" },
    { name: t("navAcademy"), href: "/academy" },
    { name: isEs ? "⚡ Juego" : "⚡ Play", href: "/play" },
    { name: isEs ? "Ranking" : "Leaderboard", href: "/leaderboard" },
    { name: t("navCommunity"), href: "/#community" },
  ];

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({
          email: authUser.email,
          display_name: authUser.user_metadata?.display_name || authUser.email?.split("@")[0],
        });
      }
      setIsLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email,
          display_name: session.user.user_metadata?.display_name || session.user.email?.split("@")[0],
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="/images/logo.png" alt="Prediction Trade" className="w-8 h-8" />
              <span className="font-bold text-xl">Prediction Trade</span>
            </Link>
            {/* Polymarket Badge */}
            <a 
              href="https://polymarket.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-primary">{t("poweredByPolymarket")}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageToggle />
            {isLoading ? (
              <div className="w-20 h-8 bg-muted animate-pulse rounded-md" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <Button asChild size="sm">
                  <Link href="/demo">{t("demoTrading")}</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <User className="w-4 h-4" />
                      <span className="max-w-[100px] truncate">{user.display_name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.display_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer gap-2 flex items-center">
                        <LayoutDashboard className="w-4 h-4" />
                        {isEs ? "Mi Dashboard" : "My Dashboard"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/demo" className="cursor-pointer">
                        {t("demoTrading")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/activity" className="cursor-pointer gap-2 flex items-center">
                        <Activity className="w-4 h-4" />
                        {isEs ? "Actividad" : "Activity"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer gap-2 flex items-center">
                        <User className="w-4 h-4" />
                        {isEs ? "Perfil" : "Profile"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      {t("signOut")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/login">{t("logIn")}</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/sign-up">{t("getStarted")}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? t("closeMenu") : t("openMenu")}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <div className="pb-2">
                <LanguageToggle />
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {user ? (
                  <>
                    <div className="px-2 py-2 text-sm">
                      <p className="font-medium">{user.display_name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Button asChild variant="outline" className="justify-start gap-2">
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <LayoutDashboard className="w-4 h-4" />
                        {isEs ? "Mi Dashboard" : "My Dashboard"}
                      </Link>
                    </Button>
                    <Button asChild className="justify-start">
                      <Link href="/demo" onClick={() => setMobileMenuOpen(false)}>
                        {t("demoTrading")}
                      </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start text-destructive" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      {t("signOut")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="ghost" className="justify-start">
                      <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                        {t("logIn")}
                      </Link>
                    </Button>
                    <Button asChild className="justify-start">
                      <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>
                        {t("getStarted")}
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
