import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingBag, Package, Truck, FileText, User, MapPin, CreditCard, Download,
  CheckCircle2, Clock, AlertCircle, ChevronRight,
} from "lucide-react";

// Mock data for customer dashboard (will connect to DB with auth)
const mockOrders = [
  { id: "ORD-007", items: "Bespoke 3-Piece Suit", total: 3200, status: "In Production", date: "2026-03-08", tracking: "" },
  { id: "ORD-004", items: "Regent Overcoat", total: 1800, status: "Shipped", date: "2026-03-06", tracking: "TRK-88712" },
  { id: "ORD-001", items: "Bespoke Suit", total: 2450, status: "Delivered", date: "2026-03-01", tracking: "TRK-88234" },
];

const mockInvoices = [
  { id: "INV-007", amount: 3200, status: "Paid", date: "2026-03-08" },
  { id: "INV-004", amount: 1800, status: "Paid", date: "2026-03-06" },
  { id: "INV-001", amount: 2450, status: "Paid", date: "2026-03-01" },
];

const mockMeasurements = {
  height: '70"', chest: '40"', waist: '34"', hips: '38"', shoulders: '18"',
  sleeveLength: '25"', inseam: '32"', neck: '15.5"', bodyType: "Athletic",
};

const statusIcon = (s: string) => {
  switch (s) {
    case "Delivered": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "Shipped": return <Truck className="h-4 w-4 text-blue-400" />;
    case "In Production": return <Clock className="h-4 w-4 text-primary" />;
    default: return <AlertCircle className="h-4 w-4 text-orange-400" />;
  }
};

const CustomerDashboard = () => {
  const totalSpent = mockOrders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl text-foreground">My Dashboard</h1>
              <p className="font-body text-xs text-muted-foreground">Manage your orders, invoices, measurements and preferences</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total Orders", value: mockOrders.length, icon: ShoppingBag },
              { label: "Total Spent", value: `৳${totalSpent.toLocaleString()}`, icon: CreditCard },
              { label: "In Progress", value: mockOrders.filter(o => o.status !== "Delivered").length, icon: Package },
              { label: "Delivered", value: mockOrders.filter(o => o.status === "Delivered").length, icon: CheckCircle2 },
            ].map(s => (
              <Card key={s.label} className="border-border bg-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-lg text-foreground">{s.value}</p>
                    <p className="font-body text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="orders" className="space-y-4">
            <TabsList className="bg-secondary w-full grid grid-cols-4">
              <TabsTrigger value="orders" className="text-xs"><ShoppingBag className="h-3.5 w-3.5 mr-1.5" /> Orders</TabsTrigger>
              <TabsTrigger value="invoices" className="text-xs"><FileText className="h-3.5 w-3.5 mr-1.5" /> Invoices</TabsTrigger>
              <TabsTrigger value="measurements" className="text-xs"><User className="h-3.5 w-3.5 mr-1.5" /> Measurements</TabsTrigger>
              <TabsTrigger value="profile" className="text-xs"><MapPin className="h-3.5 w-3.5 mr-1.5" /> Profile</TabsTrigger>
            </TabsList>

            {/* ORDERS */}
            <TabsContent value="orders">
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base">Order History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/20 transition-colors">
                      <div className="flex items-center gap-4">
                        {statusIcon(order.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-body text-sm font-medium text-primary">{order.id}</p>
                            <Badge variant={order.status === "Delivered" ? "default" : "outline"} className="text-[10px]">{order.status}</Badge>
                          </div>
                          <p className="font-body text-xs text-muted-foreground">{order.items}</p>
                          <p className="font-body text-[10px] text-muted-foreground mt-0.5">{order.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-sm text-foreground">৳{order.total.toLocaleString()}</p>
                        {order.tracking && (
                          <p className="font-mono text-[10px] text-muted-foreground mt-1">
                            <Truck className="h-3 w-3 inline mr-1" />{order.tracking}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* INVOICES */}
            <TabsContent value="invoices">
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base">Invoices & Payments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockInvoices.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-body text-sm font-medium">{inv.id}</p>
                          <p className="font-body text-[10px] text-muted-foreground">{inv.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-body text-sm">৳{inv.amount.toLocaleString()}</p>
                          <Badge variant="outline" className="text-[10px] text-green-400 border-green-400/30">{inv.status}</Badge>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* MEASUREMENTS */}
            <TabsContent value="measurements">
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base">Saved Body Measurements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(mockMeasurements).map(([key, value]) => (
                      <div key={key} className="p-3 rounded-lg bg-secondary/30 border border-border">
                        <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">{key.replace(/([A-Z])/g, " $1")}</p>
                        <p className="font-display text-lg text-foreground mt-1">{value}</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="heroOutline" className="w-full mt-4 text-xs">
                    Update Measurements via AI Scanner
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PROFILE */}
            <TabsContent value="profile">
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base">Profile & Addresses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-border">
                      <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-2">Personal Info</p>
                      <p className="font-body text-sm text-foreground">Customer Name</p>
                      <p className="font-body text-xs text-muted-foreground">customer@email.com</p>
                      <p className="font-body text-xs text-muted-foreground">+880 1XXXXXXXXX</p>
                    </div>
                    <div className="p-4 rounded-lg border border-border">
                      <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-2">Shipping Address</p>
                      <p className="font-body text-sm text-foreground">House 12, Road 5</p>
                      <p className="font-body text-xs text-muted-foreground">Dhanmondi, Dhaka 1205</p>
                      <p className="font-body text-xs text-muted-foreground">Bangladesh</p>
                    </div>
                  </div>
                  <p className="font-body text-[10px] text-muted-foreground text-center">
                    Sign in to save your profile data and sync across devices
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CustomerDashboard;
