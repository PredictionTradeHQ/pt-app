"use client";

import { Button } from "@/components/ui/button";
import { Vote, Bitcoin, Trophy, LineChart, Cpu, Globe, ArrowRight } from "lucide-react";

const categories = [
  {
    icon: Vote,
    name: "Politics",
    description: "Elections, referendums, and government decisions",
    markets: 24,
    trending: true,
  },
  {
    icon: Bitcoin,
    name: "Crypto",
    description: "Bitcoin, Ethereum, and altcoin prices",
    markets: 156,
    trending: true,
  },
  {
    icon: Trophy,
    name: "Sports",
    description: "Football, basketball, F1, and more competitions",
    markets: 89,
    trending: false,
  },
  {
    icon: LineChart,
    name: "Finance",
    description: "Traditional markets, interest rates, and economy",
    markets: 42,
    trending: false,
  },
  {
    icon: Cpu,
    name: "Technology",
    description: "Product launches, mergers, and tech trends",
    markets: 37,
    trending: true,
  },
  {
    icon: Globe,
    name: "Global Events",
    description: "Climate, culture, entertainment, and more",
    markets: 63,
    trending: false,
  },
];

export function Markets() {
  return (
    <section id="markets" className="py-24 border-t border-border">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="text-primary text-sm font-medium tracking-wider uppercase mb-4">Explore</p>
            <h2 className="text-4xl md:text-5xl font-bold text-balance">
              Our Markets
            </h2>
          </div>
          <Button variant="outline" className="gap-2 w-fit">
            View All Markets
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Categories grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <button
              key={category.name}
              className="group p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card transition-all text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <category.icon className="w-6 h-6 text-primary" />
                </div>
                {category.trending && (
                  <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                    Trending
                  </span>
                )}
              </div>

              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                {category.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">{category.markets}</span> active markets
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
