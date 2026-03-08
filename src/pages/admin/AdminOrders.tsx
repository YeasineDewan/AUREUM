import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Filter, Download, Eye, Clock, CheckCircle2, Truck, AlertCircle, Package as PackageIcon,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const initialOrders = [
  { id: "ORD-007", customer: "Alexander M.", email: "alex@email.com", items: ["Bespoke 3-Piece Suit"], total: 3200, status: "In Production", date: "2026-03-08", fabric: "Italian Wool", color: "Charcoal", measurements: true },
  { id: "ORD-006", customer: "William C.", email: "will@email.com", items: ["Cashmere Blazer"], total: 1450, status: "Shipped", date: "2026-03-07", fabric: "Cashmere Blend", color: "Navy", measurements: true },
  { id: "ORD-005", customer: "Robert L.", email: "robert@email.com", items: ["Tailored Trousers x2"], total: 580, status: "In Production", date: "2026-03-07", fabric: "Egyptian Cotton", color: "Slate Grey", measurements: false },
  { id: "ORD-004", customer: "Thomas W.", email: "thomas@email.com", items: ["Regent Overcoat"], total: 1800, status: "Delivered", date: "2026-03-06", fabric: "Italian Wool", color: "Camel", measurements: true },
  { id: "ORD-003", customer: "David K.", email: "david@email.com", items: ["Custom Shirt x5"], total: 1150, status: "Pending", date: "2026-03-05", fabric: "Belgian Linen", color: "Ivory", measurements: true },
  { id: "ORD-002", customer: "Michael R.", email: "michael@email.com", items: ["Dress Shirt x3"], total: 690, status: "Delivered", date: "2026-02-28", fabric: "Egyptian Cotton", color: "Ivory", measurements: false },
  { id: "ORD-001", customer: "James H.", email: "james@email.com", items: ["Bespoke Suit"], total: 2450, status: "Delivered", date: "2026-03-01", fabric: "Italian Wool", color: "Navy", measurements: true },
];

const STATUSES = ["All", "Pending", "In Production", "Shipped", "Delivered"];

const statusIcon = (s: string) => {
  switch (s) {
    case "Delivered": return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
    case "Shipped": return <Truck className="h-3.5 w-3.5 text-blue-400" />;
    case "In Production": return <Clock className="h-3.5 w-3.5 text-primary" />;
    default: return <AlertCircle className="h-3.5 w-3.5 text-orange-400" />;
  }
};

const statusBadgeVariant = (s: string) => {
  switch (s) {
    case "Delivered": return "default" as const;
    case "Shipped": return "secondary" as const;
    case "In Production": return "outline" as const;
    default: return "destructive" as const;
  }
};

const AdminOrders = () => {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<typeof initialOrders[0] | null>(null);
  const { toast } = useToast();

  const filtered = orders.filter((o) => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    toast({ title: `Order ${orderId} updated to ${newStatus}` });
  };

  const ordersByStatus = {
    pending: orders.filter((o) => o.status === "Pending").length,
    production: orders.filter((o) => o.status === "In Production").length,
    shipped: orders.filter((o) => o.status === "Shipped").length,
    delivered: orders.filter((o) => o.status === "Delivered").length,
  };

  return (
    <AdminLayout title="Orders" description="Track and manage all customer orders">
      {/* Mini stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Pending", count: ordersByStatus.pending, icon: AlertCircle, cls: "text-orange-400" },
          { label: "In Production", count: ordersByStatus.production, icon: Clock, cls: "text-primary" },
          { label: "Shipped", count: ordersByStatus.shipped, icon: Truck, cls: "text-blue-400" },
          { label: "Delivered", count: ordersByStatus.delivered, icon: CheckCircle2, cls: "text-green-500" },
        ].map((s) => (
          <Card key={s.label} className="border-border bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.cls}`} />
              <div>
                <p className="font-display text-lg text-foreground">{s.count}</p>
                <p className="font-body text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="font-display text-base">All Orders</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  className="pl-8 h-8 text-xs w-48 bg-secondary/40 border-border"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-8 w-36 text-xs">
                  <Filter className="h-3 w-3 mr-1.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="heroOutline" size="sm" className="h-8 text-xs">
                <Download className="h-3 w-3 mr-1.5" /> Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[11px]">Order</TableHead>
                <TableHead className="text-[11px]">Customer</TableHead>
                <TableHead className="text-[11px]">Items</TableHead>
                <TableHead className="text-[11px]">Status</TableHead>
                <TableHead className="text-[11px]">Date</TableHead>
                <TableHead className="text-[11px] text-right">Total</TableHead>
                <TableHead className="text-[11px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => (
                <TableRow key={order.id} className="hover:bg-secondary/30">
                  <TableCell className="font-body text-xs font-medium text-primary">{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-body text-xs">{order.customer}</p>
                      <p className="font-body text-[10px] text-muted-foreground">{order.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-body text-xs text-muted-foreground max-w-[160px] truncate">
                    {order.items.join(", ")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {statusIcon(order.status)}
                      <Badge variant={statusBadgeVariant(order.status)} className="text-[10px]">
                        {order.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-body text-xs text-muted-foreground">{order.date}</TableCell>
                  <TableCell className="font-body text-xs text-right font-medium">${order.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedOrder(order)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Select value={order.status} onValueChange={(v) => handleStatusChange(order.id, v)}>
                        <SelectTrigger className="h-7 w-[110px] text-[10px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.filter((s) => s !== "All").map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground font-body text-sm">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Order {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">Customer</p>
                  <p className="font-body text-sm text-foreground">{selectedOrder.customer}</p>
                  <p className="font-body text-xs text-muted-foreground">{selectedOrder.email}</p>
                </div>
                <div>
                  <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">Status</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {statusIcon(selectedOrder.status)}
                    <span className="font-body text-sm">{selectedOrder.status}</span>
                  </div>
                </div>
              </div>
              <Separator className="bg-border" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">Fabric</p>
                  <p className="font-body text-sm">{selectedOrder.fabric}</p>
                </div>
                <div>
                  <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">Color</p>
                  <p className="font-body text-sm">{selectedOrder.color}</p>
                </div>
              </div>
              <div>
                <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">Items</p>
                <p className="font-body text-sm">{selectedOrder.items.join(", ")}</p>
              </div>
              <div className="flex items-center gap-2">
                <PackageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-body text-xs text-muted-foreground">
                  Measurements: {selectedOrder.measurements ? "On file ✓" : "Not submitted"}
                </span>
              </div>
              <Separator className="bg-border" />
              <div className="flex justify-between items-center">
                <span className="font-body text-sm text-muted-foreground">Total</span>
                <span className="font-display text-xl text-primary">${selectedOrder.total.toLocaleString()}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminOrders;
