/**
 * Simple Stock Service using Yahoo Finance Query API
 * Direct approach without complex proxies
 */

const simpleStockService = {
    async getStockDetails(symbol: string) {
        try {
            console.log(`[SimpleStock] Fetching ${symbol}...`);

            // For Indian stocks, use a simple approach
            if (symbol.endsWith('.NS') || symbol.endsWith('.BO')) {
                // Use Yahoo Finance query string API (simpler, less CORS issues)
                const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price,summaryDetail`;

                try {
                    const response = await fetch(url);

                    if (response.ok) {
                        const data = await response.json();
                        const price = data.quoteSummary?.result?.[0]?.price;
                        const summary = data.quoteSummary?.result?.[0]?.summaryDetail;

                        if (price && price.regularMarketPrice) {
                            const currentPrice = price.regularMarketPrice.raw;
                            const change = price.regularMarketChange?.raw || 0;
                            const changePercent = price.regularMarketChangePercent?.raw || 0;

                            console.log(`[SimpleStock] ✅ SUCCESS - Price: ₹${currentPrice.toFixed(2)}`);

                            return {
                                symbol: symbol,
                                name: price.longName || price.shortName || symbol,
                                description: price.longName || symbol,
                                price: currentPrice,
                                change: change,
                                changePercent: changePercent,
                                currency: 'INR',
                                currencySymbol: '₹',
                                sector: 'N/A',
                                marketCap: price.marketCap?.fmt || 'N/A',
                                peRatio: summary?.trailingPE?.fmt || 'N/A',
                                beta: summary?.beta?.fmt || 'N/A',
                                eps: summary?.epsTrailingTwelveMonths?.fmt || 'N/A',
                                dividend: summary?.dividendRate?.fmt || '0.00',
                                high52w: summary?.fiftyTwoWeekHigh?.fmt || 'N/A',
                                low52w: summary?.fiftyTwoWeekLow?.fmt || 'N/A',
                                avgVolume: summary?.averageVolume?.fmt || 'N/A',
                                sma50: 'N/A',
                                sma200: 'N/A',
                                candles: { s: 'no_data', t: [], c: [], o: [], h: [], l: [], v: [] },
                                rawFinancials: { metric: {} }
                            };
                        }
                    }
                } catch (e) {
                    console.warn(`[SimpleStock] Yahoo query failed:`, e);
                }
            }

            // If above fails or not Indian stock, return null
            console.log(`[SimpleStock] No data available`);
            return null;

        } catch (error) {
            console.error(`[SimpleStock] Error:`, error);
            return null;
        }
    }
};

export default simpleStockService;
