import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Download, Eye, FileText, Loader2, Plus, Send, CheckCircle2, Clock, AlertCircle, XCircle,
} from "lucide-react";

const statusIcon = (s: string) => {
  switch (s) {
    case "Paid": return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
    case "Sent": return <Send className="h-3.5 w-3.5 text-blue-400" />;
    case "Overdue": return <AlertCircle className="h-3.5 w-3.5 text-destructive" />;
    case "Cancelled": return <XCircle className="h-3.5 w-3.5 text-muted-foreground" />;
    default: return <Clock className="h-3.5 w-3.5 text-orange-400" />;
  }
};

const statusBadge = (s: string) => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    Paid: "default", Sent: "secondary", Draft: "outline", Overdue: "destructive", Cancelled: "secondary",
  };
  return <Badge variant={variants[s] || "outline"} className="text-[10px]">{s}</Badge>;
};

// Generate PDF content as a downloadable blob
function generateInvoicePDF(invoice: any, items: any[]) {
  // Build professional invoice HTML
  const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; padding: 40px; max-width: 800px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #c4954a; padding-bottom: 20px; }
  .brand { font-size: 28px; font-weight: 700; letter-spacing: 4px; color: #c4954a; }
  .brand-sub { font-size: 10px; color: #888; letter-spacing: 2px; margin-top: 4px; }
  .inv-title { text-align: right; }
  .inv-title h2 { font-size: 24px; color: #333; }
  .inv-title p { font-size: 12px; color: #888; margin-top: 4px; }
  .info-grid { display: flex; justify-content: space-between; margin-bottom: 30px; }
  .info-block h4 { font-size: 10px; letter-spacing: 2px; color: #888; text-transform: uppercase; margin-bottom: 8px; }
  .info-block p { font-size: 13px; line-height: 1.6; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
  th { background: #f5f0e8; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #666; padding: 10px 12px; text-align: left; }
  td { padding: 12px; font-size: 13px; border-bottom: 1px solid #eee; }
  .text-right { text-align: right; }
  .totals { margin-left: auto; width: 260px; }
  .totals .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
  .totals .row.total { border-top: 2px solid #c4954a; font-size: 18px; font-weight: 700; color: #c4954a; padding-top: 12px; margin-top: 8px; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 11px; color: #aaa; }
  .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; }
  .status-paid { background: #dcfce7; color: #166534; }
  .status-sent { background: #dbeafe; color: #1e40af; }
  .status-draft { background: #f3f4f6; color: #374151; }
  .status-overdue { background: #fef2f2; color: #991b1b; }
</style></head><body>
  <div class="header">
    <div><div class="brand">AUREUM</div><div class="brand-sub">Bespoke Tailoring</div></div>
    <div class="inv-title">
      <h2>INVOICE</h2>
      <p>${invoice.invoice_number}</p>
      <span class="status status-${invoice.status.toLowerCase()}">${invoice.status}</span>
    </div>
  </div>
  <div class="info-grid">
    <div class="info-block">
      <h4>Bill To</h4>
      <p><strong>${invoice.customer_name || "Customer"}</strong></p>
      <p>${invoice.customer_email || ""}</p>
    </div>
    <div class="info-block">
      <h4>Invoice Details</h4>
      <p>Issue Date: ${invoice.issue_date}</p>
      <p>Due Date: ${invoice.due_date}</p>
      <p>Currency: ${invoice.currency || "BDT"}</p>
    </div>
  </div>
  <table>
    <thead><tr><th>Item</th><th>Qty</th><th class="text-right">Unit Price</th><th class="text-right">Total</th></tr></thead>
    <tbody>
      ${items.map(item => `<tr><td>${item.product_name}</td><td>${item.quantity}</td><td class="text-right">${item.unit_price?.toLocaleString()}</td><td class="text-right">${item.total_price?.toLocaleString()}</td></tr>`).join("")}
      ${items.length === 0 ? `<tr><td colspan="4" style="text-align:center;padding:20px;color:#999">No items</td></tr>` : ""}
    </tbody>
  </table>
  <div class="totals">
    <div class="row"><span>Subtotal</span><span>${invoice.subtotal?.toLocaleString()}</span></div>
    <div class="row"><span>Tax</span><span>${invoice.tax?.toLocaleString()}</span></div>
    ${invoice.discount > 0 ? `<div class="row"><span>Discount</span><span>-${invoice.discount?.toLocaleString()}</span></div>` : ""}
    <div class="row total"><span>Total</span><span>${invoice.currency || "BDT"} ${invoice.total?.toLocaleString()}</span></div>
  </div>
  ${invoice.notes ? `<div style="margin-top:30px;padding:16px;background:#f9f7f4;border-radius:6px;font-size:12px;color:#666"><strong>Notes:</strong> ${invoice.notes}</div>` : ""}
  <div class="footer">
    <p>Thank you for your business</p>
    <p style="margin-top:4px">AUREUM Bespoke Tailoring • contact@aureum.com</p>
  </div>
</body></html>`;
  return html;
}

function downloadInvoiceAsPDF(invoice: any, items: any[]) {
  const html = generateInvoicePDF(invoice, items);
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  }
}

const AdminInvoices = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["admin-invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*, orders(order_number, customer_id, customers(name, email))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data.map((inv: any) => ({
        ...inv,
        customer_name: inv.orders?.customers?.name || "Unknown",
        customer_email: inv.orders?.customers?.email || "",
        order_number: inv.orders?.order_number || "",
      }));
    },
  });

  const { data: orderItems = [] } = useQuery({
    queryKey: ["invoice-items", selectedInvoice?.order_id],
    queryFn: async () => {
      if (!selectedInvoice?.order_id) return [];
      const { data, error } = await supabase.from("order_items").select("*").eq("order_id", selectedInvoice.order_id);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedInvoice?.order_id,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      if (status === "Paid") updates.paid_at = new Date().toISOString();
      const { error } = await supabase.from("invoices").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
      toast({ title: "Invoice updated" });
    },
  });

  const filtered = invoices.filter((inv: any) => {
    const matchSearch = inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || inv.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalOutstanding = invoices.filter((i: any) => i.status === "Sent" || i.status === "Overdue").reduce((s: number, i: any) => s + (i.total || 0), 0);
  const totalPaid = invoices.filter((i: any) => i.status === "Paid").reduce((s: number, i: any) => s + (i.total || 0), 0);

  return (
    <AdminLayout title="Invoices" description="Generate, manage, and download invoices">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Invoices", value: invoices.length },
          { label: "Outstanding", value: `৳${totalOutstanding.toLocaleString()}`, cls: "text-orange-400" },
          { label: "Collected", value: `৳${totalPaid.toLocaleString()}`, cls: "text-green-400" },
          { label: "Overdue", value: invoices.filter((i: any) => i.status === "Overdue").length, cls: "text-destructive" },
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
            <CardTitle className="font-display text-base">All Invoices</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8 h-8 text-xs w-44 bg-secondary/40 border-border" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["All", "Draft", "Sent", "Paid", "Overdue", "Cancelled"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
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
                  <TableHead className="text-[11px]">Invoice #</TableHead>
                  <TableHead className="text-[11px]">Customer</TableHead>
                  <TableHead className="text-[11px]">Order</TableHead>
                  <TableHead className="text-[11px]">Status</TableHead>
                  <TableHead className="text-[11px]">Issue Date</TableHead>
                  <TableHead className="text-[11px]">Due Date</TableHead>
                  <TableHead className="text-[11px] text-right">Total</TableHead>
                  <TableHead className="text-[11px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inv: any) => (
                  <TableRow key={inv.id} className="hover:bg-secondary/30">
                    <TableCell className="font-body text-xs font-medium text-primary">{inv.invoice_number}</TableCell>
                    <TableCell>
                      <p className="font-body text-xs">{inv.customer_name}</p>
                      <p className="font-body text-[10px] text-muted-foreground">{inv.customer_email}</p>
                    </TableCell>
                    <TableCell className="font-body text-xs text-muted-foreground">{inv.order_number || "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {statusIcon(inv.status)}
                        {statusBadge(inv.status)}
                      </div>
                    </TableCell>
                    <TableCell className="font-body text-xs text-muted-foreground">{inv.issue_date}</TableCell>
                    <TableCell className="font-body text-xs text-muted-foreground">{inv.due_date}</TableCell>
                    <TableCell className="font-body text-xs text-right font-medium">৳{inv.total?.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedInvoice(inv)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => downloadInvoiceAsPDF(inv, [])}>
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Select value={inv.status} onValueChange={v => updateStatus.mutate({ id: inv.id, status: v })}>
                          <SelectTrigger className="h-7 w-[90px] text-[10px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["Draft", "Sent", "Paid", "Overdue", "Cancelled"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground font-body text-sm">
                      {invoices.length === 0 ? "No invoices yet. Invoices are auto-generated with orders." : "No invoices found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Invoice {selectedInvoice?.invoice_number}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">Customer</p>
                  <p className="font-body text-sm">{selectedInvoice.customer_name}</p>
                  <p className="font-body text-xs text-muted-foreground">{selectedInvoice.customer_email}</p>
                </div>
                <div>
                  <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">Status</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {statusIcon(selectedInvoice.status)}
                    <span className="font-body text-sm">{selectedInvoice.status}</span>
                  </div>
                </div>
              </div>
              <Separator className="bg-border" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">Issue Date</p>
                  <p className="font-body text-sm">{selectedInvoice.issue_date}</p>
                </div>
                <div>
                  <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">Due Date</p>
                  <p className="font-body text-sm">{selectedInvoice.due_date}</p>
                </div>
              </div>

              {orderItems.length > 0 && (
                <>
                  <Separator className="bg-border" />
                  <div>
                    <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-2">Items</p>
                    {orderItems.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center py-1.5">
                        <div>
                          <p className="font-body text-xs">{item.product_name}</p>
                          <p className="font-body text-[10px] text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-body text-xs">৳{item.total_price?.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <Separator className="bg-border" />
              <div className="space-y-1.5 text-xs font-body">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span><span>৳{selectedInvoice.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span><span>৳{selectedInvoice.tax?.toLocaleString()}</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Discount</span><span>-৳{selectedInvoice.discount?.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold text-sm">
                  <span>Total</span><span className="text-primary">৳{selectedInvoice.total?.toLocaleString()}</span>
                </div>
              </div>

              <Button variant="hero" className="w-full" onClick={() => downloadInvoiceAsPDF(selectedInvoice, orderItems)}>
                <Download className="h-4 w-4 mr-2" /> Download Invoice PDF
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminInvoices;
