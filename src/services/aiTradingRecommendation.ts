// AI Trading Recommendation Engine (Rule-Based for MVP)
import { AIRecommendation } from "@/types/aiTypes";

interface StockData {
    name: string;
    price: number;
    change: number;
    changePercent: number;
    sector: string;
    peRatio: string;
    beta: string;
}

interface TechnicalIndicator {
    label: string;
    value: string;
    status: string;
    positive?: boolean;
}

/**
 * Analyzes stock data and technical indicators to generate AI recommendation
 * This is a rule-based system for MVP - can be replaced with LLM later
 */
export function generateAIRecommendation(
    symbol: string,
    stockData: StockData,
    technicalIndicators?: TechnicalIndicator[]
): AIRecommendation {
    const insights: string[] = [];
    let score = 0;
    let maxScore = 0;

    // Analyze price momentum
    maxScore += 2;
    if (stockData.changePercent > 1.5) {
        score += 2;
        insights.push("Strong positive momentum");
    } else if (stockData.changePercent > 0.5) {
        score += 1;
        insights.push("Moderate upward trend");
    } else if (stockData.changePercent < -1.5) {
        score -= 2;
        insights.push("Negative momentum detected");
    }

    // Analyze technical indicators
    if (technicalIndicators) {
        technicalIndicators.forEach((indicator) => {
            maxScore += 1;
            if (indicator.positive) {
                score += 1;
                insights.push(`${indicator.label}: ${indicator.status}`);
            }
        });
    }

    // Analyze volatility (Beta)
    maxScore += 1;
    const beta = parseFloat(stockData.beta);
    if (beta > 0 && beta < 1.2) {
        score += 1;
        insights.push("Moderate volatility - good risk/reward");
    } else if (beta >= 1.5) {
        insights.push("High volatility - higher risk");
    }

    // Calculate confidence (0-1)
    const confidence = Math.max(0, Math.min(1, (score / maxScore + 1) / 2));

    // Determine action based on score
    let action: "BUY" | "SELL" | "HOLD";
    if (confidence > 0.65 && stockData.changePercent > 0) {
        action = "BUY";
    } else if (confidence < 0.35 || stockData.changePercent < -2) {
        action = "SELL";
    } else {
        action = "HOLD";
    }

    // Calculate target price and stop loss
    const targetPrice = stockData.price * (action === "BUY" ? 1.12 : 0.88);
    const stopLoss = stockData.price * (action === "BUY" ? 0.92 : 1.08);

    // Suggest quantity based on confidence and price
    const suggestedQuantity = Math.max(
        1,
        Math.floor((1000 * confidence) / stockData.price)
    );

    return {
        symbol,
        name: stockData.name,
        action,
        confidence,
        reason: generateReason(action, confidence, stockData),
        targetPrice,
        stopLoss,
        suggestedQuantity,
        keyInsights: insights.slice(0, 4), // Top 4 insights
    };
}

function generateReason(
    action: "BUY" | "SELL" | "HOLD",
    confidence: number,
    stockData: StockData
): string {
    const confidenceLevel =
        confidence > 0.75 ? "Strong" : confidence > 0.5 ? "Moderate" : "Weak";

    if (action === "BUY") {
        return `${confidenceLevel} buy signal based on positive momentum (${stockData.changePercent.toFixed(2)}%) and favorable technical indicators.`;
    } else if (action === "SELL") {
        return `${confidenceLevel} sell signal due to negative momentum or weak technicals. Consider taking profits or cutting losses.`;
    } else {
        return `Neutral outlook. Current conditions suggest holding position and waiting for clearer signals.`;
    }
}

/**
 * Get a random stock recommendation from available stocks
 * Useful for demo purposes
 */
export function getRandomRecommendation(
    availableStocks: Record<string, StockData>,
    technicalIndicators?: TechnicalIndicator[]
): AIRecommendation {
    const symbols = Object.keys(availableStocks);
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    const stockData = availableStocks[randomSymbol];

    return generateAIRecommendation(randomSymbol, stockData, technicalIndicators);
}
