import {
  TrendingUp,
  TrendingDown,
  PieChart,
  AlertTriangle,
  RefreshCw,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  BarChart3,
  Target,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const portfolioAllocation = [
  { name: "US Stocks", value: 45, amount: 85230, color: "bg-primary" },
  { name: "International", value: 20, amount: 37880, color: "bg-info" },
  { name: "Bonds", value: 20, amount: 37880, color: "bg-warning" },
  { name: "Real Estate", value: 10, amount: 18940, color: "bg-success" },
  { name: "Cash", value: 5, amount: 9470, color: "bg-muted-foreground" },
];

const holdings = [
  { symbol: "VTI", name: "Vanguard Total Stock", shares: 150, price: 234.56, change: 2.34, value: 35184 },
  { symbol: "VXUS", name: "Vanguard Intl Stock", shares: 200, price: 62.34, change: -0.87, value: 12468 },
  { symbol: "BND", name: "Vanguard Total Bond", shares: 300, price: 72.12, change: 0.12, value: 21636 },
  { symbol: "VNQ", name: "Vanguard Real Estate", shares: 100, price: 89.45, change: 1.56, value: 8945 },
  { symbol: "AAPL", name: "Apple Inc.", shares: 50, price: 178.92, change: 3.21, value: 8946 },
];

const rebalancingSuggestions = [
  {
    action: "Sell",
    asset: "US Stocks",
    amount: 5230,
    reason: "Currently 47% vs target 45%",
    type: "warning",
  },
  {
    action: "Buy",
    asset: "International",
    amount: 3120,
    reason: "Currently 18% vs target 20%",
    type: "info",
  },
  {
    action: "Buy",
    asset: "Bonds",
    amount: 2110,
    reason: "Currently 19% vs target 20%",
    type: "info",
  },
];

const totalValue = portfolioAllocation.reduce((sum, a) => sum + a.amount, 0);
const ytdReturn = 12.4;
const riskLevel = "Moderate";

export default function Investments() {
  return (
    <DashboardLayout title="Investment Intelligence" subtitle="Monitor and optimize your portfolio">
      <div className="space-y-6">
        {/* Disclaimer */}
        <Card className="bg-info/10 border-info/20">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-info shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Investment Suggestions Only</p>
                <p className="text-xs text-muted-foreground mt-1">
                  All suggestions are for informational purposes. User approval is required before any transactions. 
                  Past performance does not guarantee future results.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="card-success">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Portfolio</p>
                  <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
                </div>
                <Wallet className="w-8 h-8 text-success" />
              </div>
              <Badge variant="success" className="mt-2">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{ytdReturn}% YTD
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Change</p>
                  <p className="text-2xl font-bold text-success">+$1,234</p>
                </div>
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">+0.65% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <p className="text-2xl font-bold">{riskLevel}</p>
                </div>
                <Target className="w-8 h-8 text-warning" />
              </div>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-2 flex-1 rounded ${
                      level <= 3 ? "bg-warning" : "bg-secondary"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Dividend Yield</p>
                  <p className="text-2xl font-bold">2.4%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">$4,560/year estimated</p>
            </CardContent>
          </Card>
        </div>

        {/* Allocation & Rebalancing */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Portfolio Allocation */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Portfolio Allocation</CardTitle>
                <Button variant="ghost" size="sm">
                  <PieChart className="w-4 h-4 mr-2" />
                  View Chart
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolioAllocation.map((asset) => (
                  <div key={asset.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${asset.color}`} />
                        <span className="font-medium">{asset.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">${asset.amount.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground ml-2">{asset.value}%</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full ${asset.color} rounded-full transition-all duration-500`}
                        style={{ width: `${asset.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rebalancing Suggestions */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                <CardTitle>Rebalancing Suggestions</CardTitle>
              </div>
              <CardDescription>
                Recommended trades to align with your target allocation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rebalancingSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      suggestion.type === "warning" ? "card-warning" : "bg-info/10 border-info"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={suggestion.action === "Sell" ? "warning" : "info"}>
                          {suggestion.action}
                        </Badge>
                        <span className="font-medium">{suggestion.asset}</span>
                      </div>
                      <span className="font-semibold">
                        ${suggestion.amount.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex gap-3">
                <Button className="flex-1">
                  Review All Changes
                </Button>
                <Button variant="outline">
                  Dismiss
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center mt-4">
                Requires your explicit approval before execution
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Holdings Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Holdings</CardTitle>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Symbol</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">Shares</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">Price</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">Change</th>
                    <th className="text-right py-3 text-sm font-medium text-muted-foreground">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding) => (
                    <tr key={holding.symbol} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-4">
                        <span className="font-bold text-primary">{holding.symbol}</span>
                      </td>
                      <td className="py-4 text-muted-foreground">{holding.name}</td>
                      <td className="py-4 text-right">{holding.shares}</td>
                      <td className="py-4 text-right">${holding.price.toFixed(2)}</td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {holding.change > 0 ? (
                            <ArrowUpRight className="w-4 h-4 text-success" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-destructive" />
                          )}
                          <span className={holding.change > 0 ? "text-success" : "text-destructive"}>
                            {holding.change > 0 ? "+" : ""}{holding.change.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-right font-semibold">
                        ${holding.value.toLocaleString()}
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
