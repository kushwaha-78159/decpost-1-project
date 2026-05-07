cat > app/page.js << 'EOF'
"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import WeatherCard from "@/components/WeatherCard";
import SOSButton from "@/components/SOSButton";
import EmergencyContacts from "@/components/EmergencyContacts";
import LocationSelector from "@/components/LocationSelector";

export default function Home() {
  const [location, setLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [disasterRisk, setDisasterRisk] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    const savedWeather = localStorage.getItem("lastWeatherData");
    if (savedWeather) {
      setWeatherData(JSON.parse(savedWeather));
    }
  }, []);

  useEffect(() => {
    if (!weatherData) return;

    const checkDisasterRisk = () => {
      const risk = analyzeDisasterRisk(weatherData, location);
      setDisasterRisk(risk);
      
      if (risk.type !== "none" && risk.severity === "high") {
        toast.error(`⚠️ ${risk.message}`, {
          duration: 10000,
          icon: "🚨",
        });
        sendAlertToBackend(risk);
      } else if (risk.type !== "none") {
        toast.warning(`⚠️ ${risk.message}`, {
          duration: 5000,
        });
      }
    };

    checkDisasterRisk();
    const interval = setInterval(checkDisasterRisk, 300000);

    return () => clearInterval(interval);
  }, [weatherData, location]);

  const analyzeDisasterRisk = (weather, loc) => {
    if (weather.humidity > 85 && weather.temperature > 20) {
      return {
        type: "flood",
        severity: weather.humidity > 90 ? "high" : "medium",
        message: "High flood risk detected! Please move to higher ground immediately!"
      };
    }
    
    if (weather.windSpeed > 50) {
      return {
        type: "cyclone",
        severity: weather.windSpeed > 70 ? "high" : "medium",
        message: "Cyclone alert! Strong winds expected. Stay indoors!"
      };
    }
    
    if (weather.temperature > 40) {
      return {
        type: "heatwave",
        severity: weather.temperature > 45 ? "high" : "medium",
        message: "Heat wave warning! Stay hydrated and avoid direct sunlight!"
      };
    }
    
    return {
      type: "none",
      severity: "low",
      message: "No immediate risks detected"
    };
  };

  const sendAlertToBackend = async (risk) => {
    try {
      const response = await fetch("/api/send-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          risk,
          location,
          weather: weatherData,
        }),
      });
      
      if (response.ok) {
        console.log("Alert sent successfully");
      }
    } catch (error) {
      console.error("Failed to send alert:", error);
    }
  };

  const getLocation = () => {
    setLoading(true);
    
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        setPermissionGranted(true);
        await fetchWeatherData(latitude, longitude);
        toast.success("Location detected successfully!");
        setLoading(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Unable to get location. Please enter manually.");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const fetchWeatherData = async (lat, lng) => {
    try {
      setOfflineMode(false);
      const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY || "YOUR_API_KEY";
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
      );
      
      if (response.ok) {
        const data = await response.json();
        const weather = {
          temperature: Math.round(data.main.temp),
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          condition: data.weather[0].description,
          timestamp: Date.now(),
        };
        
        setWeatherData(weather);
        localStorage.setItem("lastWeatherData", JSON.stringify(weather));
        localStorage.setItem("lastLocation", JSON.stringify({ lat, lng }));
        toast.success("Weather data updated!");
      } else {
        throw new Error("Failed to fetch weather");
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
      const cachedWeather = localStorage.getItem("lastWeatherData");
      if (cachedWeather) {
        setWeatherData(JSON.parse(cachedWeather));
        setOfflineMode(true);
        toast.error("No internet connection. Showing cached data.", {
          duration: 3000,
        });
      } else {
        toast.error("Failed to fetch weather data");
      }
    }
  };

  const handleManualLocation = (lat, lng) => {
    setLocation({ lat, lng });
    setPermissionGranted(true);
    fetchWeatherData(lat, lng);
    toast.success("Location set manually!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🌍 Disaster Alert System
          </h1>
          <p className="text-gray-600">
            Real-time weather monitoring and disaster alerts
          </p>
          {offlineMode && (
            <div className="mt-2 inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
              📡 Offline Mode - Showing cached data
            </div>
          )}
        </header>

        {!permissionGranted ? (
          <div className="max-w-md mx-auto">
            <LocationSelector
              onGetLocation={getLocation}
              onManualLocation={handleManualLocation}
              loading={loading}
            />
          </div>
        ) : (
          <>
            {weatherData && (
              <WeatherCard weather={weatherData} location={location} offlineMode={offlineMode} />
            )}
            
            {disasterRisk && disasterRisk.type !== "none" && (
              <div className={`mt-6 p-4 rounded-lg ${
                disasterRisk.severity === "high" 
                  ? "bg-red-100 border-2 border-red-500 animate-pulse" 
                  : "bg-orange-100 border border-orange-500"
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🚨</span>
                  <div>
                    <h3 className="font-bold text-lg text-red-800">
                      {disasterRisk.type.toUpperCase()} ALERT!
                    </h3>
                    <p className="text-red-700">{disasterRisk.message}</p>
                    <p className="text-sm text-red-600 mt-1">
                      Severity: {disasterRisk.severity.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <SOSButton location={location} />
              <EmergencyContacts />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
EOF