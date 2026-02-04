import {
  FileText,
  Download,
  Calendar,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  DollarSign,
  CreditCard,
  Wallet,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const reportMonths = [
  {
    month: "January 2024",
    income: 8400,
    expenses: 4447,
    savings: 3953,
    netWorthChange: 12400,
    status: "ready",
  },
  {
    month: "December 2023",
    income: 8400,
    expenses: 5650,
    savings: 2750,
    netWorthChange: 8200,
    status: "ready",
  },
  {
    month: "November 2023",
    income: 8400,
    expenses: 4890,
    savings: 3510,
    netWorthChange: 15600,
    status: "ready",
  },
  {
    month: "October 2023",
    income: 8400,
    expenses: 4200,
    savings: 4200,
    netWorthChange: 9800,
    status: "ready",
  },
];

const reportCategories = [
  {
    name: "Income Statement",
    description: "Detailed breakdown of all income sources and expenses",
    icon: DollarSign,
  },
  {
    name: "Spending Analysis",
    description: "Category-wise spending with trends and insights",
    icon: PieChart,
  },
  {
    name: "Net Worth Report",
    description: "Assets, liabilities, and net worth over time",
    icon: TrendingUp,
  },
  {
    name: "Credit Card Summary",
    description: "Rewards earned, payments, and optimization tips",
    icon: CreditCard,
  },
  {
    name: "Investment Performance",
    description: "Portfolio returns, allocation, and rebalancing",
    icon: BarChart3,
  },
  {
    name: "Cash Flow Statement",
    description: "Money in vs money out analysis",
    icon: Wallet,
  },
];

export default function Reports() {
  return (
    <DashboardLayout title="Reports & Export" subtitle="Generate and download financial reports">
      <div className="space-y-6">
        {/* Quick Export */}
        <Card className="bg-gradient-to-r from-primary/10 to-info/10 border-primary/20">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">January 2024 Financial Report</h3>
                  <p className="text-sm text-muted-foreground">
                    Your complete monthly financial summary is ready
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Reports */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Monthly Reports</CardTitle>
                <CardDescription>View and download past financial reports</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Custom Range
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Month</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">Income</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">Expenses</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">Savings</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">Net Worth Δ</th>
                    <th className="text-center py-3 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reportMonths.map((report, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-4 font-medium">{report.month}</td>
                      <td className="py-4 text-right text-success">
                        +₹{report.income.toLocaleString()}
                      </td>
                      <td className="py-4 text-right text-destructive">
                        -₹{report.expenses.toLocaleString()}
                      </td>
                      <td className="py-4 text-right font-semibold">
                        ₹{report.savings.toLocaleString()}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TrendingUp className="w-4 h-4 text-success" />
                          <span className="text-success">
                            +₹{report.netWorthChange.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <Badge variant="success">Ready</Badge>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Report Categories */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Report Types</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reportCategories.map((category) => (
              <Card key={category.name} className="hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                      <category.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Bulk Export</CardTitle>
            <CardDescription>
              Export all your financial data for backup or analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-medium">Full Data Export</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  All transactions, accounts, and settings
                </p>
                <Button variant="outline" className="w-full mt-4">
                  Export as JSON
                </Button>
              </div>

              <div className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-5 h-5 text-info" />
                  <span className="font-medium">Transaction History</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  All transactions in spreadsheet format
                </p>
                <Button variant="outline" className="w-full mt-4">
                  Export as CSV
                </Button>
              </div>

              <div className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <PieChart className="w-5 h-5 text-warning" />
                  <span className="font-medium">Tax Documents</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Annual summary for tax preparation
                </p>
                <Button variant="outline" className="w-full mt-4">
                  Generate Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
