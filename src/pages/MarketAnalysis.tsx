import { useState } from "react";
import {
    TrendingUp,
    TrendingDown,
    Activity,
    Globe,
    Clock,
    Star,
    Plus,
    X,
    AlertCircle,
    Newspaper,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

const marketIndices = [
    {
        name: "S&P 500",
        symbol: "SPX",
        value: 4783.45,
        change: 28.52,
        changePercent: 0.60,
        data: Array.from({ length: 20 }, (_, i) => ({ x: i, y: 4700 + Math.random() * 100 })),
    },
    {
        name: "NASDAQ",
        symbol: "IXIC",
        value: 15032.75,
        change: 156.23,
        changePercent: 1.05,
        data: Array.from({ length: 20 }, (_, i) => ({ x: i, y: 14800 + Math.random() * 300 })),
    },
    {
        name: "DOW Jones",
        symbol: "DJI",
        value: 37468.20,
        change: -85.30,
        changePercent: -0.23,
        data: Array.from({ length: 20 }, (_, i) => ({ x: i, y: 37300 + Math.random() * 200 })),
    },
    {
        name: "Russell 2000",
        symbol: "RUT",
        value: 2015.85,
        change: 12.45,
        changePercent: 0.62,
        data: Array.from({ length: 20 }, (_, i) => ({ x: i, y: 1990 + Math.random() * 40 })),
    },
];

const sectorPerformance = [
    { name: "Technology", change: 2.34, color: "#10b981" },
    { name: "Healthcare", change: 1.15, color: "#10b981" },
    { name: "Consumer Cyclical", change: 0.89, color: "#10b981" },
    { name: "Financial", change: 0.45, color: "#10b981" },
    { name: "Energy", change: -0.23, color: "#f43f5e" },
    { name: "Utilities", change: -0.56, color: "#f43f5e" },
    { name: "Real Estate", change: -1.12, color: "#f43f5e" },
    { name: "Basic Materials", change: -1.45, color: "#f43f5e" },
];

const marketNews = [
    {
        title: "Fed signals potential rate cuts in 2024",
        source: "Reuters",
        time: "2h ago",
        sentiment: "bullish",
    },
    {
        title: "Tech earnings beat expectations across the board",
        source: "Bloomberg",
        time: "4h ago",
        sentiment: "bullish",
    },
    {
        title: "Oil prices decline amid global supply concerns",
        source: "WSJ",
        time: "5h ago",
        sentiment: "bearish",
    },
    {
        title: "Crypto markets see renewed institutional interest",
        source: "CoinDesk",
        time: "6h ago",
        sentiment: "bullish",
    },
    {
        title: "Housing market shows signs of cooling",
        source: "CNBC",
        time: "8h ago",
        sentiment: "neutral",
    },
];

const defaultWatchlist = [
    { symbol: "AAPL", name: "Apple Inc.", price: 178.50, change: 2.45, changePercent: 1.39 },
    { symbol: "MSFT", name: "Microsoft", price: 410.25, change: 5.80, changePercent: 1.43 },
    { symbol: "GOOGL", name: "Alphabet", price: 142.30, change: 1.85, changePercent: 1.32 },
    { symbol: "AMZN", name: "Amazon", price: 168.75, change: -1.20, changePercent: -0.71 },
    { symbol: "TSLA", name: "Tesla", price: 238.50, change: -4.20, changePercent: -1.73 },
];

export default function MarketAnalysis() {
    const [watchlist, setWatchlist] = useState(defaultWatchlist);
    const [newSymbol, setNewSymbol] = useState("");

    const addToWatchlist = () => {
        if (!newSymbol.trim()) return;

        const newStock = {
            symbol: newSymbol.toUpperCase(),
            name: `${newSymbol.toUpperCase()} Inc.`,
            price: 100 + Math.random() * 200,
            change: (Math.random() - 0.5) * 10,
            changePercent: (Math.random() - 0.5) * 5,
        };

        setWatchlist([...watchlist, newStock]);
        setNewSymbol("");
    };

    const removeFromWatchlist = (symbol: string) => {
        setWatchlist(watchlist.filter((s) => s.symbol !== symbol));
    };

    const marketOpen = true; // In production, calculate based on market hours

    return (
        <DashboardLayout title="Market Analysis" subtitle="Real-time market insights and trends">
            {/* Market Status */}
            <div className="flex items-center gap-4 mb-6">
                <Badge variant={marketOpen ? "success" : "secondary"} className="gap-2">
                    <div className={`w-2 h-2 rounded-full ${marketOpen ? "bg-success animate-pulse" : "bg-muted"}`} />
                    {marketOpen ? "Market Open" : "Market Closed"}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Last updated: Just now</span>
                </div>
            </div>

            {/* Market Indices */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {marketIndices.map((index) => (
                    <Card key={index.symbol}>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">{index.name}</p>
                                    <p className="text-xl font-bold">{index.value.toLocaleString()}</p>
                                </div>
                                <Badge variant={index.change >= 0 ? "success" : "destructive"} className="text-xs">
                                    {index.change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                    {index.change >= 0 ? "+" : ""}{index.changePercent.toFixed(2)}%
                                </Badge>
                            </div>
                            <div className="h-[50px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={index.data}>
                                        <defs>
                                            <linearGradient id={`color-${index.symbol}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={index.change >= 0 ? "#10b981" : "#f43f5e"} stopOpacity={0.2} />
                                                <stop offset="95%" stopColor={index.change >= 0 ? "#10b981" : "#f43f5e"} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="y"
                                            stroke={index.change >= 0 ? "#10b981" : "#f43f5e"}
                                            fillOpacity={1}
                                            fill={`url(#color-${index.symbol})`}
                                            strokeWidth={1.5}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Sector Performance */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            Sector Performance
                        </CardTitle>
                        <CardDescription>Today's performance by sector</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                            {sectorPerformance.map((sector) => (
                                <div
                                    key={sector.name}
                                    className={`p-3 rounded-lg border ${sector.change >= 0 ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{sector.name}</span>
                                        <span className={`text-sm font-bold ${sector.change >= 0 ? "text-success" : "text-destructive"}`}>
                                            {sector.change >= 0 ? "+" : ""}{sector.change.toFixed(2)}%
                                        </span>
                                    </div>
                                    <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${sector.change >= 0 ? "bg-success" : "bg-destructive"}`}
                                            style={{ width: `${Math.min(Math.abs(sector.change) * 20, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Watchlist */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-warning" />
                            Watchlist
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add symbol..."
                                value={newSymbol}
                                onChange={(e) => setNewSymbol(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addToWatchlist()}
                                className="flex-1"
                            />
                            <Button size="icon" onClick={addToWatchlist}>
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {watchlist.map((stock) => (
                                <div
                                    key={stock.symbol}
                                    className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                                >
                                    <div>
                                        <p className="font-medium text-sm">{stock.symbol}</p>
                                        <p className="text-xs text-muted-foreground">{stock.name}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-right">
                                            <p className="font-medium text-sm">${stock.price.toFixed(2)}</p>
                                            <p className={`text-xs ${stock.change >= 0 ? "text-success" : "text-destructive"}`}>
                                                {stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeFromWatchlist(stock.symbol)}
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Market News */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Newspaper className="w-5 h-5 text-info" />
                            Market News
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {marketNews.map((news, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
                                    <Badge
                                        variant={news.sentiment === "bullish" ? "success" : news.sentiment === "bearish" ? "destructive" : "secondary"}
                                        className="text-xs shrink-0 mt-0.5"
                                    >
                                        {news.sentiment === "bullish" ? <TrendingUp className="w-3 h-3" /> : news.sentiment === "bearish" ? <TrendingDown className="w-3 h-3" /> : null}
                                    </Badge>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">{news.title}</p>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                            <span>{news.source}</span>
                                            <span>•</span>
                                            <span>{news.time}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Market Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-primary" />
                            Global Markets
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[
                            { name: "FTSE 100 (UK)", value: "7,685.25", change: "+0.45%" },
                            { name: "DAX (Germany)", value: "16,845.12", change: "+0.82%" },
                            { name: "Nikkei 225 (Japan)", value: "33,464.17", change: "-0.32%" },
                            { name: "Shanghai (China)", value: "2,986.53", change: "-0.15%" },
                            { name: "ASX 200 (Australia)", value: "7,512.80", change: "+0.28%" },
                        ].map((market) => (
                            <div key={market.name} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                                <span className="text-sm">{market.name}</span>
                                <div className="text-right">
                                    <p className="text-sm font-medium">{market.value}</p>
                                    <p className={`text-xs ${market.change.startsWith("+") ? "text-success" : "text-destructive"}`}>
                                        {market.change}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
