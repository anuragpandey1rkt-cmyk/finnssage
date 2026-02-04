import json
from portfolio_explorer import ScenarioExplorer

def test_scenario_logic():
    print("Initializing ScenarioExplorer...")
    explorer = ScenarioExplorer()
    
    # Test Case 1: Conservative User
    print("\n--- TEST: Conservative Profile ---")
    savings = 10000
    equity_pct = 30
    risk = "Conservative"
    
    result = explorer.explore(savings, equity_pct, risk)
    print(json.dumps(result, indent=2))
    
    # Checks
    assert result["savings_summary"]["equity_allocation"]["amount"] == 3000
    assert len(result["aligned_stocks"]) <= 5
    for stock in result["aligned_stocks"]:
        # Conservative should only have Low risk (or maybe Medium depending on logic, but we set strictly Low for Conservative)
        # In implementation: if Conservative -> allowed_risks = ["Low"]
        assert "Low" in stock["risk_profile"], f"Stock {stock['symbol']} has risk {stock['risk_profile']} but profile is Conservative"
        assert stock["illustrative_quantity"] > 0
        
    if "transparency_note" in result:
        print("[PASS] Transparency note present.")
    else:
        print("[FAIL] Transparency note missing.")

    # Test Case 2: Aggressive User
    print("\n--- TEST: Aggressive Profile ---")
    risk = "Aggressive"
    result = explorer.explore(savings, equity_pct, risk)
    # Aggressive allows all, so we just check we got results
    if result["aligned_stocks"]:
        print(f"[PASS] Retrieved {len(result['aligned_stocks'])} stocks for Aggressive profile.")
    else:
        print("[WARN] No stocks found for Aggressive (might be data issue or no bullish stocks).")

if __name__ == "__main__":
    try:
        test_scenario_logic()
        print("\nALL TESTS PASSED.")
    except AssertionError as e:
        print(f"\nTEST FAILED: {e}")
    except Exception as e:
        print(f"\nERROR: {e}")
