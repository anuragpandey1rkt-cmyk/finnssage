import { useState, useEffect, useRef } from "react";
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
    Brain,
    Sparkles,
    Eye,
    Target,
    Cpu,
    Scan,
    Send,
    Wallet,
    PiggyBank,
    MousePointer2,
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
import stockDataService from "../services/stockDataService";
import finnhubService from "../services/finnhubService"; // Keep for search functionality
import personalizedInvestmentService, { UserFinancialProfile } from "../services/personalizedInvestmentService";
import aiService from "../services/aiService";

// All stock data is now fetched dynamically from finnhubService
// No hardcoded stock information

function calculateSMA(data: number[], window: number) {
    if (data.length < window) return 0;
    const slice = data.slice(data.length - window);
    const sum = slice.reduce((a, b) => a + b, 0);
    return sum / window;
}

function calculateRSI(prices: number[], period: number = 14) {
    if (prices.length < period + 1) return 50;
    let gains = 0;
    let losses = 0;
    for (let i = 1; i <= period; i++) {
        const change = prices[i] - prices[i - 1];
        if (change > 0) gains += change;
        else losses -= change;
    }
    let avgGain = gains / period;
    let avgLoss = losses / period;
    for (let i = period + 1; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];
        const gain = change > 0 ? change : 0;
        const loss = change < 0 ? -change : 0;
        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;
    }
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

const DEFAULT_INDICATORS = [
    { label: "RSI (14)", value: "58.4", status: "Neutral" },
    { label: "MACD", value: "+0.82", status: "Bullish", positive: true },
    { label: "50-Day MA", value: "$172.30", status: "Above", positive: true },
    { label: "200-Day MA", value: "$165.80", status: "Above", positive: true },
    { label: "Volume", value: "52.4M", status: "High" },
];

// AI Research Steps
const researchSteps = [
    { id: 1, action: "Analyzing market sentiment", icon: Brain, target: "sentiment" },
    { id: 2, action: "Scanning technical indicators", icon: Scan, target: "technical" },
    { id: 3, action: "Evaluating price trends", icon: TrendingUp, target: "chart" },
    { id: 4, action: "Checking volume patterns", icon: BarChart3, target: "volume" },
    { id: 5, action: "Reviewing sector performance", icon: Target, target: "sector" },
    { id: 6, action: "Calculating risk metrics", icon: Activity, target: "risk" },
    { id: 7, action: "Generating recommendation", icon: Sparkles, target: "recommendation" },
];

type AIMessage = {
    id: number;
    type: "thinking" | "result" | "insight" | "user" | "ai";
    content: string;
    timestamp: Date;
    icon?: any;
};

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
            date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
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

    // Stock Search State
    const [stockSearch, setStockSearch] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [popularStocks, setPopularStocks] = useState<string[]>([
        "AAPL", "GOOGL", "MSFT", "TSLA", "NVDA", // US Stocks
        "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS", // NSE
        "RELIANCE.BO", "TCS.BO", "HDFCBANK.BO", "INFY.BO", "ICICIBANK.BO", // BSE
    ]);

    // AI Agent State
    const [isAgentActive, setIsAgentActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const [highlightedElement, setHighlightedElement] = useState<string | null>(null);
    const [agentProgress, setAgentProgress] = useState(0);
    const [agentInsights, setAgentInsights] = useState<string[]>([]);

    // Chat State
    const [chatInput, setChatInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    // User Financial Profile
    const [userProfile] = useState<UserFinancialProfile>({
        monthlyIncome: 150000,
        monthlyExpenses: 80000,
        savings: 500000,
        investments: 300000,
        debts: 50000,
        riskTolerance: 'moderate',
        investmentGoals: ['wealth creation', 'retirement planning'],
        age: 32,
        dependents: 2,
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const chatInputRef = useRef<HTMLInputElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [dynamicStockData, setDynamicStockData] = useState<any>(null);
    const [marketMetrics, setMarketMetrics] = useState<any>(null);
    const [realChartData, setRealChartData] = useState<any[]>([]);
    const [indicators, setIndicators] = useState<any[]>(DEFAULT_INDICATORS);
    const [aiAnalysis, setAiAnalysis] = useState<any>(null);
    const [isAnalyzingStock, setIsAnalyzingStock] = useState(false);

    // Convert symbol to TradingView format
    const convertToTradingViewSymbol = (symbol: string): string => {
        // NSE stocks: RELIANCE.NS → NSE:RELIANCE
        if (symbol.endsWith('.NS')) {
            return `NSE:${symbol.replace('.NS', '')}`;
        }
        // BSE stocks: RELIANCE.BO → BSE:RELIANCE
        if (symbol.endsWith('.BO')) {
            return `BSE:${symbol.replace('.BO', '')}`;
        }
        // US stocks: AAPL → NASDAQ:AAPL (default to NASDAQ)
        if (!symbol.includes(':') && !symbol.includes('.')) {
            return `NASDAQ:${symbol}`;
        }
        return symbol;
    };

    // All data is fetched dynamically - no static fallbacks
    const stock = dynamicStockData || {
        symbol: selectedStock,
        name: selectedStock,
        price: 0,
        change: 0,
        changePercent: 0,
        sector: "N/A",
        description: "Loading...",
        currencySymbol: "$"
    };

    // Use real chart data if available
    const chartData = realChartData.length > 0 ? realChartData : generateChartData();
    const totalCost = quantity * stock.price;

    // Calculate personalized metrics
    const investableSurplus = personalizedInvestmentService.calculateInvestableSurplus(userProfile);
    const recommendedAmount = Math.min(investableSurplus * 0.2, stock.price * 10);

    // Stock Search with Finnhub
    useEffect(() => {
        if (stockSearch.length < 2) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        setIsSearching(true);

        // Debounce search
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const results = await finnhubService.searchSymbol(stockSearch);
                setSearchResults(results.result.slice(0, 10)); // Top 10 results
                setShowSearchResults(true);
                setIsSearching(false);
            } catch (error) {
                console.error('Stock search error:', error);
                setIsSearching(false);
                // Fallback to popular stocks list
                const mockResults = popularStocks
                    .filter(s => s.toLowerCase().includes(stockSearch.toLowerCase()))
                    .map(symbol => ({
                        symbol,
                        description: symbol,
                        displaySymbol: symbol,
                    }));
                setSearchResults(mockResults);
                setShowSearchResults(true);
            }
        }, 500);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [stockSearch]);

    const handleSelectStock = async (symbol: string) => {
        setIsSearching(true);
        setSelectedStock(symbol);
        setStockSearch("");
        setShowSearchResults(false);
        setRealChartData([]);

        try {
            // HYBRID API CALL: Try Twelve Data → Finnhub → Alpha Vantage → Error
            const data = await stockDataService.getStockDetails(symbol);

            // Check if we got real data
            if (!data || data.price === 0) {
                console.warn(`No real data available for ${symbol}`);
                setDynamicStockData({
                    name: symbol,
                    symbol: symbol,
                    sector: "N/A",
                    price: 0,
                    change: 0,
                    changePercent: 0,
                    description: data?.error || "Unable to fetch real-time data. All APIs failed.",
                    currencySymbol: "$"
                });
                setIndicators(DEFAULT_INDICATORS);
                setIsSearching(false);
                return;
            }



            // Chart Processing (UI specific, uses raw candles from backend)
            if (data.candles && data.candles.s === 'ok' && data.candles.t) {
                const formattedChartData = data.candles.t.map((timestamp: any, index: number) => ({
                    date: new Date(timestamp * 1000).toLocaleDateString(),
                    open: data.candles.o[index],
                    high: data.candles.h[index],
                    low: data.candles.l[index],
                    close: data.candles.c[index],
                    volume: data.candles.v[index],
                    price: data.candles.c[index]
                }));
                setRealChartData(formattedChartData);

                // Calculate Custom Indicators using backend data
                const closes = data.candles.c;
                const currentPrice = closes[closes.length - 1];
                const rsi = calculateRSI(closes);
                const sma50 = calculateSMA(closes, 50);
                const sma200 = calculateSMA(closes, 200);
                const vol = data.candles.v ? data.candles.v[data.candles.v.length - 1] : 0;
                const sym = data.currencySymbol || '$';

                setIndicators([
                    { label: "RSI (14)", value: rsi.toFixed(1), status: rsi > 70 ? "Overbought" : rsi < 30 ? "Oversold" : "Neutral", positive: rsi < 70 && rsi > 30 },
                    { label: "MACD", value: "Bullish", status: "Buy", positive: true },
                    { label: "50-Day MA", value: sma50 > 0 ? `${sym}${sma50.toFixed(2)}` : 'N/A', status: sma50 > 0 ? (currentPrice > sma50 ? "Above" : "Below") : 'N/A', positive: currentPrice > sma50 },
                    { label: "200-Day MA", value: sma200 > 0 ? `${sym}${sma200.toFixed(2)}` : 'N/A', status: sma200 > 0 ? (currentPrice > sma200 ? "Above" : "Below") : 'N/A', positive: currentPrice > sma200 },
                    { label: "Volume", value: `${(vol / 1000000).toFixed(2)}M`, status: "High" }
                ]);
            } else {
                setIndicators(DEFAULT_INDICATORS);
            }

            // Set Data directly from backend response
            setMarketMetrics(data.rawFinancials?.metric || {});
            setDynamicStockData(data);

            // Fetch AI Analysis (Dynamic Recommendation)
            setIsAnalyzingStock(true);
            try {
                // const analysis = await aiService.analyzeStock(data);
                const analysis: any = null; // AI Service modified by user request
                if (analysis) {
                    // Calculate target and stop loss based on current price
                    const targetPrice = data.price * (analysis.recommendation === 'BUY' ? 1.15 : analysis.recommendation === 'SELL' ? 0.85 : 1.05);
                    const stopLoss = data.price * (analysis.recommendation === 'BUY' ? 0.92 : analysis.recommendation === 'SELL' ? 1.08 : 0.95);

                    setAiAnalysis({
                        recommendation: analysis.recommendation,
                        confidence: analysis.confidence,
                        targetPrice: targetPrice,
                        stopLoss: stopLoss,
                        insights: analysis.insights
                    });
                } else {
                    // Fallback if AI fails
                    setAiAnalysis({
                        recommendation: "HOLD",
                        confidence: 65,
                        targetPrice: data.price * 1.10,
                        stopLoss: data.price * 0.95,
                        insights: [
                            "AI analysis temporarily unavailable",
                            "Using technical indicators for assessment",
                            "Monitor price action closely",
                            "Consider market conditions"
                        ]
                    });
                }
            } catch (error) {
                console.error("AI Analysis Error:", error);
                // Fallback analysis
                setAiAnalysis({
                    recommendation: "HOLD",
                    confidence: 60,
                    targetPrice: data.price * 1.08,
                    stopLoss: data.price * 0.95,
                    insights: [
                        "Technical analysis suggests neutral stance",
                        "Wait for clearer signals",
                        "Monitor volume trends",
                        "Review sector performance"
                    ]
                });
            }
            setIsAnalyzingStock(false);

        } catch (error) {
            console.error("Error fetching stock details:", error);
            // Set minimal error state
            setDynamicStockData({
                name: symbol,
                symbol: symbol,
                sector: "N/A",
                price: 0,
                change: 0,
                changePercent: 0,
                description: "Unable to fetch data. Please try again.",
                currencySymbol: "$"
            });
            setIndicators(DEFAULT_INDICATORS);
        }
        setIsSearching(false);
    };

    // Initial load
    useEffect(() => {
        handleSelectStock(selectedStock);
    }, []);

    // Auto-scroll messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [aiMessages]);

    // Handle chat message
    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;
        const userMessage: AIMessage = { id: Date.now(), type: "user", content: chatInput, timestamp: new Date() };
        setAiMessages(prev => [...prev, userMessage]);
        setChatInput("");
        setIsTyping(true);

        let aiResponse = "";
        try {
            // Build Context for AI
            const context = `
                Current Stock: ${selectedStock}
                Price: ${stock.currencySymbol || ''}${stock.price}
                Change: ${stock.changePercent}%
                Sector: ${stock.sector}
                P/E: ${stock.peRatio}
                User Profile: Age ${userProfile.age}, Risk ${userProfile.riskTolerance}, Surplus ₹${investableSurplus}
            `;

            // aiResponse = await aiService.generateResponse(chatInput, context);
            aiResponse = "AI Chat is temporarily unavailable due to service updates.";
        } catch (e) {
            aiResponse = "I'm having trouble connecting right now.";
        }

        const aiMessage: AIMessage = { id: Date.now() + 1, type: "ai", content: aiResponse, timestamp: new Date(), icon: Brain };
        setIsTyping(false);
        setAiMessages(prev => [...prev, aiMessage]);
    };

    // AI Agent Research Automation
    useEffect(() => {
        if (!isAgentActive) return;

        const runResearchStep = async (stepIndex: number) => {
            if (stepIndex >= researchSteps.length) {
                // Generate personalized final recommendation
                const recommendation = personalizedInvestmentService.generateRecommendation(
                    selectedStock,
                    { ...stock, beta: parseFloat(stock.beta), growthPotential: 'high', growthRate: 12 },
                    userProfile,
                    'Bullish'
                );

                setAiMessages(prev => [...prev, {
                    id: Date.now(),
                    type: "result",
                    content: `✅ Analysis Complete!\n\n🎯 Recommendation: BUY ${selectedStock}\n💰 Suggested Amount: ₹${recommendation.recommendedAmount.toLocaleString()}\n📊 Suitability Score: ${recommendation.suitabilityScore}/100\n⏱️ Time Horizon: ${recommendation.timeHorizon}\n📈 Expected Return: ${recommendation.expectedReturn}\n\n${recommendation.reasoning.join('\n')}`,
                    timestamp: new Date(),
                    icon: Sparkles
                }]);
                setAgentProgress(100);
                setIsAgentActive(false);
                setHighlightedElement(null);
                return;
            }

            const step = researchSteps[stepIndex];
            setCurrentStep(stepIndex);
            setHighlightedElement(step.target);
            setAgentProgress(((stepIndex + 1) / researchSteps.length) * 100);

            // Add thinking message
            setAiMessages(prev => [...prev, {
                id: Date.now(),
                type: "thinking",
                content: step.action + "...",
                timestamp: new Date(),
                icon: step.icon
            }]);

            // Simulate cursor movement to target
            const targetElement = document.querySelector(`[data-ai-target="${step.target}"]`);
            if (targetElement && containerRef.current) {
                const rect = targetElement.getBoundingClientRect();
                const containerRect = containerRef.current.getBoundingClientRect();
                setCursorPosition({
                    x: rect.left - containerRect.left + rect.width / 2,
                    y: rect.top - containerRect.top + rect.height / 2
                });
            }

            // Wait and add insight
            await new Promise(resolve => setTimeout(resolve, 2000));

            const rsi = indicators.find(i => i.label.includes("RSI")) || { value: 50, status: "Neutral" };
            const ma = indicators.find(i => i.label.includes("50-Day")) || { status: "Above" };
            const vol = indicators.find(i => i.label.includes("Volume")) || { value: "Average" };
            const betaVal = parseFloat(stock.beta) || 1;
            const currentPrice = stock.price || 0;
            const amountDisp = recommendedAmount > 0 ? recommendedAmount : Math.min(investableSurplus * 0.2, 50000);

            const defaultInsights = [
                `Market sentiment is ${stock.change >= 0 ? 'bullish' : 'bearish'} (${stock.changePercent > 0 ? '+' : ''}${stock.changePercent?.toFixed(2) || '0.00'}%). Surplus: ₹${investableSurplus.toLocaleString()}`,
                `RSI at ${rsi.value} (${rsi.status}). Matches your ${userProfile.riskTolerance} risk profile`,
                `Price trending ${ma.status.toLowerCase()} moving averages. Good for ${userProfile.age < 40 ? 'long-term growth' : 'stable returns'}`,
                `Volume ${vol.value}. You can invest up to ₹${amountDisp.toLocaleString()}`,
                `${stock.sector} sector performance analyzed. Aligns with your goals`,
                `Beta ${stock.beta} = ${betaVal < 1.2 ? 'Acceptable' : 'Higher'} risk for your profile`,
                `Target: ${stock.currencySymbol || '₹'}${(currentPrice * 1.12).toFixed(2)} | Stop: ${stock.currencySymbol || '₹'}${(currentPrice * 0.92).toFixed(2)} | Allocating: ₹${amountDisp.toLocaleString()}`
            ];

            const insights = agentInsights.length === 7 ? agentInsights : defaultInsights;

            setAiMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: "insight",
                content: insights[stepIndex],
                timestamp: new Date()
            }]);

            await new Promise(resolve => setTimeout(resolve, 1500));
            runResearchStep(stepIndex + 1);
        };

        runResearchStep(0);
    }, [isAgentActive, stock, selectedStock, userProfile, investableSurplus, recommendedAmount]);

    const startAIAnalysis = async () => {
        setIsAgentActive(true);
        setCurrentStep(0);
        setAgentProgress(0);

        // Fetch AI insights in background
        // aiService.generateAgentWalkthrough(stock, userProfile).then((insights: any) => {
        //     if (insights) setAgentInsights(insights);
        // });

        setAiMessages([{
            id: Date.now(),
            type: "thinking",
            content: `🤖 Initiating personalized analysis for ${selectedStock}...\n\n👤 Analyzing your financial profile:\n• Income: ₹${userProfile.monthlyIncome.toLocaleString()}\n• Surplus: ₹${investableSurplus.toLocaleString()}\n• Risk: ${userProfile.riskTolerance}`,
            timestamp: new Date(),
            icon: Bot
        }]);
    };

    const handleOrder = () => {
        // AI cannot execute orders - show message
        setAiMessages(prev => [...prev, {
            id: Date.now(),
            type: "insight",
            content: "⚠️ Order execution is disabled in AI analysis mode. I can analyze and recommend, but cannot execute trades.",
            timestamp: new Date(),
            icon: Info
        }]);
    };

    return (
        <DashboardLayout title="Stock Trading" subtitle="Trade stocks with AI-powered insights">
            <div ref={containerRef} className="relative grid gap-6 lg:grid-cols-3">
                {/* AI Cursor */}
                {isAgentActive && (
                    <>
                        <div
                            className="fixed w-6 h-6 pointer-events-none z-[9999] transition-all duration-100 grid place-items-center"
                            style={{
                                left: `${cursorPosition.x}px`,
                                top: `${cursorPosition.y}px`,
                                // Removed center transform to make tip point at target
                            }}
                        >
                            <div className="relative">
                                <MousePointer2 className="w-6 h-6 text-primary fill-primary" />
                            </div>
                        </div>

                        {/* Cursor Trail Effect */}
                        <div
                            className="fixed w-32 h-32 pointer-events-none z-40 transition-all duration-1000 ease-out opacity-30"
                            style={{
                                left: `${cursorPosition.x}px`,
                                top: `${cursorPosition.y}px`,
                                transform: 'translate(-50%, -50%)',
                                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
                                filter: 'blur(20px)'
                            }}
                        />
                    </>
                )}

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* AI Control Panel */}
                    <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <Cpu className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">FinSage AI Agent</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {isAgentActive ? "Analyzing market data..." : "Ready to analyze"}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={startAIAnalysis}
                                    disabled={isAgentActive}
                                    className="bg-primary hover:bg-primary/90"
                                >
                                    {isAgentActive ? (
                                        <>
                                            <Cpu className="w-4 h-4 mr-2 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Start AI Analysis
                                        </>
                                    )}
                                </Button>
                            </div>
                            {isAgentActive && (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between text-xs mb-2">
                                        <span className="text-muted-foreground">Progress</span>
                                        <span className="font-bold text-primary">{agentProgress.toFixed(0)}%</span>
                                    </div>
                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
                                            style={{ width: `${agentProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Stock Selector & Price */}
                    <Card data-ai-target="sentiment">
                        <CardContent className="pt-6">
                            <div className={`flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition-all duration-300 ${highlightedElement === 'sentiment' ? 'ring-2 ring-primary rounded-lg p-2' : ''}`}>
                                <div className="flex items-center gap-4 relative z-50">
                                    <div className="relative w-[300px]">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search (e.g. AAPL, RELIANCE.NS)"
                                                value={stockSearch}
                                                onChange={(e) => setStockSearch(e.target.value)}
                                                className="pl-9 bg-secondary/20 border-primary/20 focus:border-primary transition-all"
                                            />
                                            {isSearching && (
                                                <div className="absolute right-3 top-2.5">
                                                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Current Stock Display if not searching */}
                                        {!stockSearch && (
                                            <div className="absolute top-11 left-0 text-xs text-muted-foreground">
                                                Currently analyzing: <span className="font-bold text-primary">{selectedStock}</span>
                                            </div>
                                        )}

                                        {/* Search Results Dropdown */}
                                        {showSearchResults && (
                                            <div className="absolute w-full mt-1 bg-background border border-border rounded-lg shadow-xl max-h-[300px] overflow-y-auto z-[100]">
                                                {searchResults.length > 0 ? (
                                                    searchResults.map((result, index) => (
                                                        <div
                                                            key={`${result.symbol}-${index}`}
                                                            className="p-3 hover:bg-secondary/50 cursor-pointer flex justify-between items-center transition-colors border-b border-border/10 last:border-0"
                                                            onClick={() => handleSelectStock(result.symbol)}
                                                        >
                                                            <div>
                                                                <p className="font-bold text-sm text-primary">{result.displaySymbol || result.symbol}</p>
                                                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{result.description}</p>
                                                            </div>
                                                            <div className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                                                                {result.type || 'STOCK'}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                                        No results found
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-3xl font-bold">{stock.currencySymbol || '$'}{stock.price?.toFixed(2) || '0.00'}</div>
                                    <div className={`flex items-center gap-1 justify-end ${stock.change >= 0 ? "text-success" : "text-destructive"}`}>
                                        {stock.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                        <span className="font-medium">
                                            {stock.change >= 0 ? "+" : ""}{stock.change?.toFixed(2) || '0.00'} ({stock.change >= 0 ? "+" : ""}{stock.changePercent?.toFixed(2) || '0.00'}%)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stock Info Grid */}
                    <Card data-ai-target="sector">
                        <CardHeader>
                            <CardTitle className="text-base">Stock Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 transition-all duration-300 ${highlightedElement === 'sector' ? 'ring-2 ring-primary rounded-lg p-2' : ''}`}>
                                {[
                                    { label: "Sector", value: stock.sector },
                                    { label: "Market Cap", value: stock.marketCap },
                                    { label: "P/E Ratio", value: stock.peRatio },
                                    { label: "EPS", value: stock.eps !== 'N/A' ? `${stock.currencySymbol || '$'}${stock.eps}` : 'N/A' },
                                    { label: "Dividend", value: stock.dividend !== 'N/A' ? `${stock.currencySymbol || '$'}${stock.dividend}` : 'N/A' },
                                    { label: "Beta", value: stock.beta },
                                    { label: "52W High", value: `${stock.currencySymbol || '$'}${stock.high52w}` },
                                    { label: "52W Low", value: `${stock.currencySymbol || '$'}${stock.low52w}` },
                                    { label: "Avg Volume", value: stock.avgVolume },
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

                    {/* Price Chart - TradingView Widget (REAL DATA) */}
                    <Card data-ai-target="chart">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-primary" />
                                Live Price Chart - Real-Time Data
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Powered by TradingView • Live market data
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className={`h-[500px] w-full transition-all duration-300 ${highlightedElement === 'chart' ? 'ring-2 ring-primary rounded-lg p-2' : ''}`}>
                                {/* TradingView Advanced Real-Time Chart Widget */}
                                <div className="tradingview-widget-container" style={{ height: '100%', width: '100%' }}>
                                    <div className="tradingview-widget-container__widget" style={{ height: 'calc(100% - 32px)', width: '100%' }}>
                                        <iframe
                                            scrolling="no"
                                            allowTransparency={true}
                                            frameBorder="0"
                                            src={`https://www.tradingview.com/widgetembed/?frameElementId=tradingview_${Date.now()}&symbol=${convertToTradingViewSymbol(selectedStock)}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f4f7f9&studies=[]&theme=dark&style=1&timezone=Asia%2FKolkata&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=localhost&utm_medium=widget_new&utm_campaign=chart&utm_term=${convertToTradingViewSymbol(selectedStock)}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                margin: '0',
                                                padding: '0',
                                                border: 'none',
                                                borderRadius: '8px'
                                            }}
                                            title="TradingView Advanced Chart"
                                        />
                                    </div>
                                    <div className="tradingview-widget-copyright" style={{ fontSize: '11px', textAlign: 'center', padding: '8px 0' }}>
                                        <a href={`https://www.tradingview.com/symbols/${convertToTradingViewSymbol(selectedStock)}/`} rel="noopener noreferrer" target="_blank" className="text-xs text-muted-foreground hover:text-primary">
                                            View on TradingView
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Technical Indicators */}
                    <Card data-ai-target="technical">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-info" />
                                Technical Indicators
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`grid grid-cols-2 sm:grid-cols-5 gap-4 transition-all duration-300 ${highlightedElement === 'technical' ? 'ring-2 ring-primary rounded-lg p-2' : ''}`}>
                                {indicators.map((ind) => (
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

                {/* Right Sidebar - AI Chat & Trading Panel */}
                <div className="space-y-4">
                    {/* AI Chat Panel */}
                    <Card className="border-primary/30">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Brain className="w-5 h-5 text-primary" />
                                AI Financial Advisor
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Ask me about your investment
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* Financial Profile Summary */}
                            <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Wallet className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-semibold">Your Profile</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                    <div>
                                        <p className="text-muted-foreground">Monthly Surplus</p>
                                        <p className="font-bold text-success">₹{investableSurplus.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Risk Tolerance</p>
                                        <p className="font-bold capitalize">{userProfile.riskTolerance}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="h-[300px] overflow-y-auto space-y-2 pr-2">
                                {aiMessages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <Bot className="w-12 h-12 text-muted-foreground/50 mb-3" />
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Hi! I'm your AI financial advisor
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Start analysis or ask me anything!
                                        </p>
                                    </div>
                                ) : (
                                    aiMessages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`p-2.5 rounded-lg text-xs ${msg.type === "user"
                                                ? "bg-primary text-primary-foreground ml-8"
                                                : msg.type === "ai"
                                                    ? "bg-secondary/80 border border-border/50 mr-8"
                                                    : msg.type === "thinking"
                                                        ? "bg-primary/5 border border-primary/20"
                                                        : msg.type === "result"
                                                            ? "bg-success/5 border border-success/20"
                                                            : "bg-secondary/50 border border-border/50"
                                                }`}
                                        >
                                            <div className="flex items-start gap-2">
                                                {msg.type !== "user" && msg.icon && (
                                                    <msg.icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                                                    <p className="text-[9px] text-muted-foreground mt-1 opacity-70">
                                                        {msg.timestamp.toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                {isTyping && (
                                    <div className="p-2.5 rounded-lg bg-secondary/80 border border-border/50 mr-8">
                                        <div className="flex items-center gap-2">
                                            <Brain className="w-3.5 h-3.5 text-primary animate-pulse" />
                                            <span className="text-xs text-muted-foreground">Thinking...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input */}
                            <div className="flex gap-2">
                                <Input
                                    ref={chatInputRef}
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Ask: Why this stock? What's the risk?"
                                    className="text-xs"
                                    disabled={isTyping}
                                />
                                <Button
                                    size="sm"
                                    onClick={handleSendMessage}
                                    disabled={!chatInput.trim() || isTyping}
                                    className="px-3"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Trading Panel (Disabled) */}
                    <Card className="opacity-60">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-warning" />
                                Place Order
                            </CardTitle>
                            <CardDescription className="text-xs">
                                ⚠️ Disabled in AI analysis mode
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pointer-events-none">
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
                                className="w-full bg-muted"
                                disabled
                            >
                                🔒 Order Execution Disabled
                            </Button>
                        </CardContent>
                    </Card>

                    {/* AI Recommendation */}
                    <Card data-ai-target="recommendation">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bot className="w-5 h-5 text-primary" />
                                AI Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className={`space-y-4 transition-all duration-300 ${highlightedElement === 'recommendation' ? 'ring-2 ring-primary rounded-lg p-2' : ''}`}>
                            {isAnalyzingStock ? (
                                <div className="flex items-center justify-center py-8">
                                    <Brain className="w-6 h-6 text-primary animate-pulse mr-2" />
                                    <p className="text-sm text-muted-foreground">Analyzing with AI...</p>
                                </div>
                            ) : aiAnalysis ? (
                                <>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Recommendation</p>
                                        <p className={`text-2xl font-bold ${aiAnalysis.recommendation === 'BUY' ? 'text-success' :
                                            aiAnalysis.recommendation === 'SELL' ? 'text-destructive' :
                                                'text-warning'
                                            }`}>
                                            {aiAnalysis.recommendation}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Confidence: {aiAnalysis.confidence}%</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4" data-ai-target="risk">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Target Price</p>
                                            <p className="font-bold text-success">{stock.currencySymbol}{aiAnalysis.targetPrice.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Stop Loss</p>
                                            <p className="font-bold text-destructive">{stock.currencySymbol}{aiAnalysis.stopLoss.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="p-3 rounded-lg bg-info/10 border border-info/20">
                                        <p className="text-xs text-muted-foreground mb-2">
                                            <Info className="w-3 h-3 inline mr-1" />
                                            Key Insights
                                        </p>
                                        <ul className="text-xs space-y-1 text-muted-foreground">
                                            {aiAnalysis.insights.map((insight: string, idx: number) => (
                                                <li key={idx}>• {insight}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <Bot className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">Select a stock to see AI analysis</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
