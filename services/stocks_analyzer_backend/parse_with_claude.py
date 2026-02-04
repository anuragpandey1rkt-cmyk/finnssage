import os
import requests
import json

from dotenv import load_dotenv, find_dotenv

# Load .env file from the project root (parent of services/stocks_analyzer_backend)
success = load_dotenv(find_dotenv(filename=".env", raise_error_if_not_found=True))
print(f"Dotenv loaded: {success}")

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    print("Warning: OPENROUTER_API_KEY not found in environment!")


def parse_with_claude(statement_text: str):
    url = "https://openrouter.ai/api/v1/chat/completions"

    payload = {
        "model": "openrouter/free",
        "messages": [
            {
                "role": "system",
                "content": "You are a bank statement parser. Extract transactions into JSON."
            },
            {
                "role": "user",
                "content": f"""
Here is bank statement text:

{statement_text}

Return ONLY valid JSON in this format:
[
  {{"date": "DD/MM/YYYY", "description": "text", "amount": number, "type": "debit/credit"}}
]
"""
            }
        ]
    }

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "FinnSage"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        return json.dumps({"error": str(e)}) # Return error as JSON string so app.py can parse it (or fail parsing)


    return response.json()["choices"][0]["message"]["content"]
