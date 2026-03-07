import { Button } from "@/components/ui/button";

const products = [
  {
    name: "The Sovereign Suit",
    price: "$1,290",
    tag: "Bestseller",
  },
  {
    name: "The Monarch Blazer",
    price: "$680",
    tag: "New",
  },
  {
    name: "The Regent Overcoat",
    price: "$1,450",
    tag: "Limited",
  },
];

const FeaturedCollection = () => {
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
              {/* Placeholder product area */}
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
                <p className="font-body text-sm text-primary mb-4">{product.price}</p>
                <Button variant="heroOutline" size="sm" className="w-full">
                  Customize & Order
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollection;
