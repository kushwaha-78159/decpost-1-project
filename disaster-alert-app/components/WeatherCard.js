cat > components/WeatherCard.js << 'EOF'
"use client";

export default function WeatherCard({ weather, location, offlineMode }) {
  const getWeatherIcon = (condition) => {
    const cond = condition.toLowerCase();
    if (cond.includes("rain")) return "🌧️";
    if (cond.includes("cloud")) return "☁️";
    if (cond.includes("sun") || cond.includes("clear")) return "☀️";
    if (cond.includes("storm")) return "⛈️";
    return "🌡️";
  };

  const getWeatherColor = (temp) => {
    if (temp > 40) return "from-red-500 to-orange-500";
    if (temp > 30) return "from-orange-500 to-yellow-500";
    if (temp > 20) return "from-green-500 to-blue-500";
    if (temp > 10) return "from-blue-500 to-cyan-500";
    return "from-cyan-500 to-blue-700";
  };

  return (
    <div className={`bg-gradient-to-r ${getWeatherColor(weather.temperature)} rounded-xl shadow-lg p-6 text-white`}>
      {offlineMode && (
        <div className="text-xs text-yellow-200 mb-2">⚠️ Offline Mode - Cached Data</div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Current Weather</h2>
          {location && (
            <p className="text-sm opacity-90">
              📍 Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
            </p>
          )}
        </div>
        <div className="text-5xl">{getWeatherIcon(weather.condition)}</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white bg-opacity-20 rounded-lg p-3">
          <div className="text-3xl font-bold">{weather.temperature}°C</div>
          <div className="text-sm opacity-90">Temperature</div>
        </div>
        
        <div className="bg-white bg-opacity-20 rounded-lg p-3">
          <div className="text-3xl font-bold">{weather.humidity}%</div>
          <div className="text-sm opacity-90">Humidity</div>
        </div>
        
        <div className="bg-white bg-opacity-20 rounded-lg p-3">
          <div className="text-3xl font-bold">{weather.windSpeed} km/h</div>
          <div className="text-sm opacity-90">Wind Speed</div>
        </div>
        
        <div className="bg-white bg-opacity-20 rounded-lg p-3">
          <div className="text-xl font-bold capitalize">{weather.condition}</div>
          <div className="text-sm opacity-90">Conditions</div>
        </div>
      </div>

      <div className="mt-4 text-center text-sm opacity-75">
        Last updated: {new Date(weather.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
EOF