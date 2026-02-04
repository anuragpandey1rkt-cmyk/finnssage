import alphaVantageService from './alphaVantageService';
import finnhubService from './finnhubService';

/**
 * Hybrid Stock Data Service - OPTIMIZED FOR BOTH INDIAN & US STOCKS
 * 
 * For INDIAN stocks (.NS, .BO):
 *   Priority: Alpha Vantage (FREE API key works!)
 * 
 * For US stocks:
 *   Priority: Finnhub (FREE, unlimited)
 */
const stockDataService = {
    async getStockDetails(symbol: string) {
        console.log(`[Hybrid] 🔍 Fetching ${symbol}...`);

        const isIndianStock = symbol.endsWith('.NS') || symbol.endsWith('.BO');

        // ========================================
        // INDIAN STOCKS - Alpha Vantage FIRST
        // ========================================
        if (isIndianStock) {
            try {
                console.log(`[Hybrid] 🇮🇳 Trying Alpha Vantage for Indian stock ${symbol}...`);
                const alphaData = await alphaVantageService.getStockDetails(symbol);

                if (alphaData && alphaData.price > 0) {
                    console.log(`[Hybrid] ✅ Alpha Vantage SUCCESS - Price: ${alphaData.currencySymbol}${alphaData.price.toFixed(2)}`);
                    return {
                        ...alphaData,
                        source: 'Alpha Vantage'
                    };
                }

                console.log(`[Hybrid] ⚠️ Alpha Vantage returned zero/invalid data`);
            } catch (error) {
                console.log(`[Hybrid] ❌ Alpha Vantage failed:`, error);
            }
        }

        // ========================================
        // US STOCKS - Finnhub FIRST
        // ========================================
        if (!isIndianStock) {
            try {
                console.log(`[Hybrid] 🇺🇸 Trying Finnhub for US stock ${symbol}...`);
                const finnhubData = await finnhubService.getStockDetails(symbol);

                if (finnhubData && finnhubData.price > 0) {
                    console.log(`[Hybrid] ✅ Finnhub SUCCESS - Price: ${finnhubData.currencySymbol}${finnhubData.price.toFixed(2)}`);
                    return {
                        ...finnhubData,
                        source: 'Finnhub'
                    };
                }

                console.log(`[Hybrid] ⚠️ Finnhub returned zero/invalid data`);
            } catch (error) {
                console.log(`[Hybrid] ❌ Finnhub failed:`, error);
            }
        }

        // ========================================
        // FALLBACK: Try opposite service
        // ========================================

        // If Indian stock failed with Alpha Vantage, try Finnhub
        if (isIndianStock) {
            try {
                console.log(`[Hybrid] Trying Finnhub as fallback for ${symbol}...`);
                const finnhubData = await finnhubService.getStockDetails(symbol);

                if (finnhubData && finnhubData.price > 0) {
                    console.log(`[Hybrid] ✅ Finnhub FALLBACK SUCCESS`);
                    return {
                        ...finnhubData,
                        source: 'Finnhub (Fallback)'
                    };
                }
            } catch (error) {
                console.log(`[Hybrid] ❌ Finnhub fallback failed:`, error);
            }
        }

        // If US stock failed with Finnhub, try Alpha Vantage
        if (!isIndianStock) {
            try {
                console.log(`[Hybrid] Trying Alpha Vantage as fallback for ${symbol}...`);
                const alphaData = await alphaVantageService.getStockDetails(symbol);

                if (alphaData && alphaData.price > 0) {
                    console.log(`[Hybrid] ✅ Alpha Vantage FALLBACK SUCCESS`);
                    return {
                        ...alphaData,
                        source: 'Alpha Vantage (Fallback)'
                    };
                }
            } catch (error) {
                console.log(`[Hybrid] ❌ Alpha Vantage fallback failed:`, error);
            }
        }

        // ALL FAILED
        console.log(`[Hybrid] ❌ ALL SOURCES FAILED for ${symbol}`);
        return {
            symbol: symbol,
            name: symbol,
            description: `Unable to fetch data for ${symbol}`,
            price: 0,
            change: 0,
            changePercent: 0,
            currency: 'USD',
            currencySymbol: '$',
            sector: 'N/A',
            marketCap: 'N/A',
            peRatio: 'N/A',
            beta: 'N/A',
            eps: 'N/A',
            dividend: 'N/A',
            high52w: 'N/A',
            low52w: 'N/A',
            avgVolume: 'N/A',
            sma50: 'N/A',
            sma200: 'N/A',
            candles: { s: 'no_data', t: [], c: [], o: [], h: [], l: [], v: [] },
            rawFinancials: { metric: {} },
            source: 'ERROR',
            error: 'All data sources failed'
        };
    }
};

export default stockDataService;
