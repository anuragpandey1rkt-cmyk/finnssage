import yahooFinance from 'yahoo-finance2';

async function test() {
    console.log("Testing singleton usage...");
    try {
        const result = await yahooFinance.quoteSummary('AAPL', { modules: ['price'] });
        console.log("Singleton Success");
    } catch (e) {
        console.log("Singleton Error:", e.message);
    }

    console.log("\nTesting new instance usage...");
    try {
        const yf = new yahooFinance();
        const result = await yf.quoteSummary('AAPL', { modules: ['price'] });
        console.log("Instance Success");
    } catch (e) {
        console.log("Instance Error:", e.message);
    }
}

test();
