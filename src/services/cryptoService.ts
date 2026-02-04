
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

export interface CryptoData {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    fully_diluted_valuation: number | null;
    total_volume: number;
    high_24h: number;
    low_24h: number;
    price_change_24h: number;
    price_change_percentage_24h: number;
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
    ath: number;
    ath_change_percentage: number;
    ath_date: string;
    atl: number;
    atl_change_percentage: number;
    atl_date: string;
    last_updated: string;
    image?: string;
    sparkline_in_7d?: { price: number[] };
    description?: string;
}

const cryptoService = {
    async fetchAPI(endpoint: string, params: Record<string, string> = {}) {
        const url = new URL(`${COINGECKO_BASE_URL}${endpoint}`);
        Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`CoinGecko API Error: ${response.status}`);
        }

        return response.json();
    },

    async searchCoins(query: string) {
        try {
            const data = await this.fetchAPI('/search', { query });
            return data.coins;
        } catch (error) {
            console.error('Crypto search failed:', error);
            return [];
        }
    },

    async getCoinMarketData(ids: string[], currency: string = 'inr') {
        try {
            return await this.fetchAPI('/coins/markets', {
                vs_currency: currency,
                ids: ids.join(','),
                order: 'market_cap_desc',
                per_page: '100',
                page: '1',
                sparkline: 'true',
                price_change_percentage: '24h'
            });
        } catch (error) {
            console.error('Market data fetch failed:', error);
            return [];
        }
    },

    async getCoinDetails(id: string) {
        try {
            const data = await this.fetchAPI(`/coins/${id}`, {
                localization: 'false',
                tickers: 'false',
                market_data: 'true',
                community_data: 'false',
                developer_data: 'false',
                sparkline: 'true'
            });
            return data;
        } catch (error) {
            console.error('Coin details fetch failed:', error);
            return null;
        }
    },

    // Helper to format CoinGecko data to our app's needs
    formatCryptoData(data: any, currency: string = 'inr'): CryptoData {
        // Handle both simple market data and full details response
        const marketData = data.market_data || data;
        const currencyKey = currency.toLowerCase();

        return {
            id: data.id,
            symbol: data.symbol.toUpperCase(),
            name: data.name,
            current_price: marketData.current_price?.[currencyKey] ?? marketData.current_price,
            market_cap: marketData.market_cap?.[currencyKey] ?? marketData.market_cap,
            market_cap_rank: marketData.market_cap_rank ?? data.market_cap_rank,
            fully_diluted_valuation: marketData.fully_diluted_valuation?.[currencyKey] ?? marketData.fully_diluted_valuation,
            total_volume: marketData.total_volume?.[currencyKey] ?? marketData.total_volume,
            high_24h: marketData.high_24h?.[currencyKey] ?? marketData.high_24h,
            low_24h: marketData.low_24h?.[currencyKey] ?? marketData.low_24h,
            price_change_24h: marketData.price_change_24h_in_currency?.[currencyKey] ?? marketData.price_change_24h,
            price_change_percentage_24h: marketData.price_change_percentage_24h_in_currency?.[currencyKey] ?? marketData.price_change_percentage_24h,
            circulating_supply: marketData.circulating_supply ?? data.circulating_supply,
            total_supply: marketData.total_supply ?? data.total_supply,
            max_supply: marketData.max_supply ?? data.max_supply,
            ath: marketData.ath?.[currencyKey] ?? data.ath,
            ath_change_percentage: marketData.ath_change_percentage?.[currencyKey] ?? data.ath_change_percentage,
            ath_date: marketData.ath_date?.[currencyKey] ?? data.ath_date,
            atl: marketData.atl?.[currencyKey] ?? data.atl,
            atl_change_percentage: marketData.atl_change_percentage?.[currencyKey] ?? data.atl_change_percentage,
            atl_date: marketData.atl_date?.[currencyKey] ?? data.atl_date,
            last_updated: data.last_updated,
            image: data.image?.large || data.image,
            description: data.description?.en || '',
            sparkline_in_7d: marketData.sparkline_in_7d
        };
    },

    // Map CoinGecko ID to TradingView symbol (Basic mapping)
    getTradingViewSymbol(symbol: string): string {
        // Default to Binance USDT pair as it's most common
        const map: Record<string, string> = {
            'btc': 'BINANCE:BTCUSDT',
            'eth': 'BINANCE:ETHUSDT',
            'sol': 'BINANCE:SOLUSDT',
            'xrp': 'BINANCE:XRPUSDT',
            'ada': 'BINANCE:ADAUSDT',
            'doge': 'BINANCE:DOGEUSDT',
            'dot': 'BINANCE:DOTUSDT',
            'matic': 'BINANCE:MATICUSDT',
            'shib': 'BINANCE:SHIBUSDT',
        };
        return map[symbol.toLowerCase()] || `BINANCE:${symbol.toUpperCase()}USDT`;
    }
};

export default cryptoService;
