import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Truck, Package, MapPin, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STATUSES = ["All", "Processing", "Picked Up", "In Transit", "Out for Delivery", "Delivered", "Failed"];

const statusColor: Record<string, string> = {
  "Processing": "text-orange-400",
  "Picked Up": "text-blue-400",
  "In Transit": "text-blue-400",
  "Out for Delivery": "text-primary",
  "Delivered": "text-green-500",
  "Failed": "text-destructive",
};

const AdminShipments = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ["admin-shipments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipments")
        .select("*, orders(order_number, customers(name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data.map((s: any) => ({
        ...s,
        order_number: s.orders?.order_number || "",
        customer_name: s.orders?.customers?.name || "",
      }));
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      if (status === "Delivered") updates.actual_delivery = new Date().toISOString().split("T")[0];
      const { error } = await supabase.from("shipments").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shipments"] });
      toast({ title: "Shipment updated" });
    },
  });

  const filtered = shipments.filter((s: any) => {
    const matchSearch = s.tracking_number?.toLowerCase().includes(search.toLowerCase()) ||
      s.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      s.customer_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout title="Shipments" description="Track and manage shipments and deliveries">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Shipments", value: shipments.length },
          { label: "In Transit", value: shipments.filter((s: any) => s.status === "In Transit").length, cls: "text-blue-400" },
          { label: "Out for Delivery", value: shipments.filter((s: any) => s.status === "Out for Delivery").length, cls: "text-primary" },
          { label: "Delivered", value: shipments.filter((s: any) => s.status === "Delivered").length, cls: "text-green-500" },
        ].map(s => (
          <Card key={s.label} className="border-border bg-card">
            <CardContent className="p-4">
              <p className={`font-display text-lg ${(s as any).cls || "text-foreground"}`}>{s.value}</p>
              <p className="font-body text-[10px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="font-display text-base">All Shipments</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8 h-8 text-xs w-44 bg-secondary/40 border-border" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
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
                  <TableHead className="text-[11px]">Tracking #</TableHead>
                  <TableHead className="text-[11px]">Order</TableHead>
                  <TableHead className="text-[11px]">Customer</TableHead>
                  <TableHead className="text-[11px]">Carrier</TableHead>
                  <TableHead className="text-[11px]">Status</TableHead>
                  <TableHead className="text-[11px]">Est. Delivery</TableHead>
                  <TableHead className="text-[11px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s: any) => (
                  <TableRow key={s.id} className="hover:bg-secondary/30">
                    <TableCell className="font-mono text-xs">{s.tracking_number || "—"}</TableCell>
                    <TableCell className="font-body text-xs text-primary">{s.order_number}</TableCell>
                    <TableCell className="font-body text-xs">{s.customer_name}</TableCell>
                    <TableCell className="font-body text-xs text-muted-foreground">{s.carrier || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${statusColor[s.status] || ""}`}>{s.status}</Badge>
                    </TableCell>
                    <TableCell className="font-body text-xs text-muted-foreground">{s.estimated_delivery || "—"}</TableCell>
                    <TableCell>
                      <Select value={s.status} onValueChange={v => updateStatus.mutate({ id: s.id, status: v })}>
                        <SelectTrigger className="h-7 w-[120px] text-[10px]"><SelectValue /></SelectTrigger>
                        <SelectContent>{STATUSES.filter(st => st !== "All").map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground font-body text-sm">No shipments found</TableCell>
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

export default AdminShipments;
