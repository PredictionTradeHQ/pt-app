"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, LayoutDashboard, Flame, Medal, Share2, Target, History, Check, Link2 } from "lucide-react";
import { ProfileSignOutButton } from "@/components/profile/sign-out-button";
import { useLanguage } from "@/contexts/language-context";
import { StreakWidget } from "@/components/streak-widget";
import { BadgesGrid } from "@/components/badges-grid";
import { AccuracyStats } from "@/components/accuracy-stats";
import { PredictionHistory } from "@/components/prediction-history";
import { useGamification } from "@/stores/gamification";
import { ShareAchievementModal } from "@/components/share-achievement-modal";
import { CategoryAccuracy } from "@/components/category-accuracy";
import { CalledItModal } from "@/components/called-it-modal";
import { pushGamification, pullGamification, mergeSnapshots } from "@/lib/supabase-sync";
import type { PredictionRecord } from "@/stores/gamification";

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
  const [calledItPrediction, setCalledItPrediction] = useState<PredictionRecord | null>(null);
  const [copiedProfile, setCopiedProfile] = useState(false);

  const username = displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const profileUrl = `https://predictiontrade.online/profile/${username}`;

  const handleCopyProfile = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopiedProfile(true);
      setTimeout(() => setCopiedProfile(false), 2000);
    } catch { /* ignore */ }
  };

  const joinedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(isEs ? "es-ES" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

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
    checkResolutions().then(({ newBadgeIds, newlyCorrect }) => {
      if (newBadgeIds.length > 0) setNewBadgesFromResolution(newBadgeIds);
      // Show "Called It" modal for the most impressive correct call (contrarian first, then any)
      if (newlyCorrect.length > 0) {
        const contrarian = newlyCorrect.find(
          (p) =>
            (p.prediction === "YES" && p.probAtTime < 20) ||
            (p.prediction === "NO" && 100 - p.probAtTime < 20)
        );
        setCalledItPrediction(contrarian ?? newlyCorrect[0]);
      }
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
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-lg truncate">{displayName}</p>
              <p className="text-sm text-muted-foreground">
                @{username} · {isEs ? "Miembro de PredictionTrade" : "PredictionTrade Forecaster"}
              </p>
            </div>
            <button
              onClick={handleCopyProfile}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
              title={isEs ? "Copiar enlace de perfil" : "Copy profile link"}
            >
              {copiedProfile ? (
                <><Check className="w-3 h-3 text-primary" /><span className="text-primary">{isEs ? "Copiado" : "Copied!"}</span></>
              ) : (
                <><Link2 className="w-3 h-3" /><span>{isEs ? "Compartir perfil" : "Share profile"}</span></>
              )}
            </button>
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
          <CardContent className="space-y-6">
            <AccuracyStats
              totalPredictions={totalPredictions}
              resolvedCount={resolvedCount}
              correctCount={correctCount}
              calledItCount={calledItCount}
            />
            {predictions.length > 0 && (() => {
              const resolved = predictions.filter((p) => p.resolved)
              if (resolved.length === 0) return null
              return (
                <>
                  <div className="border-t border-border pt-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                      {isEs ? "Precisión por categoría" : "Accuracy by category"}
                    </p>
                    <CategoryAccuracy predictions={predictions} isEs={isEs} />
                  </div>
                </>
              )
            })()}
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
        profileUrl={profileUrl}
        achievement={{
          type: "streak",
          streak: currentStreak,
          bestStreak,
          totalPredictions,
          username,
        }}
      />

      {calledItPrediction && (
        <CalledItModal
          prediction={calledItPrediction}
          username={username}
          accuracyPct={
            resolvedCount >= 5
              ? Math.round((correctCount / resolvedCount) * 100)
              : null
          }
          onClose={() => setCalledItPrediction(null)}
        />
      )}
    </main>
  );
}
