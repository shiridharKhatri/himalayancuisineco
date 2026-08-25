import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const reservations = await prisma.reservation.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ reservations });
  } catch (error: any) {
    console.error("Reservations fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    const { name, email, phone, date, time, guests, seatingArea, occasion, notes } = await req.json();

    if (!name || !email || !phone || !date || !time || !guests || !seatingArea) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let userId: string | null = null;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      if (user) {
        userId = user.id;
      }
    }

    const reservation = await prisma.reservation.create({
      data: {
        userId,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        date: new Date(date),
        time,
        guests: parseInt(guests, 10),
        seatingArea,
        specialOccasion: occasion !== "NONE" ? occasion : null,
        notes: notes || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ reservation });
  } catch (error: any) {
    console.error("Reservation creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
