import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: List all job applications
export async function GET() {
  try {
    const applications = await prisma.jobApplication.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        job: true,
      },
    });

    return NextResponse.json({ applications });
  } catch (error: any) {
    console.error("Admin Applications GET Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch applications" }, { status: 500 });
  }
}

// PATCH: Update applicant status
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { applicationId, status } = body;

    if (!applicationId || !status) {
      return NextResponse.json({ error: "Application ID and status are required" }, { status: 400 });
    }

    const updated = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status },
      include: { job: true },
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (error: any) {
    console.error("Admin Applications PATCH Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update application" }, { status: 500 });
  }
}
