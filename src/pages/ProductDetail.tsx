import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/hooks/use-toast";
import {
  Star, ShoppingBag, Heart, Truck, Shield, RotateCcw, ChevronLeft,
  Ruler, Palette, Scissors, Check,
} from "lucide-react";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const { toast } = useToast();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", product?.id],
    enabled: !!product?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", product!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 container mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-12 animate-pulse">
            <div className="h-[600px] bg-secondary rounded-sm" />
            <div className="space-y-6">
              <div className="h-8 bg-secondary rounded w-3/4" />
              <div className="h-4 bg-secondary rounded w-1/2" />
              <div className="h-32 bg-secondary rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 container mx-auto px-6 py-16 text-center">
          <h1 className="font-display text-3xl mb-4">Product Not Found</h1>
          <Button variant="heroOutline" asChild><Link to="/products">Back to Collection</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        {/* Breadcrumb */}
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-2 font-body text-xs text-muted-foreground">
            <Link to="/products" className="hover:text-primary transition-colors flex items-center gap-1">
              <ChevronLeft className="h-3 w-3" /> Collections
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>
        </div>

        <div className="container mx-auto px-6 pb-16">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* IMAGE GALLERY */}
            <div className="space-y-4">
              <div className="relative aspect-[3/4] bg-secondary rounded-sm overflow-hidden group">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {product.featured && (
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground text-[10px]">
                    <Star className="h-3 w-3 mr-1" /> Featured
                  </Badge>
                )}
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <Badge variant="destructive" className="absolute top-4 right-4 text-[10px]">
                    -{Math.round((1 - product.price / product.compare_at_price) * 100)}% OFF
                  </Badge>
                )}
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`aspect-square rounded-sm overflow-hidden border-2 transition-all ${
                        selectedImage === i ? "border-primary glow-gold" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PRODUCT INFO */}
            <div className="space-y-6">
              <div>
                <p className="font-body text-[10px] tracking-[0.3em] uppercase text-primary mb-2">
                  {product.category} {product.subcategory ? `· ${product.subcategory}` : ""}
                </p>
                <h1 className="font-display text-3xl lg:text-4xl mb-3">{product.name}</h1>

                {/* Rating */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${s <= Math.round(Number(avgRating)) ? "text-primary fill-primary" : "text-border"}`}
                      />
                    ))}
                  </div>
                  <span className="font-body text-xs text-muted-foreground">
                    {avgRating} ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl text-primary">
                  ৳{product.price.toLocaleString()}
                </span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <span className="font-body text-lg text-muted-foreground line-through">
                    ৳{product.compare_at_price.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {product.short_description}
              </p>

              <Separator className="bg-border" />

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-body text-xs tracking-widest uppercase text-foreground">Select Size</p>
                    <button className="font-body text-[10px] text-primary hover:underline flex items-center gap-1">
                      <Ruler className="h-3 w-3" /> Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[48px] px-4 py-2.5 rounded-sm font-body text-xs tracking-wider transition-all ${
                          selectedSize === size
                            ? "bg-primary text-primary-foreground glow-gold"
                            : "bg-secondary border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-sm">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3 py-2.5 font-body text-sm text-muted-foreground hover:text-foreground"
                  >−</button>
                  <span className="px-4 py-2.5 font-body text-sm min-w-[40px] text-center">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="px-3 py-2.5 font-body text-sm text-muted-foreground hover:text-foreground"
                  >+</button>
                </div>
                <Button
                  variant="hero"
                  className="flex-1 py-6 text-sm tracking-wider"
                  onClick={() => {
                    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
                      toast({ title: "Please select a size", variant: "destructive" });
                      return;
                    }
                    for (let i = 0; i < qty; i++) {
                      addItem({ id: product.id, name: product.name, price: product.price });
                    }
                    toast({ title: "Added to cart", description: `${qty}× ${product.name}` });
                  }}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" /> Add to Cart
                </Button>
                <Button variant="heroOutline" size="icon" className="h-12 w-12">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Truck, label: "Free Shipping", sub: "On orders over ৳1,500" },
                  { icon: Shield, label: "Quality Guarantee", sub: "Premium materials" },
                  { icon: RotateCcw, label: "Easy Returns", sub: "30-day returns" },
                ].map((b) => (
                  <div key={b.label} className="flex flex-col items-center text-center p-3 rounded-sm bg-secondary/50 border border-border">
                    <b.icon className="h-4 w-4 text-primary mb-1.5" />
                    <p className="font-body text-[10px] font-medium text-foreground">{b.label}</p>
                    <p className="font-body text-[9px] text-muted-foreground">{b.sub}</p>
                  </div>
                ))}
              </div>

              {/* Fabric details */}
              <Separator className="bg-border" />
              <Tabs defaultValue="details" className="space-y-4">
                <TabsList className="bg-secondary w-full grid grid-cols-3">
                  <TabsTrigger value="details" className="text-[10px]">Details</TabsTrigger>
                  <TabsTrigger value="fabric" className="text-[10px]">Fabric & Care</TabsTrigger>
                  <TabsTrigger value="shipping" className="text-[10px]">Shipping</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-3">
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">{product.description}</p>
                  {product.sku && (
                    <p className="font-body text-[10px] text-muted-foreground">SKU: {product.sku}</p>
                  )}
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {product.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-[9px] capitalize">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="fabric" className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Scissors, label: "Fabric", value: product.fabric_type || "Premium" },
                      { icon: Palette, label: "Color", value: product.color || "—" },
                    ].map((d) => (
                      <div key={d.label} className="p-3 rounded-sm bg-secondary/30 border border-border">
                        <d.icon className="h-4 w-4 text-primary mb-1" />
                        <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">{d.label}</p>
                        <p className="font-body text-sm text-foreground">{d.value}</p>
                      </div>
                    ))}
                  </div>
                  <ul className="space-y-1.5">
                    {["Dry clean recommended", "Store on padded hanger", "Avoid direct sunlight", "Iron on low heat with pressing cloth"].map((t) => (
                      <li key={t} className="flex items-center gap-2 font-body text-xs text-muted-foreground">
                        <Check className="h-3 w-3 text-primary" /> {t}
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="shipping" className="space-y-2">
                  {[
                    "Free standard shipping on orders over ৳1,500",
                    "Express delivery: 2-3 business days (৳200)",
                    "International shipping available",
                    "Bespoke orders: 3-4 weeks production time",
                  ].map((t) => (
                    <p key={t} className="flex items-center gap-2 font-body text-xs text-muted-foreground">
                      <Check className="h-3 w-3 text-primary" /> {t}
                    </p>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* REVIEWS SECTION */}
          <div className="mt-16">
            <h2 className="font-display text-2xl mb-6">Customer Reviews</h2>
            {reviews.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground">No reviews yet. Be the first to review this product.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {reviews.map((review: any) => (
                  <div key={review.id} className="p-5 rounded-sm border border-border bg-card hover:border-primary/20 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-body text-sm font-medium text-foreground">{review.author_name}</p>
                        {review.verified_purchase && (
                          <Badge variant="outline" className="text-[9px] text-primary border-primary/30 mt-1">
                            <Check className="h-2.5 w-2.5 mr-0.5" /> Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3.5 w-3.5 ${s <= review.rating ? "text-primary fill-primary" : "text-border"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="font-display text-sm mb-1">{review.title}</p>
                    <p className="font-body text-xs text-muted-foreground leading-relaxed">{review.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
