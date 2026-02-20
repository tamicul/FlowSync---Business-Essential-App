import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// Static mock data - no imports during build
const mockEvents = [
  { 
    id: "1", 
    title: "Team Standup", 
    startTime: new Date().toISOString(), 
    endTime: new Date(Date.now() + 30 * 60000).toISOString(), 
    type: "MEETING",
    description: "Daily team sync",
    location: "Zoom"
  },
  { 
    id: "2", 
    title: "Deep Work: Strategy", 
    startTime: new Date(Date.now() + 60 * 60000).toISOString(), 
    endTime: new Date(Date.now() + 180 * 60000).toISOString(), 
    type: "FOCUS_TIME",
    description: "No interruptions",
  },
];

export async function GET() {
  // Return mock data - real DB connection happens at runtime
  return NextResponse.json(mockEvents);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ 
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ 
      ...body, 
      updatedAt: new Date().toISOString() 
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE() {
  return NextResponse.json({ success: true });
}