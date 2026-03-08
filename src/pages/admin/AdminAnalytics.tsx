import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { TrendingUp, Users, ShoppingCart, DollarSign, ArrowUpRight } from "lucide-react";

const monthlyRevenue = [
  { month: "Apr '25", revenue: 12400 }, { month: "May", revenue: 15200 }, { month: "Jun", revenue: 18100 },
  { month: "Jul", revenue: 16800 }, { month: "Aug", revenue: 21300 }, { month: "Sep", revenue: 19500 },
  { month: "Oct", revenue: 18400 }, { month: "Nov", revenue: 22100 }, { month: "Dec", revenue: 31500 },
  { month: "Jan '26", revenue: 24800 }, { month: "Feb", revenue: 27300 }, { month: "Mar", revenue: 19200 },
];

const ordersByCategory = [
  { category: "Suits", orders: 42 }, { category: "Shirts", orders: 68 },
  { category: "Blazers", orders: 24 }, { category: "Trousers", orders: 38 },
  { category: "Outerwear", orders: 15 }, { category: "Accessories", orders: 22 },
];

const conversionData = [
  { month: "Oct", visitors: 1200, buyers: 48 }, { month: "Nov", visitors: 1400, buyers: 56 },
  { month: "Dec", visitors: 2100, buyers: 84 }, { month: "Jan", visitors: 1600, buyers: 60 },
  { month: "Feb", visitors: 1800, buyers: 72 }, { month: "Mar", visitors: 1300, buyers: 45 },
];

const topCities = [
  { city: "New York", revenue: 42000, orders: 38 },
  { city: "London", revenue: 35000, orders: 28 },
  { city: "Paris", revenue: 28000, orders: 22 },
  { city: "San Francisco", revenue: 21000, orders: 18 },
  { city: "Miami", revenue: 14000, orders: 12 },
];

const CHART_COLORS = ["hsl(38,70%,50%)", "hsl(38,60%,65%)", "hsl(38,80%,35%)", "hsl(0,0%,40%)", "hsl(0,0%,55%)", "hsl(38,50%,45%)"];

const chartTooltipStyle = { background: "hsl(0,0%,10%)", border: "1px solid hsl(0,0%,18%)", borderRadius: 6, fontSize: 12 };

const AdminAnalytics = () => {
  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
  const avgOrderValue = Math.round(totalRevenue / 142);
  const conversionRate = ((conversionData.reduce((s, d) => s + d.buyers, 0) / conversionData.reduce((s, d) => s + d.visitors, 0)) * 100).toFixed(1);

  return (
    <AdminLayout title="Analytics" description="Business intelligence and performance metrics">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Annual Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, change: "+18.2%" },
          { label: "Avg. Order Value", value: `$${avgOrderValue}`, icon: ShoppingCart, change: "+5.4%" },
          { label: "Conversion Rate", value: `${conversionRate}%`, icon: TrendingUp, change: "+1.2%" },
          { label: "Repeat Customers", value: "62%", icon: Users, change: "+8.7%" },
        ].map((s) => (
          <Card key={s.label} className="border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-4 w-4 text-primary" />
                </div>
                <Badge variant="outline" className="text-[10px] text-green-400 border-green-400/30">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" /> {s.change}
                </Badge>
              </div>
              <p className="font-display text-2xl text-foreground">{s.value}</p>
              <p className="font-body text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">Monthly Revenue (12 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(38,70%,50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(38,70%,50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,15%)" />
                <XAxis dataKey="month" stroke="hsl(40,10%,45%)" fontSize={10} tickLine={false} />
                <YAxis stroke="hsl(40,10%,45%)" fontSize={10} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(38,70%,50%)" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">Orders by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ordersByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,15%)" horizontal={false} />
                <XAxis type="number" stroke="hsl(40,10%,45%)" fontSize={10} tickLine={false} />
                <YAxis type="category" dataKey="category" stroke="hsl(40,10%,45%)" fontSize={10} tickLine={false} width={80} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="orders" fill="hsl(38,70%,50%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <Card className="xl:col-span-3 border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">Visitors vs. Buyers</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,15%)" />
                <XAxis dataKey="month" stroke="hsl(40,10%,45%)" fontSize={10} tickLine={false} />
                <YAxis stroke="hsl(40,10%,45%)" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Line type="monotone" dataKey="visitors" stroke="hsl(0,0%,55%)" strokeWidth={2} dot={{ fill: "hsl(0,0%,55%)" }} name="Visitors" />
                <Line type="monotone" dataKey="buyers" stroke="hsl(38,70%,50%)" strokeWidth={2} dot={{ fill: "hsl(38,70%,50%)" }} name="Buyers" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2 border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">Top Markets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCities.map((city, i) => (
              <div key={city.city} className="flex items-center gap-3">
                <span className="font-display text-xs text-muted-foreground w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-body text-xs">{city.city}</span>
                    <span className="font-body text-xs text-primary">${city.revenue.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(city.revenue / topCities[0].revenue) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
