import { redirect } from "next/navigation";

export default async function AuthIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params?.next ? `?next=${encodeURIComponent(params.next)}` : "";
  redirect(`/auth/login${next}`);
}
