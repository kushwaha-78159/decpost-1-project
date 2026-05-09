"use client";
import { useState } from "react";

export const SOSButton = ({ location, onTriggered }: { location: any; onTriggered?: () => void }) => {
  const [pressed, setPressed] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const triggerSOS = () => {
    if (!location) {
      alert("Location not detected yet! Please allow GPS access.");
      return;
    }
    if (pressed) return;

    let count = 3;
    setCountdown(count);

    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        setCountdown(null);
        setPressed(true);
        const message = `EMERGENCY! I need help. My location: https://www.google.com/maps?q=${location.lat},${location.lon}`;
        console.log("SOS:", message);
        onTriggered?.();
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>

      {/* Pulse rings */}
      {(pressed || countdown !== null) && (
        <>
          <div style={{ position: "absolute", width: 100, height: 100, borderRadius: "50%", border: "2px solid rgba(255,60,40,0.4)", animation: "pulseRing 1.5s ease-out infinite" }} />
          <div style={{ position: "absolute", width: 100, height: 100, borderRadius: "50%", border: "2px solid rgba(255,60,40,0.2)", animation: "pulseRing 1.5s 0.5s ease-out infinite" }} />
        </>
      )}

      <button
        onClick={triggerSOS}
        style={{
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: pressed
            ? "linear-gradient(135deg, #ff6044, #ff3c28)"
            : "linear-gradient(135deg, #cc2010, #ff3c28)",
          border: "3px solid rgba(255,255,255,0.15)",
          color: "#fff",
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 26,
          letterSpacing: 3,
          cursor: pressed ? "default" : "pointer",
          transition: "transform 0.1s, box-shadow 0.2s",
          boxShadow: pressed
            ? "0 0 0 6px rgba(255,60,40,0.3), 0 0 30px rgba(255,60,40,0.5)"
            : "0 0 0 0 rgba(255,60,40,0), 0 8px 24px rgba(0,0,0,0.5)",
          animation: pressed ? "sosPulse 1.5s ease-in-out infinite" : "none",
          outline: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 10,
        }}
        onMouseDown={e => { if (!pressed) (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.93)"; }}
        onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
      >
        {countdown !== null ? (
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 700 }}>{countdown}</span>
        ) : (
          "SOS"
        )}
      </button>

      <div style={{
        position: "absolute",
        bottom: -28,
        left: "50%",
        transform: "translateX(-50%)",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9,
        letterSpacing: 2,
        color: pressed ? "var(--red-core)" : "rgba(255,255,255,0.3)",
        whiteSpace: "nowrap",
        transition: "color 0.3s"
      }}>
        {pressed ? "TRANSMITTED" : "HOLD TO SEND"}
      </div>
    </div>
  );
};
