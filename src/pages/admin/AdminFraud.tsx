import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ShieldAlert, ShieldCheck, ShieldX, AlertTriangle, Loader2 } from "lucide-react";

const AdminFraud = () => {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-fraud-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, customers(name, email, fraud_score)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const flaggedOrders = orders.filter((o: any) => o.fraud_flag);
  const highRiskCustomers = orders.filter((o: any) => o.customers?.fraud_score > 70);

  // Simple fraud indicators
  const fraudIndicators = [
    { label: "Flagged Orders", value: flaggedOrders.length, icon: ShieldX, cls: "text-destructive" },
    { label: "High Risk Customers", value: highRiskCustomers.length, icon: AlertTriangle, cls: "text-orange-400" },
    { label: "Clean Orders", value: orders.filter((o: any) => !o.fraud_flag).length, icon: ShieldCheck, cls: "text-green-500" },
    { label: "Total Monitored", value: orders.length, icon: ShieldAlert, cls: "text-primary" },
  ];

  return (
    <AdminLayout title="Fraud Detection" description="Monitor orders and customers for suspicious activity">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {fraudIndicators.map(f => (
          <Card key={f.label} className="border-border bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <f.icon className={`h-5 w-5 ${f.cls}`} />
              <div>
                <p className={`font-display text-lg ${f.cls}`}>{f.value}</p>
                <p className="font-body text-[10px] text-muted-foreground">{f.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fraud rules info */}
      <Card className="border-border bg-card mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base">Fraud Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { rule: "High Value Order", desc: "Orders above ৳50,000 are auto-flagged for review", severity: "Medium" },
              { rule: "Multiple Failed Payments", desc: "3+ failed payment attempts from same customer", severity: "High" },
              { rule: "Mismatched Shipping", desc: "Billing and shipping addresses in different regions", severity: "Low" },
              { rule: "New Customer + High Value", desc: "First-time customers with orders above ৳30,000", severity: "Medium" },
              { rule: "Rapid Order Frequency", desc: "More than 3 orders within 1 hour", severity: "High" },
              { rule: "Disposable Email", desc: "Email from known temporary/disposable providers", severity: "High" },
            ].map(r => (
              <div key={r.rule} className="p-3 rounded border border-border bg-secondary/20">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-body text-xs font-medium text-foreground">{r.rule}</p>
                  <Badge variant={r.severity === "High" ? "destructive" : r.severity === "Medium" ? "outline" : "secondary"} className="text-[9px]">{r.severity}</Badge>
                </div>
                <p className="font-body text-[10px] text-muted-foreground">{r.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Flagged orders */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">All Orders — Fraud Status</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[11px]">Order</TableHead>
                  <TableHead className="text-[11px]">Customer</TableHead>
                  <TableHead className="text-[11px] text-right">Total</TableHead>
                  <TableHead className="text-[11px]">Payment</TableHead>
                  <TableHead className="text-[11px]">Fraud Flag</TableHead>
                  <TableHead className="text-[11px]">Risk Score</TableHead>
                  <TableHead className="text-[11px]">Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o: any) => (
                  <TableRow key={o.id} className={`hover:bg-secondary/30 ${o.fraud_flag ? "bg-destructive/5" : ""}`}>
                    <TableCell className="font-body text-xs font-medium text-primary">{o.order_number}</TableCell>
                    <TableCell className="font-body text-xs">{o.customers?.name || "Unknown"}</TableCell>
                    <TableCell className="font-body text-xs text-right">৳{o.total?.toLocaleString()}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{o.payment_status}</Badge></TableCell>
                    <TableCell>
                      {o.fraud_flag ? (
                        <Badge variant="destructive" className="text-[10px]"><ShieldX className="h-3 w-3 mr-1" /> Flagged</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-green-400 border-green-400/30"><ShieldCheck className="h-3 w-3 mr-1" /> Clear</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`font-body text-xs ${(o.customers?.fraud_score || 0) > 70 ? "text-destructive" : (o.customers?.fraud_score || 0) > 40 ? "text-orange-400" : "text-green-400"}`}>
                        {o.customers?.fraud_score || 0}%
                      </span>
                    </TableCell>
                    <TableCell className="font-body text-[10px] text-muted-foreground max-w-[200px] truncate">{o.fraud_reason || "—"}</TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground font-body text-sm">No orders to monitor</TableCell>
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

export default AdminFraud;
