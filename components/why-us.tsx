import { Zap, Target, Users, BarChart3, BookOpen, Sparkles } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Learn Risk-Free",
    description: "Practice with virtual funds. Make mistakes, learn strategies, all without losing real money.",
  },
  {
    icon: Zap,
    title: "Real Market Data",
    description: "Live prices and volumes from Polymarket. Train with real-world market conditions.",
  },
  {
    icon: BarChart3,
    title: "Track Your Accuracy",
    description: "See your prediction history and win rate. Identify what works before going live.",
  },
  {
    icon: Sparkles,
    title: "Intuitive Interface",
    description: "Clean and easy-to-use design. Perfect for beginners learning prediction markets.",
  },
  {
    icon: Users,
    title: "Active Community",
    description: "Join thousands of learners who share analysis and prediction strategies.",
  },
  {
    icon: Target,
    title: "Ready for Real Trading?",
    description: "When you feel confident, transition to Polymarket to trade with real funds.",
  },
];

export function WhyUs() {
  return (
    <section id="why-us" className="py-24 border-t border-border">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-medium tracking-wider uppercase mb-4">Why Practice Here</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            The Smartest Way to Learn
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Most traders lose money when they start. Our simulator lets you develop 
            your prediction skills with real data before risking actual capital.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Data source banner */}
        <div className="mt-16 p-8 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm text-center">
          <p className="text-sm text-muted-foreground mb-2">Data powered by</p>
          <p className="text-2xl font-bold text-foreground">
            Polymarket &bull; Real-Time Prices &bull; Live Market Updates
          </p>
        </div>
      </div>
    </section>
  );
}
