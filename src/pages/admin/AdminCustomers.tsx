import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Search, Mail, Phone, MapPin, Calendar, ShoppingBag, DollarSign } from "lucide-react";

const customers = [
  { id: 1, name: "Alexander Mitchell", email: "alex.m@email.com", phone: "+1 555-0101", city: "New York", orders: 8, spent: 12400, lastOrder: "2026-03-08", status: "VIP", joined: "2025-06-14" },
  { id: 2, name: "William Chen", email: "will.c@email.com", phone: "+1 555-0102", city: "San Francisco", orders: 5, spent: 8200, lastOrder: "2026-03-07", status: "Active", joined: "2025-09-22" },
  { id: 3, name: "Robert Laurent", email: "rob.l@email.com", phone: "+1 555-0103", city: "Chicago", orders: 3, spent: 4800, lastOrder: "2026-03-07", status: "Active", joined: "2025-11-08" },
  { id: 4, name: "Thomas Wright", email: "tom.w@email.com", phone: "+1 555-0104", city: "London", orders: 12, spent: 18600, lastOrder: "2026-03-06", status: "VIP", joined: "2025-03-15" },
  { id: 5, name: "David Kim", email: "david.k@email.com", phone: "+1 555-0105", city: "Los Angeles", orders: 6, spent: 7500, lastOrder: "2026-03-05", status: "Active", joined: "2025-08-01" },
  { id: 6, name: "Michael Romano", email: "mike.r@email.com", phone: "+1 555-0106", city: "Miami", orders: 2, spent: 2300, lastOrder: "2026-02-28", status: "New", joined: "2026-02-10" },
  { id: 7, name: "James Harrison", email: "james.h@email.com", phone: "+1 555-0107", city: "Boston", orders: 4, spent: 5800, lastOrder: "2026-03-01", status: "Active", joined: "2025-07-19" },
  { id: 8, name: "Edward Blackwell", email: "ed.b@email.com", phone: "+1 555-0108", city: "Paris", orders: 15, spent: 24200, lastOrder: "2026-03-04", status: "VIP", joined: "2024-12-01" },
];

const AdminCustomers = () => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<typeof customers[0] | null>(null);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalSpent = customers.reduce((s, c) => s + c.spent, 0);
  const vipCount = customers.filter((c) => c.status === "VIP").length;

  return (
    <AdminLayout title="Customers" description="Manage your client relationships">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="font-display text-lg text-foreground">{customers.length}</p>
            <p className="font-body text-[10px] text-muted-foreground">Total Clients</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="font-display text-lg text-primary">{vipCount}</p>
            <p className="font-body text-[10px] text-muted-foreground">VIP Members</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="font-display text-lg text-foreground">${totalSpent.toLocaleString()}</p>
            <p className="font-body text-[10px] text-muted-foreground">Lifetime Revenue</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="font-display text-lg text-foreground">${Math.round(totalSpent / customers.length).toLocaleString()}</p>
            <p className="font-body text-[10px] text-muted-foreground">Avg. per Client</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="font-display text-base">All Customers</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search customers..." className="pl-8 h-8 text-xs w-56 bg-secondary/40 border-border" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[11px]">Customer</TableHead>
                <TableHead className="text-[11px]">Location</TableHead>
                <TableHead className="text-[11px]">Orders</TableHead>
                <TableHead className="text-[11px] text-right">Total Spent</TableHead>
                <TableHead className="text-[11px]">Last Order</TableHead>
                <TableHead className="text-[11px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="hover:bg-secondary/30 cursor-pointer" onClick={() => setSelected(c)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-display">
                          {c.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-body text-xs font-medium">{c.name}</p>
                        <p className="font-body text-[10px] text-muted-foreground">{c.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-body text-xs text-muted-foreground">{c.city}</TableCell>
                  <TableCell className="font-body text-xs">{c.orders}</TableCell>
                  <TableCell className="font-body text-xs text-right font-medium">${c.spent.toLocaleString()}</TableCell>
                  <TableCell className="font-body text-xs text-muted-foreground">{c.lastOrder}</TableCell>
                  <TableCell>
                    <Badge
                      variant={c.status === "VIP" ? "default" : c.status === "New" ? "outline" : "secondary"}
                      className="text-[10px]"
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Customer Profile</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-display">
                    {selected.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-display text-lg">{selected.name}</p>
                  <Badge variant={selected.status === "VIP" ? "default" : "secondary"} className="text-[10px]">
                    {selected.status}
                  </Badge>
                </div>
              </div>
              <Separator className="bg-border" />
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-body text-xs">{selected.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-body text-xs">{selected.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-body text-xs">{selected.city}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-body text-xs">Member since {selected.joined}</span>
                </div>
              </div>
              <Separator className="bg-border" />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-display text-lg">{selected.orders}</p>
                    <p className="font-body text-[10px] text-muted-foreground">Orders</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-display text-lg">${selected.spent.toLocaleString()}</p>
                    <p className="font-body text-[10px] text-muted-foreground">Total Spent</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCustomers;
