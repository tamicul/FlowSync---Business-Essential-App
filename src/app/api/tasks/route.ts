import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const dueBefore = searchParams.get("dueBefore");

    const where: any = { userId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (dueBefore) where.dueDate = { lte: new Date(dueBefore) };

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { priority: "desc" },
        { dueDate: "asc" },
      ],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      priority,
      estimatedMinutes,
      energyRequired,
      dueDate,
      category,
      tags,
    } = body;

    const task = await prisma.task.create({
      data: {
        userId,
        title,
        description,
        priority: priority || "MEDIUM",
        estimatedMinutes,
        energyRequired,
        dueDate: dueDate ? new Date(dueDate) : null,
        category,
        tags: tags || [],
        status: "TODO",
      },
    });

    return NextResponse.json(task);
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

    if (updates.status === "DONE") {
      updates.completedAt = new Date();
    }

    const task = await prisma.task.update({
      where: { id, userId },
      data: {
        ...updates,
        dueDate: updates.dueDate ? new Date(updates.dueDate) : undefined,
      },
    });

    return NextResponse.json(task);
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

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    await prisma.task.delete({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}