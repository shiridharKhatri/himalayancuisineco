import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { street, city, state, zipCode, isDefault } = await req.json();

    if (!street || !city || !state || !zipCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If isDefault is true, unset default on other addresses first
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    // Check if this is the first address, make it default automatically
    const existingAddressesCount = await prisma.address.count({
      where: { userId: user.id },
    });

    const newAddress = await prisma.address.create({
      data: {
        userId: user.id,
        street,
        city,
        state,
        zipCode,
        isDefault: existingAddressesCount === 0 ? true : !!isDefault,
      },
    });

    return NextResponse.json({ address: newAddress });
  } catch (error: any) {
    console.error("Address creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing address ID" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: { id, userId: user.id },
    });

    if (!address) {
      return NextResponse.json({ error: "Address not found or unauthorized" }, { status: 404 });
    }

    await prisma.address.delete({
      where: { id },
    });

    // If deleted address was default, make another one default if any exists
    if (address.isDefault) {
      const remainingAddress = await prisma.address.findFirst({
        where: { userId: user.id },
      });
      if (remainingAddress) {
        await prisma.address.update({
          where: { id: remainingAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Address deletion error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
