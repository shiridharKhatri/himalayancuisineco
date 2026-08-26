import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOCK_EVENTS } from "@/lib/data";

export const dynamic = "force-dynamic";

// GET: List all events with bookings and tickets summary
export async function GET() {
  try {
    let events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        bookings: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Auto-seed default events if empty
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
        orderBy: { createdAt: "desc" },
        include: {
          bookings: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error("Admin Events GET Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch events" }, { status: 500 });
  }
}

// POST: Create a new event
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, tagline, type, schedule, price, capacity, location, image, description, isPublished } = body;

    if (!title || !schedule || !description) {
      return NextResponse.json({ error: "Title, schedule, and description are required" }, { status: 400 });
    }

    const newEvent = await prisma.event.create({
      data: {
        title: title.trim(),
        tagline: tagline ? tagline.trim() : null,
        type: (type || "Festival Feast").trim(),
        schedule: schedule.trim(),
        price: parseFloat(price) || 0,
        capacity: parseInt(capacity, 10) || 40,
        location: (location || "115 6th St, Glenwood Springs, CO 81601").trim(),
        image: (image || "/images/event_dashain.jpg").trim(),
        description: description.trim(),
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      },
    });

    return NextResponse.json({ success: true, event: newEvent });
  } catch (error: any) {
    console.error("Admin Events POST Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create event" }, { status: 500 });
  }
}

// PATCH: Update an existing event
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, title, tagline, type, schedule, price, capacity, location, image, description, isPublished } = body;

    if (!id) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(tagline !== undefined && { tagline: tagline ? tagline.trim() : null }),
        ...(type !== undefined && { type: type.trim() }),
        ...(schedule !== undefined && { schedule: schedule.trim() }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(capacity !== undefined && { capacity: parseInt(capacity, 10) }),
        ...(location !== undefined && { location: location.trim() }),
        ...(image !== undefined && { image: image.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(isPublished !== undefined && { isPublished: Boolean(isPublished) }),
      },
    });

    return NextResponse.json({ success: true, event: updatedEvent });
  } catch (error: any) {
    console.error("Admin Events PATCH Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update event" }, { status: 500 });
  }
}

// DELETE: Delete an event
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin Events DELETE Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete event" }, { status: 500 });
  }
}
