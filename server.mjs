import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import yahooFinance from 'yahoo-finance2';

const app = express();
const PORT = 3001;

// Enable CORS for frontend
app.use(cors());
app.use(express.json());

// Proxy endpoint for Yahoo Finance
const yf = new yahooFinance();

app.get('/api/stock/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        console.log(`[Backend] Fetching ${symbol}...`);

        // suppress logging from library if needed, but nice to debug
        // yf.suppressNotices(['yahooSurvey']);

        const result = await yf.quoteSummary(symbol, {
            modules: ['summaryDetail', 'defaultKeyStatistics', 'financialData', 'price']
        });

        if (!result) {
            return res.status(404).json({ error: 'Stock not found' });
        }

        const summaryDetail = result.summaryDetail || {};
        const defaultKeyStatistics = result.defaultKeyStatistics || {};
        const financialData = result.financialData || {};
        const priceModule = result.price || {};

        // Extract Data (yahoo-finance2 returns cleaned numbers, no .raw)
        const price = priceModule.regularMarketPrice || financialData.currentPrice || 0;
        const change = priceModule.regularMarketChange || 0;
        const changePercent = (priceModule.regularMarketChangePercent || 0) * 100;
        const currency = priceModule.currency || summaryDetail.currency || 'USD';

        // Fundamentals
        const marketCap = summaryDetail.marketCap;
        const peRatio = summaryDetail.trailingPE || null;
        const eps = defaultKeyStatistics.trailingEps || null;
        const dividend = summaryDetail.dividendRate || summaryDetail.trailingAnnualDividendRate || 0;
        const high52w = summaryDetail.fiftyTwoWeekHigh || 0;
        const low52w = summaryDetail.fiftyTwoWeekLow || 0;
        const sector = summaryDetail.sector || 'N/A';
        const beta = defaultKeyStatistics.beta || null;
        const volume = summaryDetail.volume || 0;

        console.log(`[Backend] ✅ SUCCESS - ${symbol}: ${currency} ${price.toFixed(2)} | MC: ${marketCap}`);

        res.json({
            symbol: symbol,
            name: priceModule.longName || priceModule.shortName || symbol,
            price: price,
            change: change,
            changePercent: changePercent,
            currency: currency,
            marketCap: marketCap,
            peRatio: peRatio,
            eps: eps,
            dividend: dividend,
            high52w: high52w,
            low52w: low52w,
            sector: sector,
            beta: beta,
            volume: volume
        });

    } catch (error) {
        console.error('[Backend] Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 Stock API Backend running on http://localhost:${PORT}`);
    console.log(`📡 Endpoint: http://localhost:${PORT}/api/stock/:symbol\n`);
});
