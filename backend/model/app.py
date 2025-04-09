from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow requests from React (localhost:3000)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    # Dummy prediction logic or your ML model logic
    predicted_price = (data['Open'] + data['High'] + data['Low']) / 3
    return jsonify({"predicted_price": predicted_price})

if __name__ == '__main__':
    app.run(debug=True, port=8000)
