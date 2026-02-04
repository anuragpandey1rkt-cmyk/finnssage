/**
 * Twelve Data Service - Free Stock Market API
 * Works in browser, no CORS issues
 * Get free API key from: https://twelvedata.com/
 */

const API_KEY = import.meta.env.VITE_TWELVE_DATA_API_KEY || 'demo';
const BASE_URL = 'https://api.twelvedata.com';

const twelveDataService = {
    async getStockDetails(symbol: string) {
        try {
            console.log(`[TwelveData] 🔍 Fetching ${symbol}...`);

            // Fetch quote and time series
            const quoteUrl = `${BASE_URL}/quote?symbol=${symbol}&apikey=${API_KEY}`;
            const timeSeriesUrl = `${BASE_URL}/time_series?symbol=${symbol}&interval=1day&outputsize=90&apikey=${API_KEY}`;

            console.log(`[TwelveData] 📡 Calling API...`);

            const [quoteResponse, timeSeriesResponse] = await Promise.all([
                fetch(quoteUrl),
                fetch(timeSeriesUrl)
            ]);

            if (!quoteResponse.ok) {
                console.error(`[TwelveData] ❌ Quote HTTP ${quoteResponse.status}`);
                return null;
            }

            const quoteData = await quoteResponse.json();
            console.log(`[TwelveData] 📦 Quote data:`, quoteData);

            if (quoteData.code === 429) {
                console.error(`[TwelveData] ❌ Rate limit exceeded`);
                return null;
            }

            if (!quoteData.close) {
                console.error(`[TwelveData] ❌ No price data`);
                return null;
            }

            const price = parseFloat(quoteData.close);
            const previousClose = parseFloat(quoteData.previous_close || price);
            const change = price - previousClose;
            const changePercent = (change / previousClose) * 100;
            const high = parseFloat(quoteData.high || price);
            const low = parseFloat(quoteData.low || price);
            const volume = parseFloat(quoteData.volume || 0);

            // Determine currency
            let currencyCode = quoteData.currency || 'USD';
            let currencySymbol = '$';
            if (currencyCode === 'INR') {
                currencySymbol = '₹';
            } else if (currencyCode === 'EUR') {
                currencySymbol = '€';
            } else if (currencyCode === 'GBP') {
                currencySymbol = '£';
            }

            // Process time series for chart
            let candles: any = { s: 'no_data', t: [], c: [], o: [], h: [], l: [], v: [] };

            if (timeSeriesResponse.ok) {
                const timeSeriesData = await timeSeriesResponse.json();
                if (timeSeriesData.values && Array.isArray(timeSeriesData.values)) {
                    const values = timeSeriesData.values.reverse(); // Oldest first
                    candles = {
                        s: 'ok',
                        t: values.map((v: any) => new Date(v.datetime).getTime() / 1000),
                        c: values.map((v: any) => parseFloat(v.close)),
                        o: values.map((v: any) => parseFloat(v.open)),
                        h: values.map((v: any) => parseFloat(v.high)),
                        l: values.map((v: any) => parseFloat(v.low)),
                        v: values.map((v: any) => parseFloat(v.volume || 0))
                    };
                }
            }

            console.log(`[TwelveData] ✅ SUCCESS! Price: ${currencySymbol}${price.toFixed(2)}`);

            return {
                symbol: symbol,
                name: quoteData.name || symbol,
                description: `${quoteData.name || symbol} - ${quoteData.exchange || 'Stock'}`,
                price: price,
                change: change,
                changePercent: changePercent,
                currency: currencyCode,
                currencySymbol: currencySymbol,
                sector: quoteData.type || 'Equity',
                marketCap: 'N/A', // Not provided in free tier
                peRatio: 'N/A', // Not provided in free tier
                beta: 'N/A',
                eps: 'N/A',
                dividend: '0.00',
                high52w: quoteData.fifty_two_week?.high || high.toFixed(2),
                low52w: quoteData.fifty_two_week?.low || low.toFixed(2),
                avgVolume: volume ? `${(volume / 1000000).toFixed(2)}M` : 'N/A',
                candles: candles,
                rawFinancials: { metric: {} }
            };
        } catch (error) {
            console.error(`[TwelveData] ❌ Error for ${symbol}:`, error);
            return null;
        }
    }
};

export default twelveDataService;
