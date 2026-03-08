import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="h-14 flex items-center gap-4 border-b border-border bg-card/60 backdrop-blur-sm px-4 shrink-0">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex-1 flex items-center gap-4">
              <div className="relative max-w-sm hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search orders, products, customers..."
                  className="pl-9 h-8 bg-secondary/40 border-border text-xs w-72"
                />
              </div>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-destructive text-destructive-foreground text-[8px] rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
            <div className="flex items-center gap-3 pl-3 border-l border-border">
              <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                <span className="font-display text-[10px] text-primary">AE</span>
              </div>
              <div className="hidden sm:block">
                <p className="font-body text-xs text-foreground leading-none">Admin</p>
                <p className="font-body text-[10px] text-muted-foreground">admin@aureum.com</p>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h1 className="font-display text-2xl text-foreground">{title}</h1>
              {description && (
                <p className="font-body text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
