import math
from agent import FinancialAgent

class ScenarioExplorer:
    def __init__(self):
        self.agent = FinancialAgent()
        # A small diverse pool of candidates for demonstration
        self.candidate_pool = [
            "AAPL", "MSFT", "GOOGL", "AMZN", # Tech / Growth
            "JPM", "V", # Finance
            "PG", "KO", "JNJ", # Defensive / Staples
            "NVDA", "TSLA" # High Volatility
        ]

    def _calculate_annualized_volatility(self, current_price, atr_daily):
        """
        Approximates annualized volatility from Daily ATR.
        ATR is an absolute move. ATR% ~ ATR / Price.
        Annualized Vol % approx (ATR / Price) * sqrt(252).
        This is a heuristic for illustration.
        """
        if current_price == 0: return 0
        daily_vol_pct = atr_daily / current_price
        annualized_vol_pct = daily_vol_pct * math.sqrt(252)
        return annualized_vol_pct

    def explore(self, savings: float, equity_pct: float, risk_profile: str):
        """
        Generates illustrative scenarios based on user inputs.
        """
        # 1. Allocation Logic
        equity_amount = savings * (equity_pct / 100)
        safe_amount = savings - equity_amount
        
        exploration_result = {
            "savings_summary": {
                "total_savings": savings,
                "equity_allocation": {
                    "amount": round(equity_amount, 2),
                    "percentage": equity_pct,
                    "label": "Scenario-based equity exposure"
                },
                "safe_allocation": {
                    "amount": round(safe_amount, 2),
                    "percentage": 100 - equity_pct,
                    "label": "Remaining non-equity savings"
                }
            },
            "aligned_stocks": [],
            "transparency_note": "This tool illustrates potential outcomes based on historical data. It is NOT investment advice. Market conditions change."
        }
        
        # 2. Stock Filtering
        # Profile Rules:
        # Conservative: Low Risk only.
        # Balanced: Low or Medium Risk.
        # Aggressive: Any Risk.
        
        allowed_risks = []
        if risk_profile.lower() == "conservative":
            allowed_risks = ["Low"]
        elif risk_profile.lower() == "balanced":
            allowed_risks = ["Low", "Medium"]
        else:
            allowed_risks = ["Low", "Medium", "Medium-High (High Volatility)", "High (Overextended RSI)"]

        # 3. Analyze Candidates
        for symbol in self.candidate_pool:
            if len(exploration_result["aligned_stocks"]) >= 5:
                break
                
            # Analyze returns {agent_steps, analysis}
            # We catch errors to avoid one stock breaking the loop
            try:
                report = self.agent.analyze(symbol)
            except Exception:
                continue
                
            if "error" in report:
                continue
                
            analysis = report["analysis"]
            risk = analysis["risk_level"]
            trend = analysis["trend_bias"]
            price = analysis["current_price"]
            rsi = analysis["rsi"]
            atr = analysis["volatility_range"]["upper"] - price # approx atr * 2
            atr = atr / 2 # retrieve atr
            
            # Filter Logic
            # 1. Check Risk
            risk_pass = False
            for allowed in allowed_risks:
                if allowed in risk:
                    risk_pass = True
                    break
            
            if not risk_pass:
                continue
                
            # 2. Check Trend (Preference for Bullish/Neutral for scenarios)
            # If Aggressive, maybe Bearish is okay? Let's stick to Bullish/Neutral for "Investment" scenarios usually.
            if trend == "Bearish" and risk_profile.lower() != "aggressive":
                continue

            # 4. Generate Scenarios for this stock
            ann_vol = self._calculate_annualized_volatility(price, atr)
            
            # Scenarios (1 Year Horizon Illustration)
            favorable_price = price * (1 + ann_vol)
            neutral_price = price * (1 + (ann_vol * 0.2)) # Slight drift up
            unfavorable_price = price * (1 - ann_vol)
            
            qty = 0
            if price > 0:
                qty = equity_amount / price
                
            stock_scenario = {
                "symbol": symbol,
                "current_price": price,
                "trend": trend,
                "risk_profile": risk,
                "illustrative_quantity": round(qty, 2),
                "allocatable_amount": round(equity_amount, 2),
                "outcome_scenarios_1yr": {
                    "favorable": {
                        "price": round(favorable_price, 2),
                        "value_change_pct": round(ann_vol * 100, 1),
                        "description": "Historical volatility upside"
                    },
                    "neutral": {
                        "price": round(neutral_price, 2),
                        "value_change_pct": round(ann_vol * 0.2 * 100, 1),
                        "description": "Modest growth aligned with trend"
                    },
                    "unfavorable": {
                        "price": round(unfavorable_price, 2),
                        "value_change_pct": round(-ann_vol * 100, 1),
                        "description": "Historical volatility downside"
                    }
                }
            }
            
            exploration_result["aligned_stocks"].append(stock_scenario)

        return exploration_result
