import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET: Fetch all users with order & reservation statistics
export async function GET() {
  try {
    let users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            orders: true,
            reservations: true,
          },
        },
        rewardAccount: true,
      },
    });

    // Auto-seed primary admin and staff if table is fresh
    if (users.length === 0) {
      await prisma.user.createMany({
        data: [
          {
            name: "Tashi Sherpa (Owner & Master Admin)",
            email: "admin@himalayancuisineco.com",
            password: "adminpassword",
            role: "ADMIN",
          },
          {
            name: "Pemba Norbu (Kitchen Lead)",
            email: "pemba@himalayancuisineco.com",
            password: "staffpassword",
            role: "STAFF",
          },
          {
            name: "Mingma Lama (Diner VIP)",
            email: "customer@himalayan.com",
            password: "customerpassword",
            role: "CUSTOMER",
          },
        ],
      });

      users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              orders: true,
              reservations: true,
            },
          },
          rewardAccount: true,
        },
      });
    }

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Admin Users GET Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch users" }, { status: 500 });
  }
}

// POST: Create a new user or staff member
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, role, password } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        role: role || "STAFF",
        password: password ? password.trim() : "staff123",
      },
      include: {
        _count: {
          select: {
            orders: true,
            reservations: true,
          },
        },
        rewardAccount: true,
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    console.error("Admin Users POST Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 });
  }
}

// PATCH: Update user role, name, or password
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, name, role, password } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(role !== undefined && { role }),
        ...(password !== undefined && { password: password.trim() }),
      },
      include: {
        _count: {
          select: {
            orders: true,
            reservations: true,
          },
        },
        rewardAccount: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Admin Users PATCH Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}

// DELETE: Delete a user
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin Users DELETE Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 500 });
  }
}
