"use client";
import { useState, useEffect } from 'react';
import { useLocation } from '@/hooks/useLocation.ts';
import { SOSButton } from '@/components/SOSButton.tsx';

export default function Home() {
  const { location } = useLocation();
  const [weather, setWeather] = useState<any>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 1. Weather Fetch aur AI Analysis Logic
  const getUpdate = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      // Weather API Call (Replace YOUR_API_KEY with OpenWeatherMap Key)
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=YOUR_API_KEY&units=metric`);
      const data = await res.json();
      setWeather(data);

      // Offline mode ke liye data save karna 
      localStorage.setItem('last_weather', JSON.stringify(data));

      // 2. Groq AI se Risk Analyze karwana [cite: 4, 8]
      const aiRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weatherData: data }),
      });
      const aiData = await aiRes.json();
      
      if (aiData.isAlert) {
        setAlertMessage(aiData.analysis); // Disaster Alert SMS/Notification flow [cite: 4, 6]
      }
    } catch (err) {
      console.log("Internet issue, loading offline data...");
      const saved = localStorage.getItem('last_weather');
      if (saved) setWeather(JSON.parse(saved)); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location) {
      getUpdate(location.lat, location.lon); 
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">Disaster Guard AI</h1>

      {/* Weather Display [cite: 3] */}
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
        {loading ? (
          <p className="animate-pulse">Fetching live data...</p>
        ) : weather ? (
          <div className="text-center">
            <h2 className="text-xl font-semibold">📍 {weather.name}</h2>
            <p className="text-5xl font-bold my-4">{Math.round(weather.main.temp)}°C</p>
            <div className="flex justify-around text-gray-600">
              <span>💧 {weather.main.humidity}%</span>
              <span>💨 {weather.wind.speed} km/h</span>
            </div>
          </div>
        ) : (
          <p>Please allow GPS location to start </p>
        )}
      </div>

      {/* Disaster Alert Box [cite: 4, 6] */}
      {alertMessage && (
        <div className="w-full max-w-md bg-red-100 border-l-4 border-red-500 p-4 rounded shadow">
          <p className="text-red-700 font-bold">⚠️ DISASTER ALERT:</p>
          <p className="text-red-600">{alertMessage}</p>
        </div>
      )}

      {/* SOS Section  */}
      <div className="fixed bottom-10">
        <SOSButton location={location} />
      </div>
    </div>
  );
}