"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
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
  ArrowRight,
  Trophy,
  Wallet,
  Globe,
  CheckCircle,
  Circle,
  Lock,
  Gamepad2,
  GraduationCap,
  Layers,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

interface Video {
  id: string;       // YouTube video ID
  title: string;
  channel: string;
}

interface Lesson {
  id: string;
  title: string;
  titleEs: string;
  duration: string;
  free: boolean;
  icon: React.ElementType;
  content: string;
  contentEs: string;
  videos?: Video[];
}

interface Level {
  num: number;
  titleEn: string;
  titleEs: string;
  subtitleEn: string;
  subtitleEs: string;
  difficulty: Difficulty;
  tag?: "demo";
  color: string;
  bgColor: string;
  icon: React.ElementType;
  lessons: Lesson[];
}

// ─── Content ──────────────────────────────────────────────────────────────────

const levels: Level[] = [
  {
    num: 1,
    titleEn: "Introduction to Prediction Markets",
    titleEs: "Introducción a los Mercados de Predicción",
    subtitleEn: "6 lessons · ~35 min · Start here if you're completely new",
    subtitleEs: "6 lecciones · ~35 min · Empieza aquí si eres nuevo",
    difficulty: "Beginner",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    icon: BookOpen,
    lessons: [
      {
        id: "l1-1",
        title: "What Are Prediction Markets?",
        titleEs: "¿Qué son los Mercados de Predicción?",
        duration: "5 min",
        free: true,
        icon: BookOpen,
        videos: [
          { id: "8E6rzoy0Dto", title: "What is Polymarket? Prediction Markets Explained", channel: "Polymarket" },
          { id: "lGyVDgf9zJ0", title: "What Are Prediction Markets? (CEO of Polymarket)", channel: "Bankless" },
        ],
        content: `## What Are Prediction Markets?

Prediction markets are platforms where participants trade contracts based on the outcome of future real-world events. Think of them like a stock market — but instead of company shares, you trade on events like "Will Bitcoin reach $100K?" or "Who will win the election?".

### How Prices Reflect Probabilities

If a contract for "Team A wins the championship" trades at **$0.65**, the market collectively believes there's a **65% probability** of that happening. This price constantly adjusts as new information becomes available.

### Why Are They Accurate?

Prediction markets aggregate the knowledge of thousands of participants, each with their own information and analysis. This "wisdom of the crowd" effect often produces more accurate forecasts than individual experts or polls.

### Key Concepts

- **Yes/No Contracts**: Most markets offer binary outcomes. Buy "Yes" if you think it will happen.
- **Price = Probability**: A contract at $0.30 implies a 30% chance of occurring.
- **Resolution**: When the event concludes, correct predictions pay $1.00, incorrect ones pay $0.
- **Trading**: You can sell your position anytime before resolution.

### Real-World Applications

- Political elections and referendums
- Sports outcomes
- Crypto price milestones
- Economic indicators (Fed rate decisions, GDP)
- Scientific discoveries and tech releases`,
        contentEs: `## ¿Qué son los Mercados de Predicción?

Los mercados de predicción son plataformas donde los participantes compran y venden contratos basados en el resultado de eventos reales futuros. Piénsalos como un mercado de acciones, pero en lugar de acciones de empresas, operas sobre eventos como "¿Llegará Bitcoin a $100K?" o "¿Quién ganará las elecciones?".

### Cómo los Precios Reflejan Probabilidades

Si un contrato sobre "El Equipo A gana el campeonato" cotiza a **$0.65**, el mercado colectivamente cree que hay un **65% de probabilidad** de que suceda. Este precio se ajusta constantemente con nueva información.

### ¿Por Qué son Precisos?

Los mercados de predicción agregan el conocimiento de miles de participantes, cada uno con su propia información y análisis. Este efecto de "sabiduría colectiva" produce pronósticos más precisos que los expertos o las encuestas.

### Conceptos Clave

- **Contratos Sí/No**: La mayoría de los mercados ofrecen resultados binarios.
- **Precio = Probabilidad**: Un contrato a $0.30 implica un 30% de probabilidad.
- **Resolución**: Cuando el evento concluye, las predicciones correctas pagan $1.00.
- **Trading**: Puedes vender tu posición en cualquier momento antes de la resolución.`,
      },
      {
        id: "l1-2",
        title: "History: From Iowa to Polymarket",
        titleEs: "Historia: De Iowa a Polymarket",
        duration: "6 min",
        free: true,
        icon: Globe,
        videos: [
          { id: "JzaH2f9OHy4", title: "Prediction Markets — by the Accidental Creator of a Gambling Movement", channel: "PTFO" },
          { id: "APN3zwcwPdQ", title: "How Prediction Markets Are Spawning an Entire Industry", channel: "CNBC" },
        ],
        content: `## History of Prediction Markets

Prediction markets have a surprisingly long history — and an impressive track record.

### The Iowa Electronic Markets (1988)

The University of Iowa launched the first modern prediction market in 1988 to forecast US presidential elections. It consistently outperformed traditional polls.

### Intrade and the 2000s Boom

Intrade (2001–2013) became the most popular prediction market, correctly forecasting political outcomes and major world events. Its shutdown in 2013 left a vacuum.

### The Crypto Era: Augur (2018)

Augur launched as the first decentralized prediction market on Ethereum. It proved the concept but struggled with usability and fees.

### Polymarket and the Modern Era (2020–present)

Polymarket solved the usability problem by running on Polygon (low fees, fast transactions) and using USDC. It has handled hundreds of millions in volume and is now the dominant platform.

### Why It Matters for You

Understanding this history shows that prediction markets have proven accurate over decades. What you learn here isn't speculative — it's based on 35+ years of evidence that these markets work.`,
        contentEs: `## Historia de los Mercados de Predicción

Los mercados de predicción tienen una historia sorprendentemente larga y un historial impresionante.

### Los Iowa Electronic Markets (1988)

La Universidad de Iowa lanzó el primer mercado de predicción moderno en 1988 para pronosticar elecciones presidenciales de EEUU. Superó consistentemente a las encuestas tradicionales.

### Intrade y el Auge de los 2000

Intrade (2001–2013) se convirtió en el mercado de predicción más popular, pronosticando correctamente resultados políticos y eventos mundiales. Su cierre en 2013 dejó un vacío enorme.

### La Era Cripto: Augur (2018)

Augur se lanzó como el primer mercado de predicción descentralizado en Ethereum. Probó el concepto pero tuvo problemas de usabilidad y comisiones.

### Polymarket y la Era Moderna (2020–presente)

Polymarket resolvió el problema de usabilidad ejecutándose en Polygon (bajas comisiones, transacciones rápidas) y usando USDC. Ha manejado cientos de millones en volumen.`,
      },
      {
        id: "l1-3",
        title: "Why Markets Beat Experts",
        titleEs: "Por Qué los Mercados Superan a los Expertos",
        duration: "5 min",
        free: true,
        icon: TrendingUp,
        videos: [
          { id: "zB9HKb1vj_A", title: "Prediction Markets — Beating the Experts", channel: "EconTalk" },
          { id: "pedNak4S9IE", title: "Superforecasting — Philip Tetlock (How Experts Are Wrong)", channel: "Intelligence Squared" },
          { id: "ggUHOqq4dhw", title: "The Wisdom of Crowds — TEDx Brighton", channel: "TEDx Talks" },
        ],
        content: `## Why Prediction Markets Outperform Experts

One of the most fascinating aspects of prediction markets is how reliably they outperform traditional forecasting methods.

### The Wisdom of Crowds

When you aggregate the beliefs of many people — each with different information and incentives — you get something more accurate than any single expert. This is especially true when:

- Participants have real money at stake (skin in the game)
- The market is liquid and active
- The resolution criteria are clear

### Evidence-Based Accuracy

Studies show that prediction markets consistently beat:
- **Political polls**: They predicted the 2016 US election more accurately than most polls
- **Analyst forecasts**: Financial prediction markets outperform Wall Street consensus
- **Expert panels**: Even panels of domain experts are outperformed

### Why Incentives Matter

The key difference is **money**. When you're risking real capital (or even virtual funds in practice), you think more carefully. You research. You update your beliefs when new evidence arrives. This is why prediction markets are more accurate than pundit opinions.

### For Traders: What This Means

If the market says 70% probability, that's the best available estimate. Your edge comes from finding moments when the market is wrong — and that requires research and discipline.`,
        contentEs: `## Por Qué los Mercados de Predicción Superan a los Expertos

Uno de los aspectos más fascinantes de los mercados de predicción es cómo superan de manera confiable a los métodos de pronóstico tradicionales.

### La Sabiduría de las Masas

Cuando agregas las creencias de muchas personas, cada una con diferente información e incentivos, obtienes algo más preciso que cualquier experto individual. Esto es especialmente cierto cuando los participantes tienen dinero real en juego.

### Evidencia de Precisión

Estudios muestran que los mercados de predicción superan consistentemente a: encuestas políticas, pronósticos de analistas y paneles de expertos.

### Por Qué los Incentivos Importan

La diferencia clave es el **dinero**. Cuando arriesgas capital real (o fondos virtuales en práctica), piensas con más cuidado, investigas y actualizas tus creencias con nueva evidencia.`,
      },
      {
        id: "l1-4",
        title: "Types of Events You Can Trade",
        titleEs: "Tipos de Eventos que Puedes Tradear",
        duration: "6 min",
        free: true,
        icon: Layers,
        videos: [
          { id: "mRttt6c4is8", title: "Prediction Markets for Dummies — Kalshi & Polymarket 101", channel: "Coin Bureau" },
          { id: "h6UQB9lrcmc", title: "How Prediction Markets Work & How to Profit From Them", channel: "Altcoin Daily" },
        ],
        content: `## Types of Events in Prediction Markets

Prediction markets cover an enormous range of topics. Understanding each category helps you find your edge.

### Politics & Elections
The original use case. Markets on presidential elections, referendums, legislation passing, and political appointments. These markets tend to be very liquid and well-researched.

### Cryptocurrency
Will Bitcoin reach a price milestone? Will Ethereum upgrade succeed? These markets combine crypto knowledge with prediction market mechanics — popular with crypto-native traders.

### Sports
Championship winners, individual game outcomes, player performance milestones. Sports markets are popular because outcomes are fast and clear.

### Finance & Economics
Federal Reserve rate decisions, GDP growth, inflation data, company earnings beats. Great for traders with financial background.

### Technology
Product launches, AI model releases, tech company decisions. Growing category as tech becomes more geopolitically relevant.

### World Events
Geopolitical outcomes, scientific discoveries, entertainment awards (Oscars, Emmys). Most diverse category.

### How to Choose

Start with the category where you have the most knowledge. An avid sports fan will likely outperform on sports markets. A macro trader will do better on economic markets. Your existing knowledge is an edge.`,
        contentEs: `## Tipos de Eventos en Mercados de Predicción

Los mercados de predicción cubren una enorme gama de temas. Entender cada categoría te ayuda a encontrar tu ventaja.

### Política y Elecciones
El caso de uso original. Elecciones presidenciales, referendos, legislación. Muy líquidos y bien investigados.

### Criptomonedas
¿Llegará Bitcoin a un precio objetivo? ¿El upgrade de Ethereum tendrá éxito? Combina conocimiento cripto con mecánicas de predicción.

### Deportes
Ganadores de campeonatos, resultados de partidos. Populares porque los resultados son rápidos y claros.

### Finanzas y Economía
Decisiones de la Fed, PIB, inflación, resultados de empresas. Ideal para traders con formación financiera.

### Cómo Elegir

Empieza con la categoría donde tienes más conocimiento. Tu conocimiento existente es una ventaja real.`,
      },
      {
        id: "l1-5",
        title: "Prediction vs. Traditional Trading",
        titleEs: "Predicción vs. Trading Tradicional",
        duration: "5 min",
        free: false,
        icon: BarChart3,
        videos: [
          { id: "_PCYx5Nk7zU", title: "Decentralized Prediction Markets Explained for Beginners", channel: "Finematics" },
          { id: "CueX0o3ZoiQ", title: "What to Know About Prediction Markets Like Polymarket", channel: "WSJ" },
        ],
        content: `## Prediction Markets vs. Traditional Trading

Understanding the key differences helps you apply the right strategies.

### What's Different

| | Traditional Trading | Prediction Markets |
|---|---|---|
| Asset | Stocks, crypto, forex | Event outcome contracts |
| Price range | Unlimited | $0 to $1.00 |
| Resolution | Never (hold indefinitely) | Definite date/event |
| Analysis | Technical + fundamental | Research + probability |

### The $0–$1 Price Mechanic

This is the most important difference. Every contract resolves to either $0 or $1. This means:
- You always know the maximum gain and loss
- Prices ARE probabilities (no conversion needed)
- There's no infinite upside — only 100% return

### Where Prediction Markets Win

- **Clearer outcomes**: "Will X happen?" is simpler to analyze than "What will stock X be worth?"
- **Defined timeframes**: You always know when the market resolves
- **Real-world knowledge applies**: Domain expertise translates directly

### Similarities

Both reward research, discipline, and risk management. The skills you build here — evaluating probabilities, managing positions, thinking in expected value — transfer to traditional trading too.`,
        contentEs: `## Mercados de Predicción vs. Trading Tradicional

Entender las diferencias clave te ayuda a aplicar las estrategias correctas.

### Las Diferencias Principales

La diferencia más importante es el rango de precios de $0 a $1. Cada contrato se resuelve en $0 o $1, lo que significa que los precios SON probabilidades directamente.

### Donde Ganan los Mercados de Predicción

- Resultados más claros: "¿Sucederá X?" es más simple de analizar
- Plazos definidos: siempre sabes cuándo resuelve el mercado
- El conocimiento del mundo real se aplica directamente`,
      },
      {
        id: "l1-6",
        title: "Essential Glossary",
        titleEs: "Glosario Esencial",
        duration: "8 min",
        free: false,
        icon: FileText,
        videos: [
          { id: "aQph5IXgtVM", title: "Understanding Polymarket: The Simple Explanation You Needed", channel: "Crypto Banter" },
        ],
        content: `## Essential Prediction Market Glossary

Master these terms before moving on.

**AMM (Automated Market Maker)**: A smart contract that sets prices mathematically, replacing traditional order books.

**Binary Market**: A market with only two outcomes: Yes or No.

**CLOB (Central Limit Order Book)**: Traditional matching of buy/sell orders. Less common in prediction markets.

**Implied Probability**: The probability suggested by a contract's price (price × 100 = probability %).

**Liquidity**: How much capital is available for trading. High liquidity = easier to enter/exit positions.

**Multi-Outcome Market**: A market with 3+ possible outcomes (e.g., who wins an election with multiple candidates).

**Oracle**: A system that determines the official outcome of a market at resolution.

**Paper Trading**: Practicing with virtual (fake) money on real market data. That's what our demo is.

**Position**: Your current holdings in a market (how many contracts you own).

**P&L (Profit and Loss)**: Your total gains minus losses across all trades.

**Resolution**: When a market closes and pays out winners.

**Slippage**: The difference between expected and actual price, caused by trade size vs. available liquidity.

**UMA**: The oracle protocol used by Polymarket to resolve disputed markets.

**USDC**: US Dollar Coin — the stablecoin used for real-money trading on Polymarket.

**Win Rate**: Percentage of your trades that were profitable.`,
        contentEs: `## Glosario Esencial de Mercados de Predicción

**AMM**: Creador de Mercado Automatizado. Contrato inteligente que fija precios matemáticamente.

**Mercado Binario**: Mercado con solo dos resultados: Sí o No.

**Probabilidad Implícita**: La probabilidad sugerida por el precio de un contrato (precio × 100 = %).

**Liquidez**: Cuánto capital hay disponible para operar.

**Oracle**: Sistema que determina el resultado oficial de un mercado.

**Paper Trading**: Practicar con dinero virtual sobre datos reales. Eso es exactamente nuestra demo.

**P&L**: Ganancia y Pérdida total acumulada.

**Resolución**: Cuando un mercado cierra y paga a los ganadores.

**Slippage**: Diferencia entre el precio esperado y el real.

**USDC**: USD Coin, la stablecoin usada en Polymarket.`,
      },
    ],
  },
  {
    num: 2,
    titleEn: "How Markets Work Under the Hood",
    titleEs: "Cómo Funcionan los Mercados por Dentro",
    subtitleEn: "6 lessons · ~40 min · Understand the mechanics",
    subtitleEs: "6 lecciones · ~40 min · Entiende la mecánica",
    difficulty: "Beginner",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    icon: Calculator,
    lessons: [
      {
        id: "l2-1",
        title: "How Prices Equal Probabilities",
        titleEs: "Cómo los Precios Igualan Probabilidades",
        duration: "6 min",
        free: true,
        icon: Calculator,
        videos: [
          { id: "HAlYMtluzCk", title: "The Hidden Math Behind Polymarket, Gambling and Trading", channel: "Zeteo" },
          { id: "LejPvcakKpE", title: "The Wisdom (and Madness) of Crowds: Political Markets as Election Predictors", channel: "Stanford eCorner" },
        ],
        content: `## From Price to Probability

The most fundamental concept in prediction markets: **price = probability**.

### The Core Formula

**Probability = Price ÷ $1.00**

- Contract at $0.72 → **72% probability**
- Contract at $0.15 → **15% probability**
- Contract at $0.50 → **50% probability** (coin flip)

### Binary Markets Must Sum to $1.00

In a Yes/No market:
- Yes price + No price = $1.00
- If "Yes" = $0.63, then "No" = $0.37

This must always be true. If it's not, arbitrage opportunities exist.

### Interpreting Price Movements

- **Price rises from $0.40 → $0.65**: Market now believes 65% chance (was 40%). Something changed.
- **Sudden price drop**: New negative information entered the market.
- **Slow drift upward**: Gradual consensus shift as time passes and evidence accumulates.

### What the Market is Telling You

The price is the market's best aggregate estimate. It's not always right, but it reflects everything publicly known. Your edge comes from knowing something the market doesn't — or analyzing public information better.`,
        contentEs: `## Del Precio a la Probabilidad

El concepto más fundamental: **precio = probabilidad**.

### La Fórmula Central

**Probabilidad = Precio ÷ $1.00**

- Contrato a $0.72 → **72% de probabilidad**
- Contrato a $0.15 → **15% de probabilidad**

### Los Mercados Binarios Deben Sumar $1.00

En un mercado Sí/No: Precio Sí + Precio No = $1.00. Si esto no se cumple, existe una oportunidad de arbitraje.

### Interpretando los Movimientos de Precio

- **El precio sube de $0.40 → $0.65**: El mercado ahora cree 65% de probabilidad. Algo cambió.
- **Caída repentina**: Nueva información negativa entró al mercado.`,
      },
      {
        id: "l2-2",
        title: "AMMs: No Order Books Needed",
        titleEs: "AMMs: Sin Libro de Órdenes",
        duration: "8 min",
        free: true,
        icon: Zap,
        videos: [
          { id: "htXEEVkiIJ0", title: "What Are Automated Market Makers? [Explained With Animations]", channel: "Whiteboard Crypto" },
          { id: "SsSJon8UTrE", title: "AMMs and Liquidity Pools Explained — Understanding DeFi", channel: "Finematics" },
        ],
        content: `## What Is an Automated Market Maker (AMM)?

An AMM is a smart contract that creates liquidity pools and determines prices mathematically — no buyers need to match with sellers.

### The Constant Product Formula

Most AMMs use: **x × y = k**

- **x** = tokens in pool A (Yes tokens)
- **y** = tokens in pool B (No tokens)
- **k** = constant (never changes)

When you buy Yes tokens, you remove them from the pool. To keep k constant, the No tokens in the pool must increase in value — pushing the Yes price up.

### How This Works in Practice

You buy $1,000 of "Yes" on a market at 60%:
1. Yes tokens leave the pool
2. The pool rebalances automatically
3. Yes price rises slightly (say to 62%)
4. No price falls to 38%

This happens instantly, with no counterparty needed.

### Advantages of AMMs

1. **Always Available**: Trade 24/7 with no waiting
2. **Transparent Pricing**: The formula is public and verifiable
3. **No Manipulation**: Large trades move price, making manipulation expensive
4. **Instant Execution**: No order matching delays

### Slippage Warning

The bigger your trade relative to the pool size, the more the price moves against you. Split large orders to reduce slippage.`,
        contentEs: `## ¿Qué es un AMM (Creador de Mercado Automatizado)?

Un AMM es un contrato inteligente que crea pools de liquidez y determina precios matemáticamente. No necesitas que compradores y vendedores se emparejen.

### La Fórmula del Producto Constante

La mayoría usa: **x × y = k**

Cuando compras tokens "Sí", los retiras del pool. Para mantener k constante, los tokens "No" deben valer más, subiendo el precio de "Sí" automáticamente.

### Ventajas de los AMMs

1. Siempre disponibles: opera 24/7
2. Precios transparentes: la fórmula es pública
3. Ejecución instantánea: sin esperas`,
      },
      {
        id: "l2-3",
        title: "How Markets Resolve (UMA Oracle)",
        titleEs: "Cómo Resuelven los Mercados (Oracle UMA)",
        duration: "7 min",
        free: true,
        icon: CheckCircle,
        videos: [
          { id: "nf9xSjeqLk8", title: "Polymarket Complete Guide 2025 — Market Resolution Explained", channel: "Polymarket Alpha" },
          { id: "Zx8f3jrj7HE", title: "Predicting the Market with the Wisdom of Crowds", channel: "Vuk Vuković" },
        ],
        content: `## How Prediction Markets Resolve

Resolution is the moment of truth — when the event concludes and contracts pay out.

### The Resolution Process on Polymarket

1. **Event Occurs**: The real-world event happens (election result announced, etc.)
2. **Proposed Resolution**: Anyone can propose the outcome with a bond
3. **Challenge Period**: 2 hours for anyone to dispute with evidence
4. **Oracle Decision**: If disputed, UMA's decentralized oracle decides
5. **Settlement**: Winners receive $1.00 per contract, losers receive $0

### The UMA Oracle

UMA (Universal Market Access) uses an optimistic oracle system:
- Anyone can propose outcomes
- The "optimistic" part: proposals are assumed correct unless challenged
- If challenged, UMA token holders vote on the correct outcome
- Bad actors lose their bond; correct reporters are rewarded

### Types of Resolution

- **Clear-cut**: "Bitcoin price above $100K on Dec 31" — verifiable from price data
- **Subjective**: "Will X be considered successful?" — can lead to disputes
- **Cancelled**: Sometimes markets are cancelled if the question becomes unanswerable

### What This Means for You

Always read the resolution criteria carefully before trading. A market about "winning the election" might resolve differently than you expect if there's a disputed result.`,
        contentEs: `## Cómo Resuelven los Mercados de Predicción

La resolución es el momento de la verdad: cuando el evento concluye y los contratos pagan.

### El Proceso en Polymarket

1. El evento real ocurre
2. Alguien propone el resultado con una fianza
3. Período de disputa de 2 horas
4. Si se disputa, el oracle UMA decide
5. Los ganadores reciben $1.00 por contrato

### El Oracle UMA

UMA usa un sistema de oracle optimista: las propuestas se asumen correctas a menos que sean disputadas. Si hay disputa, los poseedores de tokens UMA votan.`,
      },
      {
        id: "l2-4",
        title: "Liquidity & Slippage Explained",
        titleEs: "Liquidez y Slippage Explicados",
        duration: "6 min",
        free: false,
        icon: TrendingUp,
        videos: [
          { id: "ulkEqmYnJ9M", title: "AMM Explained — Liquidity, Slippage & Price Impact in DeFi", channel: "Crypto Corner" },
          { id: "1PbZMudPP5E", title: "What is an Automated Market Maker? (Liquidity Pool Algorithm)", channel: "Smart Money" },
        ],
        content: `## Liquidity and Slippage

Two concepts that directly affect your trading costs and execution.

### What Is Liquidity?

Liquidity is the amount of capital in a market's trading pools. High liquidity means:
- Tighter spreads (Yes + No closer to $1.00)
- Less slippage on your trades
- Easier to enter and exit positions

Low liquidity means the opposite — your trades have more price impact.

### What Is Slippage?

Slippage is the difference between the price you expected and the price you got.

**Example**: You want to buy $5,000 of "Yes" at 60%.
- In a large, liquid market: you get ~60.5% average (minimal slippage)
- In a thin, illiquid market: you might average 65%+ (significant slippage)

### How to Minimize Slippage

1. **Trade liquid markets**: More volume = less slippage
2. **Split large orders**: Instead of one $5,000 trade, try five $1,000 trades
3. **Use limit orders** when available
4. **Check pool depth** before large trades

### On Our Demo

Our demo shows real Polymarket data, so the slippage you'd experience is realistic. Practice with different position sizes to feel how slippage affects your execution.`,
        contentEs: `## Liquidez y Slippage

Dos conceptos que afectan directamente tus costos de trading.

### ¿Qué es la Liquidez?

La liquidez es el capital disponible en los pools de un mercado. Alta liquidez = menos slippage y más fácil entrar/salir de posiciones.

### ¿Qué es el Slippage?

Es la diferencia entre el precio que esperabas y el que obtuviste. En mercados ilíquidos, una orden grande puede mover el precio significativamente en tu contra.

### Cómo Minimizar el Slippage

1. Opera en mercados con alto volumen
2. Divide órdenes grandes en varias más pequeñas
3. Revisa la profundidad del pool antes de operar`,
      },
      {
        id: "l2-5",
        title: "Binary vs. Multi-Outcome Markets",
        titleEs: "Mercados Binarios vs. Multi-Resultado",
        duration: "5 min",
        free: false,
        icon: Layers,
        videos: [
          { id: "A3Ue7SGrDF4", title: "What is Superforecasting? — Warren Hatch, Good Judgement", channel: "Good Judgement" },
        ],
        content: `## Binary vs. Multi-Outcome Markets

Not all prediction markets are Yes/No. Understanding the difference changes how you analyze and trade them.

### Binary Markets (Most Common)

Two outcomes: Yes or No.
- "Will Bitcoin exceed $100K by Dec 31?" → Yes / No
- Simple to analyze: focus on probability of one event
- Prices always sum to $1.00

### Multi-Outcome Markets

Three or more possible outcomes:
- "Who will win the 2024 US Presidential Election?" → Candidate A / B / C / Other
- All prices should sum to ~$1.00
- Each outcome is a separate contract

**Example multi-outcome market:**
- Candidate A: $0.48 (48%)
- Candidate B: $0.39 (39%)
- Candidate C: $0.09 (9%)
- Other: $0.04 (4%)
- Total: $1.00 ✓

### Strategy Differences

**Binary**: Simple — are you above or below the market's implied probability?

**Multi-outcome**: More complex — you can find value in "longshot" outcomes that the market underprices, or hedge across multiple candidates.

### Which to Start With

Beginners should start with binary markets. They're simpler to analyze and the math is straightforward.`,
        contentEs: `## Mercados Binarios vs. Multi-Resultado

**Mercados Binarios**: Dos resultados (Sí/No). Los más comunes y simples de analizar.

**Mercados Multi-Resultado**: Tres o más posibles resultados. Todos los precios deben sumar ~$1.00.

Los principiantes deben empezar con mercados binarios. Son más simples y la matemática es directa.`,
      },
      {
        id: "l2-6",
        title: "Reading a Market: Volume, Spread & P&L",
        titleEs: "Leer un Mercado: Volumen, Spread y P&L",
        duration: "8 min",
        free: false,
        icon: BarChart3,
        videos: [
          { id: "RTpW6Ty_sog", title: "Polymarket Tutorial: How to Read Markets & Trade Like a Pro", channel: "Polymarket Alpha" },
          { id: "qtFhzQW5Uds", title: "How to Win on Polymarket: The #1 Strategy Explained", channel: "Crypto Daily" },
        ],
        content: `## How to Read a Prediction Market

Before placing any trade, learn to extract signal from the data available.

### Key Metrics to Check

**Volume**: Total USDC traded in this market.
- High volume = strong market signal, less manipulable
- Low volume = treat prices with more skepticism

**Liquidity**: Capital available for immediate trading.
- Higher liquidity = tighter spread, less slippage

**Yes/No Spread**: Difference between Yes + No and $1.00.
- If Yes = $0.62 and No = $0.36, spread = $0.02 (2 cents of friction)

**Open Interest**: Total value of outstanding contracts.
- High OI = many traders have skin in the game

**Price History**: How the probability has moved over time.
- Look for: sudden moves (news), gradual drift (consensus shift), reversals

### Reading Price History

🟢 **Gradual rise**: Growing confidence in the outcome
🔴 **Sudden drop**: Negative news or event
📊 **Flat line**: High uncertainty, balanced market
⚡ **Spike then reversal**: Overreaction to news, potential opportunity

### Your P&L Calculation

If you buy 100 Yes contracts at $0.60 and the event happens:
- **Profit**: 100 × ($1.00 - $0.60) = **$40 profit**
- **Return**: 66.7% on your $60 investment

If the event doesn't happen:
- **Loss**: 100 × $0.60 = **$60 loss** (your full investment)`,
        contentEs: `## Cómo Leer un Mercado de Predicción

**Volumen**: Total operado. Alto volumen = señal más confiable.

**Liquidez**: Capital disponible. Mayor liquidez = menos slippage.

**Spread**: Diferencia entre Sí + No y $1.00. Indica el costo de fricción.

**Historial de Precios**: Cómo ha evolucionado la probabilidad.

### Tu Cálculo de P&L

Si compras 100 contratos Sí a $0.60 y el evento ocurre: ganancia = $40 (66.7% de retorno). Si no ocurre: pérdida = $60 (toda tu inversión).`,
      },
    ],
  },
  {
    num: 3,
    titleEn: "Start Trading: The PredictionTrade Demo",
    titleEs: "Empieza a Operar: La Demo de PredictionTrade",
    subtitleEn: "6 lessons · ~30 min · Practice with real markets, zero risk",
    subtitleEs: "6 lecciones · ~30 min · Practica con mercados reales, sin riesgo",
    difficulty: "Beginner",
    tag: "demo",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    icon: Gamepad2,
    lessons: [
      {
        id: "l3-1",
        title: "Create Your Free Account",
        titleEs: "Crea tu Cuenta Gratuita",
        duration: "3 min",
        free: true,
        icon: CheckCircle,
        videos: [
          { id: "nf9xSjeqLk8", title: "Polymarket Complete Guide 2025 — Account Setup Walkthrough", channel: "Polymarket Alpha" },
        ],
        content: `## Create Your PredictionTrade Account

Getting started is completely free and takes less than 2 minutes.

### Step-by-Step

1. **Click "Get Started"** in the top navigation
2. **Enter your email address** — we'll send a confirmation
3. **Choose a display name** (this shows on leaderboards)
4. **Set a password** (min. 6 characters)
5. **Confirm your email** and you're in

### What You Get Immediately

Once registered, you receive:
- ✅ **$100,000 virtual balance** — ready to trade
- ✅ **Full access to 100+ live markets**
- ✅ **Portfolio tracker** with P&L history
- ✅ **Win rate statistics**

### No Wallet Required

Unlike real Polymarket, our demo requires zero crypto knowledge. No MetaMask, no USDC, no blockchain setup. Just sign up and trade.

### Why Create an Account?

You can browse markets without an account, but only registered users can:
- Place trades and track positions
- See their historical P&L
- Appear on the leaderboard
- Participate in tournaments

**→ Create your account now at the top right of this page.**`,
        contentEs: `## Crea tu Cuenta en PredictionTrade

Es completamente gratis y tarda menos de 2 minutos.

### Paso a Paso

1. Haz clic en "Comenzar" en la navegación superior
2. Introduce tu email
3. Elige un nombre de usuario
4. Establece una contraseña (mín. 6 caracteres)
5. Confirma tu email y ya estás dentro

### Lo que Obtienes de Inmediato

- ✅ **$100,000 de balance virtual** — listo para operar
- ✅ **Acceso completo a 100+ mercados en vivo**
- ✅ **Rastreador de portfolio con historial de P&L**

### Sin Wallet Requerida

A diferencia del Polymarket real, nuestra demo no requiere conocimientos de cripto. Sin MetaMask, sin USDC, sin blockchain.`,
      },
      {
        id: "l3-2",
        title: "Your $100,000 Virtual Capital",
        titleEs: "Tus $100,000 de Capital Virtual",
        duration: "4 min",
        free: true,
        icon: Wallet,
        videos: [
          { id: "YpwnG3UvztM", title: "How to Trade Prediction Markets to Make $10,000 — Step by Step", channel: "Sports Betting Prodigy" },
        ],
        content: `## Understanding Your Virtual Capital

Your $100,000 demo balance is designed to replicate a realistic trading experience.

### Why $100,000?

This amount lets you:
- Place meaningful trades across multiple markets
- Practice position sizing with realistic numbers
- Feel the psychological weight of gains and losses
- Develop habits that transfer to real trading

### How It Works

Your $100,000 starts in your account balance. Every trade:
1. **Deducts** from your available balance
2. **Returns** your position value in real-time as the market moves
3. **Settles** when the market resolves ($0 or full $1 per contract)

### Track Your Progress

- **Portfolio Value**: Your balance + open position values
- **Total P&L**: Cumulative profit/loss since you started
- **Win Rate**: % of resolved trades you predicted correctly
- **Best Trade**: Your largest single winning position

### The Psychology of Paper Trading

Treat your virtual funds seriously. The habits you build — discipline, research, position sizing — are the same ones needed for real trading. Don't go all-in on every market just because it's virtual money.

### What If You Lose Everything?

Your demo balance resets if you want to start fresh. But try not to reset — tracking your full history, including losses, is how you learn.`,
        contentEs: `## Entendiendo tu Capital Virtual

Tus $100,000 están diseñados para replicar una experiencia de trading realista.

### Cómo Funciona

Cada operación: (1) deduce de tu balance disponible, (2) devuelve el valor de tu posición en tiempo real, (3) liquida cuando el mercado resuelve ($0 o $1 por contrato).

### La Psicología del Paper Trading

Trata tus fondos virtuales en serio. Los hábitos que construyas — disciplina, investigación, sizing — son los mismos que necesitarás para el trading real.`,
      },
      {
        id: "l3-3",
        title: "Explore 100+ Live Markets",
        titleEs: "Explora 100+ Mercados en Vivo",
        duration: "5 min",
        free: true,
        icon: Globe,
        videos: [
          { id: "RTpW6Ty_sog", title: "Polymarket Tutorial: Exploring the Markets Dashboard", channel: "Polymarket Alpha" },
        ],
        content: `## Navigating the Markets

Our platform gives you access to all active Polymarket markets with real-time data.

### How to Browse Markets

1. **Go to /markets** (click "Markets" in the nav)
2. **Filter by category**: Politics, Crypto, Sports, Finance, Tech, World
3. **Sort by**: Volume (most traded), Probability (closest to 50%), Closing date
4. **Search**: Find specific markets by keyword

### What You'll See Per Market

Each market card shows:
- **The question** being predicted
- **Current probability** (Yes price)
- **Volume**: Total USDC traded
- **Closing date**: When it resolves
- **Price chart**: Recent probability history

### Finding Good Markets to Practice On

For beginners, look for markets that:
- ✅ Have **high volume** (>$100K traded)
- ✅ Are **not too close to resolution** (give you time to see movement)
- ✅ Cover **topics you know well** (sports, politics, crypto)
- ✅ Have a **clear resolution criteria** (no ambiguity)

### Markets to Avoid as a Beginner

- ❌ Very low volume (illiquid, unreliable prices)
- ❌ Resolving in <24 hours (not enough time to learn)
- ❌ Highly subjective resolution criteria

**→ Head to /markets now and explore. You don't need to trade yet — just get comfortable with what's there.**`,
        contentEs: `## Navegando los Mercados

### Cómo Explorar

1. Ve a /mercados (clic en "Mercados" en la navegación)
2. Filtra por categoría: Política, Cripto, Deportes, Finanzas, Tecnología
3. Ordena por: Volumen, Probabilidad, Fecha de cierre

### Mercados Buenos para Principiantes

Busca mercados con: alto volumen (>$100K), que no cierren pronto, sobre temas que conoces bien, con criterios de resolución claros.`,
      },
      {
        id: "l3-4",
        title: "Place Your First Trade (Hands-On)",
        titleEs: "Coloca tu Primera Operación (Práctica)",
        duration: "6 min",
        free: true,
        icon: Play,
        videos: [
          { id: "mRttt6c4is8", title: "Prediction Markets for Dummies — Placing Your First Trade", channel: "Coin Bureau" },
          { id: "h6UQB9lrcmc", title: "How to Profit from Prediction Markets — Hands On Guide", channel: "Altcoin Daily" },
        ],
        content: `## Place Your First Trade

Time to stop reading and start doing. Here's exactly how to place a trade.

### Step-by-Step: Placing a Trade

1. **Find a market** you have an opinion on (go to /markets)
2. **Click on the market** to open the detail view
3. **Read the resolution criteria** — understand exactly what you're predicting
4. **Check the current price** — does it match your probability estimate?
5. **Decide: Yes or No** — which outcome do you believe in?
6. **Enter your amount** — start small (e.g., $100-$200)
7. **Review the trade**: see potential payout and slippage
8. **Click Buy** — your trade is placed!

### What Happens Next

- Your balance decreases by the amount you bet
- Your "Open Positions" section shows your active trade
- The price (and your position value) updates in real-time

### Your First Trade Checklist

Before clicking Buy, confirm:
- ☐ I understand what event I'm predicting
- ☐ I've read the resolution criteria
- ☐ I'm comfortable losing this amount
- ☐ I have a reason (not just a gut feeling)

### Recommended First Trade

Pick a binary market with >$500K volume on a topic you follow. Place $100-200. Watch it for a day. Then do it 5 more times.

**→ Go to /markets and place your first trade now.**`,
        contentEs: `## Coloca tu Primera Operación

### Paso a Paso

1. Encuentra un mercado sobre el que tengas una opinión
2. Haz clic para abrir la vista detallada
3. Lee los criterios de resolución
4. Verifica el precio actual
5. Decide: Sí o No
6. Introduce tu cantidad (empieza con $100-200)
7. Revisa: pago potencial y slippage
8. Haz clic en Comprar

### Checklist Antes de Operar

- ☐ Entiendo qué evento estoy prediciendo
- ☐ He leído los criterios de resolución
- ☐ Tengo una razón (no solo corazonada)`,
      },
      {
        id: "l3-5",
        title: "Track Your P&L & Win Rate",
        titleEs: "Seguimiento de tu P&L y Tasa de Aciertos",
        duration: "5 min",
        free: false,
        icon: BarChart3,
        videos: [
          { id: "tSg6YGgjN1Y", title: "Top Polymarket Trading Strategies — Tracking Performance", channel: "Polymarket Alpha" },
        ],
        content: `## Understanding Your Performance Metrics

Your dashboard shows everything you need to track progress and identify where to improve.

### Key Metrics Explained

**Portfolio Value**
Your current total: available balance + value of all open positions. This is your "net worth" in the demo.

**Total P&L**
Cumulative profit or loss since you started. The number that matters most over time.

**Win Rate**
Percentage of resolved markets you predicted correctly. Context:
- >60%: Excellent (professional-grade)
- 50-60%: Good, especially if you're making +EV trades
- <50%: Need to revisit your analysis process

**Average Return Per Trade**
More important than win rate alone. You can win 40% of trades and still be profitable if your winners are much bigger than your losers.

### How to Use Your History

Review every resolved trade:
- **Why did I win?** Was it skill or luck?
- **Why did I lose?** Was my analysis wrong or just unlucky?
- **What would I do differently?**

### The Goal

After 50+ trades, your performance metrics become statistically meaningful. Before that, sample size is too small — don't over-optimize.`,
        contentEs: `## Entendiendo tus Métricas de Rendimiento

**Valor del Portfolio**: Balance disponible + valor de posiciones abiertas.

**P&L Total**: Ganancia/pérdida acumulada. El número más importante a largo plazo.

**Tasa de Aciertos**: % de mercados resueltos que predijiste correctamente.
- >60%: Excelente
- 50-60%: Bueno
- <50%: Revisa tu proceso de análisis

**Retorno Promedio por Operación**: Más importante que la tasa de aciertos sola.`,
      },
      {
        id: "l3-6",
        title: "Manage Your Virtual Portfolio",
        titleEs: "Gestiona tu Portfolio Virtual",
        duration: "7 min",
        free: false,
        icon: Layers,
        videos: [
          { id: "UWoXBLAXHEY", title: "My Prediction Market Trading Playbook — Portfolio Management", channel: "Insight Trading" },
        ],
        content: `## Portfolio Management in the Demo

Good traders don't just place trades — they manage a portfolio.

### Diversification Basics

Don't put all $100,000 into one market. A basic diversification framework:

- **Maximum per trade**: 5-10% of portfolio ($5,000-10,000)
- **Maximum in one category**: 30% of portfolio ($3,000)
- **Keep reserve**: Always have 20-30% available for new opportunities

### Tracking Open Positions

Your open positions show:
- Current market probability vs. your entry price
- Unrealized P&L (what you'd make/lose if you sold now)
- Time until resolution

**When to close early**: If new information fundamentally changes your thesis, don't wait for resolution. Sell early and redeploy capital.

### Position Correlation

Watch out for correlated positions. Example:
- "Bitcoin above $100K by June" — Yes at 65%
- "Ethereum above $5K by June" — Yes at 55%

These are correlated. If the crypto market crashes, both positions lose simultaneously. You don't have the diversification you think you do.

### Building a 10-Position Portfolio

A good demo portfolio might look like:
- 3 politics/elections markets
- 2 crypto markets
- 2 sports markets
- 2 finance/economic markets
- 1 speculative/longshot market

This gives you exposure to learn across all major categories.`,
        contentEs: `## Gestión del Portfolio en la Demo

### Diversificación Básica

- Máximo por operación: 5-10% del portfolio ($500-1,000)
- Máximo en una categoría: 30% del portfolio
- Mantén reserva: siempre 20-30% disponible

### Correlación de Posiciones

Cuidado con posiciones correlacionadas. Si el mercado cripto cae, todas tus posiciones cripto pierden simultáneamente — no tienes la diversificación que crees.

### Portfolio de 10 Posiciones

Un buen portfolio demo: 3 políticas, 2 cripto, 2 deportes, 2 finanzas, 1 especulativa.`,
      },
    ],
  },
  {
    num: 4,
    titleEn: "Trading Strategies That Work",
    titleEs: "Estrategias de Trading que Funcionan",
    subtitleEn: "7 lessons · ~50 min · Build a winning edge",
    subtitleEs: "7 lecciones · ~50 min · Construye una ventaja ganadora",
    difficulty: "Intermediate",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    icon: TrendingUp,
    lessons: [
      {
        id: "l4-1",
        title: "Expected Value (EV+) Trading",
        titleEs: "Trading de Valor Esperado (EV+)",
        duration: "8 min",
        free: true,
        icon: Calculator,
        videos: [
          { id: "pSBKLHIFZLo", title: "Prediction Markets: Why the Odds Are Stacked Against You", channel: "Lex Clips" },
          { id: "HAlYMtluzCk", title: "The Hidden Math Behind Polymarket — Expected Value Deep Dive", channel: "Zeteo" },
        ],
        content: `## Expected Value: The Foundation of Profitable Trading

If you learn only one concept from this academy, make it Expected Value (EV).

### What Is Expected Value?

EV is the average outcome you'd expect if you made the same bet many times.

**Formula**: EV = (Probability of Win × Payout) - (Probability of Loss × Stake)

### Example

Market: "Will the Fed cut rates in June?" — currently at 45% (Yes costs $0.45)

Your analysis says the real probability is **60%**.

EV = (0.60 × $0.55) - (0.40 × $0.45)
EV = $0.33 - $0.18
**EV = +$0.15 per dollar wagered**

This is a +EV trade. If your probability estimate is correct, you'll profit long-term.

### Finding +EV Opportunities

You need to believe the market is wrong. Your edge comes from:
1. **Better information**: You have data the market hasn't priced in
2. **Better analysis**: You interpret public data better than the market
3. **Market biases**: Markets sometimes systematically over/undervalue outcomes

### The Key Insight

You don't need to win every trade. You need to be right when you're confident, and not bet when you're not. A 55% win rate on +EV trades compounds into significant profits.

### Common EV+ Opportunities in Prediction Markets

- **Overreaction to news**: Market overprices a candidate after one good poll
- **Recency bias**: Market underweights historical base rates
- **Low liquidity**: Small markets have more pricing inefficiencies`,
        contentEs: `## Valor Esperado: La Base del Trading Rentable

**Fórmula**: VE = (Probabilidad de Ganar × Pago) - (Probabilidad de Perder × Apuesta)

### Ejemplo

Mercado al 45% (Yes a $0.45). Tu análisis dice probabilidad real del 60%.

VE = (0.60 × $0.55) - (0.40 × $0.45) = +$0.15 por dólar apostado

Esta es una operación con VE positivo. Si tu estimación es correcta, ganarás a largo plazo.

### Encontrar Oportunidades VE+

Necesitas creer que el mercado está equivocado. Tu ventaja viene de: mejor información, mejor análisis, o sesgos del mercado.`,
      },
      {
        id: "l4-2",
        title: "Arbitrage Across Markets",
        titleEs: "Arbitraje Entre Mercados",
        duration: "7 min",
        free: false,
        icon: Zap,
        videos: [
          { id: "nAVZ3ZaACAQ", title: "Easy Prediction Market Arbitrage (Polymarket / Limitless)", channel: "Polymarket Alpha" },
        ],
        content: `## Arbitrage in Prediction Markets

Arbitrage is exploiting price discrepancies for risk-free (or near risk-free) profit.

### Type 1: Yes + No Arbitrage

In binary markets, Yes + No should equal exactly $1.00. When they don't:

- Yes = $0.45, No = $0.52 → Total = $0.97
- **Strategy**: Buy both Yes and No for $0.97. One pays $1.00. Guaranteed $0.03 profit.

This sounds small, but $0.03 on $0.97 = 3.1% risk-free return.

### Type 2: Cross-Platform Arbitrage

Same event, different prices on different platforms:
- Polymarket: "Event X" Yes at 55%
- Platform B: "Event X" Yes at 48%

Buy on Platform B ($0.48), effectively sell on Polymarket ($0.55). Profit = $0.07 per contract.

### Type 3: Multi-Outcome Sum Arbitrage

If all outcomes sum to less than $1.00:
- A: $0.30, B: $0.28, C: $0.20, D: $0.18 → Total = $0.96
- Buy all outcomes for $0.96. Winner pays $1.00. Profit = $0.04.

### Practical Limitations

- **Fees**: Transaction costs eat into small arb profits
- **Speed**: Others are looking for the same opportunities
- **Liquidity**: Large arb trades cause slippage
- **Timing risk**: Prices change before you complete all legs

### On Our Demo

Practice spotting Yes/No arbitrage in the demo. Even small discrepancies teach you to read markets precisely.`,
        contentEs: `## Arbitraje en Mercados de Predicción

**Tipo 1: Arbitraje Sí+No**
Si Sí = $0.45 y No = $0.52 (total $0.97): compra ambos por $0.97. Uno paga $1.00. Ganancia garantizada de $0.03.

**Tipo 2: Arbitraje Entre Plataformas**
Mismo evento, precios distintos en plataformas diferentes.

**Tipo 3: Arbitraje Multi-Resultado**
Si todos los resultados suman menos de $1.00, compra todos y gana la diferencia.`,
      },
      {
        id: "l4-3",
        title: "Trading Breaking News & Events",
        titleEs: "Trading en Noticias y Eventos",
        duration: "7 min",
        free: false,
        icon: Zap,
        videos: [
          { id: "tSg6YGgjN1Y", title: "Top Polymarket Strategies — Trading Breaking News & Events", channel: "Polymarket Alpha" },
          { id: "qtFhzQW5Uds", title: "How to Win on Polymarket: News-Based Strategy", channel: "Crypto Daily" },
        ],
        content: `## Trading News and Live Events

Some of the best opportunities come from being fast and accurate when news breaks.

### Why News Moves Markets

Prediction market prices change when new information arrives. The faster you can:
1. See the news
2. Assess the probability impact
3. Execute before the market reprices

...the more edge you have.

### Types of News Events

**Polls and Surveys**: A new political poll comes out. Does it change the true probability more or less than the market reacts?

**Economic Data**: CPI, jobs report, Fed minutes — these move economic prediction markets significantly.

**Crypto Market Moves**: BTC price action directly impacts "will BTC reach $X" markets.

**Sports Results**: In-game events during live sports markets.

### The News Trading Framework

1. **See the news** (have reliable sources ready)
2. **Assess impact**: Does this meaningfully change the probability?
3. **Is the market overreacting or underreacting?**
4. **Trade the gap** if you spot mispricing
5. **Be quick**: Opportunities close in minutes

### Market Overreaction Patterns

Markets frequently **overreact** to:
- Single polls (one poll ≠ trend)
- Preliminary results (often reversed)
- Emotional news (narrative beats data)

Markets frequently **underreact** to:
- Statistical base rates
- Long-term structural factors
- Slow-moving fundamental changes`,
        contentEs: `## Trading en Noticias y Eventos en Vivo

### Marco de Trading de Noticias

1. Ver la noticia (ten fuentes confiables listas)
2. Evaluar impacto: ¿cambia significativamente la probabilidad?
3. ¿El mercado sobrerreacciona o infrarreacciona?
4. Operar la brecha si detectas error de precio

### Patrones de Sobrerreacción

Los mercados frecuentemente **sobrerreaccionan** a: encuestas únicas, resultados preliminares, noticias emocionales. Y **infrarreaccionan** a: tasas base estadísticas, factores estructurales de largo plazo.`,
      },
      {
        id: "l4-4",
        title: "Momentum vs. Contrarian Strategy",
        titleEs: "Estrategia Momentum vs. Contrarian",
        duration: "6 min",
        free: false,
        icon: TrendingUp,
        videos: [
          { id: "UWoXBLAXHEY", title: "My Prediction Market Trading Playbook — Momentum vs. Contrarian", channel: "Insight Trading" },
          { id: "Zx8f3jrj7HE", title: "Predicting Markets: Crowd Wisdom Applied to Trading Strategies", channel: "Vuk Vuković" },
        ],
        content: `## Two Fundamental Trading Approaches

Every trader leans toward one of two strategies. Understanding both helps you choose.

### Momentum Trading

Follow the trend. When a market is moving in one direction, bet with it.

**Why it works**: Markets often move gradually as new information accumulates. Early movers get the full price range; late momentum traders still capture the tail.

**When to use it**:
- Clear narrative shift (candidate gaining consistently in polls)
- Volume increasing with price move (confirms the trend)
- After a major news event in a clear direction

### Contrarian Trading

Fade the extreme. When a market has moved too far too fast, bet against it.

**Why it works**: Markets overreact. Panic and euphoria both create mispriced contracts.

**When to use it**:
- Price has moved dramatically on a single data point
- Volume spike without sustained follow-through
- Historical base rates suggest the market has overshot

### Choosing Your Approach

Neither is universally better. The key question: **Is this move justified by the underlying probability, or is it emotional?**

- Justified move → consider momentum
- Emotional move → consider contrarian

### In Practice

Most successful traders are **situational** — momentum in trending markets, contrarian when they spot overreaction. Develop your own read on market sentiment through practice on our demo.`,
        contentEs: `## Dos Enfoques Fundamentales de Trading

**Momentum**: Sigue la tendencia. Funciona cuando los mercados se mueven gradualmente con nueva información.

**Contrarian**: Vende el extremo. Funciona cuando los mercados sobrerreaccionan emocionalmente.

La pregunta clave: ¿Este movimiento está justificado por la probabilidad subyacente, o es emocional? Los mejores traders son situacionales — aplican ambos según el contexto.`,
      },
      {
        id: "l4-5",
        title: "Risk Management & Position Sizing",
        titleEs: "Gestión de Riesgo y Sizing de Posiciones",
        duration: "8 min",
        free: false,
        icon: Target,
        videos: [
          { id: "LedNZbXqP54", title: "Risk Management and Position Sizing for Beginners", channel: "Koroush AK" },
          { id: "2w-Y3C_APh8", title: "Trading Risk Management Explained — Stop Loss & Position Sizing", channel: "Trading Nut" },
        ],
        content: `## Risk Management: The Skill That Separates Winners

You can be right 60% of the time and still go broke with bad risk management. You can be right 45% of the time and be profitable with good risk management.

### The Kelly Criterion

A mathematical formula for optimal position sizing:

**f = (bp - q) / b**

Where:
- f = fraction of bankroll to bet
- b = net odds received (payout / stake)
- p = your estimated probability of winning
- q = probability of losing (1 - p)

**Example**: You estimate 65% probability, contract at $0.55 (payout = $0.45 net)
- f = (0.45 × 0.65 - 0.35) / 0.45
- f = (0.2925 - 0.35) / 0.45 = negative → **don't bet**

If f is positive, it tells you what fraction of your bankroll to risk.

### Simpler Rules for Beginners

Until you're comfortable with Kelly:
- **Max 5% of bankroll per trade** ($5,000 on a $100,000 demo)
- **Max 25% in one category** ($2,500 in crypto, politics, etc.)
- **Never go all-in**, even if you're 95% confident

### The 3 Rules of Loss Management

1. **Don't chase losses**: A losing streak doesn't change the underlying probabilities
2. **Don't increase size after losses**: This is how accounts blow up
3. **Take breaks**: Emotional trading kills returns

### Bankroll Preservation

Your #1 goal is to stay in the game long enough to improve. Big losses set you back not just financially, but psychologically.`,
        contentEs: `## Gestión de Riesgo: La Habilidad que Separa a Ganadores

Puedes acertar el 60% del tiempo y aun así perder dinero con mala gestión del riesgo.

### El Criterio de Kelly

**f = (bp - q) / b** — fórmula matemática para el sizing óptimo de posiciones.

### Reglas Simples para Principiantes

- Máximo 5% del bankroll por operación
- Máximo 25% en una categoría
- Nunca apostar todo, aunque estés 95% seguro

### Las 3 Reglas de Gestión de Pérdidas

1. No perseguir pérdidas
2. No aumentar el tamaño después de perder
3. Tomar descansos — el trading emocional destruye los retornos`,
      },
      {
        id: "l4-6",
        title: "The 7 Most Common Mistakes",
        titleEs: "Los 7 Errores más Comunes",
        duration: "6 min",
        free: false,
        icon: Lightbulb,
        videos: [
          { id: "TL4WeEwUIJ8", title: "Why 90% of Traders Fail — The 3 Psychology Rules You Need", channel: "Rayner Teo" },
          { id: "XIV9d6ZiXQc", title: "Trading Psychology for Beginners: 5 Mistakes to Avoid", channel: "Warrior Trading" },
        ],
        content: `## 7 Mistakes Most Beginners Make (and How to Avoid Them)

Learn from others' mistakes so you don't have to make them yourself.

### Mistake 1: Overconfidence
"I know this will happen." No one knows. You have a probability estimate — respect it.
**Fix**: Always quantify your confidence. "I think there's 70% chance" not "this is definitely happening."

### Mistake 2: Ignoring the Market Price
If the market says 40% and you think 80%, either you're seeing something no one else is, or you're wrong.
**Fix**: Start from the market price. Only deviate if you have a specific reason.

### Mistake 3: Trading Too Many Markets
Spreading too thin means you can't properly research any single market.
**Fix**: Start with 5-10 positions max. Quality over quantity.

### Mistake 4: Ignoring Fees and Slippage
Small costs compound. A 2% fee on every trade is massive over time.
**Fix**: Calculate your all-in cost before trading, especially in illiquid markets.

### Mistake 5: Emotional Trading After a Loss
"I need to win this back." This is the path to blowing up your account.
**Fix**: Set a rule: no trading for 24 hours after a loss exceeding X%.

### Mistake 6: Not Reading Resolution Criteria
Markets resolve based on exact wording, not your interpretation.
**Fix**: Read the full resolution criteria before every trade.

### Mistake 7: No Record Keeping
Without records, you can't learn from your mistakes.
**Fix**: Keep a simple spreadsheet: market, entry price, your reasoning, outcome, P&L.`,
        contentEs: `## 7 Errores que Cometen la Mayoría de Principiantes

1. **Exceso de confianza**: Cuantifica siempre tu confianza en probabilidades
2. **Ignorar el precio del mercado**: El mercado refleja toda la información pública
3. **Operar demasiados mercados**: Calidad sobre cantidad — máximo 5-10 posiciones
4. **Ignorar comisiones y slippage**: Los costos pequeños se acumulan enormemente
5. **Trading emocional tras pérdidas**: Sin trading por 24h tras una pérdida grande
6. **No leer los criterios de resolución**: Los mercados resuelven según el texto exacto
7. **No llevar registros**: Sin registros, no puedes aprender de tus errores`,
      },
      {
        id: "l4-7",
        title: "Build Your Trading Plan",
        titleEs: "Construye tu Plan de Trading",
        duration: "8 min",
        free: false,
        icon: FileText,
        videos: [
          { id: "k8H5AnvjGog", title: "Trading Psychology — Why 75% of Traders Lose Money", channel: "The Chart Guys" },
          { id: "NkSmgCmYNrM", title: "Position Sizing & Risk Management — Build Your Trading Plan", channel: "Investopedia" },
        ],
        content: `## Your Personal Trading Plan

Professional traders don't wing it. They follow a plan. Here's how to build yours.

### The 5 Components of a Trading Plan

**1. Your Edge Definition**
What specific advantage do you have? Examples:
- Deep knowledge of a specific political region
- Strong quantitative/probability skills
- Access to niche data sources
- Quick at processing news

**2. Market Selection Criteria**
When will you trade? Define rules:
- Minimum volume: only trade markets with >$100K volume
- Categories: only trade what you understand
- Time to resolution: prefer 2+ weeks to resolution

**3. Position Sizing Rules**
- Max per trade: [X]% of bankroll
- Max open positions: [N] at once
- Max in one category: [Y]%

**4. Entry Criteria**
Before any trade, you must be able to answer:
- What's my probability estimate? (specific number)
- What's the market saying?
- What's my edge in this specific trade?
- What new information would change my mind?

**5. Exit Rules**
- When to close early (new information changes thesis)
- When to let it ride to resolution
- How to handle positions going against you

### Your First Trading Plan

Write it in 1 page. Commit to it for 30 trades. Then review and update.

A plan you follow imperfectly beats no plan executed perfectly.`,
        contentEs: `## Tu Plan de Trading Personal

**Los 5 Componentes:**

1. **Definición de tu Ventaja**: ¿Qué ventaja específica tienes? (conocimiento político, habilidades cuantitativas, etc.)

2. **Criterios de Selección**: Cuándo operar — volumen mínimo, categorías, tiempo hasta resolución

3. **Reglas de Sizing**: Máximo por operación, máximo posiciones abiertas, máximo por categoría

4. **Criterios de Entrada**: Estimación de probabilidad, ventaja específica, qué cambiaría tu opinión

5. **Reglas de Salida**: Cuándo cerrar anticipadamente, cuándo esperar resolución

Escríbelo en 1 página. Comprométete por 30 operaciones. Luego revisa y actualiza.`,
      },
    ],
  },
  {
    num: 5,
    titleEn: "From Demo to Real Money on Polymarket",
    titleEs: "De la Demo al Dinero Real en Polymarket",
    subtitleEn: "5 lessons · ~35 min · Make the leap when you're ready",
    subtitleEs: "5 lecciones · ~35 min · Da el salto cuando estés listo",
    difficulty: "Advanced",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    icon: Trophy,
    lessons: [
      {
        id: "l5-1",
        title: "Am I Ready? Self-Assessment",
        titleEs: "¿Estoy Listo? Autoevaluación",
        duration: "5 min",
        free: true,
        icon: CheckCircle,
        videos: [
          { id: "pSBKLHIFZLo", title: "Are You Ready? Why the Odds Are Stacked Against Most Traders", channel: "Lex Clips" },
          { id: "A3Ue7SGrDF4", title: "Self-Assessment — What Is Superforecasting & Are You One?", channel: "Good Judgement" },
        ],
        content: `## Are You Ready for Real Money?

Before switching to real capital, be honest with yourself.

### The Readiness Checklist

**Performance Metrics (on 50+ trades minimum)**
- ☐ Win rate above 50%
- ☐ Positive total P&L
- ☐ Average return per trade above 0

**Process Metrics**
- ☐ I have a written trading plan and follow it
- ☐ I research every market before trading (not gut feeling)
- ☐ I understand resolution criteria before every trade
- ☐ I keep records of all my trades and review them

**Psychology Metrics**
- ☐ I don't chase losses
- ☐ I'm not emotionally attached to positions
- ☐ I can handle losing 3 trades in a row without panic

**Knowledge Metrics**
- ☐ I understand EV+ trading
- ☐ I can explain AMMs and how prices work
- ☐ I understand slippage and fees

### The Honest Question

If you answered "No" to more than 3 of the above, keep practicing in the demo.

### The Capital Question

Only trade with money you can **afford to lose completely**. Prediction markets are high-risk instruments. Even skilled traders lose. Start with $50-200 maximum.`,
        contentEs: `## ¿Estás Listo para Dinero Real?

### El Checklist de Preparación

**Métricas de Rendimiento (mínimo 50 operaciones):**
- ☐ Tasa de aciertos >50%
- ☐ P&L total positivo

**Métricas de Proceso:**
- ☐ Tengo un plan de trading escrito y lo sigo
- ☐ Investigo cada mercado antes de operar
- ☐ Llevo registros de todas mis operaciones

**Métricas Psicológicas:**
- ☐ No persigo pérdidas
- ☐ Puedo manejar 3 pérdidas seguidas sin pánico

Si respondiste "No" a más de 3, sigue practicando en la demo.`,
      },
      {
        id: "l5-2",
        title: "Set Up Your Wallet & Buy USDC",
        titleEs: "Configura tu Wallet y Compra USDC",
        duration: "8 min",
        free: false,
        icon: Wallet,
        videos: [
          { id: "YlGRetrcQvk", title: "How To Use Polygon MetaMask (2025) — Full Setup Guide", channel: "Crypto Guides" },
          { id: "GkdAR1RpiMk", title: "How to Add USDC on Polygon to MetaMask — Step by Step", channel: "DeFi Dad" },
        ],
        content: `## Setting Up for Real Trading

Polymarket runs on the Polygon blockchain and uses USDC (USD Coin) as its currency.

### Step 1: Get a Crypto Wallet

**Recommended**: MetaMask (free browser extension)
1. Go to metamask.io
2. Install the browser extension
3. Create a new wallet (save your seed phrase securely — never share it)
4. Switch to the Polygon network in MetaMask

**Alternative**: Coinbase Wallet, Trust Wallet

### Step 2: Buy USDC

Option A — Buy on Coinbase (easiest):
1. Create a Coinbase account
2. Buy USDC with USD/EUR via bank transfer or card
3. Withdraw USDC to your MetaMask wallet on Polygon

Option B — Bridge from Ethereum:
If you already have ETH or USDC on Ethereum mainnet, use a bridge (Polygon Bridge, Hop Protocol) to move it to Polygon.

### Step 3: Fund Your Wallet

Start with the amount you want to trade — no more. $50-200 is reasonable for a first real-money attempt.

### Important: Fees

- Polygon gas fees are very low (cents per transaction)
- Your initial MATIC for gas can be purchased on any exchange
- Alternatively: Polymarket allows credit card/debit card deposits directly

### Security Note

- Never share your seed phrase with anyone
- Never enter your seed phrase on any website
- Store it offline (written on paper, never digital)`,
        contentEs: `## Configuración para Trading Real

Polymarket usa USDC en la blockchain Polygon.

### Paso 1: Consigue una Wallet
MetaMask (extensión de navegador gratuita) es la recomendada. Guarda tu frase semilla de forma segura — nunca la compartas.

### Paso 2: Compra USDC
La forma más fácil: crea una cuenta en Coinbase, compra USDC y retíralo a tu wallet de MetaMask en Polygon.

### Seguridad
- Nunca compartas tu frase semilla
- Nunca la introduzcas en ningún sitio web
- Guárdala offline (en papel, nunca digital)`,
      },
      {
        id: "l5-3",
        title: "Connect to Polymarket: First Real Trade",
        titleEs: "Conéctate a Polymarket: Primera Operación Real",
        duration: "9 min",
        free: false,
        icon: Globe,
        videos: [
          { id: "LAv_wpDVLlM", title: "Polygon MetaMask Tutorial — Bridge Funds & First Trade", channel: "DeFi Tutorials" },
          { id: "aQph5IXgtVM", title: "Understanding Polymarket — Navigate to Your First Real Trade", channel: "Crypto Banter" },
        ],
        content: `## Your First Real Trade on Polymarket

You've prepared. Now let's walk through the actual process.

### Connecting Your Wallet

1. Go to polymarket.com
2. Click "Connect Wallet" (top right)
3. Select MetaMask
4. Approve the connection in MetaMask
5. Your USDC balance will appear

### Navigating Polymarket

The interface is similar to what you've practiced on PredictionTrade:
- Browse markets by category
- Click any market to see details
- The Buy/Sell interface will look familiar

### Placing Your First Real Trade

1. Find a market you've researched (don't go in blind)
2. Start with your minimum amount ($20-50)
3. Read the resolution criteria one more time
4. Check the current price — is it still where you expect?
5. Set your order amount
6. Review: slippage, fees, potential payout
7. Confirm in MetaMask

### Key Differences from the Demo

- **Gas fees**: Small MATIC fee per transaction (~$0.01)
- **Trading fees**: 0.5-2% depending on market
- **Withdrawal**: Converting back to fiat takes time
- **Real emotions**: Losing real money feels different

### Start Slow

Your first 10 real trades should be small (even $10-20 each). Get comfortable with the interface and emotions before scaling up.

**Remember**: The skills you built in the demo are real. Trust your process.`,
        contentEs: `## Tu Primera Operación Real en Polymarket

### Conectar tu Wallet
1. Ve a polymarket.com
2. Clic en "Connect Wallet"
3. Selecciona MetaMask
4. Aprueba la conexión

### Diferencias Clave con la Demo
- Comisiones de gas (pequeñas, ~$0.01)
- Comisiones de trading (0.5-2%)
- Emociones reales: perder dinero real se siente diferente

### Empieza Despacio
Tus primeras 10 operaciones reales deben ser pequeñas ($10-20 cada una). Adáptate a la interfaz y las emociones antes de escalar.`,
      },
      {
        id: "l5-4",
        title: "Tax & Legal Basics",
        titleEs: "Fiscalidad y Aspectos Legales Básicos",
        duration: "6 min",
        free: false,
        icon: FileText,
        videos: [
          { id: "CueX0o3ZoiQ", title: "What to Know About Prediction Markets — Legal & Regulatory", channel: "WSJ" },
        ],
        content: `## Tax and Legal Considerations

**Important**: This is general educational information, not legal or tax advice. Consult a qualified professional for your specific situation.

### Is Prediction Market Trading Legal?

In most countries, trading on information/event markets is legal. However:
- Some jurisdictions have restrictions on "event contracts"
- US residents face the most restrictions (Polymarket is not available to US persons)
- Always check the laws in your jurisdiction

### Tax Treatment (General Principles)

Most tax authorities treat prediction market profits as either:
- **Capital gains**: Profits from trading contracts (most common interpretation)
- **Gambling income**: Some jurisdictions classify event betting differently
- **Ordinary income**: Some treat all trading profits as income

### What Records to Keep

Regardless of jurisdiction, keep:
- All trade history (entry price, exit price, date)
- USD value at time of each transaction
- Total annual P&L

Polymarket provides trade history exports — use them.

### The USDC Angle

Using USDC (a stablecoin) simplifies tax reporting since there's no currency conversion gain/loss to track. Each trade is essentially USD in, USD out.

### Consult a Professional

If you're trading significant amounts, consult a tax professional familiar with cryptocurrency and event markets in your jurisdiction. Laws are evolving rapidly in this space.`,
        contentEs: `## Consideraciones Fiscales y Legales

**Importante**: Esta es información educativa general, no asesoramiento fiscal o legal.

### ¿Es Legal el Trading en Mercados de Predicción?

En la mayoría de países es legal, pero algunos tienen restricciones. Los residentes en EEUU no pueden usar Polymarket.

### Tratamiento Fiscal (Principios Generales)

Las autoridades fiscales suelen tratar las ganancias como: plusvalías de capital (más común) o ingresos por apuestas (según jurisdicción).

### Qué Registros Guardar

Guarda: todo el historial de operaciones, valor en USD en cada transacción, P&L total anual. Polymarket ofrece exportación del historial — úsala.`,
      },
      {
        id: "l5-5",
        title: "Join Tournaments & Community",
        titleEs: "Únete a Torneos y la Comunidad",
        duration: "7 min",
        free: true,
        icon: Trophy,
        videos: [
          { id: "JzaH2f9OHy4", title: "Prediction Markets Community — The Future of the Industry", channel: "PTFO" },
          { id: "APN3zwcwPdQ", title: "How Prediction Markets Are Creating a New Trading Community", channel: "CNBC" },
        ],
        content: `## The PredictionTrade Community

Trading doesn't have to be solitary. Our community and tournaments accelerate learning.

### Tournaments

PredictionTrade runs regular tournaments where you compete against other traders:

- **Format**: All participants start with equal virtual balance
- **Duration**: Days to weeks depending on the tournament
- **Prize pool**: Real USDC prizes for top finishers
- **Rankings**: Live leaderboard updated in real-time

Tournaments are great for testing your skills under pressure and benchmarking against other traders.

### How to Join a Tournament

1. Go to the Tournaments section
2. Register for any open tournament
3. Your tournament balance is separate from your regular demo
4. Trade as usual — your tournament P&L is tracked separately

### The Community

Connect with other prediction market traders:
- Share analysis and market insights
- Learn from experienced traders' reasoning
- Discuss live events and their market implications
- Find accountability partners for your trading journey

### Learning from the Leaderboard

The leaderboard shows the top performers. Study their approach:
- How many markets are they trading?
- What categories do they favor?
- How large are their positions?

You don't need to copy them — but patterns among top traders reveal what works.

### Keep Learning

The prediction market landscape evolves. New markets, new strategies, new platforms. Stay curious, keep trading, and come back to the Academy as you advance.

**Congratulations on completing the PredictionTrade Academy.** 🎓`,
        contentEs: `## La Comunidad de PredictionTrade

### Torneos

PredictionTrade organiza torneos regulares donde compites contra otros traders:
- Todos empiezan con el mismo balance virtual
- Duración variable (días a semanas)
- Premios reales en USDC para los mejores
- Clasificación en tiempo real

### La Comunidad

Conecta con otros traders: comparte análisis, aprende del razonamiento de traders experimentados, discute eventos en vivo.

### Sigue Aprendiendo

El panorama de los mercados de predicción evoluciona. Mantente curioso, sigue operando y vuelve a la Academia a medida que avances.

**¡Felicidades por completar la Academia de PredictionTrade!** 🎓`,
      },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const difficultyColor: Record<Difficulty, string> = {
  Beginner: "text-emerald-400 bg-emerald-500/10",
  Intermediate: "text-amber-400 bg-amber-500/10",
  Advanced: "text-purple-400 bg-purple-500/10",
};

// ─── Component ───────────────────────────────────────────────────────────────

export function Academy() {
  const { t, language } = useLanguage();
  const [openLesson, setOpenLesson] = useState<Lesson | null>(null);
  const [expandedLevel, setExpandedLevel] = useState<number | null>(1);
  const [activeTab, setActiveTab] = useState<"videos" | "content">("videos");
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const isEs = language === "es";

  // Load user's academy progress
  useEffect(() => {
    fetch("/api/academy/progress")
      .then((r) => r.ok ? r.json() : [])
      .then((data: { lesson_id: string }[]) => {
        setCompletedIds(new Set(data.map((d) => d.lesson_id)));
      })
      .catch(() => {});
  }, []);

  const toggleComplete = useCallback(async (lesson: Lesson, levelNum: number) => {
    const levelId = `level-${levelNum}`;
    const isCompleted = completedIds.has(lesson.id);
    // Optimistic update
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (isCompleted) next.delete(lesson.id);
      else next.add(lesson.id);
      return next;
    });
    try {
      if (isCompleted) {
        await fetch("/api/academy/progress", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lesson_id: lesson.id }),
        });
      } else {
        await fetch("/api/academy/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lesson_id: lesson.id, level_id: levelId }),
        });
      }
    } catch {
      // Revert on error
      setCompletedIds((prev) => {
        const next = new Set(prev);
        if (isCompleted) next.add(lesson.id);
        else next.delete(lesson.id);
        return next;
      });
    }
  }, [completedIds]);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* ── Hero ── */}
        <div className="text-center mb-14">
          <Badge variant="outline" className="mb-4">
            <GraduationCap className="w-3 h-3 mr-1" />
            {isEs ? "Formación gratuita" : "Free Education"}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 text-balance">
            {isEs
              ? <>Domina los <span className="text-primary">Mercados de Predicción</span> desde Cero</>
              : <>Master <span className="text-primary">Prediction Markets</span> from Zero</>}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            {isEs
              ? "Aprende cómo funcionan los mercados de predicción, desarrolla estrategias probadas y practica sin riesgo con $100,000 de capital virtual en mercados reales en vivo."
              : "Learn how prediction markets work, develop proven strategies, and practice risk-free with $100,000 virtual capital on real live markets."}
          </p>
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 pt-6 border-t border-border">
            {[
              { num: "5", label: isEs ? "Niveles de aprendizaje" : "Learning levels" },
              { num: "30+", label: isEs ? "Lecciones y guías" : "Lessons & guides" },
              { num: "$100K", label: isEs ? "Capital virtual" : "Virtual capital" },
              { num: "100+", label: isEs ? "Mercados en vivo" : "Live markets" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold">{s.num}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Demo Banner ── */}
        <div className="mb-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">
              {isEs ? "📊 Practica Mientras Aprendes" : "📊 Practice While You Learn"}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              {isEs
                ? "Cada lección conecta con nuestra demo en vivo. Aplica lo que aprendes en 100+ mercados reales — sin wallet, sin depósitos, cero riesgo."
                : "Every lesson connects directly to our live demo. Apply what you learn on 100+ real prediction markets — no wallet, no deposits, zero risk."}
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              {["$100,000 virtual capital", "Real-time Polymarket data", "Track P&L & win rate", "No wallet needed"].map((f) => (
                <span key={f} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                  {f}
                </span>
              ))}
            </div>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <a href="/markets">
              <Play className="w-4 h-4 mr-2" />
              {isEs ? "Ir a la Demo" : "Open Demo"}
            </a>
          </Button>
        </div>

        {/* ── Levels ── */}
        <div className="space-y-4">
          {levels.map((level) => {
            const isOpen = expandedLevel === level.num;
            const LevelIcon = level.icon;
            return (
              <div
                key={level.num}
                className="rounded-2xl border border-border bg-card/50 overflow-hidden transition-colors hover:border-primary/30"
              >
                {/* Level Header */}
                <button
                  className="w-full text-left p-5 md:p-6 flex items-center gap-4"
                  onClick={() => setExpandedLevel(isOpen ? null : level.num)}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${level.bgColor} ${level.color}`}>
                    {level.num}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-base">
                        {isEs ? level.titleEs : level.titleEn}
                      </h3>
                      {level.tag === "demo" && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-primary/40 text-primary bg-primary/5">
                          🎮 Demo
                        </span>
                      )}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${difficultyColor[level.difficulty]}`}>
                        {isEs
                          ? level.difficulty === "Beginner" ? "Principiante"
                          : level.difficulty === "Intermediate" ? "Intermedio"
                          : "Avanzado"
                          : level.difficulty}
                      </span>
                      {(() => {
                        const done = level.lessons.filter(l => completedIds.has(l.id)).length;
                        const total = level.lessons.length;
                        if (done === 0) return null;
                        return (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${done === total ? "bg-emerald-500/15 text-emerald-400" : "bg-primary/10 text-primary"}`}>
                            {done === total ? "✓ " : ""}{done}/{total}
                          </span>
                        );
                      })()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isEs ? level.subtitleEs : level.subtitleEn}
                    </p>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                </button>

                {/* Lessons List */}
                {isOpen && (
                  <div className="border-t border-border px-4 pb-4 pt-3">
                    <div className="grid sm:grid-cols-2 gap-2">
                      {level.lessons.map((lesson) => {
                        const LessonIcon = lesson.icon;
                        const done = completedIds.has(lesson.id);
                        return (
                          <div
                            key={lesson.id}
                            className={`flex items-start gap-3 p-3 rounded-xl border bg-background/40 transition-all text-left group
                              ${done ? "border-emerald-500/30 bg-emerald-500/5" : "border-border hover:border-primary/50 hover:bg-primary/5"}`}
                          >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${level.bgColor} ${level.color}`}>
                              <LessonIcon className="w-3.5 h-3.5" />
                            </div>
                            <button
                              className="flex-1 min-w-0 text-left"
                              onClick={() => {
                                setOpenLesson(lesson);
                                setActiveTab(lesson.videos && lesson.videos.length > 0 ? "videos" : "content");
                              }}
                            >
                              <p className={`text-sm font-medium leading-snug transition-colors ${done ? "text-emerald-400" : "group-hover:text-primary"}`}>
                                {isEs ? lesson.titleEs : lesson.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {lesson.duration}
                                </span>
                                {lesson.videos && lesson.videos.length > 0 && (
                                  <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                                    <Play className="w-2.5 h-2.5" />
                                    {lesson.videos.length}
                                  </span>
                                )}
                                {lesson.free
                                  ? <span className="text-xs text-emerald-400 font-medium">{isEs ? "Gratis" : "Free"}</span>
                                  : <Lock className="w-3 h-3 text-muted-foreground/50" />}
                              </div>
                            </button>
                            <button
                              onClick={() => toggleComplete(lesson, level.num)}
                              title={done ? (isEs ? "Marcar incompleta" : "Mark incomplete") : (isEs ? "Marcar completada" : "Mark complete")}
                              className="shrink-0 mt-0.5 transition-transform hover:scale-110"
                            >
                              {done
                                ? <CheckCircle className="w-5 h-5 text-emerald-400" />
                                : <Circle className="w-5 h-5 text-muted-foreground/40 hover:text-primary" />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Progress Track ── */}
        <div className="mt-12 p-6 rounded-2xl border border-border bg-card/50">
          <h3 className="font-bold text-lg mb-1">
            {isEs ? "Tu Camino de Aprendizaje" : "Your Learning Journey"}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {isEs
              ? "Completa los 5 niveles y obtén tu Certificado PredictionTrade"
              : "Complete all 5 levels and earn your PredictionTrade Certificate"}
          </p>
          <div className="flex items-center">
            {levels.map((level, i) => {
              const done = level.lessons.filter(l => completedIds.has(l.id)).length;
              const finished = done === level.lessons.length && done > 0;
              const inProgress = done > 0 && !finished;
              return (
              <div key={level.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                    finished
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : inProgress
                      ? `border-primary ${level.color}`
                      : "border-border text-muted-foreground"
                  }`}>
                    {finished ? "✓" : level.num === 5 ? "🏆" : level.num}
                  </div>
                  <span className={`text-xs mt-1.5 text-center max-w-[60px] leading-tight hidden sm:block ${
                    finished ? "text-emerald-400" : inProgress ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {isEs
                      ? ["Intro", "Mecánica", "Demo", "Estrategias", "Real"][i]
                      : ["Intro", "Mechanics", "Demo", "Strategies", "Live"][i]}
                  </span>
                  {done > 0 && (
                    <span className="text-[10px] text-muted-foreground mt-0.5">{done}/{level.lessons.length}</span>
                  )}
                </div>
                {i < levels.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${finished ? "bg-emerald-500" : "bg-border"}`} />
                )}
              </div>
              );
            })}
          </div>
        </div>

        {/* ── Bottom CTA ── */}
        <div className="mt-10 text-center">
          <Card className="bg-primary/5 border-primary/20 p-8">
            <h3 className="text-2xl font-bold mb-3">
              {isEs ? "Aprende Practicando" : "Learn by Doing"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              {isEs
                ? "La teoría es genial, pero la práctica perfecciona. Aplica todo lo que aprendes en nuestro simulador sin riesgo con datos reales de Polymarket."
                : "Theory is great, but practice makes perfect. Apply everything you learn in our risk-free simulator with real Polymarket data."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg">
                <a href="/markets">
                  <Play className="w-4 h-4 mr-2" />
                  {isEs ? "Empezar a Practicar" : "Start Practicing"}
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="https://polymarket.com" target="_blank" rel="noopener noreferrer">
                  {isEs ? "Visitar Polymarket" : "Visit Polymarket"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Lesson Modal ── */}
      {openLesson && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpenLesson(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-card border-b border-border">
              <div className="px-6 py-4 flex items-center justify-between border-b border-border/50">
                <div>
                  <h2 className="font-bold text-lg">
                    {isEs ? openLesson.titleEs : openLesson.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {openLesson.duration}
                    </span>
                    {openLesson.free && (
                      <span className="text-xs text-emerald-400 font-medium">
                        {isEs ? "Gratis" : "Free"}
                      </span>
                    )}
                    {openLesson.videos && openLesson.videos.length > 0 && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        {openLesson.videos.length} {isEs ? "vídeos" : "videos"}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setOpenLesson(null)}>
                  ✕
                </Button>
              </div>
              {openLesson.videos && openLesson.videos.length > 0 && (
                <div className="flex gap-2 px-6 py-3 bg-background/40">
                  <button
                    onClick={() => setActiveTab("videos")}
                    className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                      activeTab === "videos"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    🎬 {isEs ? "Vídeos" : "Videos"}
                  </button>
                  <button
                    onClick={() => setActiveTab("content")}
                    className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                      activeTab === "content"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    📖 {isEs ? "Contenido" : "Content"}
                  </button>
                </div>
              )}
            </div>
            <div className="p-6">

              {/* ── Tab Content ── */}
              {(activeTab === "videos" && openLesson.videos && openLesson.videos.length > 0) ? (
                <div className="space-y-4">
                  {openLesson.videos.map((v, idx) => (
                    <div key={v.id} className="rounded-xl overflow-hidden border border-border bg-background/40 hover:border-primary/50 transition-colors">
                      <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                        <iframe
                          className="absolute inset-0 w-full h-full"
                          src={`https://www.youtube.com/embed/${v.id}?rel=0&modestbranding=1`}
                          title={v.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <div className="px-4 py-3 border-t border-border bg-card/60 flex items-start gap-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-6 h-6 rounded bg-red-600/20 flex items-center justify-center shrink-0">
                            <Play className="w-3 h-3 text-red-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground line-clamp-2">{v.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{v.channel} • {idx + 1} of {openLesson.videos?.length}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none">
                {(isEs ? openLesson.contentEs : openLesson.content)
                  .split("\n")
                  .map((line, i) => {
                    if (line.startsWith("## "))
                      return <h2 key={i} className="text-xl font-bold mt-6 mb-3 text-foreground">{line.replace("## ", "")}</h2>;
                    if (line.startsWith("### "))
                      return <h3 key={i} className="text-base font-semibold mt-5 mb-2 text-foreground">{line.replace("### ", "")}</h3>;
                    if (line.startsWith("- "))
                      return <li key={i} className="text-muted-foreground ml-4 my-0.5">{line.replace("- ", "")}</li>;
                    if (line.match(/^\d\./))
                      return <li key={i} className="text-muted-foreground ml-4 list-decimal my-0.5">{line.replace(/^\d\./, "").trim()}</li>;
                    if (line.startsWith("☐ ") || line.startsWith("✅ ") || line.startsWith("❌ "))
                      return <p key={i} className="text-muted-foreground my-1 flex items-start gap-1">{line}</p>;
                    if (line.trim() === "")
                      return <br key={i} />;
                    return (
                      <p key={i} className="text-muted-foreground my-1.5 leading-relaxed">
                        {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
                          part.startsWith("**") && part.endsWith("**")
                            ? <strong key={j} className="text-foreground font-semibold">{part.replace(/\*\*/g, "")}</strong>
                            : part
                        )}
                      </p>
                    );
                  })}
                </div>
              )}
              <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm">{isEs ? "¿Listo para practicar?" : "Ready to apply this?"}</p>
                  <p className="text-xs text-muted-foreground">{isEs ? "Practica con fondos virtuales en mercados reales." : "Practice with virtual funds on real market data."}</p>
                </div>
                <Button asChild>
                  <a href="/markets">
                    {isEs ? "Ir a la Demo" : "Open Demo"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
