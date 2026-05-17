"use client"

import { useEffect, useState } from "react"
import { UserPlus, UserCheck, Loader2, Users } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import {
  followUser,
  unfollowUser,
  isFollowing as fetchIsFollowing,
} from "@/lib/follows"

// FollowButton — single primitive of the Follow System v1.
//
// Behavior:
//  - Self (viewer.id === followeeId): renders a follower-count chip only, no button.
//  - Logged-out viewer: clicking the button bounces to /auth/login?next=<here>.
//  - Logged-in non-self viewer: toggles follow with optimistic UI + rollback on error.
//    Sonner toast fires ONLY on failure — success is communicated by the UI flip.
//
// The component is intentionally self-contained: it does its own `isFollowing`
// fetch on mount so callers only need to pass `followeeId` + a server-rendered
// `initialCount`. No prop drilling of viewer state through the page.

interface Props {
  followeeId: string
  /** Pre-rendered follower count from the server. Updated optimistically on toggle. */
  initialCount: number
  className?: string
}

export function FollowButton({ followeeId, initialCount, className }: Props) {
  const { user, isLoading: authLoading } = useAuth()
  const { language } = useLanguage()
  const isEs = language === "es"
  const [following, setFollowing] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [pending, setPending] = useState(false)
  const [ready, setReady] = useState(false)

  const isSelf = !!user && user.id === followeeId

  // Resolve `following` once we know who the viewer is.
  useEffect(() => {
    if (authLoading) return
    if (!user || isSelf) {
      setReady(true)
      return
    }
    let active = true
    void fetchIsFollowing(user.id, followeeId).then((f) => {
      if (!active) return
      setFollowing(f)
      setReady(true)
    })
    return () => {
      active = false
    }
  }, [authLoading, user, followeeId, isSelf])

  // Self → simple count chip. No follow control on own profile.
  if (isSelf) {
    return <FollowerCountChip count={count} isEs={isEs} className={className} />
  }

  const toggle = async () => {
    if (pending) return
    if (!user) {
      const next =
        typeof window !== "undefined"
          ? `?next=${encodeURIComponent(window.location.pathname)}`
          : ""
      window.location.href = `/auth/login${next}`
      return
    }

    const prevFollowing = following
    const prevCount = count
    setFollowing(!prevFollowing)
    setCount(prevCount + (prevFollowing ? -1 : 1))
    setPending(true)
    try {
      if (prevFollowing) await unfollowUser(followeeId)
      else await followUser(followeeId)
    } catch (e) {
      // Rollback on failure
      setFollowing(prevFollowing)
      setCount(prevCount)
      const fallback = isEs ? "Acción fallida." : "Action failed."
      toast.error(e instanceof Error ? e.message : fallback)
    } finally {
      setPending(false)
    }
  }

  if (!ready) {
    return (
      <div
        className={cn(
          "h-[30px] w-[110px] rounded-lg bg-muted/40 animate-pulse",
          className,
        )}
        aria-hidden
      />
    )
  }

  const followingLabel = isEs ? "Siguiendo" : "Following"
  const followLabel = isEs ? "Seguir" : "Follow"
  const unfollowTitle = isEs ? "Dejar de seguir" : "Unfollow"

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={following}
      title={following ? unfollowTitle : followLabel}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border",
        following
          ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/5 hover:border-primary/40"
          : "bg-primary text-primary-foreground border-primary hover:bg-primary/90",
        pending && "opacity-70 cursor-wait",
        className,
      )}
    >
      {pending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : following ? (
        <UserCheck className="w-3.5 h-3.5" />
      ) : (
        <UserPlus className="w-3.5 h-3.5" />
      )}
      <span>
        {following ? followingLabel : followLabel}
        <span className="ml-1 opacity-70 tabular-nums">· {count}</span>
      </span>
    </button>
  )
}

function FollowerCountChip({
  count,
  isEs,
  className,
}: {
  count: number
  isEs: boolean
  className?: string
}) {
  const noun = isEs
    ? count === 1 ? "seguidor" : "seguidores"
    : count === 1 ? "follower" : "followers"
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-card text-muted-foreground",
        className,
      )}
      title={isEs ? "Tu número de seguidores" : "Your follower count"}
    >
      <Users className="w-3.5 h-3.5" />
      <span className="tabular-nums">
        {count} {noun}
      </span>
    </div>
  )
}
