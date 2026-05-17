"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, LayoutDashboard, Flame, Medal, Share2, Target, History, Check, Link2, ArrowRight, Trophy, Users, Zap } from "lucide-react";
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
import { AvatarUploader } from "@/components/profile/avatar-uploader";
import { StatCard } from "@/components/profile/stat-card";
import { TopCallRow } from "@/components/profile/top-call-row";
import { getFollowerCount } from "@/lib/follows";
import { pushGamification, pullGamification, mergeSnapshots } from "@/lib/supabase-sync";
import { topCategoryFromPredictions } from "@/lib/share-copy";
import { buildProfileHeadline, computeCategoryStats, computeTopCalls } from "@/lib/profile-helpers";
import type { PredictionRecord } from "@/stores/gamification";

export function ProfileClient({
  userId,
  displayName,
  email,
  createdAt,
  avatarUrl,
}: {
  userId: string;
  displayName: string;
  email: string;
  createdAt: string | null;
  avatarUrl?: string | null;
}) {
  const { language } = useLanguage();
  const isEs = language === "es";
  const store = useGamification();
  const {
    currentStreak, bestStreak, totalPredictions,
    predictions, resolvedCount, correctCount, calledItCount,
    badges, checkResolutions,
  } = store;

  const [shareOpen, setShareOpen] = useState(false);
  const [newBadgesFromResolution, setNewBadgesFromResolution] = useState<string[]>([]);
  const [calledItPrediction, setCalledItPrediction] = useState<PredictionRecord | null>(null);
  const [copiedProfile, setCopiedProfile] = useState(false);
  // Follower count — closes the reputation loop for the owner. Without this,
  // followers grow but the owner never sees it because /profile/[mi-slug]
  // redirects to /profile (RealPublicProfile chip is never shown to self).
  // Renders only when count > 0 (no "0 followers" noise on the owner's own view).
  const [followerCount, setFollowerCount] = useState<number | null>(null);

  const username = displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const profileUrl = `https://predictiontrade.online/profile/${username}`;

  const handleCopyProfile = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopiedProfile(true);
      setTimeout(() => setCopiedProfile(false), 2000);
    } catch { /* ignore */ }
  };

  // Share own profile on X. Same tweet format as the public profile so the
  // owner self-share and a visitor share read identically. Headline is the
  // single source of truth from buildProfileHeadline().
  const shareOnX = () => {
    const text = `${displayName} on @PredictionTrade — ${headline}`;
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`,
      "_blank",
    );
  };

  const joinedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(isEs ? "es-ES" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  // Identity headline — same one-liner the public profile, share copy, and OG
  // card show. Owner sees the exact phrase visitors do so /profile reads as
  // "this is who I am" rather than a settings page.
  const accuracyPct =
    resolvedCount >= 5 ? Math.round((correctCount / resolvedCount) * 100) : null;
  const ownerCategoryStats = computeCategoryStats(predictions);
  const headline = buildProfileHeadline(
    totalPredictions > 0
      ? { totalPredictions, accuracyPct, currentStreak, calledItCount }
      : null,
    ownerCategoryStats,
  );
  // Identity gold — biggest contrarian calls. Same helper the public profile
  // uses so the owner sees their own showcase, not just the visitor's view.
  const ownerTopCalls = computeTopCalls(predictions);

  // On mount: fetch follower count from Supabase. Single indexed count(*).
  // Fire-and-forget — failure leaves followerCount as null and the chip
  // simply doesn't render (graceful: looks identical to a 0-followers user).
  useEffect(() => {
    let active = true;
    void getFollowerCount(userId).then((n) => {
      if (active) setFollowerCount(n);
    });
    return () => {
      active = false;
    };
  }, [userId]);

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
            ? "Tu perfil público y ajustes de cuenta."
            : "Your public profile and account settings."}
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
            <AvatarUploader
              userId={userId}
              displayName={displayName}
              initialUrl={avatarUrl}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-lg truncate">{displayName}</p>
              <p className="text-sm text-muted-foreground">
                @{username} · {isEs ? "Forecaster de PredictionTrade" : "PredictionTrade Forecaster"}
              </p>
              {followerCount !== null && followerCount > 0 && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span className="tabular-nums font-semibold text-foreground/80">
                    {followerCount}
                  </span>
                  <span>
                    {followerCount === 1
                      ? (isEs ? "seguidor" : "follower")
                      : (isEs ? "seguidores" : "followers")}
                  </span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={shareOnX}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-muted/40 transition-colors text-xs font-semibold"
                title={isEs ? "Compartir en X" : "Share on X"}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.859L1.254 2.25H8.08l4.259 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                {isEs ? "Compartir" : "Share"}
              </button>
              <button
                onClick={handleCopyProfile}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
                title={isEs ? "Copiar enlace de perfil" : "Copy profile link"}
              >
                {copiedProfile ? (
                  <><Check className="w-3 h-3 text-primary" /><span className="text-primary">{isEs ? "Copiado" : "Copied!"}</span></>
                ) : (
                  <><Link2 className="w-3 h-3" /><span>{isEs ? "Copiar enlace" : "Copy link"}</span></>
                )}
              </button>
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

      {/* Identity headline — shared with public profile + share copy. Only
          renders once the owner has any predictions; before that, the empty
          hero below carries the identity copy. */}
      {totalPredictions > 0 && (
        <p className="text-sm text-muted-foreground mb-6 pl-1">{headline}</p>
      )}

      {/* Glance stats grid — same 4 cells the public profile shows, so the
          owner sees the at-a-glance summary visitors see. Detailed
          breakdowns (StreakWidget, AccuracyStats, BadgesGrid) live below
          and remain owner-only. Labels stay in EN to mirror the public
          surface and keep the identity-glance identical for the owner. */}
      {totalPredictions > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={<Flame className="w-4 h-4 text-orange-400" />}
            label="Streak"
            value={`${currentStreak}d`}
            sub={`Best: ${bestStreak}d`}
          />
          <StatCard
            icon={<Target className="w-4 h-4 text-primary" />}
            label="Accuracy"
            value={accuracyPct !== null ? `${accuracyPct}%` : "—"}
            sub={accuracyPct !== null ? `${resolvedCount} resolved` : "Need ≥5 resolved"}
            highlight={accuracyPct !== null && accuracyPct >= 60}
          />
          <StatCard
            icon={<Trophy className="w-4 h-4 text-yellow-400" />}
            label="Predictions"
            value={String(totalPredictions)}
            sub={`${resolvedCount} resolved`}
          />
          <StatCard
            icon={<Medal className="w-4 h-4 text-primary" />}
            label="Badges"
            value={String(badges.length)}
            sub={calledItCount > 0 ? `${calledItCount} Called It 💡` : "Earned"}
          />
        </div>
      )}

      {/* Empty-state hero — only when the user has zero predictions */}
      {totalPredictions === 0 && (
        <EmptyProfileHero isEs={isEs} />
      )}

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

      {/* Streak card — hidden until the user has made a prediction */}
      {totalPredictions > 0 && (
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
      )}

      {/* Biggest calls — owner-side mirror of the public profile's identity
          showcase. Hidden until the owner has at least one contrarian correct
          call (computeTopCalls returns []). Same TopCallRow + same yellow
          treatment as the public surface. */}
      {ownerTopCalls.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              {isEs ? "Mejores predicciones" : "Biggest calls"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              {isEs
                ? "Predicciones acertadas contra la mayoría."
                : "Correct predictions against the crowd."}
            </p>
            <div className="space-y-3">
              {ownerTopCalls.map((call, i) => (
                <TopCallRow key={i} call={call} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Badges card — hidden until the user has made a prediction */}
      {totalPredictions > 0 && (
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
      )}

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
              ? "Consulta tu historial completo de predicciones, racha y precisión."
              : "View your full prediction history, streak, and accuracy."}
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
          topCategory={topCategoryFromPredictions(predictions)}
          onClose={() => setCalledItPrediction(null)}
        />
      )}
    </main>
  );
}

// ─── EmptyProfileHero ─────────────────────────────────────────────────────────
// Rendered on /profile when the user has zero predictions. Replaces the empty
// stats cards (Accuracy/Streak/Badges/History) with an identity-onboarding hero
// that mirrors the vocabulary of the OG cards, leaderboard spotlight, and share
// copy: streak, specialty, leaderboard. Pure UI, no state, no network.

function EmptyProfileHero({ isEs }: { isEs: boolean }) {
  return (
    <Card className="mb-6 border-primary/25 bg-gradient-to-br from-primary/[0.06] via-transparent to-amber-500/[0.04] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <CardContent className="pt-6 pb-7">
        {/* Headline */}
        <div className="text-center mb-6">
          <span className="text-4xl block mb-3 leading-none" aria-hidden>🎯</span>
          <h2 className="text-2xl font-bold mb-2">
            {isEs ? "Haz tu primera predicción." : "Make your first call."}
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            {isEs
              ? "Empieza tu racha, gana tu especialidad y sube en el ranking."
              : "Start your streak, earn your specialty, and climb the leaderboard."}
          </p>
        </div>

        {/* Three identity pillars — same vocabulary as OG cards + leaderboard */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <PillarCard
            emoji="🔥"
            accentClass="text-orange-400"
            title={isEs ? "Racha" : "Streak"}
            body={isEs
              ? "Día 1 cuando hagas tu primera predicción hoy."
              : "Day 1 the moment you predict today."}
          />
          <PillarCard
            emoji="🪙"
            accentClass="text-amber-400"
            title={isEs ? "Especialidad" : "Specialty"}
            body={isEs
              ? "Gánala con 3 predicciones acertadas en una categoría."
              : "Earned after 3 correct calls in any one category."}
          />
          <PillarCard
            emoji="🏆"
            accentClass="text-primary"
            title={isEs ? "Ranking" : "Leaderboard"}
            body={isEs
              ? "Apareces ahí desde tu primera predicción."
              : "You appear on it from your very first call."}
          />
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2">
          <Button asChild className="gap-1.5 font-semibold">
            <Link href="/markets">
              {isEs ? "Explorar mercados" : "Explore Markets"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-1.5 font-semibold">
            <Link href="/leaderboard">
              <Trophy className="w-4 h-4" />
              {isEs ? "Ver el ranking" : "Browse leaderboard"}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function PillarCard({
  emoji,
  accentClass,
  title,
  body,
}: {
  emoji: string
  accentClass: string
  title: string
  body: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-4 text-center">
      <span className="text-2xl block mb-1.5 leading-none" aria-hidden>{emoji}</span>
      <p className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${accentClass}`}>
        {title}
      </p>
      <p className="text-[11px] text-muted-foreground leading-relaxed">{body}</p>
    </div>
  )
}
