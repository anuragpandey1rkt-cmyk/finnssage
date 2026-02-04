/**
 * Yahoo Finance Service - CORRECT Implementation with CORS Proxy
 * Uses proper Yahoo Finance v7 quote endpoint for accurate LTP
 * CORS proxy allows browser access
 */

// CORS Proxy to bypass browser restrictions - using corsproxy.io (more reliable)
const CORS_PROXY = 'https://corsproxy.io/?';


const yahooFinanceService = {
    async getStockDetails(symbol: string) {
        try {
            console.log(`[Yahoo] 🔍 Fetching ${symbol}...`);

            // Yahoo Finance v7 Quote API - Most accurate for live prices
            const quoteUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;
            const proxiedUrl = `${CORS_PROXY}${quoteUrl}`;

            console.log(`[Yahoo] 📡 Calling quote API via proxy...`);
            const quoteResponse = await fetch(proxiedUrl);

            if (!quoteResponse.ok) {
                console.error(`[Yahoo] ❌ HTTP ${quoteResponse.status}`);
                return null;
            }

            const quoteData = await quoteResponse.json();
            console.log(`[Yahoo] 📦 Quote data received`);

            if (!quoteData.quoteResponse || !quoteData.quoteResponse.result || quoteData.quoteResponse.result.length === 0) {
                console.error(`[Yahoo] ❌ No quote data`);
                return null;
            }

            const quote = quoteData.quoteResponse.result[0];

            // CRITICAL: Use regularMarketPrice for accurate LTP
            const price = quote.regularMarketPrice;
            const change = quote.regularMarketChange || 0;
            const changePercent = quote.regularMarketChangePercent || 0;

            if (!price || price === 0) {
                console.error(`[Yahoo] ❌ No valid price`);
                return null;
            }

            // Currency
            let currencyCode = quote.currency || 'USD';
            let currencySymbol = '$';
            if (currencyCode === 'INR') {
                currencySymbol = '₹';
            } else if (currencyCode === 'EUR') {
                currencySymbol = '€';
            } else if (currencyCode === 'GBP') {
                currencySymbol = '£';
            }

            // Fetch historical data for chart and moving averages
            let candles: any = { s: 'no_data', t: [], c: [], o: [], h: [], l: [], v: [] };
            let sma50 = 'N/A';
            let sma200 = 'N/A';

            try {
                const endDate = Math.floor(Date.now() / 1000);
                const startDate = endDate - (365 * 24 * 60 * 60); // 1 year of data

                const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${startDate}&period2=${endDate}&interval=1d`;
                const proxiedChartUrl = `${CORS_PROXY}${chartUrl}`;
                const chartResponse = await fetch(proxiedChartUrl);


                if (chartResponse.ok) {
                    const chartData = await chartResponse.json();
                    const result = chartData.chart?.result?.[0];

                    if (result && result.timestamp) {
                        const timestamps = result.timestamp;
                        const quotes = result.indicators?.quote?.[0];

                        if (quotes) {
                            candles = {
                                s: 'ok',
                                t: timestamps,
                                c: quotes.close?.filter((v: any) => v !== null) || [],
                                o: quotes.open?.filter((v: any) => v !== null) || [],
                                h: quotes.high?.filter((v: any) => v !== null) || [],
                                l: quotes.low?.filter((v: any) => v !== null) || [],
                                v: quotes.volume?.filter((v: any) => v !== null) || []
                            };

                            // Calculate SMA 50 and SMA 200
                            const closePrices = quotes.close?.filter((v: any) => v !== null) || [];
                            if (closePrices.length >= 50) {
                                const last50 = closePrices.slice(-50);
                                sma50 = (last50.reduce((a: number, b: number) => a + b, 0) / 50).toFixed(2);
                            }
                            if (closePrices.length >= 200) {
                                const last200 = closePrices.slice(-200);
                                sma200 = (last200.reduce((a: number, b: number) => a + b, 0) / 200).toFixed(2);
                            }
                        }
                    }
                }
            } catch (chartError) {
                console.warn(`[Yahoo] Chart data failed:`, chartError);
            }

            // Calculate average volume
            let avgVolume = 'N/A';
            if (candles.v && candles.v.length > 0) {
                const recentVolumes = candles.v.slice(-10);
                const avgVol = recentVolumes.reduce((a: number, b: number) => a + b, 0) / recentVolumes.length;
                avgVolume = `${(avgVol / 1000000).toFixed(2)}M`;
            }

            console.log(`[Yahoo] ✅ SUCCESS! Price: ${currencySymbol}${price.toFixed(2)}`);

            return {
                symbol: symbol,
                name: quote.longName || quote.shortName || symbol,
                description: quote.longName || symbol,
                price: price,
                change: change,
                changePercent: changePercent,
                currency: currencyCode,
                currencySymbol: currencySymbol,
                sector: quote.sector || 'N/A',
                marketCap: quote.marketCap ? `${currencySymbol}${(quote.marketCap / 1000000000).toFixed(2)}B` : 'N/A',
                peRatio: quote.trailingPE?.toFixed(2) || quote.forwardPE?.toFixed(2) || 'N/A',
                beta: quote.beta?.toFixed(2) || 'N/A',
                eps: quote.epsTrailingTwelveMonths?.toFixed(2) || 'N/A',
                dividend: quote.dividendRate?.toFixed(2) || quote.trailingAnnualDividendRate?.toFixed(2) || '0.00',
                high52w: quote.fiftyTwoWeekHigh?.toFixed(2) || 'N/A',
                low52w: quote.fiftyTwoWeekLow?.toFixed(2) || 'N/A',
                avgVolume: avgVolume,
                sma50: sma50,
                sma200: sma200,
                candles: candles,
                rawFinancials: {
                    metric: {
                        peBasicExclExtraTTM: quote.trailingPE,
                        epsExclExtraTTM: quote.epsTrailingTwelveMonths,
                        beta: quote.beta,
                        dividendYieldIndicatedAnnual: quote.dividendYield,
                        '52WeekHigh': quote.fiftyTwoWeekHigh,
                        '52WeekLow': quote.fiftyTwoWeekLow,
                        '10DayAverageTradingVolume': quote.averageDailyVolume10Day,
                        sma50: sma50,
                        sma200: sma200
                    }
                }
            };
        } catch (error) {
            console.error(`[Yahoo] ❌ Error:`, error);
            return null;
        }
    }
};

export default yahooFinanceService;
