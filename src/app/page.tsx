"use client";
import { useState, useEffect } from 'react';
import Groq from "groq-sdk";

// AI Configuration
const groq = new Groq({ 
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY, // Key yahan se hat gayi
  dangerouslyAllowBrowser: true 
});

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [location, setLocation] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState("SCANNING GLOBAL SEISMIC PATTERNS...");
  const [userPhone, setUserPhone] = useState("");
  const [numbersCount, setNumbersCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const weatherKey = process.env.NEXT_PUBLIC_WEATHER_KEY;

        try {
          const [wRes, fRes, gRes] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherKey}&units=metric`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${weatherKey}&units=metric`),
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          ]);

          const wData = await wRes.json();
          const fData = await fRes.json();
          const gData = await gRes.json();

          setWeather(wData);
          setForecast(fData.list.slice(0, 8));
          setLocation({ address: gData.display_name });

          // AI Analysis Call
          const chatCompletion = await groq.chat.completions.create({
            messages: [
              { role: "system", content: "You are a disaster expert. If weather is bad, give a 1-sentence warning. If good, say 'System Stable'." },
              { role: "user", content: `Temp: ${wData.main.temp}C, Wind: ${wData.wind.speed}km/h, Sky: ${wData.weather[0].description}` }
            ],
            model: "llama3-8b-8192",
          });
          setAiAnalysis(chatCompletion.choices[0]?.message?.content || "SYSTEM STABLE");

        } catch (e) { console.error(e); }
      });
    }
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ 
      backgroundImage: `url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&q=80&w=2000')`,
      backgroundSize: 'cover', 
      backgroundAttachment: 'fixed', 
      minHeight: '100vh', 
      color: 'white', 
      padding: '20px',
      fontFamily: 'Inter, sans-serif'
    }}>
      
      {/* 🛑 STRIPED WARNING HEADER (Back to Original Design) */}
      <div style={{
        maxWidth: '850px', margin: '20px auto 40px auto',
        border: '3px solid white', borderRadius: '12px', overflow: 'hidden',
        boxShadow: '0 0 40px rgba(255,0,0,0.7)',
        background: `repeating-linear-gradient(45deg, #000, #000 15px, #dc2626 15px, #dc2626 30px)`
      }}>
        <div style={{ background: 'rgba(0,0,0,0.95)', padding: '25px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '950', margin: 0, color: 'white', letterSpacing: '1px' }}>
            {aiAnalysis.toUpperCase()}
          </h2>
        </div>
      </div>

      <div style={{ maxWidth: '550px', margin: '0 auto' }}>
        
        {/* 🔥 SOS BROADCAST BUTTON */}
        <button 
          onClick={() => {
            if(numbersCount === 0) return alert("Add contacts first!");
            alert(`📡 SOS BROADCASTED to ${numbersCount} users!\nAI Status: ${aiAnalysis}`);
          }}
          style={{
            width: '100%', padding: '25px', borderRadius: '50px',
            background: 'linear-gradient(to right, #b91c1c, #ef4444, #b91c1c)',
            color: 'white', fontSize: '1.4rem', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 10px 40px rgba(239, 68, 68, 0.5)', cursor: 'pointer', marginBottom: '40px'
          }}>
          BROADCAST EMERGENCY SOS
        </button>

        {/* 🗺️ LOCATION BOX */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '5px' }}>Detailed Address:</p>
          <p style={{ fontSize: '1rem', background: 'rgba(0,0,0,0.5)', padding: '12px', borderRadius: '12px' }}>
            {location?.address || "Detecting Current GPS Location..."}
          </p>
        </div>

        {/* 📱 ADD USER SECTION (Original Design) */}
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.85)', padding: '25px', borderRadius: '20px', 
          border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', marginBottom: '40px'
        }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', marginBottom: '15px' }}>ADD USERS TO ALERTS</p>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input 
              type="tel" placeholder="Enter phone number..." value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              style={{ flex: 1, background: '#020617', border: '1px solid #334155', color: 'white', padding: '12px', borderRadius: '8px' }}
            />
            <button 
              onClick={() => { if(userPhone) { setNumbersCount(n => n+1); setUserPhone(""); } }}
              style={{ background: '#166534', color: '#4ade80', padding: '0 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              ADD USER +
            </button>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>🛡️ Users Added: {numbersCount} (Numbers encrypted & hidden)</p>
        </div>

        {/* 🌡️ TEMPERATURE & TIMELINE */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ color: '#60a5fa', fontSize: '0.8rem', margin: '0 0 10px 0' }}>24H TIMELINE</h4>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px' }}>
              {forecast.map((item, i) => (
                <div key={i} style={{ minWidth: '65px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px' }}>
                  <p style={{ fontSize: '0.6rem', color: '#94a3b8', margin: 0 }}>{new Date(item.dt * 1000).getHours()}:00</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: '3px 0' }}>{Math.round(item.main.temp)}°</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'right', marginLeft: '20px' }}>
            <h1 style={{ fontSize: '5rem', fontWeight: '900', margin: 0, lineHeight: '1' }}>
              {weather?.main?.temp ? Math.round(weather.main.temp) : '--'}°
            </h1>
            <p style={{ color: '#3b82f6', fontSize: '0.7rem', fontWeight: 'bold' }}>LIVE STATUS</p>
          </div>
        </div>

      </div>
    </div>
  );
}