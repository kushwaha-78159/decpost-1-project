"use client";
import { useState, useEffect } from "react";
import { useLocation } from "@/hooks/useLocation";
import { SOSButton } from "@/components/SOSButton";

type WeatherData = {
  name: string;
  main: { temp: number; humidity: number; feels_like: number; pressure: number };
  wind: { speed: number };
  weather: { description: string; icon: string }[];
  visibility: number;
};

export default function Home() {
  const { location } = useLocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [riskLevel, setRiskLevel] = useState<"SAFE" | "RISK" | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [time, setTime] = useState(new Date());
  const [sosTriggered, setSosTriggered] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const getUpdate = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=YOUR_API_KEY&units=metric`
      );
      const data = await res.json();
      setWeather(data);
      localStorage.setItem("last_weather", JSON.stringify(data));
      setAiLoading(true);
      const aiRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weatherData: data }),
      });
      const aiData = await aiRes.json();
      setAiLoading(false);
      if (aiData.isAlert) {
        setAlertMessage(aiData.analysis);
        setRiskLevel("RISK");
      } else {
        setRiskLevel("SAFE");
      }
    } catch {
      const saved = localStorage.getItem("last_weather");
      if (saved) setWeather(JSON.parse(saved));
    } finally {
      setLoading(false);
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (location) getUpdate(location.lat, location.lon);
  }, [location]);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-void)", padding: "0 0 140px 0", position: "relative", overflow: "hidden" }}>

      {/* Background glow */}
      <div style={{
        position: "fixed", top: "-20%", left: "50%", transform: "translateX(-50%)",
        width: "800px", height: "500px", borderRadius: "50%",
        background: riskLevel === "RISK"
          ? "radial-gradient(ellipse, rgba(255,60,40,0.06) 0%, transparent 70%)"
          : riskLevel === "SAFE"
          ? "radial-gradient(ellipse, rgba(0,212,170,0.05) 0%, transparent 70%)"
          : "radial-gradient(ellipse, rgba(245,166,35,0.04) 0%, transparent 70%)",
        pointerEvents: "none", transition: "background 1s ease"
      }} />

      {/* HEADER */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 32px",
        borderBottom: "1px solid var(--border-dim)",
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(6,6,8,0.9)",
        backdropFilter: "blur(12px)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ position: "relative", width: 38, height: 38, flexShrink: 0 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", border: "2px solid var(--red-core)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: "1.5px solid rgba(255,60,40,0.4)" }} />
            </div>
            <div style={{ position: "absolute", top: "50%", left: "50%", width: 14, height: 2, background: "var(--red-core)", transformOrigin: "left center", animation: "radarSpin 2s linear infinite", marginTop: -1 }} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: 4, color: "var(--text-primary)", lineHeight: 1 }}>DISASTER GUARD</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--red-core)", letterSpacing: 3, marginTop: 2 }}>AI ALERT SYSTEM</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 600, color: "var(--text-primary)", letterSpacing: 2 }}>{formatTime(time)}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-secondary)", letterSpacing: 1, marginTop: 2 }}>{formatDate(time)}</div>
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "28px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* GPS STATUS BAR */}
        <div className="animate-fade-up" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "var(--bg-card)", borderRadius: 8, border: "1px solid var(--border-dim)" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: location ? "var(--teal-core)" : "var(--amber-core)", boxShadow: location ? "0 0 8px var(--teal-core)" : "0 0 8px var(--amber-core)", flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-secondary)", letterSpacing: 1 }}>
            {location ? `GPS LOCKED  •  ${location.lat.toFixed(4)}°N  •  ${location.lon.toFixed(4)}°E` : "AWAITING GPS SIGNAL — ALLOW LOCATION ACCESS"}
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            {["WEATHER", "AI", "SOS"].map((sys) => (
              <span key={sys} style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 1, padding: "3px 8px", borderRadius: 4, background: "rgba(0,212,170,0.08)", color: "var(--teal-core)", border: "1px solid rgba(0,212,170,0.15)" }}>{sys} ●</span>
            ))}
          </div>
        </div>

        {/* RISK BANNER */}
        {riskLevel && (
          <div className="animate-fade-up" style={{
            padding: "18px 24px", borderRadius: 10,
            border: `1px solid ${riskLevel === "RISK" ? "rgba(255,60,40,0.3)" : "rgba(0,212,170,0.2)"}`,
            background: riskLevel === "RISK" ? "rgba(255,60,40,0.07)" : "rgba(0,212,170,0.06)",
            display: "flex", alignItems: "center", gap: 16,
            animation: riskLevel === "RISK" ? "blinkAlert 2.5s ease-in-out infinite" : "none"
          }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 52, lineHeight: 1, letterSpacing: 2, color: riskLevel === "RISK" ? "var(--red-core)" : "var(--teal-core)" }}>
              {riskLevel === "RISK" ? "⚠" : "✓"}
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 3, color: riskLevel === "RISK" ? "var(--red-core)" : "var(--teal-core)" }}>
                {riskLevel === "RISK" ? "DISASTER RISK DETECTED" : "ALL CLEAR — SAFE ZONE"}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-secondary)", marginTop: 5, letterSpacing: 1 }}>
                AI ANALYSIS COMPLETE  •  {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}

        {/* ALERT DETAIL */}
        {alertMessage && (
          <div className="animate-fade-up" style={{ padding: "20px 24px", borderRadius: 10, border: "1px solid rgba(255,60,40,0.2)", background: "rgba(255,60,40,0.05)", borderLeft: "3px solid var(--red-core)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--red-hot)", letterSpacing: 2, marginBottom: 10 }}>▶ AI THREAT ANALYSIS</div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", lineHeight: 1.75 }}>{alertMessage}</p>
          </div>
        )}

        {/* WEATHER CARD */}
        <div className="animate-fade-up-delay-1" style={{ background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-dim)", overflow: "hidden" }}>
          <div style={{ padding: "13px 24px", borderBottom: "1px solid var(--border-dim)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-secondary)", letterSpacing: 2 }}>LIVE WEATHER CONDITIONS</span>
            <button onClick={() => location && getUpdate(location.lat, location.lon)} style={{ background: "transparent", border: "1px solid var(--border-dim)", borderRadius: 6, padding: "5px 14px", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-secondary)", cursor: "pointer", letterSpacing: 1, transition: "all 0.2s" }}>
              ↺ REFRESH
            </button>
          </div>
          <div style={{ padding: "28px 24px" }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", padding: "20px 0" }}>
                <div style={{ width: 20, height: 20, border: "2px solid var(--border-dim)", borderTop: "2px solid var(--red-core)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-secondary)", letterSpacing: 1 }}>FETCHING LIVE DATA...</span>
              </div>
            ) : weather ? (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: 2, marginBottom: 6 }}>LOCATION</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: 3, color: "var(--text-primary)", lineHeight: 1 }}>{weather.name?.toUpperCase()}</div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", marginTop: 6, textTransform: "capitalize" }}>{weather.weather?.[0]?.description}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 76, lineHeight: 1, letterSpacing: -2, color: weather.main.temp > 40 ? "var(--red-core)" : weather.main.temp > 30 ? "var(--amber-core)" : "var(--text-primary)" }}>
                      {Math.round(weather.main.temp)}°
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", letterSpacing: 1 }}>FEELS {Math.round(weather.main.feels_like)}°C</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                  {[
                    { label: "HUMIDITY", value: `${weather.main.humidity}%`, icon: "💧", color: "#4fa8e0" },
                    { label: "WIND", value: `${Math.round(weather.wind.speed)} km/h`, icon: "💨", color: "#8a7aee" },
                    { label: "PRESSURE", value: `${weather.main.pressure} hPa`, icon: "📊", color: "var(--teal-core)" },
                    { label: "VISIBILITY", value: weather.visibility ? `${(weather.visibility / 1000).toFixed(1)} km` : "—", icon: "👁", color: "var(--amber-core)" },
                  ].map((stat) => (
                    <div key={stat.label} style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: 8, padding: "14px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: 20, marginBottom: 8 }}>{stat.icon}</div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: stat.color, letterSpacing: 1, lineHeight: 1.2 }}>{stat.value}</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: 1, marginTop: 6 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 42, marginBottom: 12 }}>📡</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-secondary)", letterSpacing: 1 }}>WAITING FOR GPS SIGNAL</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", marginTop: 8 }}>Please allow location access in your browser</div>
              </div>
            )}
          </div>
        </div>

        {/* AI STATUS */}
        <div className="animate-fade-up-delay-2" style={{ background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-dim)", padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🤖</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: 2, marginBottom: 4 }}>GROQ AI  •  LLAMA 3 8B MODEL</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>
              {aiLoading ? "Analyzing weather patterns for disaster risk..." : riskLevel ? `Analysis complete — ${riskLevel === "RISK" ? "Threat detected" : "No threats found"}` : "Waiting for weather data to begin analysis"}
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1, padding: "6px 14px", borderRadius: 6, background: aiLoading ? "rgba(245,166,35,0.1)" : riskLevel === "RISK" ? "rgba(255,60,40,0.1)" : riskLevel === "SAFE" ? "rgba(0,212,170,0.08)" : "rgba(255,255,255,0.04)", color: aiLoading ? "var(--amber-core)" : riskLevel === "RISK" ? "var(--red-core)" : riskLevel === "SAFE" ? "var(--teal-core)" : "var(--text-muted)", border: `1px solid ${aiLoading ? "rgba(245,166,35,0.2)" : riskLevel === "RISK" ? "rgba(255,60,40,0.2)" : riskLevel === "SAFE" ? "rgba(0,212,170,0.15)" : "var(--border-dim)"}`, whiteSpace: "nowrap" }}>
            {aiLoading ? "SCANNING..." : riskLevel || "STANDBY"}
          </div>
        </div>

        {/* EMERGENCY CONTACTS */}
        <div className="animate-fade-up-delay-3" style={{ background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-dim)", overflow: "hidden" }}>
          <div style={{ padding: "13px 24px", borderBottom: "1px solid var(--border-dim)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-secondary)", letterSpacing: 2 }}>EMERGENCY CONTACTS</span>
          </div>
          <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { name: "Family", number: "+91XXXXXXXXXX", icon: "👨‍👩‍👧" },
              { name: "Friend", number: "+91XXXXXXXXXX", icon: "👤" },
              { name: "National Emergency", number: "112", icon: "🚨" },
              { name: "NDRF Helpline", number: "011-24363260", icon: "🆘" },
            ].map((c) => (
              <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--bg-surface)", borderRadius: 8, border: "1px solid var(--border-dim)" }}>
                <span style={{ fontSize: 18 }}>{c.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", fontWeight: 500 }}>{c.name}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", letterSpacing: 1 }}>{c.number}</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--teal-core)", boxShadow: "0 0 6px var(--teal-core)" }} />
              </div>
            ))}
          </div>
        </div>

        {/* FEATURE STRIPS */}
        <div className="animate-fade-up-delay-4" style={{ display: "flex", gap: 12 }}>
          {[
            { icon: "📴", label: "OFFLINE READY", desc: "Last data saved locally" },
            { icon: "📍", label: "GPS TRACKING", desc: "Real-time coordinates" },
            { icon: "📲", label: "SMS ALERT", desc: "Twilio integration ready" },
          ].map((item) => (
            <div key={item.label} style={{ flex: 1, background: "var(--bg-card)", border: "1px solid var(--border-dim)", borderRadius: 10, padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-secondary)", letterSpacing: 1, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </main>

      {/* SOS FIXED BUTTON */}
      <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 200, textAlign: "center" }}>
        {sosTriggered && (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--red-core)", letterSpacing: 2, marginBottom: 12, animation: "blinkAlert 1s ease-in-out infinite" }}>
            ▶ SOS TRANSMITTED TO ALL CONTACTS
          </div>
        )}
        <SOSButton location={location} onTriggered={() => setSosTriggered(true)} />
      </div>
    </div>
  );
}