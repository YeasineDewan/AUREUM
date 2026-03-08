import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Ruler,
  Settings,
  ArrowLeft,
  TrendingUp,
  Bell,
  FileText,
  CreditCard,
  Truck,
  ShieldAlert,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Invoices", url: "/admin/invoices", icon: FileText },
  { title: "Customers", url: "/admin/customers", icon: Users },
  { title: "Measurements", url: "/admin/measurements", icon: Ruler },
  { title: "Analytics", url: "/admin/analytics", icon: TrendingUp },
  { title: "Payments", url: "/admin/payments", icon: CreditCard },
  { title: "Shipments", url: "/admin/shipments", icon: Truck },
  { title: "Fraud Check", url: "/admin/fraud", icon: ShieldAlert },
];

const secondaryNav = [
  { title: "Notifications", url: "/admin/notifications", icon: Bell },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4 border-b border-border">
        <a href="/admin" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary/15 flex items-center justify-center shrink-0">
            <LayoutDashboard className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <div>
              <p className="font-display text-sm tracking-wider text-foreground">AUREUM</p>
              <p className="font-body text-[10px] text-muted-foreground tracking-wide">Admin Panel</p>
            </div>
          )}
        </a>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-body text-[10px] tracking-widest uppercase text-muted-foreground/60">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <span className="font-body text-sm">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-body text-[10px] tracking-widest uppercase text-muted-foreground/60">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <span className="font-body text-sm">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <a
          href="/"
          className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <span className="font-body text-xs tracking-wide">Back to Store</span>
          )}
        </a>
      </SidebarFooter>
    </Sidebar>
  );
}
