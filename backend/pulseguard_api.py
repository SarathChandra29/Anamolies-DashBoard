import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
from pathlib import Path

# ===============================
# Configuration
# ===============================
OUTPUT_DIR = Path("pulseguard_outputs")
OUTPUT_DIR.mkdir(exist_ok=True)

MODEL_PATH = Path("backend/pulseguard_model.pkl")

# ===============================
# Load Dataset
# ===============================
# Your dataset should have columns: Date, description, upi_id, amount, category
df = pd.read_csv("C:/Users/koush/Downloads/spending_patterns_detailed.csv")

# Ensure proper datatypes
df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
df['amount'] = pd.to_numeric(df['amount'], errors='coerce')

# Drop missing values
df = df.dropna(subset=['Date', 'amount', 'category'])

# ===============================
# Category Growth Trends
# ===============================
category_growth = (
    df.groupby(['category', pd.Grouper(key='Date', freq='M')])['amount']
      .sum()
      .reset_index()
      .sort_values(by=['category', 'Date'])
)

category_growth.to_csv(OUTPUT_DIR / "category_growth.csv", index=False)
print("✅ Category growth trends saved to category_growth.csv")

# ===============================
# Anomaly Detection with Isolation Forest
# ===============================
# Features: amount + encoded category
df['category_encoded'] = df['category'].astype('category').cat.codes
features = df[['amount', 'category_encoded']]

iso = IsolationForest(contamination=0.05, random_state=42)
df['anomaly'] = iso.fit_predict(features)

# Save anomalies (where anomaly = -1)
anomalies = df[df['anomaly'] == -1]
anomalies.to_csv(OUTPUT_DIR / "anomalies.csv", index=False)
print("⚠️ Anomalies detected and saved to anomalies.csv")

# ===============================
# Save the trained model
# ===============================
joblib.dump(iso, MODEL_PATH)
print(f"💾 Model saved to {MODEL_PATH}")
