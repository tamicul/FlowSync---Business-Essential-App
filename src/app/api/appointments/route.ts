import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic';

const mockAppointments = [
  { id: "1", clientName: "Sarah Johnson", serviceName: "Consultation", status: "PENDING", requestedDate: new Date().toISOString() },
  { id: "2", clientName: "Mike Chen", serviceName: "Strategy Session", status: "CONFIRMED", requestedDate: new Date().toISOString() },
];

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(mockAppointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(mockAppointments);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    const newAppointment = {
      id: Date.now().toString(),
      ...body,
      userId,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    
    return NextResponse.json(newAppointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    return NextResponse.json({ ...body, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}