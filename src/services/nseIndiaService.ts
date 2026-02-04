/**
 * RapidAPI India Stocks Service
 * Uses NSE India API via RapidAPI - FREE and RELIABLE
 */

const rapidAPIService = {
    async getStockDetails(symbol: string) {
        try {
            // Only works for Indian stocks
            if (!symbol.endsWith('.NS') && !symbol.endsWith('.BO')) {
                console.log(`[RapidAPI] Not an Indian stock: ${symbol}`);
                return null;
            }

            // Remove .NS or .BO suffix
            const cleanSymbol = symbol.replace('.NS', '').replace('.BO', '');

            console.log(`[RapidAPI] Fetching ${cleanSymbol}...`);

            // Using NSE India public API (no key needed)
            const url = `https://www.nseindia.com/api/quote-equity?symbol=${cleanSymbol}`;

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0'
                }
            });

            if (!response.ok) {
                console.error(`[RapidAPI] HTTP ${response.status}`);
                return null;
            }

            const data = await response.json();

            if (!data || !data.priceInfo) {
                console.error(`[RapidAPI] No price data`);
                return null;
            }

            const priceInfo = data.priceInfo;
            const price = priceInfo.lastPrice || 0;
            const change = priceInfo.change || 0;
            const changePercent = priceInfo.pChange || 0;

            if (!price || price === 0) {
                console.error(`[RapidAPI] Invalid price`);
                return null;
            }

            console.log(`[RapidAPI] ✅ SUCCESS - Price: ₹${price.toFixed(2)}`);

            return {
                symbol: symbol,
                name: data.info?.companyName || cleanSymbol,
                description: data.info?.companyName || cleanSymbol,
                price: price,
                change: change,
                changePercent: changePercent,
                currency: 'INR',
                currencySymbol: '₹',
                sector: data.metadata?.industry || 'N/A',
                marketCap: data.metadata?.marketCap ? `₹${(data.metadata.marketCap / 10000000).toFixed(2)}Cr` : 'N/A',
                peRatio: priceInfo.pe?.toFixed(2) || 'N/A',
                beta: 'N/A',
                eps: priceInfo.eps?.toFixed(2) || 'N/A',
                dividend: 'N/A',
                high52w: priceInfo.weekHighLow?.max?.toFixed(2) || 'N/A',
                low52w: priceInfo.weekHighLow?.min?.toFixed(2) || 'N/A',
                avgVolume: priceInfo.totalTradedVolume ? `${(priceInfo.totalTradedVolume / 1000000).toFixed(2)}M` : 'N/A',
                sma50: 'N/A',
                sma200: 'N/A',
                candles: { s: 'no_data', t: [], c: [], o: [], h: [], l: [], v: [] },
                rawFinancials: { metric: {} }
            };

        } catch (error) {
            console.error(`[RapidAPI] Error:`, error);
            return null;
        }
    }
};

export default rapidAPIService;
