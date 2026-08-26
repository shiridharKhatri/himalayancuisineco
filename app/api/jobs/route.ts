import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OPEN_JOBS } from "@/lib/data";

export const dynamic = "force-dynamic";

// GET: Fetch published jobs for public careers page
export async function GET() {
  try {
    let jobs = await prisma.job.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });

    if (jobs.length === 0 && OPEN_JOBS && OPEN_JOBS.length > 0) {
      for (const j of OPEN_JOBS) {
        await prisma.job.create({
          data: {
            title: j.title,
            location: j.location,
            type: j.type,
            schedule: j.schedule,
            salary: j.salary || "$18 - $24/hr",
            description: j.description,
            isPublished: true,
          },
        });
      }
      jobs = await prisma.job.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ jobs });
  } catch (error: any) {
    console.error("Public Jobs GET Error:", error);
    return NextResponse.json({ jobs: OPEN_JOBS });
  }
}
