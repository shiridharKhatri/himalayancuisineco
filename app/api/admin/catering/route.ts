import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: List all catering inquiries
export async function GET() {
  try {
    const inquiries = await prisma.cateringRequest.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ inquiries });
  } catch (error: any) {
    console.error("Admin Catering GET Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch catering inquiries" }, { status: 500 });
  }
}

// PATCH: Update catering inquiry status
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { inquiryId, status } = body;

    if (!inquiryId || !status) {
      return NextResponse.json({ error: "Inquiry ID and status are required" }, { status: 400 });
    }

    const updated = await prisma.cateringRequest.update({
      where: { id: inquiryId },
      data: { status },
    });

    return NextResponse.json({ success: true, inquiry: updated });
  } catch (error: any) {
    console.error("Admin Catering PATCH Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update catering inquiry" }, { status: 500 });
  }
}
