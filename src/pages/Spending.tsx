import {
  PieChart,
  TrendingDown,
  TrendingUp,
  ArrowUpRight,
  Filter,
  Download,
  Calendar,
  ShoppingBag,
  Car,
  Home,
  Utensils,
  Film,
  Zap,
  Heart,
  MoreHorizontal,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const categories = [
  { name: "Shopping", amount: 1245, percent: 28, icon: ShoppingBag, color: "bg-primary" },
  { name: "Food & Dining", amount: 892, percent: 20, icon: Utensils, color: "bg-warning" },
  { name: "Transportation", amount: 534, percent: 12, icon: Car, color: "bg-info" },
  { name: "Rent & Utilities", amount: 2100, percent: 47, icon: Home, color: "bg-destructive" },
  { name: "Entertainment", amount: 320, percent: 7, icon: Film, color: "bg-purple-500" },
  { name: "Subscriptions", amount: 156, percent: 3, icon: Zap, color: "bg-success" },
];

const monthlyComparison = [
  { month: "Oct", spending: 4200 },
  { month: "Nov", spending: 4890 },
  { month: "Dec", spending: 5650 },
  { month: "Jan", spending: 4447, current: true },
];

const topMerchants = [
  { name: "Amazon", category: "Shopping", amount: 456.78, transactions: 12 },
  { name: "Uber", category: "Transportation", amount: 234.50, transactions: 23 },
  { name: "Whole Foods", category: "Groceries", amount: 312.45, transactions: 8 },
  { name: "Netflix", category: "Entertainment", amount: 15.99, transactions: 1 },
  { name: "Spotify", category: "Entertainment", amount: 10.99, transactions: 1 },
  { name: "Starbucks", category: "Food & Dining", amount: 89.45, transactions: 18 },
];

const insights = [
  {
    type: "warning",
    title: "Dining spending up 40%",
    description: "You've spent ₹892 on dining this month, which is 40% higher than your 3-month average of ₹637.",
  },
  {
    type: "success",
    title: "Subscription savings found",
    description: "You have 3 streaming services. Consider bundling or choosing one to save ₹20/month.",
  },
  {
    type: "info",
    title: "Peak spending detected",
    description: "Most of your spending happens on weekends. Consider setting a weekend budget.",
  },
];

export default function Spending() {
  const totalSpending = categories.reduce((sum, c) => sum + c.amount, 0);

  return (
    <DashboardLayout title="Spending Analytics" subtitle="Track and analyze your spending patterns">
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="w-4 h-4" />
              January 2024
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
          <Card className="card-warning">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spending</p>
                  <p className="text-2xl font-bold">₹{totalSpending.toLocaleString()}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-warning" />
              </div>
              <Badge variant="warning" className="mt-2">
                +12% vs last month
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

          <Card className="card-success">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Budget Used</p>
                  <p className="text-2xl font-bold">74%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">of ₹6,000</p>
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-success rounded-full" style={{ width: "74%" }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold">127</p>
                </div>
                <ArrowUpRight className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">+8 from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown & Monthly Comparison */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Category Breakdown</CardTitle>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${category.color} flex items-center justify-center`}>
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
                        className={`h-full ${category.color} rounded-full transition-all duration-500`}
                        style={{ width: `${category.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-48 gap-4 pb-4">
                {monthlyComparison.map((month) => {
                  const maxSpending = Math.max(...monthlyComparison.map(m => m.spending));
                  const heightPercent = (month.spending / maxSpending) * 100;

                  return (
                    <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-sm font-semibold">₹{(month.spending / 1000).toFixed(1)}k</span>
                      <div className="w-full bg-secondary rounded-t-lg overflow-hidden flex-1 relative">
                        <div
                          className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-500 ${month.current
                              ? "bg-gradient-to-t from-primary to-info"
                              : "bg-muted-foreground/30"
                            }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className={`text-sm ${month.current ? "font-bold text-primary" : "text-muted-foreground"}`}>
                        {month.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights & Top Merchants */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Spending Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${insight.type === "warning"
                        ? "card-warning"
                        : insight.type === "success"
                          ? "card-success"
                          : "bg-info/10 border-l-4 border-info"
                      }`}
                  >
                    <p className="text-sm font-medium">{insight.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Merchants */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Merchants</CardTitle>
                <Button variant="ghost" size="sm">
                  See All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
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
                        <td className="py-3 text-right font-semibold">₹{merchant.amount.toFixed(2)}</td>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
