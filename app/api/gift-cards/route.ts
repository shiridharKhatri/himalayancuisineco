import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { recipientName, recipientEmail, senderName, message, cardStyle, amount, deliveryDate } = await req.json();

    if (!recipientName || !senderName || !cardStyle || !amount || amount <= 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let senderId: string | null = null;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      if (user) {
        senderId = user.id;

        // Earn loyalty points (10 points per dollar spent on the gift card)
        const earnedPoints = Math.round(amount * 10);
        
        let rewardAccount = await prisma.rewardAccount.findUnique({
          where: { userId: user.id },
        });

        if (!rewardAccount) {
          rewardAccount = await prisma.rewardAccount.create({
            data: {
              userId: user.id,
              points: 0,
            },
          });
        }

        await prisma.rewardAccount.update({
          where: { userId: user.id },
          data: {
            points: {
              increment: earnedPoints,
            },
          },
        });

        await prisma.rewardTransaction.create({
          data: {
            accountId: rewardAccount.id,
            points: earnedPoints,
            description: `Earned points on $${amount} Gift Card purchase`,
          },
        });
      }
    }

    // Generate unique card code
    const cardCode = `HIM-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const giftCard = await prisma.giftCard.create({
      data: {
        code: cardCode,
        balance: parseFloat(amount),
        initialBalance: parseFloat(amount),
        senderId,
        senderName,
        recipientName,
        recipientEmail: recipientEmail || "",
        message: message || null,
        cardStyle,
        scheduledDate: deliveryDate ? new Date(deliveryDate) : null,
      },
    });

    return NextResponse.json({
      success: true,
      giftCard,
      earnedPoints: senderId ? Math.round(amount * 10) : 0,
    });
  } catch (error: any) {
    console.error("Gift card purchase error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Add a GET endpoint to fetch balance of a card
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Missing card code" }, { status: 400 });
    }

    const giftCard = await prisma.giftCard.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!giftCard) {
      return NextResponse.json({ error: "Gift card not found" }, { status: 404 });
    }

    return NextResponse.json({
      code: giftCard.code,
      balance: giftCard.balance,
      isActive: giftCard.isActive,
    });
  } catch (error: any) {
    console.error("Gift card balance error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
