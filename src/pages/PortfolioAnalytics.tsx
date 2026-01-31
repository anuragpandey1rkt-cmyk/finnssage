import { useState } from "react";
import {
    TrendingUp,
    TrendingDown,
    PieChart,
    BarChart3,
    DollarSign,
    Activity,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    PieChart as RechartsPie,
    Pie,
    Cell,
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import { useFinancial } from "@/context/FinancialContext";

interface Holding {
    symbol: string;
    name: string;
    shares: number;
    avgCost: number;
    currentPrice: number;
    change: number;
    changePercent: number;
    value: number;
    type: "stock" | "etf" | "crypto";
}

const holdings: Holding[] = [
    { symbol: "AAPL", name: "Apple Inc.", shares: 50, avgCost: 145.00, currentPrice: 178.50, change: 2.45, changePercent: 1.39, value: 8925, type: "stock" },
    { symbol: "GOOGL", name: "Alphabet Inc.", shares: 15, avgCost: 120.00, currentPrice: 142.30, change: 1.85, changePercent: 1.32, value: 2134.50, type: "stock" },
    { symbol: "MSFT", name: "Microsoft", shares: 20, avgCost: 280.00, currentPrice: 410.25, change: 5.80, changePercent: 1.43, value: 8205, type: "stock" },
    { symbol: "VOO", name: "Vanguard S&P 500", shares: 30, avgCost: 380.00, currentPrice: 425.00, change: 3.20, changePercent: 0.76, value: 12750, type: "etf" },
    { symbol: "VTI", name: "Vanguard Total Market", shares: 25, avgCost: 210.00, currentPrice: 235.00, change: 1.50, changePercent: 0.64, value: 5875, type: "etf" },
    { symbol: "BTC", name: "Bitcoin", shares: 0.25, avgCost: 35000.00, currentPrice: 48500.00, change: 1250.00, changePercent: 2.64, value: 12125, type: "crypto" },
    { symbol: "ETH", name: "Ethereum", shares: 2, avgCost: 2200.00, currentPrice: 3200.00, change: 85.50, changePercent: 2.74, value: 6400, type: "crypto" },
    { symbol: "TSLA", name: "Tesla", shares: 10, avgCost: 280.00, currentPrice: 238.50, change: -4.20, changePercent: -1.73, value: 2385, type: "stock" },
];

const allocationData = [
    { name: "Stocks", value: 21649.50, color: "#6366f1" },
    { name: "ETFs", value: 18625, color: "#10b981" },
    { name: "Crypto", value: 18525, color: "#f59e0b" },
    { name: "Cash", value: 5000, color: "#64748b" },
];

const performanceData = [
    { date: "Jan", value: 52000, benchmark: 50000 },
    { date: "Feb", value: 54500, benchmark: 51200 },
    { date: "Mar", value: 51200, benchmark: 49800 },
    { date: "Apr", value: 58000, benchmark: 53000 },
    { date: "May", value: 56800, benchmark: 54500 },
    { date: "Jun", value: 62000, benchmark: 56000 },
    { date: "Jul", value: 63800, benchmark: 57500 },
];

export default function PortfolioAnalytics() {
    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0) + 5000; // +5000 cash
    const totalCost = holdings.reduce((sum, h) => sum + (h.shares * h.avgCost), 0);
    const totalGain = totalValue - 5000 - totalCost;
    const totalGainPercent = ((totalValue - 5000 - totalCost) / totalCost) * 100;

    const dayChange = holdings.reduce((sum, h) => sum + (h.change * h.shares), 0);
    const dayChangePercent = (dayChange / (totalValue - dayChange)) * 100;

    const topGainers = [...holdings].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3);
    const topLosers = [...holdings].sort((a, b) => a.changePercent - b.changePercent).slice(0, 3);

    const diversificationScore = 78; // Mock score

    return (
        <DashboardLayout title="Portfolio Analytics" subtitle="Deep insights into your investment performance">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <p className="text-xs text-muted-foreground">Total Portfolio Value</p>
                        <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
                        <div className={`flex items-center gap-1 text-xs ${dayChange >= 0 ? "text-success" : "text-destructive"}`}>
                            {dayChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            <span>{dayChange >= 0 ? "+" : ""}{dayChange.toFixed(2)} ({dayChangePercent.toFixed(2)}%) today</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-4 pb-4">
                        <p className="text-xs text-muted-foreground">Total Gain/Loss</p>
                        <p className={`text-2xl font-bold ${totalGain >= 0 ? "text-success" : "text-destructive"}`}>
                            {totalGain >= 0 ? "+" : ""}${totalGain.toLocaleString()}
                        </p>
                        <p className={`text-xs ${totalGain >= 0 ? "text-success" : "text-destructive"}`}>
                            {totalGain >= 0 ? "+" : ""}{totalGainPercent.toFixed(2)}% all-time
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-4 pb-4">
                        <p className="text-xs text-muted-foreground">Holdings</p>
                        <p className="text-2xl font-bold">{holdings.length}</p>
                        <p className="text-xs text-muted-foreground">Across {new Set(holdings.map(h => h.type)).size} asset types</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-4 pb-4">
                        <p className="text-xs text-muted-foreground">Diversification</p>
                        <p className="text-2xl font-bold">{diversificationScore}/100</p>
                        <Badge variant={diversificationScore >= 70 ? "success" : "warning"} className="text-xs mt-1">
                            {diversificationScore >= 70 ? "Well Diversified" : "Needs Improvement"}
                        </Badge>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Performance Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            Portfolio Performance (90 Days)
                        </CardTitle>
                        <CardDescription>Your portfolio vs S&P 500 benchmark</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#64748b" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "0.5rem" }}
                                        formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                                    />
                                    <Legend />
                                    <Area type="monotone" dataKey="value" name="Portfolio" stroke="#6366f1" fillOpacity={1} fill="url(#colorPortfolio)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="benchmark" name="S&P 500" stroke="#64748b" fillOpacity={1} fill="url(#colorBenchmark)" strokeWidth={2} strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Asset Allocation */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-info" />
                            Asset Allocation
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPie>
                                    <Pie
                                        data={allocationData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {allocationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, ""]} />
                                </RechartsPie>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-2 mt-4">
                            {allocationData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span>{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-medium">${item.value.toLocaleString()}</span>
                                        <span className="text-muted-foreground ml-2">({((item.value / totalValue) * 100).toFixed(0)}%)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Holdings Table */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-success" />
                            Holdings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 text-muted-foreground font-medium">Symbol</th>
                                        <th className="text-right py-3 text-muted-foreground font-medium">Shares</th>
                                        <th className="text-right py-3 text-muted-foreground font-medium">Avg Cost</th>
                                        <th className="text-right py-3 text-muted-foreground font-medium">Price</th>
                                        <th className="text-right py-3 text-muted-foreground font-medium">Change</th>
                                        <th className="text-right py-3 text-muted-foreground font-medium">Value</th>
                                        <th className="text-right py-3 text-muted-foreground font-medium">P/L</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {holdings.map((holding) => {
                                        const pl = (holding.currentPrice - holding.avgCost) * holding.shares;
                                        const plPercent = ((holding.currentPrice - holding.avgCost) / holding.avgCost) * 100;

                                        return (
                                            <tr key={holding.symbol} className="border-b border-border/50 hover:bg-secondary/30">
                                                <td className="py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={holding.type === "stock" ? "secondary" : holding.type === "etf" ? "outline" : "default"} className="text-xs">
                                                            {holding.type.toUpperCase()}
                                                        </Badge>
                                                        <div>
                                                            <p className="font-medium">{holding.symbol}</p>
                                                            <p className="text-xs text-muted-foreground">{holding.name}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-right py-3">{holding.shares}</td>
                                                <td className="text-right py-3">${holding.avgCost.toFixed(2)}</td>
                                                <td className="text-right py-3 font-medium">${holding.currentPrice.toFixed(2)}</td>
                                                <td className={`text-right py-3 ${holding.change >= 0 ? "text-success" : "text-destructive"}`}>
                                                    {holding.change >= 0 ? "+" : ""}{holding.changePercent.toFixed(2)}%
                                                </td>
                                                <td className="text-right py-3 font-medium">${holding.value.toLocaleString()}</td>
                                                <td className={`text-right py-3 font-medium ${pl >= 0 ? "text-success" : "text-destructive"}`}>
                                                    {pl >= 0 ? "+" : ""}${pl.toFixed(2)}
                                                    <span className="text-xs ml-1">({plPercent >= 0 ? "+" : ""}{plPercent.toFixed(1)}%)</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Movers */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <TrendingUp className="w-4 h-4 text-success" />
                                Top Gainers (Today)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {topGainers.map((holding) => (
                                <div key={holding.symbol} className="flex items-center justify-between p-2 rounded-lg bg-success/5 border border-success/20">
                                    <div>
                                        <p className="font-medium">{holding.symbol}</p>
                                        <p className="text-xs text-muted-foreground">{holding.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-success">+{holding.changePercent.toFixed(2)}%</p>
                                        <p className="text-xs text-success">+${holding.change.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <TrendingDown className="w-4 h-4 text-destructive" />
                                Top Losers (Today)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {topLosers.filter(h => h.changePercent < 0).map((holding) => (
                                <div key={holding.symbol} className="flex items-center justify-between p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                                    <div>
                                        <p className="font-medium">{holding.symbol}</p>
                                        <p className="text-xs text-muted-foreground">{holding.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-destructive">{holding.changePercent.toFixed(2)}%</p>
                                        <p className="text-xs text-destructive">${holding.change.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                            {topLosers.filter(h => h.changePercent < 0).length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-2">No losers today! 🎉</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
