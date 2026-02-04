import { useState, useEffect } from "react";
import {
  TrendingDown,
  TrendingUp,
  ArrowUpRight,
  Filter,
  Download,
  Calendar as CalendarIcon,
  ShoppingBag,
  Car,
  Home,
  Utensils,
  Film,
  Zap,
  Heart,
  MoreHorizontal,
  Loader2,
  Wallet,
  Smartphone,
  Coffee,
  Plane
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase, type Transaction } from "@/lib/supabase";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";

// --- Configuration & Helpers ---
const COLORS = [
  "#6366f1", // Indigo (Primary)
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#f97316", // Orange
  "#eab308", // Yellow
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
];

const getCategoryConfig = (category: string) => {
  const normalized = category.toLowerCase();

  if (normalized.includes("shop") || normalized.includes("amazon") || normalized.includes("cloth"))
    return { icon: ShoppingBag, color: COLORS[0], bg: "bg-indigo-500/10 text-indigo-500" };

  if (normalized.includes("food") || normalized.includes("dining") || normalized.includes("restau") || normalized.includes("burger"))
    return { icon: Utensils, color: COLORS[4], bg: "bg-orange-500/10 text-orange-500" };

  if (normalized.includes("transport") || normalized.includes("uber") || normalized.includes("fuel") || normalized.includes("taxi"))
    return { icon: Car, color: COLORS[8], bg: "bg-blue-500/10 text-blue-500" };

  if (normalized.includes("rent") || normalized.includes("home") || normalized.includes("hous"))
    return { icon: Home, color: COLORS[3], bg: "bg-rose-500/10 text-rose-500" };

  if (normalized.includes("entertain") || normalized.includes("movie") || normalized.includes("game") || normalized.includes("netflix"))
    return { icon: Film, color: COLORS[1], bg: "bg-violet-500/10 text-violet-500" };

  if (normalized.includes("bill") || normalized.includes("util") || normalized.includes("electric"))
    return { icon: Zap, color: COLORS[5], bg: "bg-yellow-500/10 text-yellow-500" };

  if (normalized.includes("subscript") || normalized.includes("spotify") || normalized.includes("apple"))
    return { icon: Smartphone, color: COLORS[6], bg: "bg-emerald-500/10 text-emerald-500" };

  if (normalized.includes("travel") || normalized.includes("flight") || normalized.includes("hotel"))
    return { icon: Plane, color: COLORS[7], bg: "bg-cyan-500/10 text-cyan-500" };

  return { icon: Wallet, color: COLORS[2], bg: "bg-pink-500/10 text-pink-500" };
};

// --- Mock Data for Fallback ---
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "1", user_id: "demo", date: new Date().toISOString(), description: "Whole Foods Market", amount: 4850, category: "Groceries", type: "expense", source: "manual", created_at: new Date().toISOString() },
  { id: "2", user_id: "demo", date: new Date(Date.now() - 86400000 * 1).toISOString(), description: "Uber Ride", amount: 450, category: "Transportation", type: "expense", source: "manual", created_at: new Date().toISOString() },
  { id: "3", user_id: "demo", date: new Date(Date.now() - 86400000 * 2).toISOString(), description: "Netflix Subscription", amount: 649, category: "Entertainment", type: "expense", source: "manual", created_at: new Date().toISOString() },
  { id: "4", user_id: "demo", date: new Date(Date.now() - 86400000 * 3).toISOString(), description: "Amazon Purchase", amount: 2340, category: "Shopping", type: "expense", source: "manual", created_at: new Date().toISOString() },
  { id: "5", user_id: "demo", date: new Date(Date.now() - 86400000 * 4).toISOString(), description: "Starbucks Coffee", amount: 350, category: "Food & Dining", type: "expense", source: "manual", created_at: new Date().toISOString() },
  { id: "6", user_id: "demo", date: new Date(Date.now() - 86400000 * 5).toISOString(), description: "Monthly Rent", amount: 25000, category: "Rent & Utilities", type: "expense", source: "manual", created_at: new Date().toISOString() },
  { id: "7", user_id: "demo", date: new Date(Date.now() - 86400000 * 10).toISOString(), description: "Apple Music", amount: 99, category: "Subscriptions", type: "expense", source: "manual", created_at: new Date().toISOString() },
  { id: "8", user_id: "demo", date: new Date(Date.now() - 86400000 * 12).toISOString(), description: "Zara", amount: 3499, category: "Shopping", type: "expense", source: "manual", created_at: new Date().toISOString() },
  { id: "9", user_id: "demo", date: new Date(Date.now() - 86400000 * 15).toISOString(), description: "PVR Cinemas", amount: 840, category: "Entertainment", type: "expense", source: "manual", created_at: new Date().toISOString() },
  { id: "10", user_id: "demo", date: new Date(Date.now() - 86400000 * 20).toISOString(), description: "Shell Petrol", amount: 2100, category: "Transportation", type: "expense", source: "manual", created_at: new Date().toISOString() },
  { id: "11", user_id: "demo", date: new Date(Date.now() - 86400000 * 35).toISOString(), description: "Previous Month Rent", amount: 25000, category: "Rent & Utilities", type: "expense", source: "manual", created_at: new Date().toISOString() },
  { id: "12", user_id: "demo", date: new Date(Date.now() - 86400000 * 38).toISOString(), description: "BigBasket", amount: 3200, category: "Groceries", type: "expense", source: "manual", created_at: new Date().toISOString() },
];

export default function Spending() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalSpending, setTotalSpending] = useState(0);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [topMerchants, setTopMerchants] = useState<any[]>([]);
  const [isDemoData, setIsDemoData] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'expense')
        .order('date', { ascending: false });

      if (error) {
        console.error("Supabase Error, using mock:", error);
        useMockData();
        return;
      }

      if (data && data.length > 0) {
        setTransactions(data);
        processAnalytics(data);
      } else {
        useMockData();
      }
    } catch (error) {
      console.error("Error fetching spending data:", error);
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  const useMockData = () => {
    setIsDemoData(true);
    setTransactions(MOCK_TRANSACTIONS);
    processAnalytics(MOCK_TRANSACTIONS);
  };

  const processAnalytics = (data: Transaction[]) => {
    // 1. Total Spending
    const total = data.reduce((sum, t) => sum + Number(t.amount), 0);
    setTotalSpending(total);

    // 2. Category Breakdown
    const categoryMap = new Map();
    data.forEach(t => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + Number(t.amount));
    });

    const categories = Array.from(categoryMap.entries())
      .map(([name, amount]) => {
        const config = getCategoryConfig(name);
        return {
          name,
          amount,
          percent: Math.round((amount / total) * 100),
          ...config
        };
      })
      .sort((a, b) => b.amount - a.amount);

    setCategoryData(categories);

    // 3. Monthly Comparison (Fill last 6 months)
    const monthMap = new Map();
    const now = new Date();
    const last6Months = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const key = `${monthName}`;
      last6Months.push(key);
      monthMap.set(key, 0); // Initialize with 0
    }

    data.forEach(t => {
      const date = new Date(t.date);
      const key = date.toLocaleString('default', { month: 'short' });
      // Only count if it's within our 6 month window logic (implied by just checking map existence)
      if (monthMap.has(key)) {
        monthMap.set(key, monthMap.get(key) + Number(t.amount));
      } else if (isDemoData) {
        // For demo data, simple distribution to make chart look good if dates are sparse
        const randomMonth = last6Months[Math.floor(Math.random() * last6Months.length)];
        monthMap.set(randomMonth, monthMap.get(randomMonth) + Number(t.amount));
      }
    });

    const monthlyList = Array.from(monthMap.entries()).map(([month, spending]) => ({
      month,
      spending: spending === 0 && isDemoData ? Math.floor(Math.random() * 20000) + 10000 : spending // Random filler for demo
    }));

    setMonthlyData(monthlyList);

    // 4. Top Merchants
    const merchantMap = new Map();
    data.forEach(t => {
      const key = t.description;
      const current = merchantMap.get(key) || { amount: 0, count: 0, category: t.category };
      merchantMap.set(key, {
        amount: current.amount + Number(t.amount),
        count: current.count + 1,
        category: t.category
      });
    });

    const merchants = Array.from(merchantMap.entries())
      .map(([name, stats]) => ({
        name,
        category: stats.category,
        amount: stats.amount,
        transactions: stats.count
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    setTopMerchants(merchants);
  };

  if (loading) {
    return (
      <DashboardLayout title="Spending Analytics" subtitle="Loading your financial data...">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Calculate trends
  const currentMonth = monthlyData[monthlyData.length - 1]?.spending || 0;
  const lastMonth = monthlyData[monthlyData.length - 2]?.spending || 0;
  const trendPercent = lastMonth > 0 ? Math.round(((currentMonth - lastMonth) / lastMonth) * 100) : 12;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-xl">
          <p className="font-semibold mb-1">{label}</p>
          <p className="text-primary font-mono text-sm">₹{payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout title="Spending Analytics" subtitle="Track and analyze your spending patterns">
      <div className="space-y-6 animate-in fade-in duration-500">

        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 bg-card hover:bg-accent">
              <CalendarIcon className="w-4 h-4" />
              This Month
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-card hover:bg-accent">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {isDemoData && <Badge variant="outline" className="text-muted-foreground border-dashed">Demo Mode</Badge>}
            <Button variant="outline" size="sm" className="gap-2 bg-card hover:bg-accent">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="pt-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Spending</p>
                  <p className="text-2xl font-bold mt-1">₹{totalSpending.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <TrendingDown className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant={trendPercent > 0 ? "warning" : "success"} className="text-[10px] px-1.5 py-0.5">
                  {Math.abs(trendPercent)}%
                </Badge>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 group">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Daily Average</p>
                  <p className="text-2xl font-bold mt-1">₹{Math.round(totalSpending / 30).toLocaleString()}</p>
                </div>
                <div className="p-2 bg-secondary rounded-full group-hover:bg-secondary/80 transition-colors">
                  <Filter className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">Based on 30 days activity</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 group">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">Top Category</p>
                  <p className="text-lg font-bold truncate mt-1 text-primary">
                    {categoryData[0]?.name || "N/A"}
                  </p>
                </div>
                <div className={`p-2 rounded-full ${categoryData[0]?.bg || "bg-secondary"}`}>
                  {(() => {
                    const Icon = categoryData[0]?.icon || Wallet;
                    return <Icon className="w-5 h-5" />;
                  })()}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${categoryData[0]?.percent || 0}%` }} />
                </div>
                <span className="text-xs font-medium">{categoryData[0]?.percent || 0}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 group">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold mt-1">{transactions.length}</p>
                </div>
                <div className="p-2 bg-secondary rounded-full group-hover:bg-secondary/80 transition-colors">
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">Total tracked expenses</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Category Pie Chart */}
          <Card className="flex flex-col hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Where your money goes</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col sm:flex-row gap-6 items-center">
              <div className="h-[220px] w-[220px] flex-shrink-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="amount"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Centered Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-muted-foreground">Total</span>
                  <span className="font-bold text-lg">₹{(totalSpending / 1000).toFixed(1)}k</span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-3 overflow-y-auto max-h-[220px] pr-2 custom-scrollbar">
                {categoryData.slice(0, 6).map((category) => (
                  <div key={category.name} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${category.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                        <category.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold block">₹{category.amount.toLocaleString()}</span>
                      <span className="text-[10px] text-muted-foreground">{category.percent}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends Bar Chart */}
          <Card className="flex flex-col hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Spending Trend</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="spending"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSpending)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Merchants Table */}
        <Card className="overflow-hidden border-none shadow-md">
          <CardHeader className="bg-card/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Top Merchants</CardTitle>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                View All
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {topMerchants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/30">
                    <tr>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Merchant</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                      <th className="text-right py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                      <th className="text-right py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Txns</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {topMerchants.map((merchant, index) => {
                      const config = getCategoryConfig(merchant.category);
                      return (
                        <tr key={index} className="group hover:bg-secondary/20 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                                {merchant.name.charAt(0)}
                              </div>
                              <span className="font-medium text-sm">{merchant.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant="outline" className={`font-normal ${config.bg} border-0`}>
                              {merchant.category}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-right font-medium">₹{merchant.amount.toLocaleString()}</td>
                          <td className="py-4 px-6 text-right text-sm text-muted-foreground">{merchant.transactions}</td>
                          <td className="py-4 px-4 text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground bg-secondary/10">
                No transaction data found. Start spending to see analytics!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
