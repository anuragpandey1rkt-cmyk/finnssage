// Service to fetch real-time market data (Simulated or Real API)

export interface MarketQuote {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    lastUpdated: Date;
}

// Top 50 Indian Stocks (NIFTY 50) initial data for "Real" feel if API fails
const INITIAL_MARKET_DATA: Record<string, number> = {
    'RELIANCE': 2987.50,
    'TCS': 4120.30,
    'HDFCBANK': 1450.60,
    'INFY': 1670.00,
    'ICICIBANK': 1080.45,
    'SBIN': 760.20,
    'BHARTIARTL': 1120.00,
    'ITC': 430.50,
    'L&T': 3650.00,
    'TATAMOTORS': 980.00,
    'NIFTY50': 22500.00,
    'SENSEX': 74200.00
};

export async function fetchStockPrice(symbol: string): Promise<MarketQuote> {
    // In a real production app, we would call an API like AlphaVantage or Yahoo Finance.
    // Due to CORS and API Key limits on free tiers, we will simulate a "Live" connection
    // by taking the base real price and adding random market fluctuation.

    // Check if we have a base price
    const basePrice = INITIAL_MARKET_DATA[symbol.toUpperCase()] || 100.00;

    // Simulate volatility (0.5% - 1.5%)
    const volatility = basePrice * 0.015;
    const randomChange = (Math.random() * volatility * 2) - volatility;

    const currentPrice = basePrice + randomChange;
    const changePercent = (randomChange / basePrice) * 100;

    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency

    return {
        symbol: symbol.toUpperCase(),
        price: Number(currentPrice.toFixed(2)),
        change: Number(randomChange.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        lastUpdated: new Date()
    };
}

export async function searchStocks(query: string): Promise<string[]> {
    const q = query.toUpperCase();
    return Object.keys(INITIAL_MARKET_DATA).filter(s => s.includes(q));
}
