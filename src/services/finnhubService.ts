const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

const finnhubService = {
    async fetchAPI(endpoint: string, params: Record<string, any> = {}) {
        if (!API_KEY) {
            console.warn("Finnhub API Key is missing. Please add VITE_FINNHUB_API_KEY to .env.local");
            throw new Error("API Key missing");
        }

        const query = new URLSearchParams({ ...params, token: API_KEY }).toString();
        try {
            const res = await fetch(`${BASE_URL}${endpoint}?${query}`);
            if (!res.ok) {
                if (res.status === 429) {
                    console.warn("Finnhub API Rate Limit Exceeded");
                    throw new Error("Rate limit exceeded");
                }
                throw new Error(`Finnhub API Error: ${res.status} ${res.statusText}`);
            }
            return await res.json();
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            throw error;
        }
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
        return this.fetchAPI('/stock/candle', { symbol, resolution, from, to });
    },

    async searchSymbol(q: string) {
        return this.fetchAPI('/search', { q });
    },

    async getRecommendationTrends(symbol: string) {
        return this.fetchAPI('/stock/recommendation', { symbol });
    }
};

export default finnhubService;
