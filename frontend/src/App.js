import React, { useState } from 'react';
import './App.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

function App() {
  const [stockName, setStockName] = useState('');
  const [open, setOpen] = useState('');
  const [high, setHigh] = useState('');
  const [low, setLow] = useState('');
  const [volume, setVolume] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [futurePredictions, setFuturePredictions] = useState([]);
  const [recommendation, setRecommendation] = useState('');
  const [volatilityLevel, setVolatilityLevel] = useState('');
  const [trend, setTrend] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // 🌙 Dark mode toggle

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRecommendation('');
    setVolatilityLevel('');
    setTrend('');

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: stockName || 'Unnamed Stock',
          Open: parseFloat(open),
          High: parseFloat(high),
          Low: parseFloat(low),
          Volume: parseFloat(volume),
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch prediction');

      const data = await response.json();
      const predicted = data.predicted_price;
      const future = data.future_predictions;

      setPrediction(predicted);
      setFuturePredictions(future || []);

      const openVal = parseFloat(open);
      const highVal = parseFloat(high);
      const lowVal = parseFloat(low);
      const margin = (highVal - lowVal) * 0.05;
      const threshold = highVal + margin;

      if (predicted < openVal) setRecommendation('🔴 Risky! Not recommended to buy now.');
      else if (predicted > threshold) setRecommendation('🟢 Looks good! Consider buying.');
      else setRecommendation('🟡 Hold on. Market might be volatile.');

      const volatilityPercent = ((highVal - lowVal) / lowVal) * 100;
      if (volatilityPercent <= 2) setVolatilityLevel('🟢 Low Volatility');
      else if (volatilityPercent <= 5) setVolatilityLevel('🟡 Medium Volatility');
      else setVolatilityLevel('🔴 High Volatility');

      const changePercent = ((predicted - openVal) / openVal) * 100;
      if (changePercent > 2) setTrend('📈 Bullish Trend');
      else if (changePercent < -2) setTrend('📉 Bearish Trend');
      else setTrend('🔁 Sideways Trend');
    } catch (err) {
      console.error('❌ Error:', err);
      alert('Prediction failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const createGoogleCalendarEvent = () => {
    const title = `Stock Alert: ${stockName || 'Unnamed Stock'} looks good! 📈`;
    const description = `Predicted Price: ₹${prediction?.toFixed(2)}\nRecommendation: ${recommendation}\nTrend: ${trend}`;
    const location = 'Stock Predictor App';
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    const formatDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatDate(startTime)}/${formatDate(endTime)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}&sf=true&output=xml`;
    window.open(calendarUrl, '_blank');
  };

  const chartLabels = ['Open', 'High', 'Low', 'Volume', 'Predicted', ...futurePredictions.map((_, index) => `Day ${index + 1}`)];
  const chartData = [parseFloat(open), parseFloat(high), parseFloat(low), parseFloat(volume), prediction, ...futurePredictions];
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
     <nav className="navbar">
     <img src="/image.png" alt="Logo" className="navbar-logo" />
     {/* <h1 className="navbar-title">StockWayy</h1> */}
  <div className="dropdown">
    <button className="dropdown-toggle" onClick={() => setMenuOpen(!menuOpen)}>
      ☰ Menu
    </button>

    {menuOpen && (
      <div className="dropdown-menu">
        <button className="toggle-dark" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
        <a href="https://github.com/kushfs" target="_blank" rel="noopener noreferrer">
          🔗 About
        </a>
      </div>
    )}
  </div>
</nav>


      <div className="container">
        <form className="card" onSubmit={handleSubmit}>
          <h3>Enter Stock Details</h3>
          <input type="text" placeholder="Stock Name (optional)" value={stockName} onChange={(e) => setStockName(e.target.value)} />
          <input type="number" placeholder="Open" value={open} onChange={(e) => setOpen(e.target.value)} required />
          <input type="number" placeholder="High" value={high} onChange={(e) => setHigh(e.target.value)} required />
          <input type="number" placeholder="Low" value={low} onChange={(e) => setLow(e.target.value)} required />
          <input type="number" placeholder="Volume" value={volume} onChange={(e) => setVolume(e.target.value)} required />
          <button type="submit" disabled={loading}>{loading ? '⏳ Predicting...' : '🔮 Predict'}</button>
        </form>

        {prediction !== null && (
          <div className="result">
            <h3>🧠 Predicted Price</h3>
            <p>₹ {prediction.toFixed(2)}</p>

            {recommendation && <div className="recommendation-box"><p>{recommendation}</p></div>}
            {volatilityLevel && <div className="volatility-box"><h4>🌡️ Volatility</h4><p>{volatilityLevel}</p></div>}
            {trend && <div className="trend-box"><h4>📊 Market Trend</h4><p>{trend}</p></div>}

            {recommendation.includes('Looks good') && (
              <button className="calendar-button" onClick={createGoogleCalendarEvent}>
                📅 Set Reminder on Google Calendar
              </button>
            )}
          </div>
        )}

        {prediction !== null && (
          <div className="chart-container">
            <Line
              data={{
                labels: chartLabels,
                datasets: [{
                  label: `${stockName || 'Stock'} Trend`,
                  data: chartData,
                  backgroundColor: 'rgba(75,192,192,0.4)',
                  borderColor: 'rgba(75,192,192,1)',
                  fill: true,
                  tension: 0.4,
                }],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                },
              }}
            />
          </div>
        )}
      </div>

      <footer className="footer">
  <p>Made by Kushagra Sinha<div>
  </div></p>
  <p className="footer-links">
    <a href="https://github.com/kushfs" target="_blank" rel="noopener noreferrer">GitHub</a> &nbsp;|&nbsp;
    <a href="https://www.linkedin.com/in/kushagra-sinha-9b1b47244/" target="_blank" rel="noopener noreferrer">LinkedIn</a> &nbsp;|&nbsp;
    <a href="mailto:kushagrasinha140@gmail.com">Email</a>
  </p>
  <p className="disclaimer">⚠️ This tool is for educational and informational purposes only. Predictions are not 100% accurate. Please consult a financial advisor before making investment decisions.</p>
</footer>

    </div>
  );
}

export default App;
