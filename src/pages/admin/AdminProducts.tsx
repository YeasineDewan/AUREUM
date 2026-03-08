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
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Image, MoreHorizontal } from "lucide-react";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  description: string;
  sku: string;
}

const initialProducts: Product[] = [
  { id: 1, name: "Classic Wool Suit", category: "Suits", price: 2450, stock: 12, status: "Active", description: "Handcrafted Italian wool suit", sku: "SUT-001" },
  { id: 2, name: "Egyptian Cotton Shirt", category: "Shirts", price: 230, stock: 45, status: "Active", description: "Premium Egyptian cotton dress shirt", sku: "SHR-001" },
  { id: 3, name: "Cashmere Overcoat", category: "Outerwear", price: 1800, stock: 8, status: "Active", description: "Luxurious cashmere blend overcoat", sku: "OUT-001" },
  { id: 4, name: "Slim Fit Blazer", category: "Blazers", price: 1250, stock: 15, status: "Draft", description: "Contemporary slim fit blazer", sku: "BLZ-001" },
  { id: 5, name: "Tailored Trousers", category: "Trousers", price: 290, stock: 30, status: "Active", description: "Perfectly tailored trousers", sku: "TRS-001" },
  { id: 6, name: "Silk Pocket Square Set", category: "Accessories", price: 85, stock: 60, status: "Active", description: "Set of 3 silk pocket squares", sku: "ACC-001" },
  { id: 7, name: "Merino Wool Vest", category: "Vests", price: 420, stock: 20, status: "Active", description: "Fine merino wool waistcoat", sku: "VST-001" },
  { id: 8, name: "Linen Summer Suit", category: "Suits", price: 1890, stock: 0, status: "Out of Stock", description: "Light Belgian linen summer suit", sku: "SUT-002" },
];

const CATEGORIES = ["All", "Suits", "Shirts", "Blazers", "Trousers", "Outerwear", "Vests", "Accessories"];

const AdminProducts = () => {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", category: "", price: "", stock: "", status: "Active", description: "", sku: "" });
  const { toast } = useToast();

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "All" || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  const handleSave = () => {
    if (!form.name || !form.price) {
      toast({ title: "Name and price are required", variant: "destructive" });
      return;
    }
    if (editingId !== null) {
      setProducts((prev) => prev.map((p) => p.id === editingId ? { ...p, ...form, price: Number(form.price), stock: Number(form.stock) } : p));
      toast({ title: "Product updated" });
    } else {
      setProducts((prev) => [...prev, { id: Date.now(), ...form, price: Number(form.price), stock: Number(form.stock) }]);
      toast({ title: "Product created" });
    }
    resetForm();
  };

  const resetForm = () => {
    setForm({ name: "", category: "", price: "", stock: "", status: "Active", description: "", sku: "" });
    setEditingId(null);
    setDialogOpen(false);
  };

  const handleEdit = (p: Product) => {
    setForm({ name: p.name, category: p.category, price: String(p.price), stock: String(p.stock), status: p.status, description: p.description, sku: p.sku });
    setEditingId(p.id);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Product deleted" });
  };

  const stockBadge = (stock: number) => {
    if (stock === 0) return <Badge variant="destructive" className="text-[10px]">Out of Stock</Badge>;
    if (stock <= 10) return <Badge variant="outline" className="text-[10px] text-orange-400 border-orange-400/30">Low Stock</Badge>;
    return <Badge variant="outline" className="text-[10px] text-green-400 border-green-400/30">In Stock</Badge>;
  };

  return (
    <AdminLayout title="Products" description="Manage your product catalog and inventory">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="font-display text-lg text-foreground">{products.length}</p>
            <p className="font-body text-[10px] text-muted-foreground">Total Products</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="font-display text-lg text-foreground">${totalValue.toLocaleString()}</p>
            <p className="font-body text-[10px] text-muted-foreground">Inventory Value</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="font-display text-lg text-orange-400">{lowStock}</p>
            <p className="font-body text-[10px] text-muted-foreground">Low Stock</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="font-display text-lg text-destructive">{outOfStock}</p>
            <p className="font-body text-[10px] text-muted-foreground">Out of Stock</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="font-display text-base">All Products</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search products..." className="pl-8 h-8 text-xs w-48 bg-secondary/40 border-border" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={filterCat} onValueChange={setFilterCat}>
                <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button variant="hero" size="sm" className="h-8 text-xs">
                    <Plus className="h-3 w-3 mr-1.5" /> Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-display">{editingId ? "Edit Product" : "Add Product"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-body text-xs">Name *</Label>
                        <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="bg-secondary/40 border-border" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-body text-xs">SKU</Label>
                        <Input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} className="bg-secondary/40 border-border" placeholder="SUT-001" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="font-body text-xs">Category</Label>
                        <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                          <SelectTrigger className="bg-secondary/40 border-border"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{CATEGORIES.filter((c) => c !== "All").map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-body text-xs">Price ($) *</Label>
                        <Input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="bg-secondary/40 border-border" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-body text-xs">Stock</Label>
                        <Input type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} className="bg-secondary/40 border-border" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-body text-xs">Description</Label>
                      <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="bg-secondary/40 border-border resize-none" rows={3} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-body text-xs">Status</Label>
                      <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                        <SelectTrigger className="bg-secondary/40 border-border"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="hero" className="w-full" onClick={handleSave}>
                      {editingId ? "Update Product" : "Create Product"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
              {filtered.map((product) => (
                <TableRow key={product.id} className="hover:bg-secondary/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-secondary flex items-center justify-center shrink-0">
                        <Image className="h-3.5 w-3.5 text-muted-foreground/40" />
                      </div>
                      <div>
                        <p className="font-body text-xs font-medium">{product.name}</p>
                        <p className="font-body text-[10px] text-muted-foreground truncate max-w-[180px]">{product.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">{product.sku}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px]">{product.category}</Badge></TableCell>
                  <TableCell className="font-body text-xs text-right font-medium">${product.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-body text-xs">{product.stock}</span>
                      {stockBadge(product.stock)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.status === "Active" ? "default" : product.status === "Draft" ? "secondary" : "destructive"} className="text-[10px]">
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(product)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminProducts;
