import { NextResponse } from "next/server";
import Groq from "groq-sdk";

// Groq client initialization
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { weatherData } = await req.json();

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a disaster prevention assistant. Analyze weather data and respond with 'RISK' or 'SAFE'. If RISK, mention the type (Flood, Cyclone, Heatwave) and a short safety instruction."
        },
        {
          role: "user",
          content: `Analyze this data: ${JSON.stringify(weatherData)}`
        }
      ],
      model: "llama3-8b-8192",
    });

    const analysis = completion.choices[0].message.content;

    // Agar LLM disaster detect karta hai toh alert message return karega [cite: 4, 8]
    return NextResponse.json({ 
      success: true, 
      analysis: analysis,
      isAlert: analysis?.includes("RISK") 
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: "AI analysis failed" }, { status: 500 });
  }
}