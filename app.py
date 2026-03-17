from flask import Flask, request, jsonify
from flask_cors import CORS
from models.weather_model import predict_weather
import time

app = Flask(__name__)
CORS(app) # Allow Node.js to communicate with Flask

# Mock AI Chatbot Logic
def generate_chat_response(user_message):
    msg = user_message.lower()
    time.sleep(1) # Simulate network delay
    
    if "hello" in msg or "hi" in msg:
        return "Hello! I am your AI Climate Assistant. You can ask me about global temperature trends, carbon emissions, or how to interpret your predictions."
    elif "temperature" in msg or "temp" in msg:
        return "Based on recent data in your dashboard, the global temperature anomaly has reached +1.34°C above pre-industrial levels. This primarily affects agricultural yields and infrastructure durability."
    elif "emission" in msg or "carbon" in msg:
        return "Global carbon emissions are heavily driven by Energy (13,500 MtCO2) and Transport (8,200 MtCO2). Reducing these is critical to stabilizing the climate."
    elif "prediction" in msg:
        return "When you enter local weather metrics, our Machine Learning model predicts the immediate atmospheric condition, allowing you to prepare localized impact mitigations."
    elif "risk" in msg or "map" in msg:
        return "The interactive map highlights high-risk zones, such as wildfire risks in California or drought warnings in Sub-Saharan Africa. Would you like me to analyze a specific region?"
    else:
        return "That is an excellent question. As a demonstration AI, my knowledge base is currently restricted to the metrics shown on your dashboard. Once connected to a live API, I will be able to answer this in detail!"

def get_insights(prediction):
    pred = str(prediction).lower()
    insights = []
    
    if "rain" in pred or "storm" in pred:
        insights.append({"category": "Agriculture", "message": "High moisture levels. Delay planting seeds to prevent rot.", "type": "warning"})
        insights.append({"category": "Infrastructure", "message": "Potential localized flooding. Check drainage systems.", "type": "warning"})
    elif "clear" in pred or "sun" in pred:
        insights.append({"category": "Agriculture", "message": "Optimal conditions for solar farming and harvesting.", "type": "success"})
        insights.append({"category": "Health", "message": "High UV Index likely. Advise sun protection.", "type": "warning"})
    elif "cloud" in pred or "overcast" in pred:
        insights.append({"category": "Energy", "message": "Solar yield may drop by 40%. Rely on grid buffers.", "type": "warning"})
    elif "snow" in pred or "ice" in pred:
        insights.append({"category": "Logistics", "message": "Supply chain delays expected due to icy roads.", "type": "error"})
    else:
        insights.append({"category": "General Analytics", "message": "Conditions are stable. Proceed with standard operational protocols.", "type": "success"})
        
    return insights

@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    humidity = float(data.get("humidity", 0))
    pressure_mb = float(data.get("pressure_mb", 0))
    wind_kph = float(data.get("wind_kph", 0))
    cloud = float(data.get("cloud", 0))
    visibility_km = float(data.get("visibility_km", 0))
    uv_index = float(data.get("uv_index", 0))

    result = predict_weather(humidity, pressure_mb, wind_kph, cloud, visibility_km, uv_index)
    insights = get_insights(result)

    return jsonify({"prediction": result, "insights": insights})

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({"error": "No message provided"}), 400
        
    user_message = data['message']
    bot_response = generate_chat_response(user_message)
    
    return jsonify({"response": bot_response})

@app.get("/health")
def health():
    return jsonify({"ok": True})

# Alias endpoint for Node backend convenience
@app.post("/predict-json")
def predict_json():
    return predict()

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    app.run(debug=True, host="0.0.0.0", port=port)
