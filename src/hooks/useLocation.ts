import { useState, useEffect } from 'react';

export const useLocation = () => {
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      }, (err) => console.log("Manual location needed", err));
    }
  }, []);

  return { location };
};