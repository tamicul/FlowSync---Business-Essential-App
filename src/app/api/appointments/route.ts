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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = { userId };
    if (status) where.status = status;

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { requestedDate: "asc" },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
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
      clientName,
      clientEmail,
      clientPhone,
      serviceName,
      description,
      requestedDate,
      duration,
      price,
      clientNotes,
    } = body;

    const appointment = await prisma.appointment.create({
      data: {
        userId,
        clientName,
        clientEmail,
        clientPhone,
        serviceName,
        description,
        requestedDate: new Date(requestedDate),
        duration,
        price,
        clientNotes,
        status: "PENDING",
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, ...updates } = body;

    // If confirming, create a calendar event
    let eventId = null;
    if (status === "CONFIRMED") {
      const appointment = await prisma.appointment.findUnique({
        where: { id, userId },
      });

      if (appointment) {
        const event = await prisma.event.create({
          data: {
            userId,
            title: `Appointment: ${appointment.clientName}`,
            description: `${appointment.serviceName} - ${appointment.description || ""}`,
            startTime: appointment.requestedDate,
            endTime: new Date(
              new Date(appointment.requestedDate).getTime() + appointment.duration * 60000
            ),
            type: "APPOINTMENT",
            priority: "HIGH",
          },
        });
        eventId = event.id;
      }
    }

    const updated = await prisma.appointment.update({
      where: { id, userId },
      data: {
        ...updates,
        status,
        eventId,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}