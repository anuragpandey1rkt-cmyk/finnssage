import { useMemo, useState, useRef, useEffect } from "react";
import {
  TrendingUp,
  Wallet,
  CreditCard,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Loader2,
  Landmark,
  ChevronRight,
  RefreshCw,
  ShieldCheck,
  Gem,
  IndianRupee,
  Target,
  Palmtree,
  Calculator
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, MetricCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuickActionCard } from "@/components/ui/QuickActionCard";
import { useFinancial } from "@/context/FinancialContext";
import { useCurrency } from "@/context/CurrencyContext";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import { FinancialHealthMeter } from "@/components/FinancialHealthMeter";
import { QuickActions } from "@/components/QuickActions";
import { useToast } from "@/hooks/use-toast";
import { parseCSVAsync, parsePDFAsync } from "@/lib/statementParser";

// Milestones will be calculated dynamically based on financials

// Insights will be generated dynamically based on real data
// For now, we start with empty or simple rule-based insights
const generateInsights = (financialData: any) => {
  const insights = [];

  if (financialData.monthlyExpenses > financialData.monthlyIncome * 0.8) {
    insights.push({
      type: "warning",
      title: "High Spending",
      description: "Expenses are over 80% of income.",
      icon: AlertTriangle
    });
  }

  if (financialData.savingsRate > 20) {
    insights.push({
      type: "success",
      title: "Good Savings",
      description: "You are saving more than 20% of your income!",
      icon: CheckCircle2
    });
  }

  return insights;
};

/* Insights Generation */
// Re-triggering build to verify syntax fix
export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { format } = useCurrency();
  const {
    financialData,
    transactions,
    isLoading,
    setAnnualIncome,
    setMonthlyExpenses,
    addTransactions,
    refreshTransactions
  } = useFinancial();

  // Generate insights based on real data
  const insights = useMemo(() => generateInsights(financialData), [financialData]);

  const [salaryInput, setSalaryInput] = useState(financialData.annualIncome?.toString() || "");
  const [expenseInput, setExpenseInput] = useState(financialData.monthlyExpenses?.toString() || "");
  const [incomeMode, setIncomeMode] = useState<"annual" | "monthly">("annual");
  const [expenseMode, setExpenseMode] = useState<"annual" | "monthly">("monthly");
  const [dreamGoalTarget, setDreamGoalTarget] = useState(1000000);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isCSV = file.name.endsWith(".csv");
    const isPDF = file.name.endsWith(".pdf");

    if (!isCSV && !isPDF) {
      toast({
        title: "Invalid file format",
        description: "Please upload a CSV or PDF bank statement.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const content = event.target?.result;
        if (!content) return;

        let parsedTransactions;

        if (isCSV) {
          parsedTransactions = await parseCSVAsync(content as string);
        } else {
          // PDF parsing using Gemini AI (via parsedPDFAsync)
          parsedTransactions = await parsePDFAsync(content as ArrayBuffer);
        }

        const transactionsToSave = parsedTransactions.map((t) => ({
          date: t.date,
          description: t.description,
          amount: t.type === "expense" ? -t.amount : t.amount,
          category: t.category,
          type: t.type,
          source: (isCSV ? "csv_upload" : "pdf_upload") as "csv_upload" | "pdf_upload",
        }));

        await addTransactions(transactionsToSave);
        await refreshTransactions();

        toast({
          title: "Statement Analyzed!",
          description: `Successfully extracted ${transactionsToSave.length} transactions using AI.`,
        });

      } catch (err) {
        console.error("Upload Error:", err);
        toast({
          title: "Analysis Failed",
          description: err instanceof Error ? err.message : "Failed to analyze statement.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    if (isCSV) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  // Debounced update to backend
  useEffect(() => {
    const timer = setTimeout(async () => {
      let annualAmount: number | undefined;
      let monthlyAmount: number | undefined;

      if (salaryInput === "") {
        annualAmount = 0;
      } else {
        const val = parseInt(salaryInput);
        if (!isNaN(val)) {
          annualAmount = incomeMode === "monthly" ? val * 12 : val;
        }
      }

      if (expenseInput === "") {
        monthlyAmount = 0;
      } else {
        const val = parseInt(expenseInput);
        if (!isNaN(val)) {
          monthlyAmount = expenseMode === "annual" ? val / 12 : val;
        }
      }

      if (annualAmount !== undefined || monthlyAmount !== undefined) {
        setIsSyncing(true);
        if (annualAmount !== undefined && annualAmount !== financialData.annualIncome) {
          await setAnnualIncome(annualAmount);
        }
        if (monthlyAmount !== undefined && monthlyAmount !== financialData.monthlyExpenses) {
          await setMonthlyExpenses(monthlyAmount);
        }
        setIsSyncing(false);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [salaryInput, expenseInput, incomeMode, expenseMode, financialData.annualIncome, financialData.monthlyExpenses, setAnnualIncome, setMonthlyExpenses]);

  // Sync local state with context when context updates from elsewhere (like upload)
  useEffect(() => {
    if (financialData.annualIncome !== undefined) {
      setSalaryInput(prev => prev === "" && financialData.annualIncome !== 0 ? financialData.annualIncome.toString() : prev);
    }
    if (financialData.monthlyExpenses !== undefined) {
      setExpenseInput(prev => prev === "" && financialData.monthlyExpenses !== 0 ? financialData.monthlyExpenses.toString() : prev);
    }
  }, [financialData.annualIncome, financialData.monthlyExpenses]);

  // Derive real-time financials for the UI
  const financials = useMemo(() => {
    const rawSalary = salaryInput === "" ? 0 : parseInt(salaryInput);
    const i = isNaN(rawSalary) ? 0 : (incomeMode === "monthly" ? rawSalary : rawSalary / 12);

    const rawExpense = expenseInput === "" ? 0 : parseInt(expenseInput);
    const e = isNaN(rawExpense) ? 0 : (expenseMode === "annual" ? rawExpense / 12 : rawExpense);

    const s = i - e;

    return {
      income: i,
      expenses: e,
      savings: s,
      netWorth: financialData.netWorth || (i * 12 * 2.5),
    };
  }, [salaryInput, expenseInput, incomeMode, expenseMode, financialData.netWorth]);

  // Generate chart data from real transactions or use calculated data
  const chartData = useMemo(() => {
    if (transactions.length > 0) {
      // Group transactions by month
      const monthlyData: { [key: string]: { income: number; expenses: number } } = {};

      transactions.forEach((t) => {
        const date = new Date(t.date);
        const monthKey = date.toLocaleDateString("en-US", { month: "short" });

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
    }

    // Fallback to calculated data based on income
    const monthlyIncome = financials.income;
    const monthlyExpenses = financials.expenses;

    return [
      { name: "Jan", expenses: monthlyExpenses * 0.9, income: monthlyIncome },
      { name: "Feb", expenses: monthlyExpenses * 1.1, income: monthlyIncome },
      { name: "Mar", expenses: monthlyExpenses * 0.95, income: monthlyIncome },
      { name: "Apr", expenses: monthlyExpenses * 0.85, income: monthlyIncome },
      { name: "May", expenses: monthlyExpenses * 1.05, income: monthlyIncome },
      { name: "Jun", expenses: monthlyExpenses, income: monthlyIncome },
    ];
  }, [transactions, financials.income, financials.expenses]);

  return (
    <DashboardLayout title="Dashboard" subtitle="Your financial overview">
      <div className="space-y-4">
        {/* Currency Toggle */}
        <div className="flex justify-end">
          <CurrencyToggle />
        </div>

        {/* Manual Setup Header */}
        <Card className="bg-card border-border/50">
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-center">

              {/* Income Section */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-full bg-success/10 text-success">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-sm">Update Income</h3>
                  {isSyncing && <RefreshCw className="w-3 h-3 text-primary animate-spin" />}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex p-1 bg-secondary rounded-lg">
                    <button
                      className={`px-3 py-1 text-xs rounded-md transition-all ${incomeMode === "monthly" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      onClick={() => setIncomeMode("monthly")}
                    >
                      Monthly
                    </button>
                    <button
                      className={`px-3 py-1 text-xs rounded-md transition-all ${incomeMode === "annual" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      onClick={() => setIncomeMode("annual")}
                    >
                      Annual
                    </button>
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                    <Input
                      type="number"
                      className="pl-7 h-9"
                      placeholder="0"
                      value={salaryInput}
                      onChange={(e) => setSalaryInput(e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">Set your current salary (INR)</p>
              </div>

              {/* Divider for mobile */}
              <div className="h-px bg-border md:hidden" />

              {/* Expenses Section */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-full bg-destructive/10 text-destructive">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-sm">Update Expenses</h3>
                  {!isSyncing && expenseInput && <CheckCircle2 className="w-3 h-3 text-success" />}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex p-1 bg-secondary rounded-lg">
                    <button
                      className={`px-3 py-1 text-xs rounded-md transition-all ${expenseMode === "monthly" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      onClick={() => setExpenseMode("monthly")}
                    >
                      Monthly
                    </button>
                    <button
                      className={`px-3 py-1 text-xs rounded-md transition-all ${expenseMode === "annual" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      onClick={() => setExpenseMode("annual")}
                    >
                      Annual
                    </button>
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                    <Input
                      type="number"
                      className="pl-7 h-9 border-destructive/20 focus-visible:ring-destructive/30"
                      placeholder="0"
                      value={expenseInput}
                      onChange={(e) => setExpenseInput(e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">Set your monthly expenses (INR)</p>
              </div>

              {/* Upload Section */}
              <div className="flex flex-col items-center md:items-end justify-center gap-2 md:border-l md:pl-6 border-border/50">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium">Bank Statement</p>
                  <p className="text-xs text-muted-foreground">Auto-sync transactions</p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".csv,.pdf"
                  onChange={handleFileChange}
                />
                <Button
                  variant="outline"
                  className="w-full md:w-auto gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isUploading ? "Analyzing..." : "Upload Statement"}
                </Button>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Salary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-success" />
                <span className="text-2xl font-bold text-success">{format(financials.income)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Monthly Income</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expenses (Premium)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-destructive" />
                <span className="text-2xl font-bold text-destructive">{format(financials.expenses)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Monthly Spending</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-success" />
                <span className="text-2xl font-bold text-success">{format(financials.savings)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {financials.income > 0 ? Math.round((financials.savings / financials.income) * 100) : 0}% of income
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Account Balances & Health & Charts */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Account Balances - Replicating the screenshot */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Account Balances</CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs h-7">View All</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "HDFC Checking", type: "Checking", amount: 1040000, icon: Wallet, color: "text-blue-400" },
                  { name: "HDFC Savings", type: "Savings", amount: 3775000, icon: PiggyBank, color: "text-indigo-400" },
                  { name: "ICICI Credit Card", type: "Credit", amount: -355000, icon: CreditCard, color: "text-purple-400", isNegative: true },
                  { name: "Zerodha Demat", type: "Investment", amount: 15800000, icon: TrendingUp, color: "text-emerald-400" },
                ].map((acc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg bg-secondary/50 ${acc.color}`}>
                        <acc.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{acc.name}</p>
                        <p className="text-xs text-muted-foreground">{acc.type}</p>
                      </div>
                    </div>
                    <span className={`font-mono font-medium ${acc.isNegative ? "text-destructive" : ""}`}>
                      {format(acc.amount)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Smart Milestones (Horizontal Scroll) */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Smart Milestones</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {/* Sample Milestone - Emergency Fund */}
                <Card className="bg-card border-border/50">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Emergency Fund</p>
                          <p className="text-xs text-muted-foreground">6 Months of Safety</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">75%</Badge>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[75%]" />
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span>{format(financials.expenses * 4.5)}</span>
                      <span className="text-muted-foreground">Target: {format(financials.expenses * 6)}</span>
                    </div>
                  </CardContent>
                </Card>
                {/* Sample Milestone - Wealth */}
                <Card className="bg-card border-border/50">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                          <Gem className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">The First Crore</p>
                          <p className="text-xs text-muted-foreground">Wealth Milestone</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">24%</Badge>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[24%]" />
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span>{format(2400000)}</span>
                      <span className="text-muted-foreground">Target: {format(10000000)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Right Column: Health Meter & Insights */}
          <div className="space-y-6">
            <FinancialHealthMeter
              income={financials.income}
              expenses={financials.expenses}
              savings={financials.savings}
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.map((insight, index) => (
                  <div key={index} className={`p-3 rounded-lg border-l-2 bg-secondary/10 ${insight.type === "warning" ? "border-warning" : insight.type === "success" ? "border-success" : "border-info"}`}>
                    <div className="flex items-start gap-3">
                      <insight.icon className={`w-4 h-4 mt-0.5 ${insight.type === "warning" ? "text-warning" : insight.type === "success" ? "text-success" : "text-info"}`} />
                      <div>
                        <p className="text-xs font-semibold">{insight.title}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight mt-1">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Transactions & Charts */}
        <div className="grid gap-6 md:grid-cols-2 mt-8">
          {/* Recent Transactions */}
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Transactions</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/spending')}>
                See All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No transactions found. Upload a statement to get started.</p>
                ) : (
                  transactions.slice(0, 5).map((tx: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-emerald-500' : 'text-foreground'}`}>
                        {tx.type === 'income' ? '+' : '-'}{format(Math.abs(tx.amount))}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Financial Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {chartData.length > 0 ? (
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
                      <YAxis hide />
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
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    No trend data available.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Section */}
        <QuickActions />
      </div>
    </DashboardLayout>
  );
}
