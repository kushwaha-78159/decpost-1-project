cat > components/SOSButton.js << 'EOF'
"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function SOSButton({ location }) {
  const [sending, setSending] = useState(false);

  const handleSOS = async () => {
    if (!location) {
      toast.error("Location not available. Please enable location access first.");
      return;
    }

    setSending(true);
    
    try {
      const response = await fetch("/api/send-sos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location,
          timestamp: new Date().toISOString(),
        }),
      });
      
      if (response.ok) {
        toast.success("SOS Alert sent to your emergency contacts!");
      } else {
        throw new Error("Failed to send SOS");
      }
    } catch (error) {
      console.error("SOS error:", error);
      toast.error("Failed to send SOS. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">🚨 SOS Emergency</h3>
      <button
        onClick={handleSOS}
        disabled={sending}
        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-lg transition duration-200 disabled:opacity-50 text-lg animate-pulse"
      >
        {sending ? "Sending SOS..." : "🔴 SEND SOS ALERT"}
      </button>
      <p className="text-sm text-gray-600 mt-3 text-center">
        Press to send your current location to all emergency contacts
      </p>
    </div>
  );
}
EOF