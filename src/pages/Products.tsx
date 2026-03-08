import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/hooks/use-toast";
import { Search, SlidersHorizontal, ShoppingBag, Eye, Star } from "lucide-react";
import { Link } from "react-router-dom";

const CATEGORIES = ["All", "Suits", "Blazers", "Shirts", "Trousers", "Overcoats", "Accessories"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name A-Z" },
];

const Products = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { toast } = useToast();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", category, sort, search],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*")
        .eq("status", "Active");

      if (category !== "All") {
        query = query.eq("category", category);
      }
      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      switch (sort) {
        case "price-asc": query = query.order("price", { ascending: true }); break;
        case "price-desc": query = query.order("price", { ascending: false }); break;
        case "name": query = query.order("name", { ascending: true }); break;
        default: query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        {/* Hero Banner */}
        <div className="bg-secondary py-16 border-b border-border">
          <div className="container mx-auto px-6 text-center">
            <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-3">Our Collection</p>
            <h1 className="font-display text-4xl md:text-5xl mb-4">
              Premium <span className="italic text-gradient-gold">Menswear</span>
            </h1>
            <p className="font-body text-sm text-muted-foreground max-w-lg mx-auto">
              Discover our curated collection of bespoke suits, blazers, and accessories crafted from the finest materials.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-6 py-10">
          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full md:w-48 bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="heroOutline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Category Tabs */}
          <div className={`flex flex-wrap gap-2 mb-8 ${showFilters ? "block" : "hidden md:flex"}`}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-sm font-body text-xs tracking-wider uppercase transition-all ${
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results count */}
          <p className="font-body text-xs text-muted-foreground mb-6">
            {isLoading ? "Loading..." : `${products.length} product${products.length !== 1 ? "s" : ""} found`}
          </p>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="border-border bg-card animate-pulse">
                  <div className="h-72 bg-secondary" />
                  <CardContent className="p-5 space-y-3">
                    <div className="h-4 bg-secondary rounded w-3/4" />
                    <div className="h-3 bg-secondary rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-2xl text-muted-foreground mb-2">No products found</p>
              <p className="font-body text-xs text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="group border-border bg-card overflow-hidden hover-lift cursor-pointer">
                  <div className="relative h-72 bg-secondary flex items-center justify-center overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <span className="font-display text-7xl text-muted-foreground/10">
                        {product.name.charAt(0)}
                      </span>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <Link to={`/product/${product.slug || product.id}`}>
                        <Button variant="hero" size="sm">
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                      </Link>
                      <Button
                        variant="heroOutline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          addItem({ id: product.id, name: product.name, price: product.price });
                          toast({ title: "Added to cart", description: product.name });
                        }}
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Tags */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {product.featured && (
                        <Badge className="bg-primary text-primary-foreground text-[9px] font-body tracking-wider">
                          <Star className="h-2.5 w-2.5 mr-0.5" /> Featured
                        </Badge>
                      )}
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <Badge variant="destructive" className="text-[9px] font-body tracking-wider">
                          Sale
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <p className="font-body text-[10px] text-primary tracking-widest uppercase mb-1">
                      {product.category}
                    </p>
                    <h3 className="font-display text-base mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    {product.short_description && (
                      <p className="font-body text-xs text-muted-foreground mb-3 line-clamp-2">
                        {product.short_description}
                      </p>
                    )}
                    <div className="flex items-baseline gap-2">
                      <span className="font-body text-sm font-semibold text-primary">
                        ${product.price.toLocaleString()}
                      </span>
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <span className="font-body text-xs text-muted-foreground line-through">
                          ${product.compare_at_price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="flex gap-1 mt-3">
                        {product.sizes.slice(0, 5).map((size) => (
                          <span key={size} className="px-1.5 py-0.5 bg-secondary text-[9px] font-body text-muted-foreground rounded">
                            {size}
                          </span>
                        ))}
                        {product.sizes.length > 5 && (
                          <span className="text-[9px] font-body text-muted-foreground">+{product.sizes.length - 5}</span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Products;
