"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";

export function ProfileSignOutButton() {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
  };

  return (
    <Button variant="outline" onClick={handleSignOut} disabled={loading} className="gap-2">
      <LogOut className="w-4 h-4" />
      {loading ? "Signing out..." : "Sign out"}
    </Button>
  );
}
