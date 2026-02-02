// AI Trading Assistant Type Definitions

export interface AIRecommendation {
    symbol: string;
    name: string;
    action: "BUY" | "SELL" | "HOLD";
    confidence: number; // 0-1
    reason: string;
    targetPrice: number;
    stopLoss: number;
    suggestedQuantity: number;
    keyInsights: string[];
}

export type AIActionType =
    | "focus_search"
    | "type_text"
    | "select_stock"
    | "fill_quantity"
    | "set_order_type"
    | "highlight_price"
    | "highlight_buy_sell"
    | "show_narration"
    | "stop_and_wait_for_user";

export interface AIAction {
    action: AIActionType;
    value?: string | number;
    duration?: number; // milliseconds
    message?: string; // narration message
}

export interface AIActionPlan {
    recommendation: AIRecommendation;
    steps: AIAction[];
}

export interface AIAgentState {
    isActive: boolean;
    currentStep: number;
    totalSteps: number;
    narration: string;
    cursorPosition: { x: number; y: number } | null;
    highlightedElement: string | null;
}

export interface UIElementMap {
    search: HTMLElement | null;
    buyButton: HTMLElement | null;
    sellButton: HTMLElement | null;
    quantityInput: HTMLElement | null;
    priceDisplay: HTMLElement | null;
    orderTypeSelect: HTMLElement | null;
}
