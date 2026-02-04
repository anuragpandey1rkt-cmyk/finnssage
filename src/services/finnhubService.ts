/**
 * Finnhub Service - REAL DATA ONLY
 * Returns NULL if API fails - NO FALLBACKS
 */

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || 'd60gfv1r01qto1rd2ko0d60gfv1r01qto1rd2kog';
const BASE_URL = 'https://finnhub.io/api/v1';

const finnhubService = {
    async fetchAPI(endpoint: string, params: Record<string, string> = {}) {
        const url = new URL(`${BASE_URL}${endpoint}`);
        url.searchParams.append('token', FINNHUB_API_KEY);
        Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`Finnhub API Error: ${response.status}`);
        }

        return response.json();
    },

    async getQuote(symbol: string) {
        return this.fetchAPI('/quote', { symbol });
    },

    async getCompanyProfile(symbol: string) {
        return this.fetchAPI('/stock/profile2', { symbol });
    },

    async getBasicFinancials(symbol: string) {
        return this.fetchAPI('/stock/metric', { symbol, metric: 'all' });
    },

    async getCandles(symbol: string, resolution: string, from: number, to: number) {
        return this.fetchAPI('/stock/candle', {
            symbol,
            resolution,
            from: from.toString(),
            to: to.toString()
        });
    },

    async searchSymbol(query: string) {
        try {
            return await this.fetchAPI('/search', { q: query });
        } catch (error) {
            console.error('Search failed:', error);
            return { result: [] };
        }
    },

    async getStockDetails(symbol: string) {
        try {
            console.log(`[Finnhub] Fetching ${symbol}...`);

            const now = Math.floor(Date.now() / 1000);
            const threeMonthsAgo = now - (90 * 24 * 60 * 60);

            let quote: any = { c: 0, d: 0, dp: 0 };
            let profile: any = { name: symbol, currency: 'USD', finnhubIndustry: 'N/A' };
            let financials: any = { metric: {} };
            let candles: any = { s: 'no_data', t: [], c: [], o: [], h: [], l: [], v: [] };

            // Try to fetch all data
            try { quote = await this.getQuote(symbol); } catch (e) { console.warn('[Finnhub] Quote failed', e); }
            try { profile = await this.getCompanyProfile(symbol) || profile; } catch (e) { console.warn('[Finnhub] Profile failed', e); }
            try { financials = await this.getBasicFinancials(symbol) || financials; } catch (e) { console.warn('[Finnhub] Financials failed', e); }
            try { candles = await this.getCandles(symbol, 'D', threeMonthsAgo, now) || candles; } catch (e) { console.warn('[Finnhub] Candles failed', e); }

            // Currency
            let currencyCode = profile.currency || 'USD';
            if (symbol.endsWith('.NS') || symbol.endsWith('.BO')) currencyCode = 'INR';

            const currencySymbolMap: any = { 'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥' };
            const currencySymbol = currencySymbolMap[currencyCode] || '$';

            // Price from quote
            let price = quote.c;
            let change = quote.d;
            let changePercent = quote.dp;

            // If no price from quote, try candles
            if ((!price || price === 0) && candles.c && candles.c.length > 0) {
                const lastIndex = candles.c.length - 1;
                price = candles.c[lastIndex];
                const prevPrice = candles.c[Math.max(0, lastIndex - 1)] || price;
                change = price - prevPrice;
                changePercent = prevPrice ? ((change / prevPrice) * 100) : 0;
            }

            // If still no price, return NULL (no fake data)
            if (!price || price === 0) {
                console.log(`[Finnhub] No valid price for ${symbol} - returning null`);
                return null;
            }

            console.log(`[Finnhub] ✅ SUCCESS - Price: ${currencySymbol}${price.toFixed(2)}`);

            return {
                symbol,
                name: profile.name || symbol,
                description: `${profile.name || symbol} - ${profile.finnhubIndustry || ''}`,
                price: price,
                change: change,
                changePercent: changePercent,
                currency: currencyCode,
                currencySymbol,
                sector: profile.finnhubIndustry || 'N/A',
                marketCap: profile.marketCapitalization ? `${currencySymbol}${(profile.marketCapitalization / 1000).toFixed(2)}B` : 'N/A',
                peRatio: financials.metric?.peBasicExclExtraTTM?.toFixed(2) || 'N/A',
                beta: financials.metric?.beta?.toFixed(2) || 'N/A',
                eps: financials.metric?.epsExclExtraTTM?.toFixed(2) || 'N/A',
                dividend: financials.metric?.dividendYieldIndicatedAnnual?.toFixed(2) || '0.00',
                high52w: financials.metric?.['52WeekHigh']?.toFixed(2) || quote.h?.toFixed(2) || 'N/A',
                low52w: financials.metric?.['52WeekLow']?.toFixed(2) || quote.l?.toFixed(2) || 'N/A',
                avgVolume: financials.metric?.['10DayAverageTradingVolume'] ? `${(financials.metric['10DayAverageTradingVolume'] / 1000000).toFixed(2)}M` : 'N/A',
                sma50: 'N/A',
                sma200: 'N/A',
                candles,
                rawFinancials: financials
            };

        } catch (error) {
            console.error(`[Finnhub] Error:`, error);
            return null;
        }
    }
};

export default finnhubService;
