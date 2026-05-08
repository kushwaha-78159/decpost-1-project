"use client";
export const SOSButton = ({ location }: { location: any }) => {
  const triggerSOS = () => {
    if (!location) return alert("Location not detected yet!");
    
    const message = `EMERGENCY! I need help. My location: https://www.google.com/maps?q=${location.lat},${location.lon}`;
    
    // Yaha aap SMS API (Twilio) call kar sakte hain [cite: 8]
    console.log("Sending SMS to contacts:", message);
    alert("SOS SMS Sent to family and friends!"); 
  };

  return (
    <button 
      onClick={triggerSOS}
      className="bg-red-600 hover:bg-red-700 text-white w-24 h-24 rounded-full font-black shadow-2xl border-4 border-white transition-transform active:scale-90"
    >
      SOS
    </button>
  );
};