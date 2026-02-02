// AI Agent Controller - Orchestrates the entire AI trading assistant
import { useState, useEffect, useRef, useCallback } from "react";
import { AICursor } from "./AICursor";
import { AINarration } from "./AINarration";
import { AIActionPlan, AIAction, UIElementMap } from "@/types/aiTypes";
import { moveCursorTo, typeLikeHuman, highlightElement, sleep, getElementCenter } from "@/utils/aiAnimations";
import { validateActionPlan } from "@/services/aiActionPlanner";

interface AIAgentControllerProps {
    actionPlan: AIActionPlan | null;
    onComplete?: () => void;
    onStop?: () => void;
}

export function AIAgentController({ actionPlan, onComplete, onStop }: AIAgentControllerProps) {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [narration, setNarration] = useState("");
    const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
    const [confidence, setConfidence] = useState<number | undefined>(undefined);

    const cursorRef = useRef<HTMLDivElement>(null);
    const cleanupFnsRef = useRef<Array<() => void>>([]);
    const isExecutingRef = useRef(false);

    // Map UI elements
    const getUIElements = useCallback((): UIElementMap => {
        return {
            search: document.querySelector('[data-testid="stock-search"]') as HTMLElement,
            buyButton: document.querySelector('[data-testid="buy-button"]') as HTMLElement,
            sellButton: document.querySelector('[data-testid="sell-button"]') as HTMLElement,
            quantityInput: document.querySelector('[data-testid="quantity-input"]') as HTMLElement,
            priceDisplay: document.querySelector('[data-testid="stock-price"]') as HTMLElement,
            orderTypeSelect: document.querySelector('[data-testid="order-type-select"]') as HTMLElement,
        };
    }, []);

    // Execute a single action step
    const executeAction = useCallback(async (action: AIAction, uiElements: UIElementMap) => {
        console.log(`[AI Agent] Executing action: ${action.action}`, action);

        // Update narration
        if (action.message) {
            setNarration(action.message);
        }

        switch (action.action) {
            case "focus_search":
                if (uiElements.search) {
                    const center = getElementCenter(uiElements.search);
                    setCursorPosition(center);
                    await sleep(action.duration || 800);
                    const cleanup = highlightElement(uiElements.search, action.duration || 800);
                    cleanupFnsRef.current.push(cleanup);
                }
                break;

            case "type_text":
                if (uiElements.search && typeof action.value === "string") {
                    await typeLikeHuman(uiElements.search as HTMLInputElement, action.value);
                    await sleep(action.duration || 500);
                }
                break;

            case "select_stock":
                if (uiElements.search && typeof action.value === "string") {
                    // Trigger change event for React
                    const selectElement = uiElements.search as HTMLSelectElement;
                    selectElement.value = action.value;
                    const event = new Event("change", { bubbles: true });
                    selectElement.dispatchEvent(event);
                    await sleep(action.duration || 800);
                }
                break;

            case "highlight_price":
                if (uiElements.priceDisplay) {
                    const center = getElementCenter(uiElements.priceDisplay);
                    setCursorPosition(center);
                    await sleep(300);
                    const cleanup = highlightElement(uiElements.priceDisplay, action.duration || 1000);
                    cleanupFnsRef.current.push(cleanup);
                    await sleep(action.duration || 1000);
                }
                break;

            case "fill_quantity":
                if (uiElements.quantityInput && typeof action.value === "number") {
                    const center = getElementCenter(uiElements.quantityInput);
                    setCursorPosition(center);
                    await sleep(300);

                    const input = uiElements.quantityInput as HTMLInputElement;
                    input.value = action.value.toString();
                    const event = new Event("input", { bubbles: true });
                    input.dispatchEvent(event);

                    const cleanup = highlightElement(uiElements.quantityInput, action.duration || 800);
                    cleanupFnsRef.current.push(cleanup);
                    await sleep(action.duration || 800);
                }
                break;

            case "set_order_type":
                if (uiElements.orderTypeSelect && typeof action.value === "string") {
                    const center = getElementCenter(uiElements.orderTypeSelect);
                    setCursorPosition(center);
                    await sleep(300);

                    const select = uiElements.orderTypeSelect as HTMLSelectElement;
                    select.value = action.value;
                    const event = new Event("change", { bubbles: true });
                    select.dispatchEvent(event);

                    await sleep(action.duration || 800);
                }
                break;

            case "highlight_buy_sell":
                const targetButton = actionPlan?.recommendation.action === "BUY"
                    ? uiElements.buyButton
                    : uiElements.sellButton;

                if (targetButton) {
                    const center = getElementCenter(targetButton);
                    setCursorPosition(center);
                    await sleep(300);

                    // Highlight with pulsing effect (no auto-removal)
                    const cleanup = highlightElement(
                        targetButton,
                        0, // Indefinite
                        actionPlan?.recommendation.action === "BUY" ? "#22c55e" : "#ef4444"
                    );
                    cleanupFnsRef.current.push(cleanup);
                    await sleep(action.duration || 1500);
                }
                break;

            case "stop_and_wait_for_user":
                console.log("[AI Agent] SAFETY STOP - Waiting for user confirmation");
                // Keep highlights and cursor visible
                break;

            case "show_narration":
                // Already handled at the start
                await sleep(action.duration || 1000);
                break;
        }
    }, [actionPlan]);

    // Execute the entire action plan
    const executePlan = useCallback(async (plan: AIActionPlan) => {
        if (isExecutingRef.current) {
            console.warn("[AI Agent] Already executing a plan");
            return;
        }

        // Validate plan for safety
        if (!validateActionPlan(plan)) {
            console.error("[AI Agent] Action plan failed safety validation");
            setNarration("❌ Safety check failed - plan aborted");
            return;
        }

        isExecutingRef.current = true;
        setIsActive(true);
        setConfidence(plan.recommendation.confidence);
        setCurrentStep(0);

        const uiElements = getUIElements();

        // Check if required UI elements exist
        if (!uiElements.search) {
            console.error("[AI Agent] Required UI elements not found");
            setNarration("❌ UI elements not ready");
            isExecutingRef.current = false;
            setIsActive(false);
            return;
        }

        try {
            for (let i = 0; i < plan.steps.length; i++) {
                if (!isExecutingRef.current) {
                    console.log("[AI Agent] Execution stopped by user");
                    break;
                }

                setCurrentStep(i);
                await executeAction(plan.steps[i], uiElements);
            }

            console.log("[AI Agent] Plan execution complete");
            onComplete?.();
        } catch (error) {
            console.error("[AI Agent] Error during execution:", error);
            setNarration("❌ An error occurred");
        }
    }, [executeAction, getUIElements, onComplete]);

    // Start execution when action plan changes
    useEffect(() => {
        if (actionPlan && !isExecutingRef.current) {
            executePlan(actionPlan);
        }
    }, [actionPlan, executePlan]);

    // Cleanup function
    const stopAgent = useCallback(() => {
        console.log("[AI Agent] Stopping agent");
        isExecutingRef.current = false;
        setIsActive(false);
        setCursorPosition(null);
        setNarration("");
        setConfidence(undefined);

        // Run all cleanup functions
        cleanupFnsRef.current.forEach(fn => fn());
        cleanupFnsRef.current = [];

        onStop?.();
    }, [onStop]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopAgent();
        };
    }, [stopAgent]);

    return (
        <>
            <AICursor isActive={isActive} position={cursorPosition} />
            <AINarration isActive={isActive} message={narration} confidence={confidence} />
        </>
    );
}
