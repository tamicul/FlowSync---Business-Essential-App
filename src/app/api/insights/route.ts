import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Fetch user's data
    const [events, tasks, appointments] = await Promise.all([
      prisma.event.findMany({
        where: {
          userId,
          startTime: { gte: startOfDay, lte: endOfDay },
        },
        orderBy: { startTime: "asc" },
      }),
      prisma.task.findMany({
        where: {
          userId,
          status: { not: "DONE" },
        },
        orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
      }),
      prisma.appointment.findMany({
        where: {
          userId,
          status: "PENDING",
        },
      }),
    ]);

    // Generate AI insights
    const insights = [];

    // Check for back-to-back meetings
    const meetings = events.filter((e: any) => e.type === "MEETING");
    for (let i = 0; i < meetings.length - 1; i++) {
      const current = meetings[i];
      const next = meetings[i + 1];
      const gap = new Date(next.startTime).getTime() - new Date(current.endTime).getTime();
      
      if (gap < 15 * 60 * 1000) {
        insights.push({
          type: "WARNING",
          message: `You have "${current.title}" followed by "${next.title}" with little break time.`,
          action: "Add 15-min buffer",
        });
      }
    }

    // Check for high-priority tasks
    const highPriorityTasks = tasks.filter((t: any) => t.priority === "HIGH");
    if (highPriorityTasks.length > 0) {
      insights.push({
        type: "ALERT",
        message: `You have ${highPriorityTasks.length} high priority tasks pending.`,
        action: "Schedule focus time",
      });
    }

    // Check for overdue tasks
    const overdueTasks = tasks.filter(
      (t: any) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE"
    );
    if (overdueTasks.length > 0) {
      insights.push({
        type: "WARNING",
        message: `You have ${overdueTasks.length} overdue tasks that need attention.`,
        action: "Review and reschedule",
      });
    }

    // Check for pending appointments
    if (appointments.length > 0) {
      insights.push({
        type: "TIP",
        message: `You have ${appointments.length} appointment requests waiting for confirmation.`,
        action: "Review requests",
      });
    }

    // Check for meeting-heavy day
    if (meetings.length > 4) {
      insights.push({
        type: "WARNING",
        message: `You have ${meetings.length} meetings today. Consider blocking focus time.`,
        action: "Block focus time",
      });
    }

    // Productivity tip
    if (insights.length === 0) {
      insights.push({
        type: "TIP",
        message: "Your day looks well-balanced with time for both meetings and focus work.",
        action: "Maintain this rhythm",
      });
    }

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json([
      { type: "tip", message: "Welcome to FlowSync!", action: "Get started" }
    ]);
  }
}