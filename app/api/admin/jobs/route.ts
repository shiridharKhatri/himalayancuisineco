import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OPEN_JOBS } from "@/lib/data";

export const dynamic = "force-dynamic";

// GET: Fetch all job listings with application counts
export async function GET() {
  try {
    let jobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    // Auto-seed initial default jobs if database has 0 records
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
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { applications: true },
          },
        },
      });
    }

    return NextResponse.json({ jobs });
  } catch (error: any) {
    console.error("Admin Jobs GET Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch jobs" }, { status: 500 });
  }
}

// POST: Create a new job opening
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, location, type, schedule, salary, description, isPublished } = body;

    if (!title || !location || !type || !description) {
      return NextResponse.json(
        { error: "Title, location, employment type, and description are required" },
        { status: 400 }
      );
    }

    const newJob = await prisma.job.create({
      data: {
        title: title.trim(),
        location: location.trim(),
        type: type.trim(),
        schedule: (schedule || "Flexible Shifts").trim(),
        salary: salary ? salary.trim() : null,
        description: description.trim(),
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      },
    });

    return NextResponse.json({ success: true, job: newJob });
  } catch (error: any) {
    console.error("Admin Jobs POST Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create job" }, { status: 500 });
  }
}

// PATCH: Update an existing job opening
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, title, location, type, schedule, salary, description, isPublished } = body;

    if (!id) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(location !== undefined && { location: location.trim() }),
        ...(type !== undefined && { type: type.trim() }),
        ...(schedule !== undefined && { schedule: schedule.trim() }),
        ...(salary !== undefined && { salary: salary ? salary.trim() : null }),
        ...(description !== undefined && { description: description.trim() }),
        ...(isPublished !== undefined && { isPublished: Boolean(isPublished) }),
      },
    });

    return NextResponse.json({ success: true, job: updatedJob });
  } catch (error: any) {
    console.error("Admin Jobs PATCH Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update job" }, { status: 500 });
  }
}

// DELETE: Delete a job opening
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    await prisma.job.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin Jobs DELETE Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete job" }, { status: 500 });
  }
}
