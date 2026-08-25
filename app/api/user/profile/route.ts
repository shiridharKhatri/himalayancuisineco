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

    const email = session.user.email;

    // Find user in database
    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        addresses: true,
        reservations: {
          orderBy: { date: "desc" },
        },
        rewardAccount: {
          include: {
            transactions: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
        orders: {
          orderBy: { createdAt: "desc" },
          include: {
            items: {
              include: {
                modifiers: true,
              },
            },
          },
        },
      },
    });

    // If user does not exist in DB yet (e.g. newly signed-in via Google/Phone OTP), create them
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: session.user.name || "Member",
          role: "CUSTOMER",
          rewardAccount: {
            create: {
              points: 150, // 150 signup bonus points
              transactions: {
                create: {
                  points: 150,
                  description: "Signup bonus points",
                },
              },
            },
          },
        },
        include: {
          addresses: true,
          reservations: {
            orderBy: { date: "desc" },
          },
          rewardAccount: {
            include: {
              transactions: {
                orderBy: { createdAt: "desc" },
              },
            },
          },
          orders: {
            orderBy: { createdAt: "desc" },
            include: {
              items: {
                include: {
                  modifiers: true,
                },
              },
            },
          },
        },
      });
    } else if (!user.rewardAccount) {
      // If user exists but has no rewards account, initialize one
      await prisma.rewardAccount.create({
        data: {
          userId: user.id,
          points: 250, // seed 250 points to matches mock design
          transactions: {
            create: {
              points: 250,
              description: "Welcome loyalty points allocation",
            },
          },
        },
      });

      // Refetch
      user = await prisma.user.findUnique({
        where: { email },
        include: {
          addresses: true,
          reservations: {
            orderBy: { date: "desc" },
          },
          rewardAccount: {
            include: {
              transactions: {
                orderBy: { createdAt: "desc" },
              },
            },
          },
          orders: {
            orderBy: { createdAt: "desc" },
            include: {
              items: {
                include: {
                  modifiers: true,
                },
              },
            },
          },
        },
      }) as any;
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
