from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
from prophet import Prophet

app = FastAPI()

class ForecastRequest(BaseModel):
    sales_history: list  # [{date: "2025-05-01", quantity: 12}, ...]

@app.post("/forecast")
def forecast(data: ForecastRequest):
    df = pd.DataFrame(data.sales_history)
    print("DataFrame:", df)
    df = df.rename(columns={"date": "ds", "quantity": "y"})
    if len(df) < 2:
        return {"forecast": []}
    m = Prophet()
    m.fit(df)
    future = m.make_future_dataframe(periods=30)
    forecast = m.predict(future)
    result = [
        {"date": row["ds"].strftime("%Y-%m-%d"), "forecast": float(row["yhat"])}
        for _, row in forecast.tail(30).iterrows()
    ]
    return {"forecast": result}

class AnomalyRequest(BaseModel):
    inventory_movements: list  # [{date: "2025-05-01", quantity: 12}, ...]

@app.post("/anomaly")
def anomaly(data: AnomalyRequest):
    df = pd.DataFrame(data.inventory_movements)
    if len(df) < 5:
        return {"anomalies": []}
    q1 = df["quantity"].quantile(0.25)
    q3 = df["quantity"].quantile(0.75)
    iqr = q3 - q1
    anomalies = df[(df["quantity"] < q1 - 1.5 * iqr) | (df["quantity"] > q3 + 1.5 * iqr)]
    return {"anomalies": anomalies.to_dict(orient="records")}
