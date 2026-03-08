import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import {
  DollarSign, ShoppingCart, Package, Users, TrendingUp, TrendingDown, ArrowUpRight,
  Clock, CheckCircle2, Truck, AlertCircle,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const revenueData = [
  { month: "Sep", revenue: 14200 }, { month: "Oct", revenue: 18400 }, { month: "Nov", revenue: 22100 },
  { month: "Dec", revenue: 31500 }, { month: "Jan", revenue: 24800 }, { month: "Feb", revenue: 27300 },
  { month: "Mar", revenue: 19200 },
];

const dailyOrders = [
  { day: "Mon", orders: 5 }, { day: "Tue", orders: 8 }, { day: "Wed", orders: 6 },
  { day: "Thu", orders: 12 }, { day: "Fri", orders: 9 }, { day: "Sat", orders: 14 }, { day: "Sun", orders: 3 },
];

const categoryData = [
  { name: "Suits", value: 42, revenue: 58200 },
  { name: "Shirts", value: 28, revenue: 18400 },
  { name: "Outerwear", value: 15, revenue: 22500 },
  { name: "Trousers", value: 15, revenue: 12600 },
];

const CHART_COLORS = ["hsl(38,70%,50%)", "hsl(38,60%,65%)", "hsl(38,80%,35%)", "hsl(0,0%,40%)"];

const recentOrders = [
  { id: "ORD-007", customer: "Alexander M.", item: "Bespoke 3-Piece Suit", total: 3200, status: "In Production", time: "2h ago" },
  { id: "ORD-006", customer: "William C.", item: "Cashmere Blazer", total: 1450, status: "Shipped", time: "4h ago" },
  { id: "ORD-005", customer: "Robert L.", item: "Trousers x2", total: 580, status: "In Production", time: "6h ago" },
  { id: "ORD-004", customer: "Thomas W.", item: "Regent Overcoat", total: 1800, status: "Delivered", time: "1d ago" },
  { id: "ORD-003", customer: "David K.", item: "Custom Shirt x5", total: 1150, status: "Pending", time: "1d ago" },
];

const topProducts = [
  { name: "The Sovereign Suit", sold: 24, revenue: 30960 },
  { name: "Cashmere Overcoat", sold: 12, revenue: 21600 },
  { name: "Monarch Blazer", sold: 18, revenue: 12240 },
  { name: "Egyptian Cotton Shirt", sold: 45, revenue: 10350 },
];

const statusIcon = (status: string) => {
  switch (status) {
    case "Delivered": return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
    case "Shipped": return <Truck className="h-3.5 w-3.5 text-blue-400" />;
    case "In Production": return <Clock className="h-3.5 w-3.5 text-primary" />;
    default: return <AlertCircle className="h-3.5 w-3.5 text-orange-400" />;
  }
};

const chartTooltipStyle = {
  background: "hsl(0,0%,10%)",
  border: "1px solid hsl(0,0%,18%)",
  borderRadius: 6,
  fontSize: 12,
};

const AdminDashboard = () => {
  const stats = [
    {
      label: "Total Revenue",
      value: "$157,500",
      change: "+12.5%",
      trend: "up" as const,
      icon: DollarSign,
      sub: "vs. last month",
    },
    {
      label: "Orders",
      value: "142",
      change: "+8.2%",
      trend: "up" as const,
      icon: ShoppingCart,
      sub: "this month",
    },
    {
      label: "Products",
      value: "38",
      change: "+3",
      trend: "up" as const,
      icon: Package,
      sub: "active in catalog",
    },
    {
      label: "Customers",
      value: "84",
      change: "-2.1%",
      trend: "down" as const,
      icon: Users,
      sub: "active clients",
    },
  ];

  return (
    <AdminLayout title="Dashboard" description="Overview of your atelier's performance">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border bg-card hover:border-primary/20 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-body ${
                    stat.trend === "up"
                      ? "text-green-400 border-green-400/30"
                      : "text-red-400 border-red-400/30"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {stat.change}
                </Badge>
              </div>
              <p className="font-display text-2xl text-foreground">{stat.value}</p>
              <p className="font-body text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Revenue Trend */}
        <Card className="xl:col-span-2 border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-base">Revenue Trend</CardTitle>
              <Badge variant="outline" className="text-[10px] font-body text-primary border-primary/30">
                Last 7 months
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(38,70%,50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(38,70%,50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,15%)" />
                <XAxis dataKey="month" stroke="hsl(40,10%,45%)" fontSize={11} tickLine={false} />
                <YAxis stroke="hsl(40,10%,45%)" fontSize={11} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(38,70%,50%)" strokeWidth={2} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {categoryData.map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                  <span className="font-body text-[11px] text-muted-foreground">{cat.name}</span>
                  <span className="font-body text-[11px] text-foreground ml-auto">{cat.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Recent Orders */}
        <Card className="xl:col-span-3 border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-base">Recent Orders</CardTitle>
              <a href="/admin/orders" className="font-body text-xs text-primary hover:underline flex items-center gap-1">
                View all <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[11px]">Order</TableHead>
                  <TableHead className="text-[11px]">Customer</TableHead>
                  <TableHead className="text-[11px]">Item</TableHead>
                  <TableHead className="text-[11px]">Status</TableHead>
                  <TableHead className="text-[11px] text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-secondary/30">
                    <TableCell className="font-body text-xs font-medium">{order.id}</TableCell>
                    <TableCell className="font-body text-xs">{order.customer}</TableCell>
                    <TableCell className="font-body text-xs text-muted-foreground max-w-[140px] truncate">{order.item}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {statusIcon(order.status)}
                        <span className="font-body text-[11px]">{order.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-body text-xs text-right">${order.total.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Products + Daily Orders */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">Top Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topProducts.map((product, i) => (
                <div key={product.name} className="flex items-center gap-3">
                  <span className="font-display text-xs text-muted-foreground w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-xs text-foreground truncate">{product.name}</p>
                    <p className="font-body text-[10px] text-muted-foreground">{product.sold} sold</p>
                  </div>
                  <span className="font-body text-xs text-primary">${product.revenue.toLocaleString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">Daily Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={dailyOrders}>
                  <Bar dataKey="orders" fill="hsl(38,70%,50%)" radius={[3, 3, 0, 0]} />
                  <XAxis dataKey="day" stroke="hsl(40,10%,45%)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
