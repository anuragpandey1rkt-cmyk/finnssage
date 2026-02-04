
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const BASE_URL = '/api/groq/openai/v1/chat/completions';

export interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

const groqService = {
    async chat(messages: ChatMessage[]) {
        if (!GROQ_API_KEY || GROQ_API_KEY === 'undefined') {
            console.error("Groq API Key missing");
            return "Error: API Key is missing or invalid in Vercel Environment Variables. Please set VITE_GROQ_API_KEY.";
        }

        try {
            const response = await fetch(BASE_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.1-70b-versatile",
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 1024,
                    stream: false
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Groq API Error:", errorData);
                return `Error: Groq API request failed (${response.status}). ${errorData.error?.message || ''}`;
            }

            const data = await response.json();
            return data.choices?.[0]?.message?.content || "No response received.";
        } catch (error: any) {
            console.error("Groq Service Error:", error);
            return `Connection Error: ${error.message || 'Unable to reach Groq API'}.`;
        }
    }
};

export default groqService;
