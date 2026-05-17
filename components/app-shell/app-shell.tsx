"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Zap,
  GraduationCap,
  Trophy,
  User,
  LogOut,
  Activity,
  HelpCircle,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { LanguageToggle } from "@/components/language-toggle";

type NavItem = {
  href: string;
  labelEn: string;
  labelEs: string;
  /** Optional shorter label used by the mobile bottom nav (grid-cols-6 at
   *  10px font). Only set when the desktop label overflows narrow phones. */
  labelMobileEn?: string;
  labelMobileEs?: string;
  icon: typeof LayoutDashboard;
};

const NAV: NavItem[] = [
  { href: "/dashboard", labelEn: "Dashboard", labelEs: "Panel", icon: LayoutDashboard },
  { href: "/markets", labelEn: "Markets", labelEs: "Mercados", icon: TrendingUp },
  { href: "/play", labelEn: "Game", labelEs: "Juego", icon: Zap },
  { href: "/academy", labelEn: "Academy", labelEs: "Academia", icon: GraduationCap },
  { href: "/leaderboard", labelEn: "Leaderboard", labelEs: "Ranking", labelMobileEn: "Ranks", icon: Trophy },
  { href: "/profile", labelEn: "Profile", labelEs: "Perfil", icon: User },
];

const SECONDARY: NavItem[] = [
  { href: "/activity", labelEn: "Activity", labelEs: "Actividad", icon: Activity },
  { href: "/help", labelEn: "Help", labelEs: "Ayuda", icon: HelpCircle },
  { href: "/", labelEn: "Landing page", labelEs: "Página principal", icon: Home },
];

export function AppShell({
  children,
  requireAuth = true,
}: {
  children: React.ReactNode;
  requireAuth?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();
  const { language } = useLanguage();
  const isEs = language === "es";

  useEffect(() => {
    if (requireAuth && !isLoading && !user) {
      const next = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/auth/login?next=${next}`);
    }
  }, [requireAuth, isLoading, user, pathname, router]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return href === pathname || pathname?.startsWith(href + "/");
  };

  if (requireAuth && (isLoading || !user)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
          <span className="text-xl font-bold text-primary">PT</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 flex-col border-r border-border bg-card/30 backdrop-blur-sm z-40">
        <div className="px-5 py-5 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="Prediction Trade" width={32} height={32} className="w-8 h-8" />
            <span className="font-bold text-lg">Prediction Trade</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            {isEs ? "Plataforma" : "Platform"}
          </p>
          <ul className="space-y-1 mb-6">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive(item.href)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{isEs ? item.labelEs : item.labelEn}</span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            {isEs ? "Más" : "More"}
          </p>
          <ul className="space-y-1">
            {SECONDARY.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive(item.href)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{isEs ? item.labelEs : item.labelEn}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {user && (
          <div className="px-3 py-3 border-t border-border">
            <div className="px-3 py-2 mb-2">
              <p className="text-sm font-medium truncate">{user.display_name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 justify-start gap-2 text-muted-foreground hover:text-destructive"
                onClick={() => signOut()}
              >
                <LogOut className="w-4 h-4" />
                {isEs ? "Salir" : "Sign out"}
              </Button>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="Prediction Trade" width={28} height={28} className="w-7 h-7" />
            <span className="font-bold">Prediction Trade</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                onClick={() => signOut()}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="md:ml-60 pt-14 pb-20 md:pt-0 md:pb-0 min-h-screen">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md">
        <ul className="grid grid-cols-6">
          {NAV.map((item) => (
            <li key={item.href} className="min-w-0">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2 px-0.5 text-[10px] leading-tight transition-colors",
                  isActive(item.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="truncate w-full text-center">
                  {isEs
                    ? (item.labelMobileEs ?? item.labelEs)
                    : (item.labelMobileEn ?? item.labelEn)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
