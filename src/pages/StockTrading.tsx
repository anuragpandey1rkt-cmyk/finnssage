import { useState, useEffect } from "react";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    BarChart3,
    Activity,
    Zap,
    ChevronDown,
} from "lucide-react";
import { useAIAgent } from "@/hooks/useAIAgent";
import { AIAgentController } from "@/components/trading/AIAgentController";
import { AIChatPanel } from "@/components/trading/AIChatPanel";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { fetchStockData, StockData, POPULAR_STOCKS } from "@/services/yahooFinance";
import { toast } from "sonner";

// Initial fallback data while loading
const INITIAL_STOCK_STATE: StockData = {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 0,
    change: 0,
    changePercent: 0,
    volume: 0,
    high: 0,
    low: 0,
    open: 0,
    prevClose: 0,
    chartData: []
};

export default function StockTrading() {
    const [selectedStock, setSelectedStock] = useState("AAPL");
    const [stock, setStock] = useState<StockData>(INITIAL_STOCK_STATE);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch data when selected stock changes
    useEffect(() => {
        const loadStockData = async () => {
            setIsLoading(true);
            try {
                const data = await fetchStockData(selectedStock);
                if (data) {
                    setStock(data);
                } else {
                    toast.error(`Failed to load data for ${selectedStock}`);
                }
            } catch (error) {
                console.error("Error loading stock data:", error);
                toast.error("Error connecting to market data service");
            } finally {
                setIsLoading(false);
            }
        };

        loadStockData();
    }, [selectedStock]);

    const [orderType, setOrderType] = useState("market");
    const [action, setAction] = useState<"buy" | "sell">("buy");
    const [quantity, setQuantity] = useState(10);
    const [limitPrice, setLimitPrice] = useState(0);
    const [stopPrice, setStopPrice] = useState(0);

    const {
        currentActionPlan,
        messages,
        isTyping,
        handleUserMessage,
        stopAIAgent,
        handleAgentComplete,
        resetChat
    } = useAIAgent({ [selectedStock]: stock }); // Pass current real stock data to AI

    const chartData = stock.chartData.length > 0 ? stock.chartData : [];
    const totalCost = quantity * stock.price;

    const technicalIndicators = [
        { label: "RSI (14)", value: "54.2", status: "Neutral" }, // These would ideally be calculated from real chart data
        { label: "Volume", value: (stock.volume / 1000000).toFixed(1) + "M", status: "High" },
        { label: "Day High", value: `$${stock.high.toFixed(2)}`, status: "Neutral" },
        { label: "Day Low", value: `$${stock.low.toFixed(2)}`, status: "Neutral" },
    ];

    const handleOrder = () => {
        alert(`${action.toUpperCase()} Order Placed!\n\n${quantity} shares of ${selectedStock} @ $${stock.price}\nTotal: $${totalCost.toFixed(2)}`);
    };

    return (
        <DashboardLayout title="Stock Trading" subtitle="Trade stocks with AI-powered insights">
            <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-6 overflow-hidden">
                {/* Left Side: Main Trading Interface (75%) */}
                <div className="flex-1 space-y-6 overflow-y-auto pr-2 pb-10 scrollbar-hide">
                    {/* Stock Selector & Price */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <select
                                            data-testid="stock-search"
                                            value={selectedStock}
                                            onChange={(e) => setSelectedStock(e.target.value)}
                                            className="flex h-10 w-[200px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                        >
                                            {POPULAR_STOCKS.map((symbol) => (
                                                <option key={symbol} value={symbol}>
                                                    {symbol}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div data-testid="stock-price" className="text-3xl font-bold">${stock.price.toFixed(2)}</div>
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
                                    { label: "Sector", value: stock.sector || "N/A" },
                                    { label: "Market Cap", value: stock.marketCap ? (stock.marketCap / 1e9).toFixed(2) + "B" : "N/A" },
                                    { label: "P/E Ratio", value: stock.peRatio?.toFixed(2) || "N/A" },
                                    { label: "Day High", value: `$${stock.high?.toFixed(2)}` },
                                    { label: "Day Low", value: `$${stock.low?.toFixed(2)}` },
                                    { label: "Prev Close", value: `$${stock.prevClose?.toFixed(2)}` },
                                    { label: "Open", value: `$${stock.open?.toFixed(2)}` },
                                    { label: "Volume", value: (stock.volume / 1e6).toFixed(1) + "M" },
                                ].map((item) => (
                                    <div key={item.label} className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
                                        <p className="font-semibold text-sm mt-1">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground mt-4">
                                <strong>About:</strong> {stock.description || `Real-time trading data for ${stock.symbol}`}
                            </p>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Price Chart (Takes 2/3) */}
                        <Card className="lg:col-span-2">
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

                        {/* Trading Panel (Takes 1/3) */}
                        <div className="space-y-4">
                            <Card className="h-full">
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
                                            data-testid="buy-button"
                                            variant={action === "buy" ? "default" : "outline"}
                                            className={action === "buy" ? "bg-success hover:bg-success/90" : ""}
                                            onClick={() => setAction("buy")}
                                        >
                                            Buy
                                        </Button>
                                        <Button
                                            data-testid="sell-button"
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
                                        <div className="relative">
                                            <select
                                                data-testid="order-type-select"
                                                value={orderType}
                                                onChange={(e) => setOrderType(e.target.value)}
                                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                            >
                                                <option value="market">Market Order</option>
                                                <option value="limit">Limit Order</option>
                                                <option value="stop">Stop Loss</option>
                                                <option value="stoplimit">Stop Limit</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                                        </div>
                                    </div>

                                    {/* Quantity */}
                                    <div className="space-y-2">
                                        <Label>Quantity</Label>
                                        <Input
                                            data-testid="quantity-input"
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
                        </div>
                    </div>

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

                {/* Right Side: AI Chat Panel (Fixed Width) */}
                <div className="w-full lg:w-[400px] shrink-0 h-[600px] lg:h-full pb-4">
                    <AIChatPanel
                        messages={messages}
                        onSendMessage={handleUserMessage}
                        isTyping={isTyping}
                        onReset={resetChat}
                    />
                </div>
            </div>

            <AIAgentController
                actionPlan={currentActionPlan}
                onComplete={handleAgentComplete}
                onStop={stopAIAgent}
            />
        </DashboardLayout>
    );
}
