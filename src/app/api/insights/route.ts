import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

// Generate AI insights based on user's schedule and tasks
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

    // Generate insights
    const insights = [];

    // Check for back-to-back meetings
    const meetings = events.filter((e) => e.type === "MEETING");
    for (let i = 0; i < meetings.length - 1; i++) {
      const current = meetings[i];
      const next = meetings[i + 1];
      const gap =
        new Date(next.startTime).getTime() - new Date(current.endTime).getTime();
      
      if (gap < 15 * 60 * 1000) {
        // Less than 15 minutes
        insights.push({
          type: "WARNING",
          category: "schedule",
          title: "Back-to-Back Meetings",
          message: `You have "${current.title}" followed by "${next.title}" with little break time.`,
          suggestedAction: "Add 15-min buffer",
          confidence: 0.95,
        });
      }
    }

    // Check for high-priority tasks
    const highPriorityTasks = tasks.filter((t) => t.priority === "HIGH");
    if (highPriorityTasks.length > 0) {
      insights.push({
        type: "ALERT",
        category: "tasks",
        title: `${highPriorityTasks.length} High Priority Tasks`,
        message: `You have ${highPriorityTasks.length} high priority tasks pending.`,
        suggestedAction: "Schedule focus time",
        confidence: 0.9,
      });
    }

    // Check for overdue tasks
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE"
    );
    if (overdueTasks.length > 0) {
      insights.push({
        type: "WARNING",
        category: "tasks",
        title: `${overdueTasks.length} Overdue Tasks`,
        message: `You have ${overdueTasks.length} overdue tasks that need attention.`,
        suggestedAction: "Review and reschedule",
        confidence: 0.95,
      });
    }

    // Check for pending appointments
    if (appointments.length > 0) {
      insights.push({
        type: "TIP",
        category: "appointments",
        title: `${appointments.length} Pending Booking Requests`,
        message: `You have ${appointments.length} appointment requests waiting for confirmation.`,
        suggestedAction: "Review requests",
        confidence: 0.85,
      });
    }

    // Check for meeting-heavy day
    if (meetings.length > 4) {
      insights.push({
        type: "WARNING",
        category: "wellness",
        title: "Meeting-Heavy Day",
        message: `You have ${meetings.length} meetings today. Consider blocking focus time.`,
        suggestedAction: "Block focus time",
        confidence: 0.88,
      });
    }

    // Productivity tip
    if (insights.length === 0) {
      insights.push({
        type: "TIP",
        category: "productivity",
        title: "Good Schedule Balance",
        message: "Your day looks well-balanced with time for both meetings and focus work.",
        suggestedAction: "Maintain this rhythm",
        confidence: 0.8,
      });
    }

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}