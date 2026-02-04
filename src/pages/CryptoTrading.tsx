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
    Info,
    Brain,
    Sparkles,
    Target,
    Cpu,
    Scan,
    Send,
    Wallet,
    Globe,
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
import cryptoService, { CryptoData } from "../services/cryptoService";
import personalizedInvestmentService, { UserFinancialProfile } from "../services/personalizedInvestmentService";
import { aiService } from "../services/aiService";

// Helper for generic indicators since crypto API might not give technicals directly
const DEFAULT_INDICATORS = [
    { label: "RSI (14)", value: "58.4", status: "Neutral" },
    { label: "MACD", value: "+0.82", status: "Bullish", positive: true },
    { label: "Volume (24h)", value: "High", status: "High" },
    { label: "Volatility", value: "Medium", status: "Normal" },
    { label: "Sentiment", value: "Bullish", status: "Positive", positive: true },
];

// AI Research Steps for Crypto
const researchSteps = [
    { id: 1, action: "Analyzing market sentiment", icon: Brain, target: "sentiment" },
    { id: 2, action: "Scanning on-chain data", icon: Scan, target: "technical" },
    { id: 3, action: "Evaluating price trends", icon: TrendingUp, target: "chart" },
    { id: 4, action: "Checking volume patterns", icon: BarChart3, target: "volume" },
    { id: 5, action: "Reviewing fundamentals", icon: Target, target: "fundamentals" },
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

export default function CryptoTrading() {
    const [selectedCryptoId, setSelectedCryptoId] = useState("bitcoin");
    const [orderType, setOrderType] = useState("market");
    const [action, setAction] = useState<"buy" | "sell">("buy");
    const [quantity, setQuantity] = useState(0.1);
    const [limitPrice, setLimitPrice] = useState(0);

    // Crypto Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [popularCryptos] = useState([
        { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
        { id: "ethereum", symbol: "ETH", name: "Ethereum" },
        { id: "solana", symbol: "SOL", name: "Solana" },
        { id: "ripple", symbol: "XRP", name: "XRP" },
        { id: "cardano", symbol: "ADA", name: "Cardano" },
        { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" }
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

    // Data State
    const [cryptoData, setCryptoData] = useState<CryptoData | null>(null);
    const [indicators, setIndicators] = useState(DEFAULT_INDICATORS);
    const [aiAnalysis, setAiAnalysis] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // User Profile (Mock)
    const [userProfile] = useState<UserFinancialProfile>({
        monthlyIncome: 150000,
        monthlyExpenses: 80000,
        savings: 500000,
        investments: 300000,
        debts: 50000,
        riskTolerance: 'high', // Usually high for crypto traders
        investmentGoals: ['wealth creation', 'speculation'],
        age: 28,
        dependents: 0,
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const chartSymbol = cryptoData ? cryptoService.getTradingViewSymbol(cryptoData.symbol) : "BINANCE:BTCUSDT";
    const currentPrice = cryptoData?.current_price || 0;
    const totalCost = quantity * currentPrice;
    const investableSurplus = personalizedInvestmentService.calculateInvestableSurplus(userProfile);

    // Search Effect
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        setIsSearching(true);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        searchTimeoutRef.current = setTimeout(async () => {
            const results = await cryptoService.searchCoins(searchQuery);
            setSearchResults(results.slice(0, 10)); // Top 10
            setShowSearchResults(true);
            setIsSearching(false);
        }, 500);

        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [searchQuery]);

    // Fetch Crypto Data
    const fetchCryptoData = async (id: string) => {
        setIsSearching(true);
        setSelectedCryptoId(id);
        setSearchQuery("");
        setShowSearchResults(false);

        try {
            const data = await cryptoService.getCoinDetails(id);
            if (data) {
                const formatted = cryptoService.formatCryptoData(data, 'inr');
                setCryptoData(formatted);

                // Update basic indicators based on real data
                const rsiVal = 50 + (formatted.price_change_percentage_24h || 0);
                setIndicators([
                    { label: "RSI (14)", value: Math.min(Math.max(rsiVal, 0), 100).toFixed(1), status: rsiVal > 70 ? "Overbought" : rsiVal < 30 ? "Oversold" : "Neutral" },
                    { label: "Sentiment", value: formatted.price_change_percentage_24h > 0 ? "Bullish" : "Bearish", status: formatted.price_change_percentage_24h > 0 ? "Positive" : "Negative", positive: formatted.price_change_percentage_24h > 0 },
                    { label: "Vol (24h)", value: "High", status: "Active" },
                    { label: "ATH Diff", value: `${formatted.ath_change_percentage?.toFixed(1)}%`, status: "Info" },
                    { label: "Rank", value: `#${formatted.market_cap_rank}`, status: "Info" },
                ]);

                // AI Analysis Trigger
                analyzeCrypto(formatted);
            }
        } catch (error) {
            console.error("Error fetching crypto data", error);
        }
        setIsSearching(false);
    };

    const analyzeCrypto = async (data: CryptoData) => {
        setIsAnalyzing(true);
        try {
            // Simulate AI analysis since we don't have a direct crypto endpoint in aiService yet
            // In a real app, extend aiService to support this
            await new Promise(r => setTimeout(r, 1500));

            const recommendation = data.price_change_percentage_24h > 5 ? "BUY" : data.price_change_percentage_24h < -5 ? "SELL" : "HOLD";
            const target = data.current_price * (recommendation === 'BUY' ? 1.15 : 1.05);
            const stop = data.current_price * (recommendation === 'BUY' ? 0.90 : 0.95);

            setAiAnalysis({
                recommendation,
                confidence: 75 + Math.random() * 15, // Mock confidence
                targetPrice: target,
                stopLoss: stop,
                insights: [
                    `Price changed by ${data.price_change_percentage_24h.toFixed(2)}% in 24h`,
                    `Market cap rank #${data.market_cap_rank} indicates ${data.market_cap_rank < 20 ? 'high' : 'moderate'} stability`,
                    `Trading ${data.ath_change_percentage.toFixed(1)}% from ATH`,
                    `Volume indicates ${data.total_volume > 1000000000 ? 'strong' : 'moderate'} interest`
                ]
            });

        } catch (e) {
            console.error(e);
        }
        setIsAnalyzing(false);
    };

    useEffect(() => {
        fetchCryptoData(selectedCryptoId);
    }, []);

    // Chat handler
    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;
        setAiMessages(prev => [...prev, { id: Date.now(), type: "user", content: chatInput, timestamp: new Date() }]);
        setChatInput("");
        setIsTyping(true);

        try {
            const context = `
                Crypto: ${cryptoData?.name || selectedCryptoId} (${cryptoData?.symbol})
                Price: ₹${cryptoData?.current_price}
                Change 24h: ${cryptoData?.price_change_percentage_24h}%
                Market Cap: ₹${cryptoData?.market_cap}
                User Profile: Risk ${userProfile.riskTolerance}
            `;
            const response = await aiService.generateResponse(chatInput, context);
            setAiMessages(prev => [...prev, { id: Date.now() + 1, type: "ai", content: response, timestamp: new Date(), icon: Brain }]);
        } catch (e) {
            setAiMessages(prev => [...prev, { id: Date.now() + 1, type: "ai", content: "I'm offline right now.", timestamp: new Date(), icon: Brain }]);
        }
        setIsTyping(false);
    };

    // Agent Logic (copied and adapted from StockTrading)
    const startAIAnalysis = async () => {
        setIsAgentActive(true);
        setCurrentStep(0);
        setAgentProgress(0);
        setAiMessages([{
            id: Date.now(),
            type: "thinking",
            content: `🤖 Initiating deep-dive analysis for ${cryptoData?.name}...\n\n👤 Analyzing profile:\n• Surplus: ₹${investableSurplus.toLocaleString()}\n• Risk: ${userProfile.riskTolerance}`,
            timestamp: new Date(),
            icon: Bot
        }]);
    };

    useEffect(() => {
        if (!isAgentActive || !cryptoData) return;

        const runStep = async (idx: number) => {
            if (idx >= researchSteps.length) {
                setAiMessages(prev => [...prev, {
                    id: Date.now(),
                    type: "result",
                    content: `✅ Analysis Complete!\n\n🎯 Recommendation: ${aiAnalysis?.recommendation || 'HOLD'} ${cryptoData.symbol}\n💰 Target: ₹${aiAnalysis?.targetPrice?.toFixed(2)}\n🛑 Stop Loss: ₹${aiAnalysis?.stopLoss?.toFixed(2)}`,
                    timestamp: new Date(),
                    icon: Sparkles
                }]);
                setAgentProgress(100);
                setIsAgentActive(false);
                setHighlightedElement(null);
                return;
            }

            const step = researchSteps[idx];
            setCurrentStep(idx);
            setHighlightedElement(step.target);
            setAgentProgress(((idx + 1) / researchSteps.length) * 100);

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

            await new Promise(r => setTimeout(r, 2000));
            // Add insight (mock for now based on step)
            await new Promise(r => setTimeout(r, 1000));
            runStep(idx + 1);
        };
        runStep(0);
    }, [isAgentActive, cryptoData]);


    const handleOrder = () => {
        setAiMessages(prev => [...prev, {
            id: Date.now(),
            type: "insight",
            content: "⚠️ Order execution is disabled in this demo.",
            timestamp: new Date(),
            icon: Info
        }]);
    }

    return (
        <DashboardLayout title="Crypto Trading" subtitle="Advanced crypto analytics & AI insights">
            <div ref={containerRef} className="relative grid gap-6 lg:grid-cols-3">
                {/* AI Cursor */}
                {isAgentActive && (
                    <>
                        <div className="fixed w-6 h-6 pointer-events-none z-[9999] transition-all duration-100 grid place-items-center"
                            style={{ left: `${cursorPosition.x}px`, top: `${cursorPosition.y}px` }}>
                            <MousePointer2 className="w-6 h-6 text-primary fill-primary" />
                        </div>
                        <div className="fixed w-32 h-32 pointer-events-none z-40 transition-all duration-1000 ease-out opacity-30"
                            style={{
                                left: `${cursorPosition.x}px`, top: `${cursorPosition.y}px`, transform: 'translate(-50%, -50%)',
                                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)', filter: 'blur(20px)'
                            }} />
                    </>
                )}

                <div className="lg:col-span-2 space-y-6">
                    {/* Controls */}
                    <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
                        <CardContent className="pt-6 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10"><Cpu className="w-6 h-6 text-primary" /></div>
                                <div><h3 className="font-bold">FinSage Crypto Agent</h3><p className="text-xs text-muted-foreground">Real-time analysis</p></div>
                            </div>
                            <Button onClick={startAIAnalysis} disabled={isAgentActive || !cryptoData} className="bg-primary hover:bg-primary/90">
                                {isAgentActive ? <><Cpu className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> : <><Sparkles className="w-4 h-4 mr-2" /> Start AI Analysis</>}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Search & Header */}
                    <Card data-ai-target="sentiment">
                        <CardContent className="pt-6">
                            <div className={`flex flex-col sm:flex-row gap-4 justify-between ${highlightedElement === 'sentiment' ? 'ring-2 ring-primary rounded-lg p-2' : ''}`}>
                                <div className="relative w-[300px] z-50">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search coins (e.g. BTC, DOGE...)"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9"
                                        />
                                        {isSearching && <div className="absolute right-3 top-2.5 animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />}
                                    </div>

                                    {showSearchResults && (
                                        <div className="absolute w-full mt-1 bg-background border border-border rounded-lg shadow-xl max-h-[300px] overflow-y-auto">
                                            {searchResults.length > 0 ? searchResults.map(coin => (
                                                <div key={coin.id} className="p-3 hover:bg-secondary/50 cursor-pointer flex items-center gap-3" onClick={() => fetchCryptoData(coin.id)}>
                                                    <img src={coin.thumb} alt={coin.symbol} className="w-6 h-6 rounded-full" />
                                                    <div><p className="font-bold text-sm">{coin.symbol}</p><p className="text-xs text-muted-foreground">{coin.name}</p></div>
                                                </div>
                                            )) : <div className="p-4 text-center text-sm">No results</div>}
                                        </div>
                                    )}
                                </div>

                                {cryptoData && (
                                    <div className="text-right">
                                        <div className="text-3xl font-bold">₹{cryptoData.current_price.toLocaleString()}</div>
                                        <div className={`flex items-center gap-1 justify-end ${cryptoData.price_change_percentage_24h >= 0 ? "text-success" : "text-destructive"}`}>
                                            {cryptoData.price_change_percentage_24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                            <span className="font-medium">{cryptoData.price_change_percentage_24h.toFixed(2)}%</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats */}
                    {cryptoData && (
                        <Card data-ai-target="fundamentals">
                            <CardContent className={`pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 ${highlightedElement === 'fundamentals' ? 'ring-2 ring-primary rounded-lg p-2' : ''}`}>
                                {[
                                    { l: "Market Cap", v: `₹${(cryptoData.market_cap / 10000000).toFixed(2)}Cr` },
                                    { l: "Volume (24h)", v: `₹${(cryptoData.total_volume / 10000000).toFixed(2)}Cr` },
                                    { l: "High (24h)", v: `₹${cryptoData.high_24h.toLocaleString()}` },
                                    { l: "Low (24h)", v: `₹${cryptoData.low_24h.toLocaleString()}` },
                                ].map(i => (
                                    <div key={i.l} className="p-3 bg-secondary/30 rounded-lg">
                                        <p className="text-xs text-muted-foreground">{i.l}</p>
                                        <p className="font-semibold">{i.v}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Chart */}
                    <Card data-ai-target="chart">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" /> Live Chart</CardTitle></CardHeader>
                        <CardContent>
                            <div className={`h-[500px] w-full ${highlightedElement === 'chart' ? 'ring-2 ring-primary rounded-lg p-2' : ''}`}>
                                <iframe
                                    src={`https://www.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${chartSymbol}&interval=D&theme=dark&style=1&timezone=Asia%2FKolkata&withdateranges=1&hide_side_toolbar=1&allow_symbol_change=1&save_image=0&details=1`}
                                    style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
                                    title="TradingView"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Chat */}
                    <Card className="flex flex-col h-[500px]">
                        <CardHeader className="pb-2"><CardTitle className="text-base flex gap-2"><Bot className="w-4 h-4" /> AI Assistant</CardTitle></CardHeader>
                        <CardContent className="flex-1 flex flex-col min-h-0">
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-3">
                                {aiMessages.map(m => (
                                    <div key={m.id} className={`p-2 rounded-lg text-xs ${m.type === 'user' ? 'bg-primary text-primary-foreground ml-8' : 'bg-secondary/80 mr-8'} ${m.type === 'thinking' ? 'animate-pulse opacity-70' : ''}`}>
                                        <p>{m.content}</p>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="flex gap-2">
                                <Input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} placeholder="Ask about this coin..." className="text-xs" />
                                <Button size="sm" onClick={handleSendMessage} disabled={!chatInput.trim()}><Send className="w-4 h-4" /></Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Trade Panel */}
                    <Card data-ai-target="trade-panel" className="opacity-80">
                        <CardHeader><CardTitle className="flex gap-2 text-base"><Wallet className="w-4 h-4" /> Trade (Simulated)</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant={action === 'buy' ? 'default' : 'outline'} className={action === 'buy' ? 'bg-success' : ''} onClick={() => setAction('buy')}>Buy</Button>
                                <Button variant={action === 'sell' ? 'default' : 'outline'} className={action === 'sell' ? 'bg-destructive' : ''} onClick={() => setAction('sell')}>Sell</Button>
                            </div>
                            <div className="space-y-2">
                                <Label>Quantity</Label>
                                <Input type="number" value={quantity} onChange={e => setQuantity(parseFloat(e.target.value))} />
                            </div>
                            <div className="p-3 bg-secondary/20 rounded text-sm flex justify-between">
                                <span>Total</span>
                                <span className="font-bold">₹{totalCost.toFixed(2)}</span>
                            </div>
                            <Button className="w-full" onClick={handleOrder}>Execute</Button>
                        </CardContent>
                    </Card>

                    {/* AI Recommendation */}
                    <Card data-ai-target="recommendation">
                        <CardHeader><CardTitle className="flex gap-2 text-base"><Sparkles className="w-4 h-4" /> Analysis</CardTitle></CardHeader>
                        <CardContent>
                            {isAnalyzing ? <div className="text-center p-4">Analyzing...</div> : aiAnalysis ? (
                                <div className="space-y-2">
                                    <div className={`text-2xl font-bold text-center ${aiAnalysis.recommendation === 'BUY' ? 'text-success' : 'text-destructive'}`}>{aiAnalysis.recommendation}</div>
                                    <div className="text-xs text-muted-foreground text-center">Confidence: {aiAnalysis.confidence.toFixed(0)}%</div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="p-2 bg-success/10 rounded"><span className="block text-muted-foreground">Target</span>₹{aiAnalysis.targetPrice.toFixed(2)}</div>
                                        <div className="p-2 bg-destructive/10 rounded"><span className="block text-muted-foreground">Stop</span>₹{aiAnalysis.stopLoss.toFixed(2)}</div>
                                    </div>
                                    <ul className="text-xs space-y-1 list-disc pl-4 text-muted-foreground">
                                        {aiAnalysis.insights.map((i: string, idx: number) => <li key={idx}>{i}</li>)}
                                    </ul>
                                </div>
                            ) : <div className="text-center text-muted-foreground text-xs">Select a coin to analyze</div>}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
