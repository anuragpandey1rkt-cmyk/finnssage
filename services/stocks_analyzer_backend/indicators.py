import pandas as pd
import numpy as np

def calculate_ema(data: pd.DataFrame, window: int) -> pd.Series:
    """Calculates Exponential Moving Average."""
    return data['Close'].ewm(span=window, adjust=False).mean()

def calculate_rsi(data: pd.DataFrame, window: int = 14) -> pd.Series:
    """Calculates Relative Strength Index."""
    delta = data['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()

    # Avoid division by zero
    rs = gain / loss.replace(0, np.nan)
    rsi = 100 - (100 / (1 + rs))
    
    # Fill NaN at the beginning with 50 (neutral) or drop. 
    # Better to fill with 50 to avoid breaking downstream logic if history is short, but safe practice is to leave NaN.
    return rsi.fillna(50) 

def calculate_atr(data: pd.DataFrame, window: int = 14) -> pd.Series:
    """Calculates Average True Range."""
    high = data['High']
    low = data['Low']
    close = data['Close']
    
    tr1 = high - low
    tr2 = abs(high - close.shift())
    tr3 = abs(low - close.shift())
    
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.rolling(window=window).mean()
    
    return atr
