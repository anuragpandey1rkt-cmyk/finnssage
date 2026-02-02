import { useMemo, useState } from "react";
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
  Upload,
  FileText,
  Plus
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, MetricCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFinancial } from "@/context/FinancialContext";
import { useCurrency } from "@/context/CurrencyContext";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import { FinancialHealthMeter } from "@/components/FinancialHealthMeter";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { format, symbol } = useCurrency();
  const { financialData, transactions, investments, isLoading, uploadStatement, addInvestment } = useFinancial();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  // Calculate real financials
  const financials = {
    income: financialData.monthlyIncome,
    expenses: financialData.monthlyExpenses,
    savings: financialData.monthlySavings,
    netWorth: financialData.netWorth,
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadStatement(file);
      toast({
        title: "Statement Uploaded",
        description: `Successfully processed ${file.name}`,
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddSampleInvestment = async () => {
    // Temporary quick action for demo/testing since no UI form requested yet
    try {
      await addInvestment({
        symbol: 'RELIANCE',
        name: 'Reliance Industries',
        type: 'stock',
        quantity: 10,
        avg_buy_price: 2500,
        return_amount: 0,
        return_percentage: 0
      });
      toast({ title: "Started SIP/Investment", description: "Added Reliance Industries to portfolio." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  // Generate chart data from real transactions
  const chartData = useMemo(() => {
    if (transactions.length === 0) return [];

    // Group transactions by month
    const monthlyData: { [key: string]: { income: number; expenses: number } } = {};

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const monthKey = date.toLocaleDateString("en-IN", { month: "short" });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }

      if (t.type === "income") {
        monthlyData[monthKey].income += Math.abs(t.amount);
      } else {
        monthlyData[monthKey].expenses += Math.abs(t.amount);
      }
    });

    return Object.entries(monthlyData)
      .slice(-6)
      .map(([name, data]) => ({
        name,
        income: data.income,
        expenses: data.expenses,
      }));
  }, [transactions]);

  // Show Empty State if no transactions AND no investments
  // BUT allow partial state (e.g. only investments added)
  const isEmpty = transactions.length === 0 && investments.length === 0 && financials.income === 0;

  if (!isLoading && isEmpty) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Your financial overview">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Wallet className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">Welcome to FinSage</h2>
          <p className="text-muted-foreground max-w-md text-lg">
            To get your financial health score and AI insights, please upload your bank statement or add your investments.
          </p>

          <div className="grid gap-4 w-full max-w-sm">
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-info rounded-xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <label className="relative flex items-center justify-center gap-3 p-6 border-2 border-dashed border-primary/30 rounded-xl cursor-pointer hover:border-primary transition-colors bg-card">
                {isUploading ? (
                  <span className="animate-pulse">Processing Statement...</span>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-primary" />
                    <span className="font-semibold">Upload Bank Statement (PDF)</span>
                  </>
                )}
                <input
                  type="file"
                  accept="application/pdf,text/csv"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

          <Button variant="outline" onClick={handleAddSampleInvestment}>
            Start SIP / Add Investment
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard" subtitle="Your financial overview">
      <div className="space-y-6">
        {/* Currency Toggle (Static INR) */}
        <div className="flex justify-end">
          <CurrencyToggle />
        </div>

        {/* Net Worth Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard trend="neutral" className="lg:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Worth</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight">
                  {format(financials.netWorth)}
                </h2>
                <div className="mt-2 text-xs text-muted-foreground">
                  Based on available data
                </div>
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
                    +{format(financials.income)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowDownRight className="w-4 h-4 text-destructive" />
                    <span className="text-sm">Expenses</span>
                  </div>
                  <span className="font-semibold text-destructive">
                    -{format(financials.expenses)}
                  </span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Net Savings</span>
                  <span className="text-lg font-bold text-success">
                    +{format(financials.savings)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>





        {/* Investments & Transactions Group */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Investment Portfolio */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Investment Portfolio</CardTitle>
                <Button size="sm" variant="outline" onClick={handleAddSampleInvestment}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add SIP/Stock
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {investments.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No investments yet. Start a SIP!
                  </div>
                )}
                {investments.map((inv, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{inv.name} <span className="text-xs text-muted-foreground">({inv.symbol})</span></p>
                        <p className="text-xs text-muted-foreground">
                          {inv.quantity} units @ {format(inv.avg_buy_price)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{format(inv.current_value || 0)}</p>
                      <p className={`text-xs ${(inv.return_percentage || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {(inv.return_percentage || 0) >= 0 ? '+' : ''}{(inv.return_percentage || 0).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Financial Health Meter (Real Score) */}
          <FinancialHealthMeter />
        </div>

        {/* Transactions List */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Transactions</CardTitle>
                <div className="relative">
                  <label className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-md cursor-pointer hover:bg-primary/90 transition-colors">
                    + Upload
                    <input
                      type="file"
                      accept="application/pdf,text/csv"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.slice(0, 5).map((tx, idx) => (
                  <div
                    key={idx} // Use tx.id if available but for safety idx
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${tx.type === 'income' ? 'bg-success/10' : 'bg-secondary'}`}>
                        {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5 text-success" /> : <CreditCard className="w-5 h-5 text-muted-foreground" />}
                      </div>
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {tx.category} • {new Date(tx.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-semibold ${tx.type === 'expense' ? "text-destructive" : "text-success"}`}
                    >
                      {tx.type === 'expense' ? "-" : "+"}{format(Math.abs(tx.amount))}
                    </span>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    No transactions found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        {chartData.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-1">
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
                        formatter={(value: number) => [format(value), ""]}
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
        )}
      </div>
    </DashboardLayout>
  );
}
