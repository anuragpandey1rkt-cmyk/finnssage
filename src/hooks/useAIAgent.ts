// Hook for AI Agent State Management
import { useState, useCallback, useRef } from "react";
import { AIRecommendation, AIActionPlan } from "@/types/aiTypes";
import { generateAIRecommendation, getRandomRecommendation } from "@/services/aiTradingRecommendation";
import { createActionPlan } from "@/services/aiActionPlanner";
import { ChatMessage } from "@/components/trading/AIChatPanel";
import { toast } from "sonner";

export function useAIAgent(
  availableStocks?: Record<string, any>
) {
  const [isAgentActive, setIsAgentActive] = useState(false);
  const [currentActionPlan, setCurrentActionPlan] = useState<AIActionPlan | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I've analyze the current market trends. Select a stock or ask me to find potential opportunities.",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Helper to safely start the agent
  const startAIAgentInternal = useCallback((specificRecommendation?: AIRecommendation) => {
    if (!availableStocks) return;

    setIsAgentActive(true);
    
    // 1. Get recommendation (specific or random)
    const recommendation = specificRecommendation || getRandomRecommendation(availableStocks);
      
    // 2. Create action plan
    const plan = createActionPlan(recommendation);
      
    // 3. Set plan to trigger execution
    setCurrentActionPlan(plan);
  }, [availableStocks]);

  const addMessage = useCallback((message: Omit<ChatMessage, "id" | "timestamp">) => {
    setMessages(prev => [...prev, {
      ...message,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date()
    }]);
  }, []);

  const handleUserMessage = useCallback(async (content: string) => {
    addMessage({ role: "user", content });
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
        setIsTyping(false);
        
        if (content.toLowerCase().includes("recommend") || content.toLowerCase().includes("find") || content.toLowerCase().includes("trade")) {
            if (availableStocks) {
                const recommendation = getRandomRecommendation(availableStocks);
                
                addMessage({
                    role: "assistant",
                    content: `I've analyzed the market and found a strong signal for ${recommendation.name} (${recommendation.symbol}).`,
                    type: "action_card",
                    actionData: {
                        title: "Action Recommended",
                        description: `Based on recent technical indicators, I recommend a ${recommendation.action} position for ${recommendation.symbol}.`,
                        actionLabel: "Yes, show me",
                        onAction: () => startAIAgentInternal(recommendation)
                    }
                });
            }
        } else {
            addMessage({
                role: "assistant",
                content: "I'm specialized in trading execution. Ask me to 'find a trade' or 'recommend a stock' and I'll analyze the market for you."
            });
        }
    }, 1500);
  }, [availableStocks, addMessage, startAIAgentInternal]);

  const stopAIAgent = useCallback(() => {
    setIsAgentActive(false);
    setCurrentActionPlan(null);
    addMessage({ role: "system", content: "AI Agent stopped by user." });
  }, [addMessage]);

  const handleAgentComplete = useCallback(() => {
    setIsAgentActive(false);
    setCurrentActionPlan(null);
    addMessage({ 
        role: "assistant", 
        content: "I've set up the trade order for you. Please review the details in the order panel and click 'Place Order' when you're ready." 
    });
  }, [addMessage]);

  const resetChat = useCallback(() => {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: "Hello! I've analyze the current market trends. Select a stock or ask me to find potential opportunities.",
        timestamp: new Date()
      }]);
      setIsAgentActive(false);
      setCurrentActionPlan(null);
  }, []);

  return {
    isAgentActive,
    currentActionPlan,
    messages,
    isTyping,
    handleUserMessage,
    startAIAgent: startAIAgentInternal,
    stopAIAgent,
    handleAgentComplete,
    resetChat
  };
}
