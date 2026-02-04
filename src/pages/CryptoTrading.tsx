import { useState } from "react";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Activity,
    Zap,
    Bot,
    Info,
    Clock,
    Globe,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const cryptoData: Record<string, {
    name: string;
    symbol: string;
    price: number;
    change24h: number;
    changePercent24h: number;
    marketCap: string;
    volume24h: string;
    circulatingSupply: string;
    maxSupply: string;
    allTimeHigh: string;
    description: string;
}> = {
    BTC: {
        name: "Bitcoin",
        symbol: "BTC",
        price: 48500.00,
        change24h: 1250.00,
        changePercent24h: 2.64,
        marketCap: "₹952B",
        volume24h: "₹28.4B",
        circulatingSupply: "19.6M BTC",
        maxSupply: "21M BTC",
        allTimeHigh: "₹69,000",
        description: "Bitcoin is a decentralized digital currency that can be transferred on the peer-to-peer bitcoin network.",
    },
    ETH: {
        name: "Ethereum",
        symbol: "ETH",
        price: 3200.00,
        change24h: 85.50,
        changePercent24h: 2.74,
        marketCap: "₹384B",
        volume24h: "₹15.2B",
        circulatingSupply: "120.2M ETH",
        maxSupply: "Unlimited",
        allTimeHigh: "₹4,878",
        description: "Ethereum is a decentralized platform that enables smart contracts and decentralized applications.",
    },
    SOL: {
        name: "Solana",
        symbol: "SOL",
        price: 98.50,
        change24h: -3.20,
        changePercent24h: -3.15,
        marketCap: "₹42.8B",
        volume24h: "₹2.1B",
        circulatingSupply: "435M SOL",
        maxSupply: "Unlimited",
        allTimeHigh: "₹260",
        description: "Solana is a high-performance blockchain supporting builders around the world creating crypto apps.",
    },
    XRP: {
        name: "XRP",
        symbol: "XRP",
        price: 0.62,
        change24h: 0.02,
        changePercent24h: 3.33,
        marketCap: "₹33.6B",
        volume24h: "₹1.8B",
        circulatingSupply: "54.2B XRP",
        maxSupply: "100B XRP",
        allTimeHigh: "₹3.40",
        description: "XRP is the native cryptocurrency of the XRP Ledger, designed for fast and low-cost transactions.",
    },
    ADA: {
        name: "Cardano",
        symbol: "ADA",
        price: 0.58,
        change24h: 0.015,
        changePercent24h: 2.65,
        marketCap: "₹20.4B",
        volume24h: "₹456M",
        circulatingSupply: "35.2B ADA",
        maxSupply: "45B ADA",
        allTimeHigh: "₹3.10",
        description: "Cardano is a proof-of-stake blockchain platform with smart contract functionality.",
    },
};

// Generate mock chart data
function generateCryptoChartData(basePrice: number) {
    const data = [];
    let price = basePrice * 0.9;
    for (let i = 0; i < 24; i++) {
        const change = (Math.random() - 0.45) * (basePrice * 0.02);
        price = Math.max(price + change, basePrice * 0.8);
        data.push({
            time: `${i}:00`,
            price: parseFloat(price.toFixed(2)),
            volume: Math.floor(Math.random() * 1000 + 500),
        });
    }
    return data;
}

// Mock order book
function generateOrderBook(price: number) {
    const bids = [];
    const asks = [];

    for (let i = 0; i < 5; i++) {
        bids.push({
            price: (price - (i + 1) * (price * 0.001)).toFixed(2),
            amount: (Math.random() * 2 + 0.5).toFixed(4),
            total: (Math.random() * 5000 + 1000).toFixed(2),
        });
        asks.push({
            price: (price + (i + 1) * (price * 0.001)).toFixed(2),
            amount: (Math.random() * 2 + 0.5).toFixed(4),
            total: (Math.random() * 5000 + 1000).toFixed(2),
        });
    }

    return { bids, asks };
}

export default function CryptoTrading() {
    const [selectedCrypto, setSelectedCrypto] = useState("BTC");
    const [action, setAction] = useState<"buy" | "sell">("buy");
    const [orderType, setOrderType] = useState("market");
    const [amount, setAmount] = useState(0.1);
    const [limitPrice, setLimitPrice] = useState(0);

    const crypto = cryptoData[selectedCrypto];
    const chartData = generateCryptoChartData(crypto.price);
    const orderBook = generateOrderBook(crypto.price);
    const totalCost = amount * crypto.price;

    const handleOrder = () => {
        alert(`${action.toUpperCase()} Order Placed!\n\n${amount} ${crypto.symbol} @ ₹${crypto.price.toLocaleString()}\nTotal: ₹${totalCost.toLocaleString()}`);
    };

    return (
        <DashboardLayout title="Crypto Trading" subtitle="Trade cryptocurrencies 24/7">
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Crypto Selector & Price */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(cryptoData).map(([symbol, data]) => (
                                                <SelectItem key={symbol} value={symbol}>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold">{symbol}</span>
                                                        <span className="text-muted-foreground text-xs">{data.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Badge variant="success" className="gap-1">
                                        <Globe className="w-3 h-3" />
                                        24/7 Trading
                                    </Badge>
                                </div>

                                <div className="text-right">
                                    <div className="text-3xl font-bold">₹{crypto.price.toLocaleString()}</div>
                                    <div className={`flex items-center gap-1 justify-end ${crypto.change24h >= 0 ? "text-success" : "text-destructive"}`}>
                                        {crypto.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                        <span className="font-medium">
                                            {crypto.change24h >= 0 ? "+" : ""}₹{crypto.change24h.toLocaleString()} ({crypto.change24h >= 0 ? "+" : ""}{crypto.changePercent24h.toFixed(2)}%)
                                        </span>
                                        <span className="text-muted-foreground text-xs ml-1">24h</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Crypto Info Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: "Market Cap", value: crypto.marketCap },
                            { label: "24h Volume", value: crypto.volume24h },
                            { label: "Circulating Supply", value: crypto.circulatingSupply },
                            { label: "All-Time High", value: crypto.allTimeHigh },
                        ].map((item) => (
                            <Card key={item.label}>
                                <CardContent className="pt-4 pb-4">
                                    <p className="text-xs text-muted-foreground">{item.label}</p>
                                    <p className="font-bold text-lg">{item.value}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Price Chart */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary" />
                                    Price Chart (24h)
                                </CardTitle>
                                <div className="flex gap-2">
                                    {["1H", "24H", "7D", "30D", "1Y"].map((period) => (
                                        <Button key={period} variant={period === "24H" ? "default" : "ghost"} size="sm" className="text-xs">
                                            {period}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorCrypto" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={crypto.change24h >= 0 ? "#10b981" : "#f43f5e"} stopOpacity={0.2} />
                                                <stop offset="95%" stopColor={crypto.change24h >= 0 ? "#10b981" : "#f43f5e"} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} interval={3} />
                                        <YAxis domain={["auto", "auto"]} axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "0.5rem" }}
                                            formatter={(value: number) => [`₹${value.toLocaleString()}`, "Price"]}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="price"
                                            stroke={crypto.change24h >= 0 ? "#10b981" : "#f43f5e"}
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorCrypto)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Book */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Book</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-6">
                                {/* Bids */}
                                <div>
                                    <h4 className="text-sm font-medium text-success mb-3">Bids (Buy Orders)</h4>
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="border-b border-border">
                                                <th className="text-left py-2 text-muted-foreground font-medium">Price</th>
                                                <th className="text-right py-2 text-muted-foreground font-medium">Amount</th>
                                                <th className="text-right py-2 text-muted-foreground font-medium">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderBook.bids.map((bid, i) => (
                                                <tr key={i} className="border-b border-border/30 hover:bg-success/5">
                                                    <td className="py-2 text-success font-mono">₹{bid.price}</td>
                                                    <td className="py-2 text-right font-mono">{bid.amount}</td>
                                                    <td className="py-2 text-right font-mono">₹{bid.total}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Asks */}
                                <div>
                                    <h4 className="text-sm font-medium text-destructive mb-3">Asks (Sell Orders)</h4>
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="border-b border-border">
                                                <th className="text-left py-2 text-muted-foreground font-medium">Price</th>
                                                <th className="text-right py-2 text-muted-foreground font-medium">Amount</th>
                                                <th className="text-right py-2 text-muted-foreground font-medium">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderBook.asks.map((ask, i) => (
                                                <tr key={i} className="border-b border-border/30 hover:bg-destructive/5">
                                                    <td className="py-2 text-destructive font-mono">₹{ask.price}</td>
                                                    <td className="py-2 text-right font-mono">{ask.amount}</td>
                                                    <td className="py-2 text-right font-mono">₹{ask.total}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
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
                                Trade {crypto.symbol}
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
                                        <SelectItem value="stop">Stop Order</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Amount */}
                            <div className="space-y-2">
                                <Label>Amount ({crypto.symbol})</Label>
                                <Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    step="0.001"
                                    min={0.001}
                                />
                                <div className="flex gap-2">
                                    {[0.01, 0.1, 0.5, 1].map((preset) => (
                                        <Button key={preset} variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setAmount(preset)}>
                                            {preset}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Limit Price (conditional) */}
                            {orderType === "limit" && (
                                <div className="space-y-2">
                                    <Label>Limit Price (INR)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            value={limitPrice || crypto.price}
                                            onChange={(e) => setLimitPrice(Number(e.target.value))}
                                            className="pl-10"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Order Summary */}
                            <div className="p-4 rounded-lg bg-secondary/30 border border-border/50 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Amount</span>
                                    <span className="font-medium">{amount} {crypto.symbol}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Price</span>
                                    <span className="font-medium">₹{crypto.price.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm pt-2 border-t border-border">
                                    <span className="text-muted-foreground">Total</span>
                                    <span className="font-bold">₹{totalCost.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Fee (0.1%)</span>
                                    <span>₹{(totalCost * 0.001).toFixed(2)}</span>
                                </div>
                            </div>

                            <Button
                                className={`w-full ${action === "buy" ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"}`}
                                onClick={handleOrder}
                            >
                                {action === "buy" ? `🟢 Buy ${crypto.symbol}` : `🔴 Sell ${crypto.symbol}`}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Market Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bot className="w-5 h-5 text-primary" />
                                Market Sentiment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Fear & Greed Index</span>
                                <Badge variant="success">72 - Greed</Badge>
                            </div>

                            <div className="h-2 bg-gradient-to-r from-destructive via-warning to-success rounded-full">
                                <div className="w-[72%] h-full bg-transparent relative">
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-success" />
                                </div>
                            </div>

                            <div className="p-3 rounded-lg bg-info/10 border border-info/20">
                                <p className="text-xs text-muted-foreground">
                                    <Info className="w-3 h-3 inline mr-1" />
                                    {crypto.description}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>Market open 24/7</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
