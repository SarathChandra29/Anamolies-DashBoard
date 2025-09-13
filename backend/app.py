from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from flask_cors import CORS
import os

# ====================
# CONFIG
# ====================
BACKEND_DIR = Path(r"D:/Codes/pennyfy/backend")
MODEL_PATH = BACKEND_DIR / "pulseguard_model.pkl"
DATE_COL = "Transaction Date"
AMOUNT_COL = "Total Spent"
CAT_COL = "Category"

# Load model
iso = joblib.load(MODEL_PATH)

# Flask App
app = Flask(__name__)
CORS(app)

# -------------------
# Preprocessing
# -------------------
def preprocess(df):
    df[DATE_COL] = pd.to_datetime(df[DATE_COL], errors="coerce")
    df = df.dropna(subset=[DATE_COL, AMOUNT_COL])
    df = df[df[AMOUNT_COL] > 0].copy()
    df["DayOfWeek"] = df[DATE_COL].dt.dayofweek
    df["Month"] = df[DATE_COL].dt.month
    df["log_amount"] = np.log1p(df[AMOUNT_COL])
    df["is_weekend"] = df["DayOfWeek"].isin([5, 6]).astype(int)
    X = df[["log_amount", "is_weekend", "DayOfWeek", "Month"]]
    return df, X

# -------------------
# Routes
# -------------------
@app.route("/")
def home():
    return jsonify({"message": "PulseGuard API is running 🚀"})

@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "Upload a CSV with 'file' field"}), 400
    file = request.files["file"]
    df = pd.read_csv(file)
    df, X = preprocess(df)
    df["anomaly_score"] = iso.decision_function(X)
    df["is_anomaly"] = (iso.predict(X) == -1).astype(int)
    anomalies = df[df["is_anomaly"] == 1]
    return jsonify({
        "total_transactions": len(df),
        "anomalies_found": len(anomalies),
        "anomalies": anomalies.head(20).to_dict(orient="records")
    })

# ====================
# START SERVER
# ====================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
