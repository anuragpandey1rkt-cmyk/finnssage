import fetch from 'node-fetch';

async function testV7() {
    console.log("--- Testing V7 ---");
    const url = "https://query1.finance.yahoo.com/v7/finance/quote?symbols=YESBANK.NS";
    try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        console.log("Status:", res.status);
        if (res.ok) {
            const data = await res.json();
            const quote = data.quoteResponse?.result?.[0];
            if (quote) {
                console.log("Price:", quote.regularMarketPrice);
                console.log("MCap:", quote.marketCap);
                console.log("PE:", quote.trailingPE);
                console.log("EPS:", quote.epsTrailingTwelveMonths);
                console.log("Div:", quote.dividendRate);
                console.log("DivYield:", quote.dividendYield);
            } else {
                console.log("No quote found");
            }
        } else {
            console.log("Error text:", await res.text());
        }
    } catch (e) {
        console.error(e);
    }
}

async function testV10() {
    console.log("\n--- Testing V10 ---");
    const url = "https://query1.finance.yahoo.com/v10/finance/quoteSummary/YESBANK.NS?modules=summaryDetail,defaultKeyStatistics,financialData,price";
    try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        console.log("Status:", res.status);
        if (res.ok) {
            const data = await res.json();
            const result = data.quoteSummary?.result?.[0];
            if (result) {
                console.log("Summary:", result.summaryDetail ? "Found" : "Missing");
                console.log("MCap:", result.summaryDetail?.marketCap?.raw);
            } else {
                console.log("No result");
            }
        } else {
            console.log("Error text:", await res.text());
        }
    } catch (e) {
        console.error(e);
    }
}

async function run() {
    await testV7();
    await testV10();
}

run();
