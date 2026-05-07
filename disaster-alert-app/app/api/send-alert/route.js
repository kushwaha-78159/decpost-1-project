cat > app/api/send-alert/route.js << 'EOF'
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { risk, location, weather } = body;
    
    console.log("🚨 DISASTER ALERT TRIGGERED:", {
      risk: risk.type,
      severity: risk.severity,
      message: risk.message,
      location,
      weather,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json({ success: true, message: "Alert sent" });
  } catch (error) {
    console.error("Error sending alert:", error);
    return NextResponse.json(
      { error: "Failed to send alert" },
      { status: 500 }
    );
  }
}
EOF