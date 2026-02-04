import os
import json
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from extract_text import extract_text
from parse_with_claude import parse_with_claude

app = FastAPI()

# allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    print(f"Received request to upload: {file.filename}", flush=True)
    try:
        # save uploaded file
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())

        # 1️⃣ extract text from PDF
        text = extract_text(file_path)

        # 2️⃣ send text to Claude (OpenRouter)
        print("Starting AI analysis...", flush=True)
        json_text = parse_with_claude(text)
        print(f"AI Response received: {json_text[:100]}...", flush=True) # Print first 100 chars

        # 3️⃣ convert returned string to JSON
        transactions = json.loads(json_text)
        print(f"Parsed {len(transactions)} transactions", flush=True)

        return {
            "status": "success",
            "transactions": transactions
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
