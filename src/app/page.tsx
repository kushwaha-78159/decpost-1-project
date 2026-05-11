"use client";
import { useState, useEffect } from 'react';

export default function Home() {
  const [location, setLocation] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [showHourly, setShowHourly] = useState(false);
  const [userPhone, setUserPhone] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // Number maangne ke liye popup
  const [riskDetails, setRiskDetails] = useState("Scanning global safety data...");

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lon: longitude });
        
        try {
          const apiKey = process.env.NEXT_PUBLIC_WEATHER_KEY;
          const [currRes, foreRes, geoRes] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`),
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          ]);

          const currData = await currRes.json();
          const foreData = await foreRes.json();
          const geoData = await geoRes.json();

          setWeather(currData);
          setForecast(foreData.list.slice(0, 8));
          setLocation((prev: any) => ({ ...prev, address: geoData.display_name }));

          if (currData.wind.speed > 35) {
            setRiskDetails("🚨 CRITICAL: High wind/Storm risk detected in your zone.");
          } else {
            setRiskDetails("✅ Global Status: No immediate disaster threats detected.");
          }
        } catch (e) { console.error(e); }
      });
    }
  }, []);

  const handleFinalBroadcast = () => {
    if (userPhone.length < 10) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }
    // Simulation: Messaging all users in the area
    alert(`📡 MASS BROADCAST INITIATED!\n\nUser: ${userPhone}\nLocation: ${location?.address}\nStatus: ${riskDetails}\n\nAlert sent to all active devices in the vicinity.`);
    setIsModalOpen(false);
  };

  return (
    <div style={{ backgroundColor: '#020617', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', padding: '20px' }}>
      
      {/* 1. RISK ANALYSIS HEADER */}
      <div style={{ background: '#0f172a', padding: '20px', borderRadius: '24px', border: '1px solid #1e293b', marginBottom: '30px', textAlign: 'center' }}>
        <p style={{ color: '#3b82f6', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>AI PROTECTION STATUS</p>
        <p style={{ margin: '10px 0 0', fontSize: '0.95rem' }}>{riskDetails}</p>
      </div>

      <div style={{ maxWidth: '450px', margin: '0 auto' }}>
        {/* 2. WEATHER DASHBOARD */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ color: '#94a3b8' }}>📍 {location?.address?.split(',')[0] || "Locating..."}</p>
          <h1 style={{ fontSize: '6rem', margin: '10px 0', fontWeight: '900', letterSpacing: '-5px' }}>
            {weather ? Math.round(weather.main.temp) : '--'}°
          </h1>
          <p style={{ color: '#60a5fa', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '2px' }}>{weather?.weather[0].main}</p>
        </div>

        {/* 3. BROADCAST BUTTON */}
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{
            width: '100%', padding: '25px', borderRadius: '20px',
            background: 'linear-gradient(to right, #dc2626, #991b1b)',
            color: 'white', fontSize: '1.2rem', fontWeight: 'bold', border: 'none', cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(220, 38, 38, 0.4)'
          }}
        >
          BROADCAST EMERGENCY SOS
        </button>

        {/* 4. HOURLY FORECAST CLICKABLE */}
        <div style={{ marginTop: '30px' }}>
          <div onClick={() => setShowHourly(!showHourly)} style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', color: '#64748b', fontSize: '0.9rem' }}>
            <span>Next 24 Hours</span>
            <span>{showHourly ? '▲' : '▼'}</span>
          </div>
          {showHourly && (
            <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', marginTop: '15px', paddingBottom: '10px' }}>
              {forecast.map((item, i) => (
                <div key={i} style={{ minWidth: '85px', background: '#0f172a', padding: '15px', borderRadius: '20px', textAlign: 'center', border: '1px solid #1e293b' }}>
                  <p style={{ fontSize: '0.7rem', color: '#64748b' }}>{new Date(item.dt * 1000).getHours()}:00</p>
                  <p style={{ fontWeight: 'bold' }}>{Math.round(item.main.temp)}°</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. SOS NUMBER MODAL (The Popup) */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', width: '100%', maxWidth: '400px', padding: '30px', borderRadius: '30px', border: '1px solid #334155' }}>
            <h2 style={{ margin: '0 0 10px 0' }}>Activate SOS</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>Enter your phone number to broadcast your location to all users in this area.</p>
            
            <input 
              autoFocus
              type="tel" 
              placeholder="Enter Phone Number"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #334155', background: '#0f172a', color: 'white', fontSize: '1.1rem', marginBottom: '20px' }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '15px', background: '#334155', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleFinalBroadcast} style={{ flex: 2, padding: '15px', background: '#ef4444', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Broadcast Now</button>
            </div>
          </div>
        </div>
      )}

      <footer style={{ marginTop: '50px', textAlign: 'center', fontSize: '0.7rem', color: '#334155' }}>
        📍 TRACKING: {location?.address || "Detecting address..."}
      </footer>
    </div>
  );
}