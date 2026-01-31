import { useEffect, useState } from "react";
import {
  TrendingUp,
  Wallet,
  CreditCard,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, MetricCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Default mock data (fallback)
const defaultAccountBalances = [
  { name: "Chase Checking", balance: 12450, type: "checking", icon: Wallet },
  { name: "Chase Savings", balance: 45200, type: "savings", icon: PiggyBank },
  { name: "AMEX Platinum", balance: -4250, type: "credit", icon: CreditCard },
  { name: "Fidelity 401k", balance: 189300, type: "investment", icon: TrendingUp },
];

const insights = [
  {
    type: "warning",
    title: "High spending alert",
    description: "You've spent 40% more on dining this month compared to your average.",
    icon: AlertTriangle,
  },
  {
    type: "success",
    title: "Great savings rate",
    description: "You're saving 28% of your income, above your 25% target.",
    icon: CheckCircle2,
  },
  {
    type: "info",
    title: "Card optimization",
    description: "Switch to Chase Sapphire for dining to earn 3x points.",
    icon: Sparkles,
  },
];

export default function Dashboard() {
  const [financials, setFinancials] = useState({
    income: 8400,
    expenses: 5890,
    savings: 2510,
    netWorth: 287450,
  });

  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Load personalized data from onboarding
    const storedIncome = localStorage.getItem("userIncome");

    if (storedIncome) {
      const annualIncome = parseInt(storedIncome, 10);
      const monthlyIncome = Math.round(annualIncome / 12);
      // Assume ~70% expenses for realistic data
      const monthlyExpenses = Math.round(monthlyIncome * 0.65);
      const monthlySavings = monthlyIncome - monthlyExpenses;

      setFinancials({
        income: monthlyIncome,
        expenses: monthlyExpenses,
        savings: monthlySavings,
        netWorth: Math.round(annualIncome * 2.5), // Mock net worth based on income
      });

      // Generate personalized chart data based on income
      const data = [
        { name: "Jan", expenses: monthlyExpenses * 0.9, income: monthlyIncome },
        { name: "Feb", expenses: monthlyExpenses * 1.1, income: monthlyIncome },
        { name: "Mar", expenses: monthlyExpenses * 0.95, income: monthlyIncome },
        { name: "Apr", expenses: monthlyExpenses * 0.85, income: monthlyIncome + 500 }, // Bonus
        { name: "May", expenses: monthlyExpenses * 1.05, income: monthlyIncome },
        { name: "Jun", expenses: monthlyExpenses, income: monthlyIncome },
      ];
      setChartData(data);
    } else {
      // Fallback data
      setChartData([
        { name: "Jan", expenses: 5000, income: 8400 },
        { name: "Feb", expenses: 6200, income: 8400 },
        { name: "Mar", expenses: 5800, income: 8400 },
        { name: "Apr", expenses: 4900, income: 8900 },
        { name: "May", expenses: 5890, income: 8400 },
      ]);
    }
  }, []);

  return (
    <DashboardLayout title="Dashboard" subtitle="Your financial overview">
      <div className="space-y-6">
        {/* Net Worth Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard trend="up" className="lg:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Worth</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight">
                  ${financials.netWorth.toLocaleString()}
                </h2>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="success" className="gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +12.4%
                  </Badge>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                <p className="text-xs text-muted-foreground">Assets</p>
                <p className="text-lg font-semibold text-success">
                  ${Math.round(financials.netWorth * 1.2).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-xs text-muted-foreground">Liabilities</p>
                <p className="text-lg font-semibold text-destructive">
                  ${Math.round(financials.netWorth * 0.2).toLocaleString()}
                </p>
              </div>
            </div>
          </MetricCard>

          {/* Cash Flow */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-muted-foreground">
                Monthly Cash Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-success" />
                    <span className="text-sm">Income</span>
                  </div>
                  <span className="font-semibold text-success">
                    +${financials.income.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowDownRight className="w-4 h-4 text-destructive" />
                    <span className="text-sm">Expenses</span>
                  </div>
                  <span className="font-semibold text-destructive">
                    -${financials.expenses.toLocaleString()}
                  </span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Net Savings</span>
                  <span className="text-lg font-bold text-success">
                    +${financials.savings.toLocaleString()}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-info rounded-full transition-all duration-500"
                    style={{ width: `${(financials.savings / financials.income) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Saving {Math.round((financials.savings / financials.income) * 100)}% of income
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Accounts & Insights */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Account Balances */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Account Balances</CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {defaultAccountBalances.map((account) => (
                  <div
                    key={account.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary">
                        <account.icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {account.type}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-semibold ${account.balance < 0 ? "text-destructive" : "text-foreground"
                        }`}
                    >
                      {account.balance < 0 ? "-" : ""}$
                      {Math.abs(account.balance).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <CardTitle>AI Insights</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${insight.type === "warning"
                      ? "card-warning"
                      : insight.type === "success"
                        ? "card-success"
                        : "bg-info/10 border-info"
                      }`}
                  >
                    <div className="flex items-start gap-2">
                      <insight.icon
                        className={`w-4 h-4 mt-0.5 ${insight.type === "warning"
                          ? "text-warning"
                          : insight.type === "success"
                            ? "text-success"
                            : "text-info"
                          }`}
                      />
                      <div>
                        <p className="text-sm font-medium">{insight.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <Button variant="ghost" size="sm">
                  See All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Whole Foods", category: "Groceries", amount: -89.32, date: "Today" },
                  { name: "Salary Deposit", category: "Income", amount: financials.income, date: "Yesterday" },
                  { name: "Uber", category: "Transport", amount: -24.50, date: "Yesterday" },
                ].map((tx, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.amount > 0 ? "bg-success/20" : "bg-secondary"
                          }`}
                      >
                        {tx.amount > 0 ? (
                          <ArrowUpRight className="w-4 h-4 text-success" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{tx.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {tx.category} • {tx.date}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-semibold ${tx.amount > 0 ? "text-success" : "text-foreground"
                        }`}
                    >
                      {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Spending Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      hide
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "0.5rem" }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorIncome)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stroke="#f43f5e"
                      fillOpacity={1}
                      fill="url(#colorExpenses)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
