import { supabase } from "@/lib/supabase";

export interface CardDetails {
    features: string[];
    rewards: {
        base_rate: string;
        special_categories: { category: string; rate: string }[];
    };
    fees: {
        joining: string;
        renewal: string;
    };
}

export const fetchCardDetails = async (bankName: string, cardModel: string): Promise<CardDetails> => {
    console.log("Using Client-Side AI Call...");

    // 1. Try to get key from VITE env (Client Side)
    const apiKey = import.meta.env.VITE_GROK_API_KEY_1;

    if (!apiKey || apiKey.includes("PutYourKeyHere")) {
        throw new Error("Missing API Key. Please add VITE_GROK_API_KEY_1 to your .env.local file.");
    }

    const prompt = `
    You are a financial expert. Provide a detailed JSON summary of the rewards and benefits for the credit card: "${bankName} ${cardModel}".
    
    Return ONLY valid JSON with this structure:
    {
      "features": ["string", "string"],
      "rewards": {
        "base_rate": "string",
        "special_categories": [
           { "category": "Dining", "rate": "5x points" },
           { "category": "Travel", "rate": "2x points" }
        ]
      },
      "fees": {
        "joining": "string",
        "renewal": "string"
      }
    }
    
    Do not include markdown formatting or any text outside the JSON.
    `;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: 'You are a helpful JSON-speaking financial assistant.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.1,
            }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || "AI API Call Failed");
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanContent);

    } catch (error: any) {
        console.error("Client AI Error:", error);
        throw new Error(error.message || "Failed to analyze card.");
    }
};
