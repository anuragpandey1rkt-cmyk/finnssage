import pandas as pd
from data_loader import fetch_stock_data
from indicators import calculate_ema, calculate_rsi, calculate_atr
from ml_engine import MarketClassifier

class FinancialAgent:
    def __init__(self):
        self.steps = []
        self.classifier = MarketClassifier()
        
    def log(self, message: str):
        """Logs a step in the agent's decision process."""
        self.steps.append(message)
        
    def analyze(self, symbol: str):
        """
        Performs a full agentic analysis of the stock.
        """
        self.steps = [] # Reset steps
        result = {
            "agent_steps": [],
            "analysis": {}
        }
        
        # Step 1: Data Acquisition
        self.log(f"Initiating analysis for {symbol}...")
        self.log("Tool: fetch_stock_data -> Fetching 6 months of OHLCV data.")
        df = fetch_stock_data(symbol)
        
        if df.empty:
            self.log(f"Error: No data found for {symbol}. Stopping analysis.")
            result["agent_steps"] = self.steps
            result["error"] = "Data not found"
            return result
            
        current_price = df['Close'].iloc[-1]
        self.log(f"Data acquired. Last close price: {current_price:.2f}")

        # Step 2: Indicator Calculation
        self.log("Tool: Indicator Engine -> Calculating EMA20, EMA50, RSI(14), ATR(14).")
        df['EMA20'] = calculate_ema(df, 20)
        df['EMA50'] = calculate_ema(df, 50)
        df['RSI'] = calculate_rsi(df, 14)
        df['ATR'] = calculate_atr(df, 14)
        
        # Get latest values
        latest = df.iloc[-1]
        ema20 = latest['EMA20']
        ema50 = latest['EMA50']
        rsi = latest['RSI']
        atr = latest['ATR']
        
        self.log(f"Indicators Computed: RSI={rsi:.2f}, ATR={atr:.2f}, EMA20={ema20:.2f}, EMA50={ema50:.2f}")
        
        # Step 3: ML Classification
        self.log("Tool: ML Classifier -> analyzing market state features.")
        market_state, confidence = self.classifier.classify(ema20, ema50, rsi, atr)
        self.log(f"ML Output: Class={market_state}, Confidence={confidence:.2f}")
        
        # Step 4: Logic & Risk Assessment
        self.log("Agent Logic: Assessing risk and volatility parameters.")
        
        # Risk Rules
        risk_level = "Low"
        if rsi > 70 or rsi < 30:
            risk_level = "High (Overextended RSI)"
        elif atr > (current_price * 0.03): # > 3% daily move expectation
            risk_level = "Medium-High (High Volatility)"
        elif atr > (current_price * 0.015):
            risk_level = "Medium"
            
        # Volatility Range (Next 24h expected range)
        # Using 2 * ATR for a safe standard deviation-like bound (approx 95% conf equivalent if Normal dist)
        vol_upper = current_price + (2 * atr)
        vol_lower = current_price - (2 * atr)
        
        self.log(f"Risk Assessment: {risk_level}")
        self.log(f"Volatility Range: {vol_lower:.2f} - {vol_upper:.2f}")

        # Final Decision Synthesis
        analysis_payload = {
            "current_price": round(current_price, 2),
            "trend_bias": market_state,
            "risk_level": risk_level,
            "rsi": round(rsi, 2),
            "volatility_range": {
                "upper": round(vol_upper, 2),
                "lower": round(vol_lower, 2)
            },
            "confidence_score": round(confidence, 2)
        }
        
        result["agent_steps"] = self.steps
        result["analysis"] = analysis_payload
        
        self.log("Analysis complete.")
        return result
