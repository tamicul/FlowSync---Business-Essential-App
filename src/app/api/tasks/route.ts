import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic';

// Mock data for build time / when DB is not available
const mockTasks = [
  { id: "1", title: "Review Q4 Budget", status: "TODO", priority: "HIGH", userId: "mock" },
  { id: "2", title: "Client Presentation", status: "IN_PROGRESS", priority: "HIGH", userId: "mock" },
];

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return mock data for now
    return NextResponse.json(mockTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(mockTasks);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Return created task
    const newTask = {
      id: Date.now().toString(),
      ...body,
      userId,
      status: "TODO",
      createdAt: new Date().toISOString(),
    };
    
    return NextResponse.json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updates } = body;

    return NextResponse.json({ id, ...updates, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
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
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}