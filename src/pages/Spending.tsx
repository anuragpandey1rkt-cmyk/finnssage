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
  ArrowDownRight
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFinancial } from "@/context/FinancialContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useMemo } from "react";

export default function Spending() {
  const { transactions, financialData } = useFinancial();
  const { format } = useCurrency();

  // Calculate real metrics
  const totalSpending = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [transactions]);

  const categoriesData = useMemo(() => {
    const cats: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const c = t.category || "Uncategorized";
      cats[c] = (cats[c] || 0) + Math.abs(t.amount);
    });

    return Object.entries(cats).map(([name, amount], i) => ({
      name,
      amount,
      percent: totalSpending ? Math.round((amount / totalSpending) * 100) : 0,
      icon: ShoppingBag, // simplified icon logic
      color: `bg-${['primary', 'warning', 'info', 'destructive', 'success', 'purple-500'][i % 6]}`
    })).sort((a, b) => b.amount - a.amount);
  }, [transactions, totalSpending]);

  return (
    <DashboardLayout title="Spending Analytics" subtitle="Track and analyze your spending patterns">
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="w-4 h-4" />
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
          <Card className="card-warning">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spending</p>
                  <p className="text-2xl font-bold">{format(totalSpending)}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Daily Average</p>
                  <p className="text-2xl font-bold">{format(Math.round(totalSpending / 30))}</p>
                </div>
                <PieChart className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Based on 30 days</p>
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
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoriesData.length === 0 ? <p className="text-muted-foreground">No expense data available.</p> :
                  categoriesData.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{format(category.amount)}</span>
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
        </div>

        {/* Recent Transactions List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Description</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Category</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 text-sm">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="py-3 font-medium">{t.description}</td>
                      <td className="py-3">
                        <Badge variant="muted">{t.category}</Badge>
                      </td>
                      <td className={`py-3 text-right font-semibold ${t.type === 'income' ? 'text-emerald-500' : ''}`}>
                        {t.type === 'income' ? '+' : '-'}{format(Math.abs(t.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
