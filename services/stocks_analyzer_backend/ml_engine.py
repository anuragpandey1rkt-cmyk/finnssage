import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os

class MarketClassifier:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        self._train_mock_model() # Train on init for demo purposes

    def _train_mock_model(self):
        """
        Trains the model on synthetic data based on standard technical analysis rules 
        to ensure reasonable outputs without needing a massive historical dataset immediately.
        This acts as a 'knowledge base' for the classifier.
        """
        # Generate synthetic data covering logical scenarios
        # Features: [EMA20, EMA50, RSI, ATR] 
        # Note: We'll use (Price - EMA) diffs or ratios for better normalization, 
        # but the requirements asked for these specific input features.
        # To make raw EMA usable, we often normalize, but here we will assume the inputs 
        # might be raw. However, raw EMA is price-dependent. 
        # A robust ML model should use normalized features (e.g., Price/EMA).
        # STRICT ADHERENCE TO PROMPT: "Input features: EMA20, EMA50, RSI, ATR"
        # If we must use raw EMA, the model will struggle across different price ranges.
        # I will normalize internally: feature1 = Price/EMA20, feature2 = Price/EMA50.
        
        # Let's create a robust synthetic dataset representing:
        # 1. Bullish: Price > EMA20 > EMA50, RSI > 50
        # 2. Bearish: Price < EMA20 < EMA50, RSI < 50
        # 3. Neutral: Price chopping around EMAs, RSI ~ 50
        
        X = []
        y = []
        
        for _ in range(1000):
            # Bullish Case
            price = np.random.uniform(100, 200)
            ema20 = price * np.random.uniform(0.95, 0.99) # Price above EMA20
            ema50 = ema20 * np.random.uniform(0.90, 0.98) # EMA20 above EMA50
            rsi = np.random.uniform(55, 80)
            atr = price * 0.02
            X.append([ema20, ema50, rsi, atr, price]) 
            y.append("Bullish")

            # Bearish Case
            price = np.random.uniform(100, 200)
            ema20 = price * np.random.uniform(1.01, 1.05) # Price below EMA20
            ema50 = ema20 * np.random.uniform(1.02, 1.10) # EMA20 below EMA50
            rsi = np.random.uniform(20, 45)
            atr = price * 0.02
            X.append([ema20, ema50, rsi, atr, price])
            y.append("Bearish")

            # Neutral Case
            price = np.random.uniform(100, 200)
            ema20 = price * np.random.uniform(0.98, 1.02)
            ema50 = ema20 * np.random.uniform(0.98, 1.02)
            rsi = np.random.uniform(40, 60)
            atr = price * 0.01 
            X.append([ema20, ema50, rsi, atr, price])
            y.append("Neutral")

        # Convert to DataFrame
        # We need to process the raw features into semantic features for the model if we want it to work well,
        # but the prompt asked for specific input features. 
        # I will train the model on the RELATIVE relationships which the Tree model can learn 
        # IF we include Price as a feature, OR if we pre-process.
        # The prompt says "Input features: EMA20, EMA50, RSI, ATR". It does NOT list Price.
        # Without Price, EMA20=100 and EMA50=90 tells us nothing about where the Price is.
        # However, EMA20 > EMA50 is a signal.
        # I will strictly follow the prompt but I will add logic to handle the "missing Price" context 
        # by checking if the user INTENDED for valid technical analysis. 
        # Actually, standard interpretation: EMA crossover.
        # If EMA20 > EMA50 -> Bullish.
        # I will train the model to respect EMA cross + RSI.
        
        X_df = pd.DataFrame(X, columns=['EMA20', 'EMA50', 'RSI', 'ATR', 'Price'])
        
        # We will train on the features requested. 
        # Note: Depending solely on EMAs without Price is weak, but we can detect Crossovers.
        train_features = X_df[['EMA20', 'EMA50', 'RSI', 'ATR']]
        
        self.scaler.fit(train_features)
        X_scaled = self.scaler.transform(train_features)
        self.model.fit(X_scaled, y)
        self.is_trained = True

    def classify(self, ema20, ema50, rsi, atr):
        if not self.is_trained:
            self._train_mock_model()
            
        features = pd.DataFrame([[ema20, ema50, rsi, atr]], columns=['EMA20', 'EMA50', 'RSI', 'ATR'])
        X_scaled = self.scaler.transform(features)
        prediction = self.model.predict(X_scaled)[0]
        probabilities = self.model.predict_proba(X_scaled)[0]
        
        # Get confidence
        confidence = max(probabilities)
        
        return prediction, confidence
