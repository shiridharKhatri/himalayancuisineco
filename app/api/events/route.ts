import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOCK_EVENTS } from "@/lib/data";

export const dynamic = "force-dynamic";

// GET: Fetch published events
export async function GET() {
  try {
    let events = await prisma.event.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      include: {
        bookings: true,
      },
    });

    if (events.length === 0 && MOCK_EVENTS && MOCK_EVENTS.length > 0) {
      for (const e of MOCK_EVENTS) {
        await prisma.event.create({
          data: {
            title: e.title,
            type: e.type || "Festival Feast",
            schedule: e.schedule || "October 20, 2026 @ 6:00 PM",
            price: 45.0,
            capacity: 40,
            location: e.location || "Main Dining Hall",
            image: e.id === "evt-dashain-feast" ? "/images/event_dashain.jpg" : "/images/event_masterclass.jpg",
            description: e.description,
            isPublished: true,
          },
        });
      }

      events = await prisma.event.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        include: {
          bookings: true,
        },
      });
    }

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error("Public Events GET Error:", error);
    return NextResponse.json({ events: MOCK_EVENTS });
  }
}

// POST: Book tickets for an event
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventId, customerName, customerEmail, customerPhone, ticketsCount, totalPaid, notes } = body;

    if (!eventId || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: "Event ID, full name, email, and phone number are required" },
        { status: 400 }
      );
    }

    const booking = await prisma.eventBooking.create({
      data: {
        eventId,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        ticketsCount: parseInt(ticketsCount, 10) || 1,
        totalPaid: parseFloat(totalPaid) || 0,
        notes: notes ? notes.trim() : null,
        status: "CONFIRMED",
      },
    });

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error("Public Event Booking Error:", error);
    return NextResponse.json({ error: error.message || "Failed to book tickets" }, { status: 500 });
  }
}
