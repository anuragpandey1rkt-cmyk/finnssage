import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { bankName, cardModel } = await req.json();

    if (!bankName || !cardModel) {
      throw new Error('Bank name and card model are required');
    }

    const GROK_API_KEY = Deno.env.get('GROK_API_KEY_1');
    if (!GROK_API_KEY) {
      throw new Error('Server misconfiguration: API Key missing');
    }

    const prompt = `
    You are a financial expert. Provide a detailed JSON summary of the rewards and benefits for the credit card: "${bankName} ${cardModel}".
    
    Return ONLY valid JSON with this structure:
    {
      "features": ["string", "string"], // List of key benefits like Lounge Access, Insurance, Golf
      "rewards": {
        "base_rate": "string", // e.g. "2 points per Rs 100"
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

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
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

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`AI Provider Error: ${data.error.message}`);
    }

    const content = data.choices[0].message.content;
    
    // Attempt to parse JSON strictly
    let cardData;
    try {
        // Remove any markdown fencing if present
        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        cardData = JSON.parse(cleanContent);
    } catch (e) {
        console.error("Failed to parse AI response:", content);
        throw new Error("Failed to parse card details from AI");
    }

    return new Response(JSON.stringify(cardData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
