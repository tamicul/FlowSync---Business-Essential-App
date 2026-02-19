import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const insights = [
      { type: "tip", message: "Your peak focus time is 9-11 AM", action: "Schedule deep work" },
      { type: "warning", message: "You have 3 back-to-back meetings today", action: "Add buffers" },
      { type: "suggestion", message: "Leave by 1:45 PM for your 2:00 PM meeting", action: "Set reminder" },
    ];

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json([
      { type: "tip", message: "Welcome to FlowSync!", action: "Get started" }
    ]);
  }
}