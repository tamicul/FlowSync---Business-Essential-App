import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json([]);
    }

    // Get user's tasks and events
    const [tasks, events] = await Promise.all([
      prisma.task.findMany({
        where: { userId },
      }),
      prisma.event.findMany({
        where: { userId },
      }),
    ]);

    const insights = [];

    // Check for high priority tasks
    const highPriorityTasks = tasks.filter(t => t.priority === "HIGH" && t.status !== "DONE");
    if (highPriorityTasks.length > 0) {
      insights.push({
        type: "warning",
        message: `You have ${highPriorityTasks.length} high priority tasks pending attention.`,
      });
    }

    // Check for overdue tasks
    const overdueTasks = tasks.filter(
      t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE"
    );
    if (overdueTasks.length > 0) {
      insights.push({
        type: "warning",
        message: `You have ${overdueTasks.length} overdue tasks.`,
      });
    }

    // Check task completion rate
    const doneTasks = tasks.filter(t => t.status === "DONE").length;
    const totalTasks = tasks.length;
    if (totalTasks > 0 && doneTasks / totalTasks > 0.7) {
      insights.push({
        type: "tip",
        message: "Great job! You've completed over 70% of your tasks.",
      });
    }

    // Check for many pending tasks
    const pendingTasks = tasks.filter(t => t.status === "TODO").length;
    if (pendingTasks > 5) {
      insights.push({
        type: "suggestion",
        message: `You have ${pendingTasks} tasks in your backlog. Consider prioritizing.`,
      });
    }

    // Default insight if none generated
    if (insights.length === 0) {
      insights.push({
        type: "tip",
        message: "Add your tasks to get personalized insights and recommendations.",
      });
    }

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json([]);
  }
}