import { Ruler, Palette, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import customizationImage from "@/assets/customization-preview.jpg";

const features = [
  {
    icon: RotateCcw,
    title: "3D Visualization",
    description: "Rotate, zoom, and inspect every detail of your garment in real-time 3D.",
  },
  {
    icon: Palette,
    title: "Fabric & Color",
    description: "Choose from premium fabrics, colors, and patterns to match your taste.",
  },
  {
    icon: Ruler,
    title: "Body Mapping",
    description: "Input your exact measurements for a perfect, tailored fit every time.",
  },
];

const CustomizationSection = () => {
  return (
    <section id="customize" className="py-24 bg-secondary">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative group">
            <div className="overflow-hidden rounded-sm">
              <img
                src={customizationImage}
                alt="Fabric customization tools"
                className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 border border-primary/30" />
          </div>

          {/* Content */}
          <div>
            <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">
              Innovation Meets Tradition
            </p>
            <h2 className="font-display text-4xl md:text-5xl mb-6">
              3D Custom
              <span className="block text-gradient-gold italic">Tailoring</span>
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-10 max-w-md">
              Our revolutionary 3D customization studio lets you design every aspect of your garment — 
              from fabric and fit to buttons and stitching — all visualized on a digital mannequin 
              matched to your body measurements.
            </p>

            <div className="space-y-6 mb-10">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4 items-start hover-lift">
                  <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-body font-semibold text-sm mb-1">{feature.title}</h3>
                    <p className="font-body text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="hero" size="lg">
              Launch 3D Studio
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomizationSection;
