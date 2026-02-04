/**
 * Backend Stock Service - Calls our Express backend
 * This solves CORS issues by proxying through our server
 */

const BACKEND_URL = 'http://localhost:3001';

const backendStockService = {
    async getStockDetails(symbol: string) {
        try {
            console.log(`[Backend Service] Fetching ${symbol}...`);

            const response = await fetch(`${BACKEND_URL}/api/stock/${symbol}`);

            if (!response.ok) {
                console.error(`[Backend Service] HTTP ${response.status}`);
                return null;
            }

            const data = await response.json();

            if (!data || !data.price || data.price === 0) {
                console.error(`[Backend Service] No valid price`);
                return null;
            }

            // Currency symbol
            let currencySymbol = '$';
            if (data.currency === 'INR') currencySymbol = '₹';
            else if (data.currency === 'EUR') currencySymbol = '€';
            else if (data.currency === 'GBP') currencySymbol = '£';

            console.log(`[Backend Service] ✅ SUCCESS - Price: ${currencySymbol}${data.price.toFixed(2)}`);

            return {
                symbol: data.symbol,
                name: data.name,
                description: data.name,
                price: data.price,
                change: data.change,
                changePercent: data.changePercent,
                currency: data.currency,
                currencySymbol: currencySymbol,
                sector: data.sector || 'N/A',
                marketCap: data.marketCap ? `${currencySymbol}${(data.marketCap / 1000000000).toFixed(2)}B` : 'N/A',
                peRatio: data.peRatio?.toFixed(2) || 'N/A',
                beta: data.beta?.toFixed(2) || 'N/A',
                eps: data.eps?.toFixed(2) || 'N/A',
                dividend: data.dividend?.toFixed(2) || '0.00',
                high52w: data.high52w?.toFixed(2) || 'N/A',
                low52w: data.low52w?.toFixed(2) || 'N/A',
                avgVolume: 'N/A',
                sma50: 'N/A',
                sma200: 'N/A',
                candles: { s: 'no_data', t: [], c: [], o: [], h: [], l: [], v: [] },
                rawFinancials: { metric: {} }
            };

        } catch (error) {
            console.error(`[Backend Service] Error:`, error);
            return null;
        }
    }
};

export default backendStockService;
