import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, Building2, Banknote } from "lucide-react";

const gateways = [
  { name: "SSLCommerz", icon: CreditCard, status: "Ready to configure", description: "Full payment gateway supporting Visa, MasterCard, bKash, Nagad, Rocket, and more", color: "text-blue-400" },
  { name: "bKash", icon: Smartphone, status: "Ready to configure", description: "Mobile financial service — direct merchant integration for instant payments", color: "text-pink-400" },
  { name: "Nagad", icon: Smartphone, status: "Ready to configure", description: "Digital financial service by Bangladesh Post Office", color: "text-orange-400" },
  { name: "Bank Transfer", icon: Building2, status: "Active", description: "Manual bank transfer with order reference verification", color: "text-green-400" },
  { name: "Cash on Delivery", icon: Banknote, status: "Active", description: "Pay when the order is delivered to your doorstep", color: "text-primary" },
];

const AdminPayments = () => (
  <AdminLayout title="Payments" description="Manage payment gateways — bKash, Nagad, SSLCommerz">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {gateways.map(gw => (
        <Card key={gw.name} className="border-border bg-card hover:border-primary/20 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <gw.icon className={`h-6 w-6 ${gw.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base text-foreground">{gw.name}</h3>
                  <Badge variant={gw.status === "Active" ? "default" : "outline"} className="text-[10px]">{gw.status}</Badge>
                </div>
                <p className="font-body text-xs text-muted-foreground mt-1">{gw.description}</p>
                <p className="font-body text-[10px] text-muted-foreground/60 mt-3">
                  {gw.status === "Active" ? "✓ Gateway is active and receiving payments" : "API keys needed to activate. Configure when ready."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    <Card className="border-border bg-card mt-6">
      <CardContent className="p-6 text-center">
        <p className="font-body text-xs text-muted-foreground">
          Payment gateway integration is UI-ready. Provide your merchant API keys when you're ready to activate bKash, Nagad, or SSLCommerz.
        </p>
      </CardContent>
    </Card>
  </AdminLayout>
);

export default AdminPayments;
