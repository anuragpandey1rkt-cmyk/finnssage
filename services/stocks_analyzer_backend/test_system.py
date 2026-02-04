import json
from agent import FinancialAgent

def test():
    print("Initializing Agent...")
    agent = FinancialAgent()
    
    symbol = "AAPL"
    print(f"Running analysis for {symbol}...")
    result = agent.analyze(symbol)
    
    print("\n--- JSON OUTPUT ---")
    print(json.dumps(result, indent=2))
    
    # Basic Checks
    if "agent_steps" in result and "analysis" in result:
        print("\n[PASS] Structure valid.")
    else:
        print("\n[FAIL] Structure invalid.")
        
    if result["analysis"].get("current_price", 0) > 0:
        print("[PASS] Price looks real.")
    else:
        print("[FAIL] Price invalid.")

if __name__ == "__main__":
    test()
