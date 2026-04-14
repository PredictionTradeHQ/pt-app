import { Play, Target, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Play,
    step: "01",
    title: "Get $10,000 Virtual",
    description: "Start instantly with $10,000 in paper trading funds. No wallet needed, no deposits, no risk.",
  },
  {
    icon: Target,
    step: "02",
    title: "Trade Real Markets",
    description: "Place paper trades on live Polymarket events. Same prices, same odds, zero consequences.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Master the Game",
    description: "Track your P&L and win rate. When you're profitable here, you're ready for the real thing.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 border-t border-border">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-medium tracking-wider uppercase mb-4">Paper Trading</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            Learn Before You Earn
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Most traders lose money when they start. Paper trading lets you make mistakes 
            for free and develop winning strategies with real Polymarket data.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div 
              key={step.step}
              className="relative group"
            >
              <div className="p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors h-full">
                {/* Step number */}
                <span className="text-7xl font-bold text-border absolute top-4 right-4 group-hover:text-primary/20 transition-colors">
                  {step.step}
                </span>
                
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="mt-16 p-8 rounded-2xl border border-border bg-card/30 backdrop-blur-sm">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-primary mb-2">$10,000</p>
              <p className="text-muted-foreground">Starting Balance</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary mb-2">100+</p>
              <p className="text-muted-foreground">Live Markets</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary mb-2">$0</p>
              <p className="text-muted-foreground">Real Money at Risk</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
