// AI Action Planner - Converts recommendations into executable UI steps
import { AIRecommendation, AIActionPlan, AIAction } from "@/types/aiTypes";

/**
 * Creates a step-by-step action plan from an AI recommendation
 * This plan will be executed by the AI Agent Controller
 */
export function createActionPlan(
    recommendation: AIRecommendation
): AIActionPlan {
    const steps: AIAction[] = [];

    // Step 1: Show initial narration
    steps.push({
        action: "show_narration",
        message: `🤖 AI Analysis Complete! I recommend ${recommendation.action} ${recommendation.symbol}`,
        duration: 1500,
    });

    // Step 2: Focus on search/stock selector
    steps.push({
        action: "focus_search",
        message: `🔍 Searching for ${recommendation.symbol}...`,
        duration: 800,
    });

    // Step 3: Type stock symbol (character by character)
    steps.push({
        action: "type_text",
        value: recommendation.symbol,
        message: `⌨️ Selecting ${recommendation.name}`,
        duration: 1200,
    });

    // Step 4: Select the stock
    steps.push({
        action: "select_stock",
        value: recommendation.symbol,
        message: `✅ ${recommendation.symbol} selected`,
        duration: 800,
    });

    // Step 5: Highlight the price
    steps.push({
        action: "highlight_price",
        message: `💰 Current price analyzed`,
        duration: 1000,
    });

    // Step 6: Fill quantity
    steps.push({
        action: "fill_quantity",
        value: recommendation.suggestedQuantity,
        message: `📊 Suggested quantity: ${recommendation.suggestedQuantity} shares`,
        duration: 1000,
    });

    // Step 7: Set order type to market
    steps.push({
        action: "set_order_type",
        value: "market",
        message: `⚡ Market order recommended for immediate execution`,
        duration: 800,
    });

    // Step 8: Highlight Buy/Sell buttons
    steps.push({
        action: "highlight_buy_sell",
        message: `🎯 ${recommendation.action} recommendation ready`,
        duration: 1500,
    });

    // Step 9: Stop and wait for user
    steps.push({
        action: "stop_and_wait_for_user",
        message: `⏸️ Please review the ${recommendation.action} order and click to confirm`,
        duration: 0, // Indefinite - waits for user
    });

    return {
        recommendation,
        steps,
    };
}

/**
 * Validates that an action plan is safe and compliant
 * Ensures no auto-execution of trades
 */
export function validateActionPlan(plan: AIActionPlan): boolean {
    // Check that plan ends with stop_and_wait_for_user
    const lastStep = plan.steps[plan.steps.length - 1];
    if (lastStep.action !== "stop_and_wait_for_user") {
        console.error("SAFETY VIOLATION: Action plan does not end with user confirmation");
        return false;
    }


    // The type system already prevents unsafe actions like "click_buy" or "click_sell"
    // since they're not included in the AIActionType union


    return true;
}
