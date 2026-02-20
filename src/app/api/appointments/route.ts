import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const mockAppointments = [
  { id: "1", clientName: "Sarah Johnson", serviceName: "Consultation", status: "PENDING", requestedDate: new Date().toISOString() },
  { id: "2", clientName: "Mike Chen", serviceName: "Strategy Session", status: "CONFIRMED", requestedDate: new Date().toISOString() },
];

export async function GET(req: NextRequest) {
  try {
    let appointments = mockAppointments;
    
    try {
      const { auth } = await import("@clerk/nextjs/server");
      const { prisma } = await import("@/lib/db");
      
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json(mockAppointments);
      }

      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status");

      const where: any = { userId };
      if (status) where.status = status;

      appointments = await prisma.appointment.findMany({
        where,
        orderBy: { requestedDate: "asc" },
      });
    } catch (dbError) {
      console.log("Using mock data - DB not available");
    }

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(mockAppointments);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    try {
      const { auth } = await import("@clerk/nextjs/server");
      const { prisma } = await import("@/lib/db");
      
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const appointment = await prisma.appointment.create({
        data: {
          userId,
          ...body,
          status: "PENDING",
        },
      });
      
      return NextResponse.json(appointment);
    } catch (dbError) {
      return NextResponse.json({ 
        id: Date.now().toString(),
        ...body,
        status: "PENDING",
        createdAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    
    try {
      const { auth } = await import("@clerk/nextjs/server");
      const { prisma } = await import("@/lib/db");
      
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

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
    } catch (dbError) {
      return NextResponse.json({ ...body, updatedAt: new Date().toISOString() });
    }
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}