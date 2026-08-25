import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: List reservations
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const status = searchParams.get("status");

    const where: any = {};
    if (date) {
      where.date = { contains: date };
    }
    if (status && status !== "ALL") {
      where.status = status;
    }

    const reservations = await prisma.reservation.findMany({
      where,
      orderBy: [{ date: "desc" }, { time: "asc" }],
    });

    return NextResponse.json({ reservations });
  } catch (error: any) {
    console.error("Admin Reservations GET Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch reservations" }, { status: 500 });
  }
}

// PATCH: Update reservation status
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { reservationId, status } = body;

    if (!reservationId || !status) {
      return NextResponse.json({ error: "Reservation ID and status are required" }, { status: 400 });
    }

    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status },
    });

    return NextResponse.json({ success: true, reservation: updated });
  } catch (error: any) {
    console.error("Admin Reservations PATCH Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update reservation" }, { status: 500 });
  }
}
