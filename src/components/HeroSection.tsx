import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-model.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Premium tailored menswear"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-6 pt-16">
        <div className="max-w-xl">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-6 opacity-0 animate-fade-in">
            Premium Menswear — Crafted for You
          </p>
          <h1 className="font-display text-5xl md:text-7xl leading-tight mb-6 opacity-0 animate-fade-in-delay">
            Define Your
            <span className="block text-gradient-gold italic">Signature</span>
            Style
          </h1>
          <p className="font-body text-base text-muted-foreground leading-relaxed mb-10 max-w-md opacity-0 animate-fade-in-delay-2">
            Experience bespoke tailoring meets 3D customization. Design your perfect
            garment with our interactive body-mapping technology.
          </p>
          <div className="flex gap-4 opacity-0 animate-fade-in-delay-2">
            <Button variant="hero" size="lg">
              Customize Now
            </Button>
            <Button variant="heroOutline" size="lg">
              View Collection
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </section>
  );
};

export default HeroSection;
