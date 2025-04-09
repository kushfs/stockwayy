from flask import Flask, request, jsonify
import numpy as np
import joblib
import os

app = Flask(__name__)

# Load the model
model_path = os.path.join(os.path.dirname(__file__), "stock_price_model.pkl")
model = joblib.load(model_path)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        print("📥 Received input:", data)

        features = np.array([[data['Open'], data['High'], data['Low'], data['Volume']]])
        prediction = model.predict(features)

        return jsonify({'predicted_price': float(prediction[0])})
    
    except Exception as e:
        print("❌ Error during prediction:", e)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8000)
