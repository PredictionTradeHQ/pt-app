"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, LayoutDashboard } from "lucide-react";
import { ProfileSignOutButton } from "@/components/profile/sign-out-button";
import { useLanguage } from "@/contexts/language-context";

export function ProfileClient({
  displayName,
  email,
  createdAt,
}: {
  displayName: string;
  email: string;
  createdAt: string | null;
}) {
  const { language } = useLanguage();
  const isEs = language === "es";

  const joinedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(isEs ? "es-ES" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <main className="container mx-auto px-4 md:px-8 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{isEs ? "Perfil" : "Profile"}</h1>
        <p className="text-muted-foreground">
          {isEs
            ? "Gestiona tu cuenta y preferencias."
            : "Manage your account and preferences."}
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {isEs ? "Cuenta" : "Account"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-lg">{displayName}</p>
              <p className="text-sm text-muted-foreground">
                {isEs ? "Miembro de PredictionTrade" : "PredictionTrade Member"}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground text-xs">
                  {isEs ? "Correo electrónico" : "Email"}
                </p>
                <p className="font-medium break-all">{email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground text-xs">
                  {isEs ? "Miembro desde" : "Member since"}
                </p>
                <p className="font-medium">{joinedDate}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{isEs ? "Resumen de actividad" : "Activity Overview"}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {isEs
              ? "Consulta tus estadísticas de trading, resultados de juego y progreso en la academia."
              : "View your full trading stats, game results, and academy progress."}
          </p>
          <Button asChild>
            <Link href="/dashboard" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              {isEs ? "Ir al panel" : "Go to Dashboard"}
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{isEs ? "Sesión" : "Session"}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {isEs
              ? "Cierra sesión en este dispositivo."
              : "Sign out of your account on this device."}
          </p>
          <ProfileSignOutButton />
        </CardContent>
      </Card>
    </main>
  );
}
