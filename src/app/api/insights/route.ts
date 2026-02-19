import { NextRequest, NextResponse } from "next/server";

// Simple placeholder route - no database dependency for build
export async function GET() {
  return NextResponse.json({ 
    message: "FlowSync API - AI Insights endpoint",
    status: "ok",
    insights: [
      { type: "tip", message: "Your peak focus time is 9-11 AM" },
      { type: "warning", message: "You have 3 back-to-back meetings today" }
    ]
  });
}