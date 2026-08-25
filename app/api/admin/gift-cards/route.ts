import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: List all gift cards with transactions
export async function GET() {
  try {
    const giftCards = await prisma.giftCard.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        transactions: true,
      },
    });

    return NextResponse.json({ giftCards });
  } catch (error: any) {
    console.error("Admin Gift Cards GET Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch gift cards" }, { status: 500 });
  }
}

// POST: Issue manual/VIP gift card
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { recipientName, recipientEmail, senderName, amount, message, cardStyle } = body;

    if (!recipientName || !recipientEmail || !amount) {
      return NextResponse.json({ error: "Recipient name, email, and amount are required" }, { status: 400 });
    }

    // Generate random 14-char code
    const raw = Math.random().toString(36).substring(2, 10).toUpperCase();
    const code = `HIMA-${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
    const parsedAmount = parseFloat(amount);

    const giftCard = await prisma.giftCard.create({
      data: {
        code,
        initialBalance: parsedAmount,
        balance: parsedAmount,
        recipientName: recipientName.trim(),
        recipientEmail: recipientEmail.trim().toLowerCase(),
        senderName: (senderName || "Himalayan Management").trim(),
        message: message || "Complimentary VIP Gift Card",
        cardStyle: cardStyle || "classic",
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, giftCard });
  } catch (error: any) {
    console.error("Admin Gift Cards POST Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create gift card" }, { status: 500 });
  }
}
