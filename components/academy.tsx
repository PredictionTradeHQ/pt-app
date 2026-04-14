"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  TrendingUp, 
  Calculator, 
  Lightbulb, 
  Clock, 
  ChevronRight,
  Play,
  FileText,
  Target,
  BarChart3,
  Zap,
  ArrowRight
} from "lucide-react";

const courses = [
  {
    id: "basics",
    category: "Fundamentals",
    title: "What Are Prediction Markets?",
    description: "Understand the basics of how prediction markets work, why they're accurate, and how prices reflect probabilities.",
    duration: "5 min read",
    difficulty: "Beginner",
    icon: BookOpen,
    content: `
## What Are Prediction Markets?

Prediction markets are platforms where participants trade on the outcomes of future events. Think of them as a stock market, but instead of company shares, you're trading contracts based on real-world outcomes.

### How Prices Reflect Probabilities

If a contract for "Team A wins the championship" trades at $0.65, the market collectively believes there's a **65% probability** of that happening. This price constantly adjusts as new information becomes available.

### Why Are They Accurate?

Prediction markets aggregate the knowledge of thousands of participants, each with their own information and analysis. This "wisdom of the crowd" effect often produces more accurate forecasts than individual experts.

### Key Concepts

- **Yes/No Contracts**: Most markets offer binary outcomes. Buy "Yes" if you think it will happen, "No" if you don't.
- **Price = Probability**: A contract at $0.30 implies a 30% chance of occurring.
- **Resolution**: When the event occurs, correct predictions pay $1, incorrect ones pay $0.
- **Trading**: You can sell your position anytime before resolution if you change your mind.

### Real-World Applications

- Political elections
- Sports outcomes
- Economic indicators
- Scientific discoveries
- Entertainment (awards, releases)
    `
  },
  {
    id: "amm",
    category: "Deep Dive",
    title: "Understanding AMMs (Automated Market Makers)",
    description: "Learn how Automated Market Makers provide liquidity and enable trading without traditional order books.",
    duration: "8 min read",
    difficulty: "Intermediate",
    icon: Calculator,
    content: `
## What Is an Automated Market Maker (AMM)?

An AMM is a smart contract that creates liquidity pools and determines prices mathematically, rather than matching buyers with sellers through an order book.

### The Constant Product Formula

Most AMMs use a simple formula: **x * y = k**

Where:
- **x** = quantity of token A in the pool
- **y** = quantity of token B in the pool  
- **k** = constant (the product must stay the same)

When you buy token A, you add token B to the pool, and the price adjusts automatically.

### How This Applies to Prediction Markets

In prediction markets like Polymarket, the AMM maintains pools for each outcome:

- **Yes Pool**: Tokens representing the event will happen
- **No Pool**: Tokens representing it won't happen

As more people buy "Yes", its price increases (probability goes up), and "No" becomes cheaper (probability goes down).

### Advantages of AMMs

1. **Always Available**: Trade 24/7 without waiting for a counterparty
2. **Transparent Pricing**: The formula is public and verifiable
3. **No Manipulation**: Large trades move the price, making manipulation expensive
4. **Instant Execution**: No order matching delays

### Slippage and Large Orders

The bigger your trade relative to the pool, the more the price moves against you. This is called **slippage**. In practice:

- Small trades: minimal price impact
- Large trades: significant price impact

Professional traders often split large orders to minimize slippage.
    `
  },
  {
    id: "probability",
    category: "Deep Dive",
    title: "How Probabilities Are Calculated",
    description: "Dive into the mathematics behind Polymarket prices and how market forces determine implied probability.",
    duration: "6 min read",
    difficulty: "Intermediate",
    icon: BarChart3,
    content: `
## From Price to Probability

Converting Polymarket prices to probabilities is straightforward:

**Probability = Price / $1.00**

If "Bitcoin reaches $100k by December" trades at $0.42, the implied probability is **42%**.

### The Complete Market Rule

For binary markets (Yes/No), the probabilities should sum to 100%:

- Yes price: $0.42
- No price: $0.58
- Total: $1.00 (100%)

If they don't sum exactly to $1.00, arbitrage opportunities exist.

### Multi-Outcome Markets

For markets with multiple outcomes (e.g., "Who will win the election?"):

Each candidate has their own price, and all should sum to ~$1.00:
- Candidate A: $0.45 (45%)
- Candidate B: $0.35 (35%)
- Candidate C: $0.15 (15%)
- Other: $0.05 (5%)

### Why Prices Move

Prices change based on:

1. **New Information**: Breaking news, polls, announcements
2. **Trading Volume**: Large buys/sells shift the price
3. **Time Decay**: As events approach, uncertainty decreases
4. **Market Sentiment**: Collective trader psychology

### Reading the Market

- **Sharp moves**: Major news or insider activity
- **Gradual drift**: Slow consensus shift
- **High volume, stable price**: Disagreement between traders
- **Low volume, price moves**: Thin liquidity, less reliable signal
    `
  },
  {
    id: "arbitrage",
    category: "Strategies",
    title: "Arbitrage Strategies for Beginners",
    description: "Learn how to identify and profit from price discrepancies across different markets or outcomes.",
    duration: "7 min read",
    difficulty: "Intermediate",
    icon: Lightbulb,
    content: `
## What Is Arbitrage?

Arbitrage is exploiting price differences for risk-free profit. In prediction markets, this occurs when prices are "mispriced" relative to each other.

### Type 1: Cross-Platform Arbitrage

The same event might have different prices on different platforms:

- Polymarket: "Event X" Yes at $0.55
- Platform B: "Event X" Yes at $0.48

**Strategy**: Buy on Platform B, sell on Polymarket. You profit $0.07 per contract regardless of outcome.

### Type 2: Complementary Outcome Arbitrage

In binary markets, Yes + No should equal $1.00. If they don't:

- Yes price: $0.45
- No price: $0.52
- Total: $0.97

**Strategy**: Buy both Yes and No for $0.97. One will pay $1.00. Guaranteed $0.03 profit.

### Type 3: Multi-Outcome Arbitrage

If candidate probabilities sum to less than 100%:

- A: $0.30
- B: $0.25
- C: $0.20
- D: $0.15
- Total: $0.90

**Strategy**: Buy all outcomes for $0.90. Winner pays $1.00. Profit: $0.10.

### Practical Considerations

1. **Fees**: Transaction fees can eat into small arbitrage profits
2. **Speed**: Others are looking for the same opportunities
3. **Liquidity**: Large arbitrage trades cause slippage
4. **Timing**: Prices can change before you complete all trades

### In Our Simulator

Use our platform to practice identifying arbitrage opportunities without risk. Track how quickly they appear and disappear in real market conditions.
    `
  },
  {
    id: "risk",
    category: "Strategies",
    title: "Risk Management Fundamentals",
    description: "Essential strategies for managing your portfolio and avoiding common mistakes in prediction trading.",
    duration: "6 min read",
    difficulty: "Beginner",
    icon: Target,
    content: `
## Why Risk Management Matters

Even skilled predictors lose money without proper risk management. The goal isn't to win every trade—it's to be profitable over time.

### Position Sizing

Never risk more than you can afford to lose on a single market.

**The 1-5% Rule**: Risk only 1-5% of your total bankroll on any single prediction.

With a $10,000 bankroll:
- Conservative: $100-200 per market
- Moderate: $300-400 per market
- Aggressive: $500 per market (higher risk)

### Diversification

Don't put all your funds in one type of market:

- Spread across different categories (politics, sports, crypto)
- Mix different time horizons (weeks vs. months)
- Balance high-confidence vs. speculative bets

### The Kelly Criterion

A mathematical formula for optimal bet sizing:

**f = (bp - q) / b**

Where:
- f = fraction of bankroll to bet
- b = odds received (payout ratio)
- p = probability of winning
- q = probability of losing (1 - p)

### Common Mistakes to Avoid

1. **Overconfidence**: You're not smarter than the market consensus
2. **Chasing Losses**: Don't increase bet size after losses
3. **FOMO**: Missing one opportunity won't ruin you
4. **Ignoring Fees**: Small fees compound over many trades
5. **Emotional Trading**: Stick to your strategy

### Track Everything

Keep records of:
- Entry and exit prices
- Your reasoning for each trade
- Outcome and profit/loss
- What you learned
    `
  },
  {
    id: "polymarket",
    category: "Platform Guide",
    title: "How Polymarket Works",
    description: "A complete guide to the Polymarket platform, including how markets are created, resolved, and settled.",
    duration: "5 min read",
    difficulty: "Beginner",
    icon: Zap,
    content: `
## Polymarket Overview

Polymarket is the largest decentralized prediction market, running on the Polygon blockchain. It handles millions in daily trading volume across hundreds of markets.

### Market Structure

Each market has:
- **Question**: The event being predicted
- **Outcomes**: Usually Yes/No, sometimes multiple options
- **Resolution Date**: When the outcome will be determined
- **Resolution Source**: How the outcome is verified (news, official data)

### How Markets Resolve

When an event concludes:

1. **Oracle Check**: Polymarket uses UMA's optimistic oracle
2. **Challenge Period**: Anyone can dispute incorrect resolutions
3. **Settlement**: Winning contracts pay $1.00, losing pay $0

### Trading Mechanics

- **Buy**: Purchase outcome tokens at current price
- **Sell**: Exit your position before resolution
- **Limit Orders**: Set your desired price
- **Market Orders**: Buy/sell at current price

### Fees on Polymarket

- Trading fees: ~0.5-2% depending on market
- No deposit/withdrawal fees (just gas)
- No fees on resolution

### From Simulation to Reality

Our simulator uses real Polymarket data, so the markets you practice on here move exactly like the real thing. When you're ready:

1. Set up a crypto wallet (MetaMask recommended)
2. Bridge funds to Polygon
3. Deposit USDC to Polymarket
4. Start trading with real funds

The skills you build here transfer directly to live trading.
    `
  },
];

const quickTips = [
  {
    title: "Start Small",
    description: "Even in simulation, practice with small positions to build discipline.",
    icon: Target,
  },
  {
    title: "Follow the News",
    description: "Markets react to information. Stay informed about events you're trading.",
    icon: FileText,
  },
  {
    title: "Track Your Bets",
    description: "Keep a journal of your predictions and reasoning to improve over time.",
    icon: BarChart3,
  },
  {
    title: "Learn from Losses",
    description: "Every wrong prediction is a learning opportunity. Analyze what you missed.",
    icon: Lightbulb,
  },
];

export function Academy() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const selectedCourseData = courses.find(c => c.id === selectedCourse);
  
  const filteredCourses = activeTab === "all" 
    ? courses 
    : courses.filter(c => c.category.toLowerCase().includes(activeTab));

  const categories = ["all", "fundamentals", "deep dive", "strategies", "platform"];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <BookOpen className="w-3 h-3 mr-1" />
            Free Learning Resources
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            Prediction Markets Academy
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Master the fundamentals of prediction trading. From basic concepts to advanced strategies, 
            learn everything you need before risking real capital.
          </p>
        </div>

        {/* Quick Tips */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {quickTips.map((tip, index) => (
            <Card key={index} className="bg-card/50 border-border">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <tip.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{tip.title}</h3>
                    <p className="text-xs text-muted-foreground">{tip.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Course List or Course Detail */}
        {selectedCourse && selectedCourseData ? (
          <div className="max-w-4xl mx-auto">
            {/* Back button */}
            <Button 
              variant="ghost" 
              className="mb-6"
              onClick={() => setSelectedCourse(null)}
            >
              <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
              Back to All Courses
            </Button>

            {/* Course header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{selectedCourseData.category}</Badge>
                <Badge variant="outline">{selectedCourseData.difficulty}</Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {selectedCourseData.duration}
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-4">{selectedCourseData.title}</h2>
              <p className="text-muted-foreground">{selectedCourseData.description}</p>
            </div>

            {/* Course content */}
            <Card className="bg-card/50">
              <CardContent className="p-8 prose prose-invert prose-sm max-w-none">
                <div className="whitespace-pre-wrap leading-relaxed">
                  {selectedCourseData.content.split('\n').map((line, i) => {
                    if (line.startsWith('## ')) {
                      return <h2 key={i} className="text-2xl font-bold mt-8 mb-4 text-foreground">{line.replace('## ', '')}</h2>;
                    }
                    if (line.startsWith('### ')) {
                      return <h3 key={i} className="text-xl font-semibold mt-6 mb-3 text-foreground">{line.replace('### ', '')}</h3>;
                    }
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={i} className="font-semibold text-foreground my-2">{line.replace(/\*\*/g, '')}</p>;
                    }
                    if (line.startsWith('- ')) {
                      return <li key={i} className="text-muted-foreground ml-4">{line.replace('- ', '')}</li>;
                    }
                    if (line.match(/^\d\./)) {
                      return <li key={i} className="text-muted-foreground ml-4 list-decimal">{line.replace(/^\d\./, '').trim()}</li>;
                    }
                    if (line.trim() === '') {
                      return <br key={i} />;
                    }
                    return <p key={i} className="text-muted-foreground my-2">{line}</p>;
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Next steps */}
            <div className="mt-8 p-6 rounded-2xl border border-border bg-card/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Ready to apply what you learned?</h3>
                  <p className="text-sm text-muted-foreground">Practice with virtual funds on real market data.</p>
                </div>
                <Button asChild>
                  <a href="/markets">
                    Start Practicing
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Category tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="bg-card/50 border border-border">
                {categories.map((cat) => (
                  <TabsTrigger 
                    key={cat} 
                    value={cat}
                    className="capitalize data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {cat === "all" ? "All Courses" : cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Course grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card 
                  key={course.id}
                  className="bg-card/50 border-border hover:border-primary/50 transition-colors cursor-pointer group"
                  onClick={() => setSelectedCourse(course.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">{course.category}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {course.duration}
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <course.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">{course.difficulty}</Badge>
                      <span className="text-sm text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read Article
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA Section */}
            <div className="mt-16 text-center">
              <Card className="bg-primary/5 border-primary/20 p-8">
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-2xl font-bold mb-4">Learn by Doing</h3>
                  <p className="text-muted-foreground mb-6">
                    Theory is great, but practice makes perfect. Apply everything you learn 
                    in our risk-free simulator with real Polymarket data.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button asChild size="lg">
                      <a href="/markets">
                        <Play className="w-4 h-4 mr-2" />
                        Start Practicing
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <a href="https://polymarket.com" target="_blank" rel="noopener noreferrer">
                        Visit Polymarket
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
