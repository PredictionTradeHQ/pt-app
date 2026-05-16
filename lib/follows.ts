// Follow System v1 — minimal client helpers.
//
// All reads use `count: "exact", head: true` so PostgREST returns only the
// count header (no payload). Writes go through RLS — insert_own / delete_own
// policies in migration 007 guarantee the caller can only act as themselves.
//
// No API routes. No cache layer. No denormalized counters. If the follow
// graph gets large enough that on-demand counts hurt, the right next step
// is a SQL RPC `get_follower_counts(uuid[])` or a separate view — not a
// trigger-maintained column.

import { createClient } from "@/lib/supabase/client"

export async function followUser(followeeId: string): Promise<void> {
  const supabase = createClient()
  const { data: userResult, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userResult.user) {
    throw new Error("Sign in to follow forecasters.")
  }
  const followerId = userResult.user.id
  if (followerId === followeeId) {
    throw new Error("You can't follow yourself.")
  }
  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: followerId, followee_id: followeeId })
  // Duplicate row (PK conflict) → already following, treat as success.
  if (error && error.code !== "23505") {
    throw new Error(error.message || "Follow failed.")
  }
}

export async function unfollowUser(followeeId: string): Promise<void> {
  const supabase = createClient()
  const { data: userResult, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userResult.user) {
    throw new Error("Sign in to manage follows.")
  }
  const followerId = userResult.user.id
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("followee_id", followeeId)
  if (error) throw new Error(error.message || "Unfollow failed.")
}

export async function getFollowerCount(userId: string): Promise<number> {
  const supabase = createClient()
  const { count, error } = await supabase
    .from("follows")
    .select("follower_id", { count: "exact", head: true })
    .eq("followee_id", userId)
  if (error) return 0
  return count ?? 0
}

export async function getFollowingCount(userId: string): Promise<number> {
  const supabase = createClient()
  const { count, error } = await supabase
    .from("follows")
    .select("followee_id", { count: "exact", head: true })
    .eq("follower_id", userId)
  if (error) return 0
  return count ?? 0
}

export async function isFollowing(
  followerId: string,
  followeeId: string,
): Promise<boolean> {
  if (followerId === followeeId) return false
  const supabase = createClient()
  const { count, error } = await supabase
    .from("follows")
    .select("follower_id", { count: "exact", head: true })
    .eq("follower_id", followerId)
    .eq("followee_id", followeeId)
  if (error) return false
  return (count ?? 0) > 0
}
