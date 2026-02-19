import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic';

const mockEvents = [
  { id: "1", title: "Team Standup", startTime: new Date().toISOString(), endTime: new Date().toISOString(), type: "MEETING" },
  { id: "2", title: "Focus Time", startTime: new Date().toISOString(), endTime: new Date().toISOString(), type: "FOCUS_TIME" },
];

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(mockEvents);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(mockEvents);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    const newEvent = {
      id: Date.now().toString(),
      ...body,
      userId,
      createdAt: new Date().toISOString(),
    };
    
    return NextResponse.json(newEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
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
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}