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
} from "recharts";

// Map text categories to icons and colors
const getCategoryConfig = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized.includes("shop") || normalized.includes("amazon")) return { icon: ShoppingBag, color: "#6366f1", bg: "bg-primary" };
  if (normalized.includes("food") || normalized.includes("dining") || normalized.includes("restau")) return { icon: Utensils, color: "#f59e0b", bg: "bg-warning" };
  if (normalized.includes("transport") || normalized.includes("uber") || normalized.includes("fuel")) return { icon: Car, color: "#3b82f6", bg: "bg-info" };
  if (normalized.includes("rent") || normalized.includes("util") || normalized.includes("bill")) return { icon: Home, color: "#ef4444", bg: "bg-destructive" };
  if (normalized.includes("entertain") || normalized.includes("movie") || normalized.includes("netflix")) return { icon: Film, color: "#a855f7", bg: "bg-purple-500" };
  if (normalized.includes("subscript") || normalized.includes("spotify")) return { icon: Zap, color: "#10b981", bg: "bg-success" };
  return { icon: Heart, color: "#64748b", bg: "bg-secondary" };
};

export default function Spending() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalSpending, setTotalSpending] = useState(0);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [topMerchants, setTopMerchants] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch only expenses
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'expense')
        .order('date', { ascending: false });

      if (error) throw error;

      if (data) {
        setTransactions(data);
        processAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching spending data:", error);
    } finally {
      setLoading(false);
    }
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

    // 3. Monthly Comparison (Last 6 months)
    const monthMap = new Map();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    data.forEach(t => {
      const date = new Date(t.date);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      const current = monthMap.get(key) || 0;
      monthMap.set(key, current + Number(t.amount));
    });

    // Create array for chart (mocking missing months for better visual if needed, but let's use real)
    const monthlyList = Array.from(monthMap.entries())
      .map(([month, spending]) => ({ month, spending }))
      .reverse() // Oldest first
      .slice(-6); // Last 6 months

    if (monthlyList.length === 0) {
      // Fallback if no data
      setMonthlyData([
        { month: "Jan", spending: 0 }
      ]);
    } else {
      setMonthlyData(monthlyList);
    }

    // 4. Top Merchants
    const merchantMap = new Map();
    data.forEach(t => {
      const current = merchantMap.get(t.description) || { amount: 0, count: 0, category: t.category };
      merchantMap.set(t.description, {
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
      .slice(0, 5); // Top 5

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
  const lastMonth = monthlyData[monthlyData.length - 2]?.spending || 0; // simplistic prev month
  const trendPercent = lastMonth > 0 ? Math.round(((currentMonth - lastMonth) / lastMonth) * 100) : 0;

  return (
    <DashboardLayout title="Spending Analytics" subtitle="Track and analyze your spending patterns">
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <CalendarIcon className="w-4 h-4" />
              This Month
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className={`${trendPercent > 0 ? 'card-warning' : 'card-success'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spending</p>
                  <p className="text-2xl font-bold">₹{totalSpending.toLocaleString()}</p>
                </div>
                {trendPercent > 0 ? (
                  <TrendingUp className="w-8 h-8 text-warning" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-success" />
                )}
              </div>
              <Badge variant={trendPercent > 0 ? "warning" : "success"} className="mt-2">
                {trendPercent > 0 ? "+" : ""}{trendPercent}% vs last month
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Daily Average</p>
                  <p className="text-2xl font-bold">₹{Math.round(totalSpending / 30)}</p>
                </div>
                <PieChart className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Based on 30 days</p>
            </CardContent>
          </Card>

          <Card className="card-info">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Highest Category</p>
                  <p className="text-lg font-bold truncate max-w-[120px]">
                    {categoryData[0]?.name || "None"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {categoryData[0]?.percent || 0}% of total
                  </p>
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-info rounded-full" style={{ width: `${categoryData[0]?.percent || 0}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold">{transactions.length}</p>
                </div>
                <ArrowUpRight className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Total tracked</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown & Monthly Comparison */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Category Breakdown */}
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Category Breakdown</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              {/* Chart Section */}
              <div className="h-[200px] w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="amount"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* List Section */}
              <div className="space-y-4">
                {categoryData.slice(0, 5).map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${category.bg} flex items-center justify-center`}>
                          <category.icon className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">₹{category.amount.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {category.percent}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500`}
                        style={{ width: `${category.percent}%`, backgroundColor: category.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Comparison */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                      contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, "Spending"]}
                    />
                    <Bar dataKey="spending" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Merchants */}
        <Card>
          <CardHeader>
            <CardTitle>Top Merchants</CardTitle>
          </CardHeader>
          <CardContent>
            {topMerchants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">Merchant</th>
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">Category</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Transactions</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {topMerchants.map((merchant, index) => (
                      <tr key={index} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-3 font-medium">{merchant.name}</td>
                        <td className="py-3">
                          <Badge variant="muted">{merchant.category}</Badge>
                        </td>
                        <td className="py-3 text-right font-semibold">₹{merchant.amount.toLocaleString()}</td>
                        <td className="py-3 text-right text-muted-foreground">{merchant.transactions}</td>
                        <td className="py-3 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No transaction data found. Start spending to see analytics!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
