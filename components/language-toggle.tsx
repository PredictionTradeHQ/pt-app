"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-md border border-border p-0.5">
      <Button
        type="button"
        size="sm"
        variant={language === "en" ? "default" : "ghost"}
        className="h-7 px-2 text-xs"
        onClick={() => setLanguage("en")}
      >
        EN
      </Button>
      <Button
        type="button"
        size="sm"
        variant={language === "es" ? "default" : "ghost"}
        className="h-7 px-2 text-xs"
        onClick={() => setLanguage("es")}
      >
        ES
      </Button>
    </div>
  );
}
