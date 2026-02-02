export interface StockData {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    high: number;
    low: number;
    open: number;
    prevClose: number;
    marketCap?: number;
    name?: string;
    description?: string;
    sector?: string;
    peRatio?: number;
    chartData: {
        date: string;
        price: number;
        volume: number;
        open: number;
        high: number;
        low: number;
        close: number;
    }[];
}

const CORS_PROXY = "https://corsproxy.io/?";
const YAHOO_BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart/";

export async function fetchStockData(symbol: string): Promise<StockData | null> {
    try {
        // Fetch 1 month of data with 1 day interval
        const url = `${CORS_PROXY}${encodeURIComponent(
            `${YAHOO_BASE_URL}${symbol}?interval=1d&range=1mo`
        )}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch stock data");

        const data = await response.json();
        const result = data.chart?.result?.[0];

        if (!result) return null;

        const meta = result.meta;
        const quotes = result.indicators.quote[0];
        const timestamps = result.timestamp;

        // Process chart data
        const chartData = timestamps.map((ts: number, index: number) => ({
            date: new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            price: quotes.close[index] || 0,
            volume: quotes.volume[index] || 0,
            open: quotes.open[index] || 0,
            high: quotes.high[index] || 0,
            low: quotes.low[index] || 0,
            close: quotes.close[index] || 0,
        })).filter((item: any) => item.price > 0); // Filter out null/bad data points

        // Calculate changes
        const currentPrice = meta.regularMarketPrice;
        const prevClose = meta.chartPreviousClose;
        const change = currentPrice - prevClose;
        const changePercent = (change / prevClose) * 100;

        return {
            symbol: meta.symbol,
            price: currentPrice,
            change: change,
            changePercent: changePercent,
            volume: meta.regularMarketVolume,
            high: meta.regularMarketDayHigh,
            low: meta.regularMarketDayLow,
            open: meta.regularMarketOpen,
            prevClose: prevClose,
            marketCap: 0, // Not available in this endpoint, would need quoteSummary endpoint
            name: symbol, // Fallback, usually would fetch profile
            chartData: chartData,

            // Mock static data for fields not in chart endpoint
            description: "No description available via public API.",
            sector: "Technology",
            peRatio: 25.5
        };
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        return null; // Handle error gracefully
    }
}

export const POPULAR_STOCKS = ["AAPL", "NVDA", "TSLA", "MSFT", "GOOGL", "AMD", "META", "AMZN"];
