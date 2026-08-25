import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: List all orders with filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const deliveryType = searchParams.get("type");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (deliveryType && deliveryType !== "ALL") {
      where.deliveryType = deliveryType;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            menuItem: true,
            modifiers: true,
          },
        },
      },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Admin Orders GET Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch orders" }, { status: 500 });
  }
}

// PATCH: Update order status
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: "Order ID and status are required" }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error("Admin Orders PATCH Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update order status" }, { status: 500 });
  }
}
