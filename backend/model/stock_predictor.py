from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/predict": {"origins": "http://localhost:3000"}})

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    print("📥 Received data:", data)

    open_val = data.get('Open', 0)
    high_val = data.get('High', 0)
    low_val = data.get('Low', 0)
    volume_val = data.get('Volume', 0)

    # 📊 More realistic dummy logic:
    # Factor in Open, trend between High/Low, and a tiny volume signal
    avg_price = (open_val + high_val + low_val) / 3
    volatility = high_val - low_val
    trend_signal = (high_val + low_val) / 2 - open_val
    volume_boost = volume_val * 0.01  # Small impact from volume

    predicted_price = round(avg_price + (trend_signal * 0.2) + volume_boost, 2)

    # 📈 Simulated future predictions (gradual trend)
    future_predictions = [
        round(predicted_price * (1 + 0.015 * i), 2) for i in range(1, 4)
    ]

    return jsonify({
        'predicted_price': predicted_price,
        'future_predictions': future_predictions
    })

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
