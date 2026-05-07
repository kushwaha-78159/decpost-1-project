cat > app/api/send-sos/route.js << 'EOF'
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { location, timestamp } = body;
    
    const mapsLink = `https://maps.google.com/?q=${location.lat},${location.lng}`;
    
    console.log("🆘 SOS ALERT TRIGGERED:", {
      location,
      timestamp,
      googleMapsLink: mapsLink,
    });
    
    return NextResponse.json({ 
      success: true, 
      message: "SOS sent",
      mapsLink: mapsLink
    });
  } catch (error) {
    console.error("Error sending SOS:", error);
    return NextResponse.json(
      { error: "Failed to send SOS" },
      { status: 500 }
    );
  }
}
EOF