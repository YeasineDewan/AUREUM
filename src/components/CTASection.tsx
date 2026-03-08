import { Button } from "@/components/ui/button";
import { CalendarDays, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative text-center">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">
          Ready to Begin?
        </p>
        <h2 className="font-display text-4xl md:text-5xl mb-6 max-w-2xl mx-auto">
          Your Perfect Suit <span className="italic text-gradient-gold">Awaits</span>
        </h2>
        <p className="font-body text-sm text-muted-foreground max-w-lg mx-auto mb-10">
          Book a consultation with our expert tailors or jump straight into our 3D customization studio to design your dream garment.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="lg" asChild>
            <Link to="/book">
              <CalendarDays className="h-4 w-4 mr-2" /> Book Appointment
            </Link>
          </Button>
          <Button variant="heroOutline" size="lg" asChild>
            <Link to="/customize">
              Start Designing <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
