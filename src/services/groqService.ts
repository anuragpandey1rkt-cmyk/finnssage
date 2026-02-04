
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

const groqService = {
    async chat(messages: ChatMessage[]) {
        if (!GROQ_API_KEY) {
            console.error("Groq API Key missing");
            return "Error: API Key missing. Please set VITE_GROQ_API_KEY.";
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
                const errorData = await response.json();
                console.error("Groq API Error:", errorData);
                throw new Error(`Groq API Error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices?.[0]?.message?.content || "No response received.";
        } catch (error) {
            console.error("Groq Service Error:", error);
            return "I'm having trouble connecting to my brain (Groq API). Please try again later.";
        }
    }
};

export default groqService;
