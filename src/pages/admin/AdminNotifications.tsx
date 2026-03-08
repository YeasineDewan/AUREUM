import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, ShoppingCart, Package, AlertTriangle, CheckCircle2, Info } from "lucide-react";

const notifications = [
  { id: 1, type: "order", icon: ShoppingCart, title: "New order received", desc: "Alexander M. placed order ORD-007 for $3,200", time: "2 hours ago", read: false },
  { id: 2, type: "stock", icon: AlertTriangle, title: "Low stock alert", desc: "Cashmere Overcoat is running low (8 remaining)", time: "4 hours ago", read: false },
  { id: 3, type: "order", icon: CheckCircle2, title: "Order delivered", desc: "ORD-004 was successfully delivered to Thomas W.", time: "6 hours ago", read: false },
  { id: 4, type: "system", icon: Info, title: "System update", desc: "New analytics features are now available", time: "1 day ago", read: true },
  { id: 5, type: "order", icon: ShoppingCart, title: "New order received", desc: "William C. placed order ORD-006 for $1,450", time: "1 day ago", read: true },
  { id: 6, type: "stock", icon: Package, title: "Product out of stock", desc: "Linen Summer Suit is now out of stock", time: "2 days ago", read: true },
  { id: 7, type: "order", icon: ShoppingCart, title: "New order received", desc: "Robert L. placed order ORD-005 for $580", time: "2 days ago", read: true },
];

const iconColor = (type: string) => {
  switch (type) {
    case "order": return "text-primary";
    case "stock": return "text-orange-400";
    case "system": return "text-blue-400";
    default: return "text-muted-foreground";
  }
};

const AdminNotifications = () => {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <AdminLayout title="Notifications" description="Stay updated on your store activity">
      <div className="max-w-2xl space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-4 w-4 text-primary" />
          <span className="font-body text-xs text-muted-foreground">{unread} unread notifications</span>
        </div>

        {notifications.map((n) => (
          <Card
            key={n.id}
            className={`border-border bg-card transition-colors ${!n.read ? "border-l-2 border-l-primary" : ""}`}
          >
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5`}>
                <n.icon className={`h-4 w-4 ${iconColor(n.type)}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-body text-sm text-foreground">{n.title}</p>
                  {!n.read && <Badge variant="default" className="text-[8px] px-1.5 py-0">New</Badge>}
                </div>
                <p className="font-body text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                <p className="font-body text-[10px] text-muted-foreground/60 mt-1">{n.time}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
