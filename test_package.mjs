import yahooFinance from 'yahoo-finance2';

console.log("Type:", typeof yahooFinance);
if (yahooFinance) {
    console.log("Keys:", Object.keys(yahooFinance));
    if (yahooFinance.quoteSummary) {
        console.log("quoteSummary is available");
    } else {
        console.log("quoteSummary is MISSING");
    }
} else {
    console.log("yahooFinance is falsy");
}

import * as yf from 'yahoo-finance2';
console.log("Namespace keys:", Object.keys(yf));
