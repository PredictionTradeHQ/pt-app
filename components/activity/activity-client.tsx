"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Activity as ActivityIcon } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

type Trade = {
  type?: string;
  market?: string;
  outcome?: string;
  amount?: number;
  price?: number;
  timestamp?: string | number;
};

export function ActivityClient({ trades }: { trades: Trade[] }) {
  const { language } = useLanguage();
  const isEs = language === "es";

  const items = trades
    .map((t) => ({
      timestamp:
        typeof t.timestamp === "number"
          ? new Date(t.timestamp).toISOString()
          : t.timestamp ?? new Date().toISOString(),
      data: t,
    }))
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  return (
    <main className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isEs ? "Actividad" : "Activity"}
        </h1>
        <p className="text-muted-foreground">
          {isEs
            ? "Tu historial completo de predicciones."
            : "Your full prediction history."}
        </p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <ActivityIcon className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {isEs
                ? "Aún sin actividad. Haz tu primera predicción para construir tu historial."
                : "No activity yet. Make your first call to build your history."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {items.map((item, i) => (
                <TradeRow key={i} item={item} isEs={isEs} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

function TradeRow({
  item,
  isEs,
}: {
  item: { timestamp: string; data: Trade };
  isEs: boolean;
}) {
  const date = new Date(item.timestamp);
  const dateStr = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const t = item.data;
  const amount = typeof t.amount === "number" ? t.amount : 0;
  return (
    <div className="flex items-center gap-4 px-4 py-4 hover:bg-muted/30 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <TrendingUp className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">
          {t.type === "sell" ? (isEs ? "Vendiste" : "Sold") : isEs ? "Compraste" : "Bought"}{" "}
          <span className="text-muted-foreground">{t.outcome ?? "—"}</span>
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {t.market ?? (isEs ? "Mercado" : "Market")} · {dateStr} · {timeStr}
        </p>
      </div>
      <div className="text-right">
        <p className="font-bold">${amount.toLocaleString()}</p>
        {typeof t.price === "number" && (
          <p className="text-xs text-muted-foreground">
            @ {(t.price * 100).toFixed(1)}¢
          </p>
        )}
      </div>
    </div>
  );
}
