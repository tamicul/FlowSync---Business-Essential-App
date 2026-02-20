import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const mockInsights = [
  { type: "tip", message: "Your peak focus time is 9-11 AM", action: "Schedule deep work" },
  { type: "warning", message: "You have 3 back-to-back meetings today", action: "Add buffers" },
  { type: "suggestion", message: "Leave by 1:45 PM for your 2:00 PM meeting", action: "Set reminder" },
];

export async function GET() {
  return NextResponse.json(mockInsights);
}