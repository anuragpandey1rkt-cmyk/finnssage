import { ParsedTransaction } from "@/lib/statementParser";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY_2;
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

export const aiService = {
    /**
     * Analyzes raw text from a bank statement using Groq AI to extract structured transactions.
     */
    analyzeBankStatement: async (text: string): Promise<ParsedTransaction[]> => {
        if (!GROQ_API_KEY) {
            console.warn("Missing VITE_GROQ_API_KEY_2. Please add it to your .env.local file.");
            throw new Error("Groq API Key (VITE_GROQ_API_KEY_2) is missing.");
        }

        const systemPrompt = `
      You are an expert financial data analyst. 
      Extract all transactions from the provided bank statement text. 
      Return ONLY a valid JSON array of objects. Do not include markdown formatting, explanations, or code blocks.
      
      Each transaction object must have:
      - "date": string (ISO 8601 format YYYY-MM-DD)
      - "description": string (clean up merchant name, remove cryptic codes)
      - "amount": number (absolute value)
      - "type": "income" or "expense"
      - "category": string (Infer based on description, e.g., "Food", "Transport", "Salary", "Rent", "Shopping", "Transfer")

      Ignore headers, footers, and page numbers. If no transactions are found, return an empty array [].
    `;

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: `Analyze this bank statement:\n\n${text.slice(0, 30000)}` }
                    ],
                    temperature: 0.1, // Low temperature for consistent data extraction
                    response_format: { type: "json_object" } // Force JSON mode
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Groq API Error: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            const rawResult = data.choices?.[0]?.message?.content;

            if (!rawResult) {
                throw new Error("No response from Groq.");
            }

            // Clean cleanup markdown if present (just in case) or find the JSON array in the text
            const cleanJson = rawResult.replace(/```json/g, "").replace(/```/g, "").trim();

            // Sometimes models wrap array in an object like { "transactions": [...] }, handle that
            let parsedData;
            try {
                parsedData = JSON.parse(cleanJson);
            } catch (e) {
                // Fallback: try to find array brackets
                const match = cleanJson.match(/\[.*\]/s);
                if (match) {
                    parsedData = JSON.parse(match[0]);
                } else {
                    throw new Error("Failed to parse JSON from AI response");
                }
            }

            const transactions: ParsedTransaction[] = Array.isArray(parsedData)
                ? parsedData
                : (parsedData.transactions || []);

            // Ensure date objects are Date instances
            return transactions.map(t => ({
                ...t,
                date: new Date(t.date)
            }));

        } catch (error) {
            console.error("AI Parsing Failed:", error);
            throw error;
        }
    },
};
