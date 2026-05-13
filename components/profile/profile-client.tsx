"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, LayoutDashboard, Flame, Medal, Share2, Target, History } from "lucide-react";
import { ProfileSignOutButton } from "@/components/profile/sign-out-button";
import { useLanguage } from "@/contexts/language-context";
import { StreakWidget } from "@/components/streak-widget";
import { BadgesGrid } from "@/components/badges-grid";
import { AccuracyStats } from "@/components/accuracy-stats";
import { PredictionHistory } from "@/components/prediction-history";
import { useGamification } from "@/stores/gamification";
import { ShareAchievementModal } from "@/components/share-achievement-modal";
import { pushGamification, pullGamification, mergeSnapshots } from "@/lib/supabase-sync";

export function ProfileClient({
  userId,
  displayName,
  email,
  createdAt,
}: {
  userId: string;
  displayName: string;
  email: string;
  createdAt: string | null;
}) {
  const { language } = useLanguage();
  const isEs = language === "es";
  const store = useGamification();
  const {
    currentStreak, bestStreak, totalPredictions,
    predictions, resolvedCount, correctCount, calledItCount,
    checkResolutions,
  } = store;

  const [shareOpen, setShareOpen] = useState(false);
  const [newBadgesFromResolution, setNewBadgesFromResolution] = useState<string[]>([]);

  const joinedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(isEs ? "es-ES" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const username = displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // On mount: sync with Supabase (pull remote, merge, push merged back)
  useEffect(() => {
    async function syncWithSupabase() {
      try {
        const remote = await pullGamification(userId);
        if (remote) {
          const local = {
            currentStreak: store.currentStreak,
            bestStreak: store.bestStreak,
            lastPredictionDate: store.lastPredictionDate,
            totalPredictions: store.totalPredictions,
            categoryPredictions: store.categoryPredictions,
            predictions: store.predictions,
            resolvedCount: store.resolvedCount,
            correctCount: store.correctCount,
            calledItCount: store.calledItCount,
            badges: store.badges,
          };
          const merged = mergeSnapshots(local, remote);
          // Only update store if remote has more data
          if (
            merged.bestStreak > local.bestStreak ||
            merged.totalPredictions > local.totalPredictions ||
            merged.badges.length > local.badges.length
          ) {
            // Apply merged state to Zustand store via reset + set
            store.reset();
            // Re-hydrate via Zustand internal set — push merged state
            await pushGamification(userId, merged);
          }
        }
      } catch {
        // Sync failure is non-critical
      }
    }
    syncWithSupabase();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check for resolved markets on profile visit
  useEffect(() => {
    if (predictions.length === 0) return;
    checkResolutions().then((newIds) => {
      if (newIds.length > 0) setNewBadgesFromResolution(newIds);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Push to Supabase when gamification state changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (totalPredictions === 0) return;
      pushGamification(userId, {
        currentStreak, bestStreak, lastPredictionDate: store.lastPredictionDate,
        totalPredictions, categoryPredictions: store.categoryPredictions,
        predictions, resolvedCount, correctCount, calledItCount,
        badges: store.badges,
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [totalPredictions, resolvedCount, store.badges.length]); // eslint-disable-line react-hooks/exhaustive-deps

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

      {/* Account card */}
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
            <div className="flex-1">
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

      {/* Accuracy stats */}
      {totalPredictions > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {isEs ? "Precisión" : "Accuracy"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AccuracyStats
              totalPredictions={totalPredictions}
              resolvedCount={resolvedCount}
              correctCount={correctCount}
              calledItCount={calledItCount}
            />
          </CardContent>
        </Card>
      )}

      {/* Streak card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              {isEs ? "Racha de predicciones" : "Prediction Streak"}
            </CardTitle>
            {currentStreak > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 h-8 text-xs"
                onClick={() => setShareOpen(true)}
              >
                <Share2 className="w-3 h-3" />
                {isEs ? "Compartir" : "Share"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <StreakWidget variant="profile" />
        </CardContent>
      </Card>

      {/* Badges card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Medal className="w-5 h-5 text-primary" />
            {isEs ? "Insignias" : "Badges"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BadgesGrid />
        </CardContent>
      </Card>

      {/* Prediction history */}
      {predictions.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              {isEs ? "Historial de predicciones" : "Prediction History"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PredictionHistory predictions={predictions} limit={10} />
          </CardContent>
        </Card>
      )}

      {/* Activity Overview */}
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

      {/* Session */}
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

      <ShareAchievementModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        achievement={{
          type: "streak",
          streak: currentStreak,
          bestStreak,
          totalPredictions,
          username,
        }}
      />
    </main>
  );
}
