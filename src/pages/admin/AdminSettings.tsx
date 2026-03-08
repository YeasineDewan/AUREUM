import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Save, Store, Mail, CreditCard, Globe, Shield } from "lucide-react";

const AdminSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    storeName: "AUREUM",
    email: "admin@aureum.com",
    phone: "+1 555-0100",
    address: "123 Fifth Avenue, New York, NY 10001",
    currency: "USD",
    taxRate: "8",
    freeShippingThreshold: "1000",
    emailNotifications: true,
    orderConfirmation: true,
    shippingUpdates: true,
    lowStockAlerts: true,
    maintenanceMode: false,
  });

  const handleSave = () => {
    toast({ title: "Settings saved", description: "Your changes have been applied." });
  };

  return (
    <AdminLayout title="Settings" description="Configure your store and preferences">
      <div className="max-w-3xl space-y-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" /> Store Information
            </CardTitle>
            <CardDescription className="font-body text-xs">Basic store details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-body text-xs">Store Name</Label>
                <Input value={settings.storeName} onChange={(e) => setSettings((s) => ({ ...s, storeName: e.target.value }))} className="bg-secondary/40 border-border" />
              </div>
              <div className="space-y-2">
                <Label className="font-body text-xs">Email</Label>
                <Input value={settings.email} onChange={(e) => setSettings((s) => ({ ...s, email: e.target.value }))} className="bg-secondary/40 border-border" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-body text-xs">Phone</Label>
                <Input value={settings.phone} onChange={(e) => setSettings((s) => ({ ...s, phone: e.target.value }))} className="bg-secondary/40 border-border" />
              </div>
              <div className="space-y-2">
                <Label className="font-body text-xs">Currency</Label>
                <Input value={settings.currency} onChange={(e) => setSettings((s) => ({ ...s, currency: e.target.value }))} className="bg-secondary/40 border-border" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-body text-xs">Address</Label>
              <Input value={settings.address} onChange={(e) => setSettings((s) => ({ ...s, address: e.target.value }))} className="bg-secondary/40 border-border" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> Commerce Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-body text-xs">Tax Rate (%)</Label>
                <Input type="number" value={settings.taxRate} onChange={(e) => setSettings((s) => ({ ...s, taxRate: e.target.value }))} className="bg-secondary/40 border-border" />
              </div>
              <div className="space-y-2">
                <Label className="font-body text-xs">Free Shipping Threshold ($)</Label>
                <Input type="number" value={settings.freeShippingThreshold} onChange={(e) => setSettings((s) => ({ ...s, freeShippingThreshold: e.target.value }))} className="bg-secondary/40 border-border" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "emailNotifications" as const, label: "Email Notifications", desc: "Receive email notifications for new orders" },
              { key: "orderConfirmation" as const, label: "Order Confirmations", desc: "Send confirmation emails to customers" },
              { key: "shippingUpdates" as const, label: "Shipping Updates", desc: "Notify customers of shipping status changes" },
              { key: "lowStockAlerts" as const, label: "Low Stock Alerts", desc: "Get notified when product stock is low" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="font-body text-sm text-foreground">{item.label}</p>
                  <p className="font-body text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={settings[item.key]}
                  onCheckedChange={(v) => setSettings((s) => ({ ...s, [item.key]: v }))}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Advanced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-sm text-foreground">Maintenance Mode</p>
                <p className="font-body text-xs text-muted-foreground">Temporarily disable the storefront for maintenance</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(v) => setSettings((s) => ({ ...s, maintenanceMode: v }))}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button variant="hero" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" /> Save Settings
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
