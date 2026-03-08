import { Star } from "lucide-react";

const testimonials = [
  {
    name: "James Whitfield",
    role: "CEO, Meridian Capital",
    text: "The 3D customization studio is unlike anything I've experienced. My suit fits like a second skin — absolute perfection.",
    rating: 5,
  },
  {
    name: "Ahnaf Rahman",
    role: "Creative Director",
    text: "From the body scan to the final stitch, every detail was handled with precision. AUREUM sets a new standard in bespoke tailoring.",
    rating: 5,
  },
  {
    name: "David Chen",
    role: "Partner, Chen & Associates",
    text: "I've ordered three suits now. The fabric quality and the fit are consistently outstanding. Their virtual consultation made it effortless.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">
            Client Testimonials
          </p>
          <h2 className="font-display text-4xl md:text-5xl">
            What Our <span className="italic text-gradient-gold">Clients</span> Say
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-card border border-border rounded-sm p-8 hover-lift relative"
            >
              {/* Quote mark */}
              <span className="absolute top-4 right-6 font-display text-6xl text-primary/10 leading-none">"</span>

              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                ))}
              </div>

              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">
                {t.text}
              </p>

              <div className="border-t border-border pt-4">
                <p className="font-body text-sm font-medium text-foreground">{t.name}</p>
                <p className="font-body text-[10px] text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
