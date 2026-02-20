import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const mockInsights = [
  { type: "tip", message: "Your peak focus time is 9-11 AM", action: "Schedule deep work" },
  { type: "warning", message: "You have 3 back-to-back meetings today", action: "Add buffers" },
  { type: "suggestion", message: "Leave by 1:45 PM for your 2:00 PM meeting", action: "Set reminder" },
];

export async function GET(req: NextRequest) {
  try {
    let insights = mockInsights;
    
    try {
      const { auth } = await import("@clerk/nextjs/server");
      const { prisma } = await import("@/lib/db");
      
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json(mockInsights);
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
        }),
        prisma.task.findMany({
          where: {
            userId,
            status: { not: "DONE" },
          },
        }),
        prisma.appointment.findMany({
          where: {
            userId,
            status: "PENDING",
          },
        }),
      ]);

      // Generate AI insights
      insights = [];

      // Check for back-to-back meetings
      const meetings = events.filter((e: any) => e.type === "MEETING");
      for (let i = 0; i < meetings.length - 1; i++) {
        const current = meetings[i];
        const next = meetings[i + 1];
        const gap = new Date(next.startTime).getTime() - new Date(current.endTime).getTime();
        
        if (gap < 15 * 60 * 1000) {
          insights.push({
            type: "warning",
            message: `You have "${current.title}" followed by "${next.title}" with little break time.`,
            action: "Add 15-min buffer",
          });
        }
      }

      // Check for high-priority tasks
      const highPriorityTasks = tasks.filter((t: any) => t.priority === "HIGH");
      if (highPriorityTasks.length > 0) {
        insights.push({
          type: "alert",
          message: `You have ${highPriorityTasks.length} high priority tasks pending.`,
          action: "Schedule focus time",
        });
      }

      // Check for pending appointments
      if (appointments.length > 0) {
        insights.push({
          type: "tip",
          message: `You have ${appointments.length} appointment requests waiting for confirmation.`,
          action: "Review requests",
        });
      }

      if (insights.length === 0) {
        insights.push({
          type: "tip",
          message: "Your day looks well-balanced with time for both meetings and focus work.",
          action: "Maintain this rhythm",
        });
      }
    } catch (dbError) {
      console.log("Using mock insights - DB not available");
    }

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json(mockInsights);
  }
}