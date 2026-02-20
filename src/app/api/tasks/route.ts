import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const mockTasks = [
  { id: "1", title: "Review Q4 Budget", status: "TODO", priority: "HIGH", duration: 60, energyRequired: 4 },
  { id: "2", title: "Client Presentation", status: "IN_PROGRESS", priority: "HIGH", duration: 90, energyRequired: 5 },
  { id: "3", title: "Email Campaign", status: "REVIEW", priority: "MEDIUM", duration: 45, energyRequired: 3 },
  { id: "4", title: "Documentation", status: "DONE", priority: "LOW", duration: 30, energyRequired: 2 },
];

export async function GET() {
  return NextResponse.json(mockTasks);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ 
      id: Date.now().toString(),
      ...body,
      status: "TODO",
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