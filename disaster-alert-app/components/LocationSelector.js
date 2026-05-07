cat > components/LocationSelector.js << 'EOF'
"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function LocationSelector({ onGetLocation, onManualLocation, loading }) {
  const [showManual, setShowManual] = useState(false);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      toast.error("Please enter valid coordinates");
      return;
    }
    
    onManualLocation(latitude, longitude);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      <div className="mb-6">
        <div className="text-6xl mb-4">📍</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Enable Location Access
        </h2>
        <p className="text-gray-600">
          Allow location access to get real-time weather updates and disaster alerts
        </p>
      </div>

      <button
        onClick={onGetLocation}
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 mb-4"
      >
        {loading ? "Detecting location..." : "📍 Use My Current Location"}
      </button>

      <button
        onClick={() => setShowManual(!showManual)}
        className="text-blue-500 hover:text-blue-600 text-sm"
      >
        {showManual ? "Hide" : "Enter location manually"}
      </button>

      {showManual && (
        <form onSubmit={handleManualSubmit} className="mt-4 space-y-3">
          <input
            type="number"
            step="any"
            placeholder="Latitude (e.g., 28.6139)"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            step="any"
            placeholder="Longitude (e.g., 77.2090)"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Set Location
          </button>
        </form>
      )}
    </div>
  );
}
EOF