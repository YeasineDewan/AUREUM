import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Package, ShoppingCart, DollarSign, Users, Plus, Pencil, Trash2, LayoutDashboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data
const initialOrders = [
  { id: "ORD-001", customer: "James H.", item: "Bespoke Suit", status: "In Production", total: 2450, date: "2026-03-01" },
  { id: "ORD-002", customer: "Michael R.", item: "Dress Shirt x3", status: "Delivered", total: 690, date: "2026-02-28" },
  { id: "ORD-003", customer: "David K.", item: "Overcoat", status: "Pending", total: 1800, date: "2026-03-05" },
  { id: "ORD-004", customer: "Thomas W.", item: "Blazer", status: "Shipped", total: 1250, date: "2026-03-03" },
  { id: "ORD-005", customer: "Robert L.", item: "Trousers x2", status: "In Production", total: 580, date: "2026-03-07" },
];

const initialProducts = [
  { id: 1, name: "Classic Wool Suit", category: "Suits", price: 2450, stock: 12, status: "Active" },
  { id: 2, name: "Egyptian Cotton Shirt", category: "Shirts", price: 230, stock: 45, status: "Active" },
  { id: 3, name: "Cashmere Overcoat", category: "Outerwear", price: 1800, stock: 8, status: "Active" },
  { id: 4, name: "Slim Fit Blazer", category: "Blazers", price: 1250, stock: 15, status: "Draft" },
  { id: 5, name: "Tailored Trousers", category: "Trousers", price: 290, stock: 30, status: "Active" },
];

const revenueData = [
  { month: "Oct", revenue: 18400 }, { month: "Nov", revenue: 22100 }, { month: "Dec", revenue: 31500 },
  { month: "Jan", revenue: 24800 }, { month: "Feb", revenue: 27300 }, { month: "Mar", revenue: 19200 },
];

const categoryData = [
  { name: "Suits", value: 42 }, { name: "Shirts", value: 28 }, { name: "Outerwear", value: 15 }, { name: "Trousers", value: 15 },
];

const CHART_COLORS = ["hsl(38,70%,50%)", "hsl(38,60%,65%)", "hsl(38,80%,35%)", "hsl(0,0%,40%)"];

const statusColor = (status: string) => {
  switch (status) {
    case "Delivered": case "Active": return "default";
    case "Shipped": return "secondary";
    case "In Production": return "outline";
    default: return "destructive";
  }
};

const Admin = () => {
  const [orders, setOrders] = useState(initialOrders);
  const [products, setProducts] = useState(initialProducts);
  const [productForm, setProductForm] = useState({ name: "", category: "", price: "", stock: "", status: "Active" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;

  const handleSaveProduct = () => {
    if (!productForm.name || !productForm.price) {
      toast({ title: "Name and price are required", variant: "destructive" });
      return;
    }
    if (editingId !== null) {
      setProducts((prev) => prev.map((p) => p.id === editingId ? { ...p, ...productForm, price: Number(productForm.price), stock: Number(productForm.stock) } : p));
      toast({ title: "Product updated" });
    } else {
      setProducts((prev) => [...prev, { id: Date.now(), ...productForm, price: Number(productForm.price), stock: Number(productForm.stock) }]);
      toast({ title: "Product created" });
    }
    setProductForm({ name: "", category: "", price: "", stock: "", status: "Active" });
    setEditingId(null);
    setDialogOpen(false);
  };

  const handleEdit = (p: typeof initialProducts[0]) => {
    setProductForm({ name: p.name, category: p.category, price: String(p.price), stock: String(p.stock), status: p.status });
    setEditingId(p.id);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Product deleted" });
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    toast({ title: `Order ${orderId} updated to ${newStatus}` });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <h1 className="font-display text-xl text-foreground">AUREUM Admin</h1>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <a href="/">← Back to Store</a>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, sub: "This period" },
                { label: "Orders", value: totalOrders, icon: ShoppingCart, sub: "Total orders" },
                { label: "Products", value: totalProducts, icon: Package, sub: "In catalog" },
                { label: "Customers", value: 84, icon: Users, sub: "Active clients" },
              ].map((stat) => (
                <Card key={stat.label} className="border-border bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground text-sm">{stat.label}</span>
                      <stat.icon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-2xl font-display text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-border bg-card">
                <CardHeader><CardTitle className="text-lg">Revenue Trend</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
                      <XAxis dataKey="month" stroke="hsl(40,10%,55%)" fontSize={12} />
                      <YAxis stroke="hsl(40,10%,55%)" fontSize={12} />
                      <Tooltip contentStyle={{ background: "hsl(0,0%,10%)", border: "1px solid hsl(0,0%,18%)", borderRadius: 4 }} />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(38,70%,50%)" strokeWidth={2} dot={{ fill: "hsl(38,70%,50%)" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardHeader><CardTitle className="text-lg">Sales by Category</CardTitle></CardHeader>
                <CardContent className="flex justify-center">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} fontSize={11}>
                        {categoryData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(0,0%,10%)", border: "1px solid hsl(0,0%,18%)", borderRadius: 4 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Orders</CardTitle>
                <CardDescription>Manage and update customer orders.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.item}</TableCell>
                        <TableCell><Badge variant={statusColor(order.status)}>{order.status}</Badge></TableCell>
                        <TableCell>${order.total.toLocaleString()}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <Select value={order.status} onValueChange={(v) => handleStatusChange(order.id, v)}>
                            <SelectTrigger className="w-[140px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["Pending", "In Production", "Shipped", "Delivered"].map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>Manage your product catalog.</CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingId(null); setProductForm({ name: "", category: "", price: "", stock: "", status: "Active" }); } }}>
                  <DialogTrigger asChild>
                    <Button variant="hero" size="sm"><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle>{editingId ? "Edit Product" : "Add Product"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={productForm.name} onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))} placeholder="Product name" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Input value={productForm.category} onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))} placeholder="Suits" />
                        </div>
                        <div className="space-y-2">
                          <Label>Price ($)</Label>
                          <Input type="number" value={productForm.price} onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))} placeholder="0" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Stock</Label>
                          <Input type="number" value={productForm.stock} onChange={(e) => setProductForm((p) => ({ ...p, stock: e.target.value }))} placeholder="0" />
                        </div>
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select value={productForm.status} onValueChange={(v) => setProductForm((p) => ({ ...p, status: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Draft">Draft</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button variant="hero" className="w-full" onClick={handleSaveProduct}>
                        {editingId ? "Update Product" : "Create Product"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>${product.price.toLocaleString()}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell><Badge variant={statusColor(product.status)}>{product.status}</Badge></TableCell>
                        <TableCell className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
