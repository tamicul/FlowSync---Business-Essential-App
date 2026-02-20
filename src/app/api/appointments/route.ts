import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const mockAppointments = [
  { id: "1", clientName: "Sarah Johnson", serviceName: "Consultation", status: "PENDING", requestedDate: new Date().toISOString(), duration: 30 },
  { id: "2", clientName: "Mike Chen", serviceName: "Strategy Session", status: "CONFIRMED", requestedDate: new Date(Date.now() + 86400000).toISOString(), duration: 60 },
];

export async function GET() {
  return NextResponse.json(mockAppointments);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ 
      id: Date.now().toString(),
      ...body,
      status: "PENDING",
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