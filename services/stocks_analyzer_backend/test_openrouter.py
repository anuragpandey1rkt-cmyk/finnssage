import os
import requests
from dotenv import load_dotenv, find_dotenv

# Load .env file from the project root (parent of services/stocks_analyzer_backend)
load_dotenv(find_dotenv(filename=".env", raise_error_if_not_found=True))
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

url = "https://openrouter.ai/api/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json",
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "FinnSage"
}

models_to_test = [
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "openrouter/free",
    "qwen/qwen-2.5-vl-7b-instruct:free"
]

print("Starting batch test...")

for model in models_to_test:
    print(f"Testing model: {model}")
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": "Hello"}]
    }
    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        fname = f"result_{model.replace('/', '_').replace(':', '_')}.txt"
        with open(fname, "w", encoding="utf-8") as f:
            f.write(response.text)
        print(f"Response written to {fname}")
        
        if response.status_code == 200:
            print(f"SUCCESS with {model}!")
            break
    except Exception as e:
        print(f"Request failed: {e}")
