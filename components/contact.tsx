import { Mail, MapPin, Clock } from "lucide-react";

export function Contact() {
  return (
    <section id="contact" className="py-24 border-t border-border">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-medium tracking-wider uppercase mb-4">Contact</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            Get in Touch
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Have questions or need assistance? Our team is here to help you 
            navigate the world of prediction markets.
          </p>
        </div>

        {/* Contact cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Email */}
          <div className="p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm text-center hover:border-primary/50 transition-colors">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Email Us</h3>
            <p className="text-muted-foreground text-sm mb-4">
              For general inquiries and support
            </p>
            <a 
              href="mailto:management@predictiontrade.online" 
              className="text-primary hover:underline font-medium break-all"
            >
              management@predictiontrade.online
            </a>
          </div>

          {/* Location */}
          <div className="p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm text-center hover:border-primary/50 transition-colors">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Global Platform</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Decentralized and accessible worldwide
            </p>
            <span className="text-foreground font-medium">
              Available Globally
            </span>
          </div>

          {/* Response time */}
          <div className="p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm text-center hover:border-primary/50 transition-colors">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Response Time</h3>
            <p className="text-muted-foreground text-sm mb-4">
              We typically respond within
            </p>
            <span className="text-foreground font-medium">
              24-48 Hours
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Ready to start trading predictions?
          </p>
          <a 
            href="mailto:management@predictiontrade.online"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Mail className="w-5 h-5" />
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}
