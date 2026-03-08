import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag } from "lucide-react";

const products = [
  {
    id: "sovereign-suit",
    name: "The Sovereign Suit",
    price: 1290,
    tag: "Bestseller",
  },
  {
    id: "monarch-blazer",
    name: "The Monarch Blazer",
    price: 680,
    tag: "New",
  },
  {
    id: "regent-overcoat",
    name: "The Regent Overcoat",
    price: 1450,
    tag: "Limited",
  },
];

const FeaturedCollection = () => {
  const addItem = useCartStore((s) => s.addItem);
  const { toast } = useToast();

  const handleAdd = (product: (typeof products)[0]) => {
    addItem({ id: product.id, name: product.name, price: product.price });
    toast({ title: "Added to cart", description: product.name });
  };

  return (
    <section id="collections" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">
            Curated for Excellence
          </p>
          <h2 className="font-display text-4xl md:text-5xl">
            Featured <span className="italic text-gradient-gold">Collection</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.name}
              className="group bg-card border border-border rounded-sm overflow-hidden hover-lift cursor-pointer"
            >
              <div className="relative h-80 bg-charcoal-light flex items-center justify-center">
                <span className="font-display text-6xl text-muted-foreground/20">
                  {product.name.charAt(4)}
                </span>
                <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-[10px] font-body tracking-widest uppercase px-3 py-1 rounded-sm">
                  {product.tag}
                </span>
              </div>

              <div className="p-6">
                <h3 className="font-display text-lg mb-1">{product.name}</h3>
                <p className="font-body text-sm text-primary mb-4">${product.price.toLocaleString()}</p>
                <div className="flex gap-2">
                  <Button variant="heroOutline" size="sm" className="flex-1" asChild>
                    <a href="/customize">Customize</a>
                  </Button>
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={() => handleAdd(product)}
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollection;
