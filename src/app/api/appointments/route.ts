import { NextRequest, NextResponse } from "next/server";

// Simple placeholder route - no database dependency for build
export async function GET() {
  return NextResponse.json({ 
    message: "FlowSync API - Appointments endpoint",
    status: "ok"
  });
}

export async function POST() {
  return NextResponse.json({ 
    message: "Create appointment - requires authentication"
  }, { status: 401 });
}

export async function PUT() {
  return NextResponse.json({ 
    message: "Update appointment - requires authentication"
  }, { status: 401 });
}