from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent import FinancialAgent
from portfolio_explorer import ScenarioExplorer
import uvicorn
from data_loader import fetch_stock_history


app = FastAPI(
    title="FinSage Agentic Backend",
    description="Explainable, risk-aware stock analysis API (No Predictions)",
    version="1.1.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


agent = FinancialAgent()
explorer = ScenarioExplorer()

class ScenarioRequest(BaseModel):
    savings: float
    equity_pct: float
    risk_profile: str

@app.get("/")
def home():
    return {"message": "FinSage Agentic Backend is running. Use /analyze/{symbol} or POST /explore."}

@app.post("/explore")
def explore_scenarios(request: ScenarioRequest):
    """
    Generates personalized financial exploration scenarios.
    WARNING: Not financial advice. Illustrative only.
    """
    if request.equity_pct < 0 or request.equity_pct > 100:
        raise HTTPException(status_code=400, detail="Equity percentage must be between 0 and 100")
        
    try:
        return explorer.explore(request.savings, request.equity_pct, request.risk_profile)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analyze/{symbol}")
def analyze_stock(symbol: str):
    """
    Analyzes a stock symbol using the Agentic AI pipeline.
    """
    symbol = symbol.upper().strip()
    if not symbol.isalpha() and "^" not in symbol: # Allow Indices (e.g. ^GSPC)
         # Basic sanitization, though yfinance handles many things.
         # Assuming standard tickers.
         pass
    
    try:
        result = agent.analyze(symbol)
        if "error" in result:
             raise HTTPException(status_code=404, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/stocks/{symbol}/history")
def stock_history(symbol: str):
    history = fetch_stock_history(symbol)
    return {
        "symbol": symbol,
        "prices": history
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
