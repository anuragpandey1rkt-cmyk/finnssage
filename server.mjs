import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

// Enable CORS for frontend
app.use(cors());
app.use(express.json());

// Proxy endpoint for Yahoo Finance
app.get('/api/stock/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        console.log(`[Backend] Fetching ${symbol}...`);

        // Yahoo Finance v7 Quote API
        const quoteUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;
        const response = await fetch(quoteUrl);

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Yahoo Finance API error' });
        }

        const data = await response.json();
        const quote = data.quoteResponse?.result?.[0];

        if (!quote) {
            return res.status(404).json({ error: 'Stock not found' });
        }

        // Extract data
        const price = quote.regularMarketPrice || 0;
        const change = quote.regularMarketChange || 0;
        const changePercent = quote.regularMarketChangePercent || 0;

        console.log(`[Backend] ✅ SUCCESS - ${symbol}: ${quote.currency}${price.toFixed(2)}`);

        res.json({
            symbol: symbol,
            name: quote.longName || quote.shortName || symbol,
            price: price,
            change: change,
            changePercent: changePercent,
            currency: quote.currency || 'USD',
            marketCap: quote.marketCap,
            peRatio: quote.trailingPE,
            eps: quote.epsTrailingTwelveMonths,
            dividend: quote.dividendRate,
            high52w: quote.fiftyTwoWeekHigh,
            low52w: quote.fiftyTwoWeekLow,
            sector: quote.sector || 'N/A',
            beta: quote.beta
        });

    } catch (error) {
        console.error('[Backend] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 Stock API Backend running on http://localhost:${PORT}`);
    console.log(`📡 Endpoint: http://localhost:${PORT}/api/stock/:symbol\n`);
});
