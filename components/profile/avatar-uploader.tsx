"use client"

import { useRef, useState } from "react"
import { Camera, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Avatar, type AvatarSize } from "@/components/avatar"
import { useAuth } from "@/contexts/auth-context"

// Avatar editor: wraps <Avatar /> with a hover-revealed camera overlay that
// opens a file picker, transcodes the chosen image to WebP at ≤512×512, uploads
// it to the `avatars` Supabase Storage bucket as `<user_id>.webp` (upsert),
// then updates profiles.avatar_url with the public URL + a ?v= cache buster.
//
// Pure client-side. No new route, no new endpoint. Storage RLS (see migration
// 006) is what binds the upload path to the authenticated user — the policy
// rejects writes whose basename doesn't match auth.uid().

const MAX_DIM = 512                  // resize longest edge to this many px
const WEBP_QUALITY = 0.88            // canvas.toBlob quality
const MAX_BYTES = 5 * 1024 * 1024    // 5 MB; matches bucket file_size_limit

interface AvatarUploaderProps {
  userId: string
  displayName: string
  initialUrl?: string | null
  size?: AvatarSize
  /** Tailwind override for the underlying <Avatar /> accent. */
  className?: string
}

export function AvatarUploader({
  userId,
  displayName,
  initialUrl,
  size = "lg",
  className,
}: AvatarUploaderProps) {
  const { supabase } = useAuth()
  const [url, setUrl] = useState<string | null>(initialUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const openPicker = () => {
    if (uploading) return
    fileInputRef.current?.click()
  }

  const handleFile = async (file: File) => {
    if (file.size > MAX_BYTES) {
      toast.error("Image too large. Max 5 MB.")
      return
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.")
      return
    }

    setUploading(true)
    try {
      const webp = await transcodeToWebp(file)
      const path = `${userId}.webp`

      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, webp, {
          upsert: true,
          contentType: "image/webp",
          cacheControl: "0",
        })
      if (uploadErr) throw uploadErr

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path)
      // Append a version query param so CDN never serves the prior image.
      const versionedUrl = `${pub.publicUrl}?v=${Date.now()}`

      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ avatar_url: versionedUrl })
        .eq("id", userId)
      if (updateErr) throw updateErr

      setUrl(versionedUrl)
      toast.success("Avatar updated.")
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed."
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative group shrink-0">
      <Avatar
        size={size}
        url={url}
        displayName={displayName}
        className={className}
      />

      {/* Hover/click overlay — fully covers the circle, never causes layout shift */}
      <button
        type="button"
        onClick={openPicker}
        disabled={uploading}
        aria-label={uploading ? "Uploading avatar" : "Change avatar"}
        className={[
          "absolute inset-0 rounded-full flex items-center justify-center",
          "text-white transition-all duration-150",
          uploading
            ? "bg-black/55 opacity-100 cursor-wait"
            : "bg-black/0 opacity-0 group-hover:bg-black/45 group-hover:opacity-100 cursor-pointer focus-visible:bg-black/45 focus-visible:opacity-100 focus-visible:outline-none",
        ].join(" ")}
      >
        {uploading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Camera className="w-5 h-5" />
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
          // Allow re-selecting the same file later.
          e.target.value = ""
        }}
        className="hidden"
      />
    </div>
  )
}

// ─── Transcode helper ────────────────────────────────────────────────────────

async function transcodeToWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  try {
    const ratio = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height))
    const w = Math.max(1, Math.round(bitmap.width * ratio))
    const h = Math.max(1, Math.round(bitmap.height * ratio))

    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas unavailable in this browser.")
    ctx.drawImage(bitmap, 0, 0, w, h)

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Could not encode image as WebP. Try another file."))
            return
          }
          resolve(blob)
        },
        "image/webp",
        WEBP_QUALITY,
      )
    })
  } finally {
    // createImageBitmap allocates GPU/native memory on some browsers.
    bitmap.close?.()
  }
}
