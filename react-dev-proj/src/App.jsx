import { useState } from 'react';

function App() {

  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);

  const fetchWeatherData = async () => {
    try {
      const response = await fetch('http://localhost:5153/weatherforecast');
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Failed to fetch weather data. Please try again later.');
    }
  }


  return (
    <div className="App">
      <h1>Hello, React!</h1>
      <p>Getting Weather Information...</p>
      <button onClick={fetchWeatherData}>Fetch Weather Data</button>
      {error && <p className="error">{error}</p>}
      {weatherData && (
        <ul>
          {weatherData.map((item, index) => (
            <li key={index}>
              Date: {item.date}, Temperature (C): {item.temperatureC}, Summary: {item.summary}, Temperature (F): {item.temperatureF}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;