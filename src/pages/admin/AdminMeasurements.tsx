import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, CheckCircle2, XCircle, Ruler } from "lucide-react";

const measurements = [
  { id: 1, customer: "Alexander M.", orderId: "ORD-007", chest: 40, waist: 34, hips: 38, shoulders: 18.5, sleeveLength: 25, inseam: 32, submitted: "2026-03-08", complete: true },
  { id: 2, customer: "William C.", orderId: "ORD-006", chest: 42, waist: 36, hips: 40, shoulders: 19, sleeveLength: 26, inseam: 33, submitted: "2026-03-07", complete: true },
  { id: 3, customer: "Robert L.", orderId: "ORD-005", chest: null, waist: null, hips: null, shoulders: null, sleeveLength: null, inseam: null, submitted: null, complete: false },
  { id: 4, customer: "Thomas W.", orderId: "ORD-004", chest: 44, waist: 38, hips: 42, shoulders: 20, sleeveLength: 27, inseam: 34, submitted: "2026-03-05", complete: true },
  { id: 5, customer: "David K.", orderId: "ORD-003", chest: 39, waist: 33, hips: 37, shoulders: 18, sleeveLength: 24.5, inseam: 31, submitted: "2026-03-04", complete: true },
  { id: 6, customer: "James H.", orderId: "ORD-001", chest: 41, waist: 35, hips: 39, shoulders: 18.5, sleeveLength: 25.5, inseam: 32, submitted: "2026-02-28", complete: true },
];

const AdminMeasurements = () => {
  const [search, setSearch] = useState("");

  const filtered = measurements.filter((m) =>
    m.customer.toLowerCase().includes(search.toLowerCase()) || m.orderId.toLowerCase().includes(search.toLowerCase())
  );

  const complete = measurements.filter((m) => m.complete).length;
  const pending = measurements.filter((m) => !m.complete).length;

  return (
    <AdminLayout title="Measurements" description="Client body measurement records">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <Ruler className="h-5 w-5 text-primary" />
            <div>
              <p className="font-display text-lg">{measurements.length}</p>
              <p className="font-body text-[10px] text-muted-foreground">Total Records</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-display text-lg">{complete}</p>
              <p className="font-body text-[10px] text-muted-foreground">Complete</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-orange-400" />
            <div>
              <p className="font-display text-lg">{pending}</p>
              <p className="font-body text-[10px] text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="font-display text-base">Measurement Records</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8 h-8 text-xs w-48 bg-secondary/40 border-border" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[11px]">Customer</TableHead>
                <TableHead className="text-[11px]">Order</TableHead>
                <TableHead className="text-[11px]">Chest</TableHead>
                <TableHead className="text-[11px]">Waist</TableHead>
                <TableHead className="text-[11px]">Hips</TableHead>
                <TableHead className="text-[11px]">Shoulders</TableHead>
                <TableHead className="text-[11px]">Sleeve</TableHead>
                <TableHead className="text-[11px]">Inseam</TableHead>
                <TableHead className="text-[11px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id} className="hover:bg-secondary/30">
                  <TableCell className="font-body text-xs font-medium">{m.customer}</TableCell>
                  <TableCell className="font-body text-xs text-primary">{m.orderId}</TableCell>
                  <TableCell className="font-body text-xs text-muted-foreground">{m.chest ?? "—"}"</TableCell>
                  <TableCell className="font-body text-xs text-muted-foreground">{m.waist ?? "—"}"</TableCell>
                  <TableCell className="font-body text-xs text-muted-foreground">{m.hips ?? "—"}"</TableCell>
                  <TableCell className="font-body text-xs text-muted-foreground">{m.shoulders ?? "—"}"</TableCell>
                  <TableCell className="font-body text-xs text-muted-foreground">{m.sleeveLength ?? "—"}"</TableCell>
                  <TableCell className="font-body text-xs text-muted-foreground">{m.inseam ?? "—"}"</TableCell>
                  <TableCell>
                    {m.complete ? (
                      <Badge variant="outline" className="text-[10px] text-green-400 border-green-400/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Complete
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-orange-400 border-orange-400/30">
                        <XCircle className="h-3 w-3 mr-1" /> Pending
                      </Badge>
                    )}
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

export default AdminMeasurements;
