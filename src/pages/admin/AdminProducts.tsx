import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Pencil, Trash2, Search, Image as ImageIcon, Package, Tag, Ruler, Globe, Star,
  Loader2, AlertCircle, CheckCircle2, Upload, X,
} from "lucide-react";

const CATEGORIES = ["Suits", "Shirts", "Blazers", "Trousers", "Outerwear", "Vests", "Accessories", "Shoes", "Custom"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Custom"];
const FABRIC_TYPES = ["Italian Wool", "Egyptian Cotton", "Belgian Linen", "Cashmere Blend", "Silk Blend", "Merino Wool", "Tweed", "Velvet", "Poplin", "Oxford Cotton"];

interface ProductForm {
  name: string; slug: string; sku: string; description: string; short_description: string;
  category: string; subcategory: string; price: string; compare_at_price: string; cost_price: string;
  stock: string; low_stock_threshold: string; status: string; tags: string[];
  weight: string; weight_unit: string; dimensions_length: string; dimensions_width: string; dimensions_height: string;
  fabric_type: string; color: string; sizes: string[];
  seo_title: string; seo_description: string; featured: boolean; images: string[];
}

const emptyForm: ProductForm = {
  name: "", slug: "", sku: "", description: "", short_description: "",
  category: "", subcategory: "", price: "", compare_at_price: "", cost_price: "",
  stock: "0", low_stock_threshold: "10", status: "Draft", tags: [],
  weight: "", weight_unit: "kg", dimensions_length: "", dimensions_width: "", dimensions_height: "",
  fabric_type: "", color: "", sizes: [],
  seo_title: "", seo_description: "", featured: false, images: [],
};

const AdminProducts = () => {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>({ ...emptyForm });
  const [tagInput, setTagInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products from DB
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (formData: ProductForm) => {
      const payload = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        sku: formData.sku,
        description: formData.description,
        short_description: formData.short_description,
        category: formData.category,
        subcategory: formData.subcategory,
        price: parseFloat(formData.price) || 0,
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        stock: parseInt(formData.stock) || 0,
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 10,
        status: formData.status,
        tags: formData.tags,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        weight_unit: formData.weight_unit,
        dimensions_length: formData.dimensions_length ? parseFloat(formData.dimensions_length) : null,
        dimensions_width: formData.dimensions_width ? parseFloat(formData.dimensions_width) : null,
        dimensions_height: formData.dimensions_height ? parseFloat(formData.dimensions_height) : null,
        fabric_type: formData.fabric_type,
        color: formData.color,
        sizes: formData.sizes,
        seo_title: formData.seo_title,
        seo_description: formData.seo_description,
        featured: formData.featured,
        images: formData.images,
      };
      if (editingId) {
        const { error } = await supabase.from("products").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: editingId ? "Product updated" : "Product created" });
      resetForm();
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Product deleted" });
    },
  });

  const filtered = products.filter((p: any) => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "All" || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const totalValue = products.reduce((s: number, p: any) => s + (p.price || 0) * (p.stock || 0), 0);
  const lowStock = products.filter((p: any) => p.stock > 0 && p.stock <= (p.low_stock_threshold || 10)).length;
  const outOfStock = products.filter((p: any) => p.stock === 0).length;

  const resetForm = () => { setForm({ ...emptyForm }); setEditingId(null); setDialogOpen(false); setTagInput(""); };

  const handleEdit = (p: any) => {
    setForm({
      name: p.name || "", slug: p.slug || "", sku: p.sku || "", description: p.description || "",
      short_description: p.short_description || "", category: p.category || "", subcategory: p.subcategory || "",
      price: String(p.price || ""), compare_at_price: p.compare_at_price ? String(p.compare_at_price) : "",
      cost_price: p.cost_price ? String(p.cost_price) : "",
      stock: String(p.stock || 0), low_stock_threshold: String(p.low_stock_threshold || 10),
      status: p.status || "Draft", tags: p.tags || [], weight: p.weight ? String(p.weight) : "",
      weight_unit: p.weight_unit || "kg", dimensions_length: p.dimensions_length ? String(p.dimensions_length) : "",
      dimensions_width: p.dimensions_width ? String(p.dimensions_width) : "",
      dimensions_height: p.dimensions_height ? String(p.dimensions_height) : "",
      fabric_type: p.fabric_type || "", color: p.color || "", sizes: p.sizes || [],
      seo_title: p.seo_title || "", seo_description: p.seo_description || "",
      featured: p.featured || false, images: p.images || [],
    });
    setEditingId(p.id);
    setDialogOpen(true);
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(f => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };

  const toggleSize = (size: string) => {
    setForm(f => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter(s => s !== size) : [...f.sizes, size],
    }));
  };

  const stockBadge = (stock: number, threshold: number = 10) => {
    if (stock === 0) return <Badge variant="destructive" className="text-[10px]">Out of Stock</Badge>;
    if (stock <= threshold) return <Badge variant="outline" className="text-[10px] text-orange-400 border-orange-400/30">Low Stock</Badge>;
    return <Badge variant="outline" className="text-[10px] text-green-400 border-green-400/30">In Stock</Badge>;
  };

  const profit = form.price && form.cost_price ? (parseFloat(form.price) - parseFloat(form.cost_price)).toFixed(2) : null;
  const margin = form.price && form.cost_price && parseFloat(form.price) > 0
    ? (((parseFloat(form.price) - parseFloat(form.cost_price)) / parseFloat(form.price)) * 100).toFixed(1) : null;

  return (
    <AdminLayout title="Products" description="Manage your product catalog and inventory">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Products", value: products.length, cls: "text-foreground" },
          { label: "Inventory Value", value: `$${totalValue.toLocaleString()}`, cls: "text-foreground" },
          { label: "Low Stock", value: lowStock, cls: "text-orange-400" },
          { label: "Out of Stock", value: outOfStock, cls: "text-destructive" },
        ].map(s => (
          <Card key={s.label} className="border-border bg-card">
            <CardContent className="p-4">
              <p className={`font-display text-lg ${s.cls}`}>{s.value}</p>
              <p className="font-body text-[10px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="font-display text-base">All Products</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8 h-8 text-xs w-44 bg-secondary/40 border-border" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Select value={filterCat} onValueChange={setFilterCat}>
                <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button variant="hero" size="sm" className="h-8 text-xs"><Plus className="h-3 w-3 mr-1.5" /> Add Product</Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-display text-lg">{editingId ? "Edit Product" : "Add New Product"}</DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="basic" className="mt-2">
                    <TabsList className="bg-secondary w-full grid grid-cols-5">
                      <TabsTrigger value="basic" className="text-[10px]"><Package className="h-3 w-3 mr-1" /> Basic</TabsTrigger>
                      <TabsTrigger value="pricing" className="text-[10px]"><Tag className="h-3 w-3 mr-1" /> Pricing</TabsTrigger>
                      <TabsTrigger value="variants" className="text-[10px]"><Ruler className="h-3 w-3 mr-1" /> Details</TabsTrigger>
                      <TabsTrigger value="media" className="text-[10px]"><ImageIcon className="h-3 w-3 mr-1" /> Media</TabsTrigger>
                      <TabsTrigger value="seo" className="text-[10px]"><Globe className="h-3 w-3 mr-1" /> SEO</TabsTrigger>
                    </TabsList>

                    {/* BASIC TAB */}
                    <TabsContent value="basic" className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-body text-xs">Product Name *</Label>
                          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-secondary/40 border-border" placeholder="Classic Wool Suit" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-body text-xs">SKU</Label>
                          <Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className="bg-secondary/40 border-border" placeholder="SUT-001" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-body text-xs">Short Description</Label>
                        <Input value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} className="bg-secondary/40 border-border" placeholder="Brief summary for listings" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-body text-xs">Full Description</Label>
                        <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-secondary/40 border-border resize-none" rows={4} placeholder="Detailed product description..." />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="font-body text-xs">Category *</Label>
                          <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                            <SelectTrigger className="bg-secondary/40 border-border"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-body text-xs">Status</Label>
                          <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                            <SelectTrigger className="bg-secondary/40 border-border"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Draft">Draft</SelectItem>
                              <SelectItem value="Archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end gap-3 pb-1">
                          <div className="flex items-center gap-2">
                            <Switch checked={form.featured} onCheckedChange={v => setForm(f => ({ ...f, featured: v }))} />
                            <Label className="font-body text-xs">Featured</Label>
                          </div>
                        </div>
                      </div>
                      {/* Tags */}
                      <div className="space-y-2">
                        <Label className="font-body text-xs">Tags</Label>
                        <div className="flex gap-2">
                          <Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())} className="bg-secondary/40 border-border flex-1" placeholder="Add tag..." />
                          <Button variant="heroOutline" size="sm" onClick={addTag} type="button">Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {form.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-[10px] gap-1">
                              {tag}
                              <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))} />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    {/* PRICING TAB */}
                    <TabsContent value="pricing" className="space-y-4 pt-2">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="font-body text-xs">Price ($) *</Label>
                          <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="bg-secondary/40 border-border" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-body text-xs">Compare at Price</Label>
                          <Input type="number" value={form.compare_at_price} onChange={e => setForm(f => ({ ...f, compare_at_price: e.target.value }))} className="bg-secondary/40 border-border" placeholder="Original price" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-body text-xs">Cost Price</Label>
                          <Input type="number" value={form.cost_price} onChange={e => setForm(f => ({ ...f, cost_price: e.target.value }))} className="bg-secondary/40 border-border" placeholder="Your cost" />
                        </div>
                      </div>
                      {profit && (
                        <Card className="border-primary/20 bg-primary/5">
                          <CardContent className="p-4 flex items-center gap-6">
                            <div>
                              <p className="font-body text-[10px] text-muted-foreground">Profit</p>
                              <p className="font-display text-lg text-primary">${profit}</p>
                            </div>
                            <div>
                              <p className="font-body text-[10px] text-muted-foreground">Margin</p>
                              <p className="font-display text-lg text-primary">{margin}%</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      <Separator className="bg-border" />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-body text-xs">Stock Quantity</Label>
                          <Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="bg-secondary/40 border-border" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-body text-xs">Low Stock Alert At</Label>
                          <Input type="number" value={form.low_stock_threshold} onChange={e => setForm(f => ({ ...f, low_stock_threshold: e.target.value }))} className="bg-secondary/40 border-border" />
                        </div>
                      </div>
                    </TabsContent>

                    {/* DETAILS TAB */}
                    <TabsContent value="variants" className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-body text-xs">Fabric Type</Label>
                          <Select value={form.fabric_type} onValueChange={v => setForm(f => ({ ...f, fabric_type: v }))}>
                            <SelectTrigger className="bg-secondary/40 border-border"><SelectValue placeholder="Select fabric" /></SelectTrigger>
                            <SelectContent>{FABRIC_TYPES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-body text-xs">Color</Label>
                          <Input value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="bg-secondary/40 border-border" placeholder="e.g. Charcoal, Navy" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-body text-xs">Available Sizes</Label>
                        <div className="flex flex-wrap gap-2">
                          {SIZES.map(size => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => toggleSize(size)}
                              className={`px-3 py-1.5 rounded border text-xs font-body transition-all ${
                                form.sizes.includes(size) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground"
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                      <Separator className="bg-border" />
                      <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">Shipping Details</p>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-2">
                          <Label className="font-body text-xs">Weight</Label>
                          <Input type="number" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} className="bg-secondary/40 border-border" placeholder="0.0" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-body text-xs">Unit</Label>
                          <Select value={form.weight_unit} onValueChange={v => setForm(f => ({ ...f, weight_unit: v }))}>
                            <SelectTrigger className="bg-secondary/40 border-border"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kg">kg</SelectItem>
                              <SelectItem value="lb">lb</SelectItem>
                              <SelectItem value="g">g</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label className="font-body text-xs">Dimensions (L × W × H cm)</Label>
                          <div className="flex gap-2">
                            <Input type="number" value={form.dimensions_length} onChange={e => setForm(f => ({ ...f, dimensions_length: e.target.value }))} className="bg-secondary/40 border-border" placeholder="L" />
                            <Input type="number" value={form.dimensions_width} onChange={e => setForm(f => ({ ...f, dimensions_width: e.target.value }))} className="bg-secondary/40 border-border" placeholder="W" />
                            <Input type="number" value={form.dimensions_height} onChange={e => setForm(f => ({ ...f, dimensions_height: e.target.value }))} className="bg-secondary/40 border-border" placeholder="H" />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* MEDIA TAB */}
                    <TabsContent value="media" className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label className="font-body text-xs">Image URLs</Label>
                        <p className="font-body text-[10px] text-muted-foreground">Add image URLs for your product (image upload will be available with storage setup)</p>
                        <div className="flex gap-2">
                          <Input
                            placeholder="https://example.com/image.jpg"
                            className="bg-secondary/40 border-border flex-1"
                            onKeyDown={e => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const val = (e.target as HTMLInputElement).value.trim();
                                if (val) { setForm(f => ({ ...f, images: [...f.images, val] })); (e.target as HTMLInputElement).value = ""; }
                              }
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {form.images.map((img, i) => (
                            <div key={i} className="relative group rounded border border-border overflow-hidden aspect-square bg-secondary">
                              <img src={img} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                              <button
                                type="button"
                                onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                                className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3 text-destructive" />
                              </button>
                            </div>
                          ))}
                          {form.images.length === 0 && (
                            <div className="col-span-4 py-8 text-center border-2 border-dashed border-border rounded-lg">
                              <Upload className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                              <p className="font-body text-xs text-muted-foreground">No images added yet</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    {/* SEO TAB */}
                    <TabsContent value="seo" className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label className="font-body text-xs">SEO Title</Label>
                        <Input value={form.seo_title} onChange={e => setForm(f => ({ ...f, seo_title: e.target.value }))} className="bg-secondary/40 border-border" placeholder="Page title for search engines" />
                        <p className="font-body text-[10px] text-muted-foreground">{form.seo_title.length}/60 characters</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-body text-xs">SEO Description</Label>
                        <Textarea value={form.seo_description} onChange={e => setForm(f => ({ ...f, seo_description: e.target.value }))} className="bg-secondary/40 border-border resize-none" rows={3} placeholder="Meta description for search engines" />
                        <p className="font-body text-[10px] text-muted-foreground">{form.seo_description.length}/160 characters</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-body text-xs">URL Slug</Label>
                        <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="bg-secondary/40 border-border" placeholder="auto-generated-from-name" />
                      </div>
                      {/* Preview */}
                      <Card className="border-border bg-secondary/20">
                        <CardContent className="p-4">
                          <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-2">Search Preview</p>
                          <p className="font-body text-sm text-blue-400">{form.seo_title || form.name || "Product Title"}</p>
                          <p className="font-body text-xs text-green-400">yourstore.com/products/{form.slug || "product-slug"}</p>
                          <p className="font-body text-[11px] text-muted-foreground mt-1">{form.seo_description || form.short_description || "Product description will appear here..."}</p>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>

                  <Button variant="hero" className="w-full mt-4" onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending || !form.name || !form.price}>
                    {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {editingId ? "Update Product" : "Create Product"}
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[11px]">Product</TableHead>
                  <TableHead className="text-[11px]">SKU</TableHead>
                  <TableHead className="text-[11px]">Category</TableHead>
                  <TableHead className="text-[11px] text-right">Price</TableHead>
                  <TableHead className="text-[11px]">Stock</TableHead>
                  <TableHead className="text-[11px]">Status</TableHead>
                  <TableHead className="text-[11px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((product: any) => (
                  <TableRow key={product.id} className="hover:bg-secondary/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="h-3.5 w-3.5 text-muted-foreground/40" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-body text-xs font-medium">{product.name}</p>
                            {product.featured && <Star className="h-3 w-3 text-primary fill-primary" />}
                          </div>
                          <p className="font-body text-[10px] text-muted-foreground truncate max-w-[180px]">{product.short_description || product.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">{product.sku}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-[10px]">{product.category}</Badge></TableCell>
                    <TableCell className="font-body text-xs text-right font-medium">
                      ${product.price?.toLocaleString()}
                      {product.compare_at_price && (
                        <span className="text-muted-foreground line-through ml-1.5">${product.compare_at_price}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-body text-xs">{product.stock}</span>
                        {stockBadge(product.stock, product.low_stock_threshold)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.status === "Active" ? "default" : product.status === "Draft" ? "secondary" : "destructive"} className="text-[10px]">
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(product)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteMutation.mutate(product.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground font-body text-sm">
                      {products.length === 0 ? "No products yet. Click 'Add Product' to get started." : "No products found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminProducts;
