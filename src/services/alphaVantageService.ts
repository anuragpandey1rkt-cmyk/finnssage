const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

const alphaVantageService = {
    async fetchAPI(params: Record<string, any>) {
        if (!API_KEY) {
            console.warn("Alpha Vantage API Key missing. Add VITE_ALPHA_VANTAGE_API_KEY to .env.local");
            return null;
        }

        const query = new URLSearchParams({ ...params, apikey: API_KEY }).toString();
        try {
            const res = await fetch(`${BASE_URL}?${query}`);
            if (!res.ok) {
                throw new Error(`Alpha Vantage API Error: ${res.status}`);
            }
            const data = await res.json();

            // Check for API limit error
            if (data.Note || data['Error Message']) {
                console.warn("Alpha Vantage API limit reached or error:", data.Note || data['Error Message']);
                return null;
            }

            return data;
        } catch (error) {
            console.error(`Error fetching from Alpha Vantage:`, error);
            return null;
        }
    },

    async getGlobalQuote(symbol: string) {
        return this.fetchAPI({
            function: 'GLOBAL_QUOTE',
            symbol: symbol
        });
    },

    async getTimeSeriesDaily(symbol: string) {
        return this.fetchAPI({
            function: 'TIME_SERIES_DAILY',
            symbol: symbol,
            outputsize: 'compact' // Last 100 days
        });
    },

    async getRSI(symbol: string, interval: string = 'daily', timePeriod: number = 14) {
        return this.fetchAPI({
            function: 'RSI',
            symbol: symbol,
            interval: interval,
            time_period: timePeriod,
            series_type: 'close'
        });
    },

    async getMACD(symbol: string, interval: string = 'daily') {
        return this.fetchAPI({
            function: 'MACD',
            symbol: symbol,
            interval: interval,
            series_type: 'close'
        });
    },

    async getSMA(symbol: string, interval: string = 'daily', timePeriod: number = 50) {
        return this.fetchAPI({
            function: 'SMA',
            symbol: symbol,
            interval: interval,
            time_period: timePeriod,
            series_type: 'close'
        });
    },

    async getStockDetails(symbol: string) {
        try {
            // Fetch quote and time series in parallel
            const [quoteData, timeSeriesData] = await Promise.all([
                this.getGlobalQuote(symbol),
                this.getTimeSeriesDaily(symbol)
            ]);

            if (!quoteData || !quoteData['Global Quote']) {
                return null;
            }

            const quote = quoteData['Global Quote'];
            const price = parseFloat(quote['05. price'] || '0');
            const change = parseFloat(quote['09. change'] || '0');
            const changePercent = parseFloat(quote['10. change percent']?.replace('%', '') || '0');
            const volume = parseFloat(quote['06. volume'] || '0');
            const high = parseFloat(quote['03. high'] || '0');
            const low = parseFloat(quote['04. low'] || '0');

            // Process time series for chart
            let candles: any = { s: 'no_data', t: [], c: [], o: [], h: [], l: [], v: [] };
            if (timeSeriesData && timeSeriesData['Time Series (Daily)']) {
                const timeSeries = timeSeriesData['Time Series (Daily)'];
                const dates = Object.keys(timeSeries).slice(0, 90); // Last 90 days

                candles = {
                    s: 'ok',
                    t: dates.map(date => new Date(date).getTime() / 1000),
                    c: dates.map(date => parseFloat(timeSeries[date]['4. close'])),
                    o: dates.map(date => parseFloat(timeSeries[date]['1. open'])),
                    h: dates.map(date => parseFloat(timeSeries[date]['2. high'])),
                    l: dates.map(date => parseFloat(timeSeries[date]['3. low'])),
                    v: dates.map(date => parseFloat(timeSeries[date]['5. volume']))
                };
            }

            // Determine currency
            let currencyCode = 'USD';
            let currencySymbol = '$';
            if (symbol.endsWith('.NS') || symbol.endsWith('.BO')) {
                currencyCode = 'INR';
                currencySymbol = '₹';
            }

            return {
                symbol: symbol,
                name: symbol.replace('.NS', '').replace('.BO', ''),
                description: `Real-time data for ${symbol}`,
                price: price,
                change: change,
                changePercent: changePercent,
                currency: currencyCode,
                currencySymbol: currencySymbol,
                sector: 'N/A', // Alpha Vantage doesn't provide this in free tier
                marketCap: 'N/A',
                peRatio: 'N/A',
                beta: 'N/A',
                eps: 'N/A',
                dividend: 'N/A',
                high52w: high.toFixed(2),
                low52w: low.toFixed(2),
                avgVolume: `${(volume / 1000000).toFixed(2)}M`,
                candles: candles,
                rawFinancials: { metric: {} }
            };
        } catch (error) {
            console.error("Alpha Vantage Error:", error);
            return null;
        }
    }
};

export default alphaVantageService;
