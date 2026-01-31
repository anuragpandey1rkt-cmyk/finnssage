import { useState } from "react";
import {
    TrendingUp,
    TrendingDown,
    Search,
    DollarSign,
    BarChart3,
    Activity,
    Zap,
    Bot,
    ChevronDown,
    Info,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ComposedChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Line,
} from "recharts";

const stockData: Record<string, {
    name: string;
    sector: string;
    industry: string;
    marketCap: string;
    peRatio: string;
    eps: string;
    dividend: string;
    beta: string;
    high52w: string;
    low52w: string;
    avgVolume: string;
    description: string;
    price: number;
    change: number;
    changePercent: number;
}> = {
    AAPL: {
        name: "Apple Inc.",
        sector: "Technology",
        industry: "Consumer Electronics",
        marketCap: "$2.89T",
        peRatio: "28.5",
        eps: "$6.13",
        dividend: "$0.96",
        beta: "1.28",
        high52w: "$199.62",
        low52w: "$164.08",
        avgVolume: "52.4M",
        description: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.",
        price: 178.50,
        change: 2.45,
        changePercent: 1.39,
    },
    GOOGL: {
        name: "Alphabet Inc.",
        sector: "Technology",
        industry: "Internet Services",
        marketCap: "$1.82T",
        peRatio: "24.8",
        eps: "$5.80",
        dividend: "N/A",
        beta: "1.05",
        high52w: "$152.45",
        low52w: "$121.32",
        avgVolume: "28.6M",
        description: "Alphabet Inc. provides various products and services including Google Search, ads, Android, Chrome, and cloud computing.",
        price: 142.30,
        change: 1.85,
        changePercent: 1.32,
    },
    MSFT: {
        name: "Microsoft Corporation",
        sector: "Technology",
        industry: "Software",
        marketCap: "$2.78T",
        peRatio: "34.2",
        eps: "$10.34",
        dividend: "$2.72",
        beta: "0.92",
        high52w: "$430.82",
        low52w: "$362.90",
        avgVolume: "22.1M",
        description: "Microsoft develops, licenses, and supports software, services, devices, and solutions worldwide.",
        price: 410.25,
        change: 5.80,
        changePercent: 1.43,
    },
    TSLA: {
        name: "Tesla, Inc.",
        sector: "Consumer Cyclical",
        industry: "Auto Manufacturers",
        marketCap: "$758B",
        peRatio: "62.4",
        eps: "$3.82",
        dividend: "N/A",
        beta: "2.31",
        high52w: "$299.29",
        low52w: "$138.80",
        avgVolume: "98.2M",
        description: "Tesla designs, develops, manufactures, and sells electric vehicles and energy generation and storage systems.",
        price: 238.50,
        change: -4.20,
        changePercent: -1.73,
    },
    NVDA: {
        name: "NVIDIA Corporation",
        sector: "Technology",
        industry: "Semiconductors",
        marketCap: "$1.19T",
        peRatio: "65.8",
        eps: "$7.34",
        dividend: "$0.16",
        beta: "1.72",
        high52w: "$505.48",
        low52w: "$222.97",
        avgVolume: "45.8M",
        description: "NVIDIA Corporation provides graphics, computing, and networking solutions in the United States and internationally.",
        price: 485.20,
        change: 12.35,
        changePercent: 2.61,
    },
};

const technicalIndicators = [
    { label: "RSI (14)", value: "58.4", status: "Neutral" },
    { label: "MACD", value: "+0.82", status: "Bullish", positive: true },
    { label: "50-Day MA", value: "$172.30", status: "Above", positive: true },
    { label: "200-Day MA", value: "$165.80", status: "Above", positive: true },
    { label: "Volume", value: "52.4M", status: "High" },
];

// Generate mock chart data
function generateChartData() {
    const data = [];
    let basePrice = 175;
    for (let i = 0; i < 30; i++) {
        const change = (Math.random() - 0.5) * 5;
        const open = basePrice + change;
        const close = open + (Math.random() - 0.5) * 3;
        const high = Math.max(open, close) + Math.random() * 2;
        const low = Math.min(open, close) - Math.random() * 2;
        const volume = Math.floor(Math.random() * 50 + 30);

        data.push({
            date: `Day ${i + 1}`,
            open: parseFloat(open.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            volume,
            price: parseFloat(close.toFixed(2)),
        });
        basePrice = close;
    }
    return data;
}

export default function StockTrading() {
    const [selectedStock, setSelectedStock] = useState("AAPL");
    const [orderType, setOrderType] = useState("market");
    const [action, setAction] = useState<"buy" | "sell">("buy");
    const [quantity, setQuantity] = useState(10);
    const [limitPrice, setLimitPrice] = useState(0);
    const [stopPrice, setStopPrice] = useState(0);

    const stock = stockData[selectedStock];
    const chartData = generateChartData();
    const totalCost = quantity * stock.price;

    const handleOrder = () => {
        alert(`${action.toUpperCase()} Order Placed!\n\n${quantity} shares of ${selectedStock} @ $${stock.price}\nTotal: $${totalCost.toFixed(2)}`);
    };

    return (
        <DashboardLayout title="Stock Trading" subtitle="Trade stocks with AI-powered insights">
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stock Selector & Price */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Select value={selectedStock} onValueChange={setSelectedStock}>
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(stockData).map(([symbol, data]) => (
                                                <SelectItem key={symbol} value={symbol}>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold">{symbol}</span>
                                                        <span className="text-muted-foreground text-xs">{data.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="text-right">
                                    <div className="text-3xl font-bold">${stock.price.toFixed(2)}</div>
                                    <div className={`flex items-center gap-1 justify-end ${stock.change >= 0 ? "text-success" : "text-destructive"}`}>
                                        {stock.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                        <span className="font-medium">
                                            {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)} ({stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stock Info Grid */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Stock Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                {[
                                    { label: "Sector", value: stock.sector },
                                    { label: "Market Cap", value: stock.marketCap },
                                    { label: "P/E Ratio", value: stock.peRatio },
                                    { label: "EPS", value: stock.eps },
                                    { label: "Dividend", value: stock.dividend },
                                    { label: "Beta", value: stock.beta },
                                    { label: "52W High", value: stock.high52w },
                                    { label: "52W Low", value: stock.low52w },
                                    { label: "Avg Volume", value: stock.avgVolume },
                                    { label: "Industry", value: stock.industry },
                                ].map((item) => (
                                    <div key={item.label} className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
                                        <p className="font-semibold text-sm mt-1">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground mt-4">
                                <strong>About:</strong> {stock.description}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Price Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-primary" />
                                Price Chart (30 Days)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} interval={4} />
                                        <YAxis yAxisId="left" domain={["auto", "auto"]} axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                                        <YAxis yAxisId="right" orientation="right" hide />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "0.5rem" }}
                                            formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]}
                                        />
                                        <Bar dataKey="volume" fill="hsl(var(--muted))" opacity={0.3} yAxisId="right" />
                                        <Line type="monotone" dataKey="price" stroke="#2f81f7" strokeWidth={2} dot={false} yAxisId="left" />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Technical Indicators */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-info" />
                                Technical Indicators
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                {technicalIndicators.map((ind) => (
                                    <div key={ind.label} className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                                        <p className="text-xs text-muted-foreground">{ind.label}</p>
                                        <p className={`font-bold text-lg ${ind.positive ? "text-success" : ""}`}>{ind.value}</p>
                                        <Badge variant={ind.positive ? "success" : "secondary"} className="mt-1 text-xs">
                                            {ind.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Trading Panel */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-warning" />
                                Place Order
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Buy/Sell Toggle */}
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant={action === "buy" ? "default" : "outline"}
                                    className={action === "buy" ? "bg-success hover:bg-success/90" : ""}
                                    onClick={() => setAction("buy")}
                                >
                                    Buy
                                </Button>
                                <Button
                                    variant={action === "sell" ? "default" : "outline"}
                                    className={action === "sell" ? "bg-destructive hover:bg-destructive/90" : ""}
                                    onClick={() => setAction("sell")}
                                >
                                    Sell
                                </Button>
                            </div>

                            {/* Order Type */}
                            <div className="space-y-2">
                                <Label>Order Type</Label>
                                <Select value={orderType} onValueChange={setOrderType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="market">Market Order</SelectItem>
                                        <SelectItem value="limit">Limit Order</SelectItem>
                                        <SelectItem value="stop">Stop Loss</SelectItem>
                                        <SelectItem value="stoplimit">Stop Limit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Quantity */}
                            <div className="space-y-2">
                                <Label>Quantity</Label>
                                <Input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    min={1}
                                />
                            </div>

                            {/* Limit Price (conditional) */}
                            {(orderType === "limit" || orderType === "stoplimit") && (
                                <div className="space-y-2">
                                    <Label>Limit Price ($)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            value={limitPrice || stock.price}
                                            onChange={(e) => setLimitPrice(Number(e.target.value))}
                                            className="pl-10"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Stop Price (conditional) */}
                            {(orderType === "stop" || orderType === "stoplimit") && (
                                <div className="space-y-2">
                                    <Label>Stop Price ($)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            value={stopPrice || stock.price * 0.95}
                                            onChange={(e) => setStopPrice(Number(e.target.value))}
                                            className="pl-10"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Order Summary */}
                            <div className="p-4 rounded-lg bg-secondary/30 border border-border/50 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Estimated Total</span>
                                    <span className="font-bold">${totalCost.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Commission</span>
                                    <span>$0.00</span>
                                </div>
                            </div>

                            <Button
                                className={`w-full ${action === "buy" ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"}`}
                                onClick={handleOrder}
                            >
                                {action === "buy" ? "🟢 Place Buy Order" : "🔴 Place Sell Order"}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* AI Analysis */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bot className="w-5 h-5 text-primary" />
                                AI Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Recommendation</p>
                                <p className="text-2xl font-bold text-success">BUY</p>
                                <p className="text-xs text-muted-foreground">Confidence: 78%</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">Target Price</p>
                                    <p className="font-bold text-success">${(stock.price * 1.12).toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Stop Loss</p>
                                    <p className="font-bold text-destructive">${(stock.price * 0.92).toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="p-3 rounded-lg bg-info/10 border border-info/20">
                                <p className="text-xs text-muted-foreground mb-2">
                                    <Info className="w-3 h-3 inline mr-1" />
                                    Key Insights
                                </p>
                                <ul className="text-xs space-y-1 text-muted-foreground">
                                    <li>• Strong earnings momentum</li>
                                    <li>• Bullish MACD crossover</li>
                                    <li>• Trading above key moving averages</li>
                                    <li>• Sector outperformance</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
