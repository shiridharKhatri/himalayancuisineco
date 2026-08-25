import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const jobId = formData.get("jobId") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const availability = formData.get("availability") as string;
    const coverLetter = (formData.get("coverLetter") as string) || "";
    const resumeFile = formData.get("resume") as File | null;

    if (!jobId || !name || !email || !phone || !availability) {
      return NextResponse.json(
        { error: "Missing required application fields." },
        { status: 400 }
      );
    }

    let resumeUrl = "No file attached";

    // Handle real file upload if provided
    if (resumeFile && typeof resumeFile.arrayBuffer === "function" && resumeFile.size > 0) {
      const bytes = await resumeFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = path.join(process.cwd(), "public", "uploads", "resumes");
      await mkdir(uploadsDir, { recursive: true });

      // Clean filename
      const safeName = resumeFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${safeName}`;
      const filePath = path.join(uploadsDir, uniqueFileName);

      await writeFile(filePath, buffer);
      resumeUrl = `/uploads/resumes/${uniqueFileName}`;
    }

    // Check if job exists in DB, or fallback/link to existing job
    let dbJob = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!dbJob) {
      // Find by title or create fallback job entry if not seeded
      dbJob = await prisma.job.create({
        data: {
          id: jobId,
          title: jobId.replace("job-", "").toUpperCase(),
          location: "Glenwood Springs, CO",
          type: "Full-time",
          schedule: availability,
          description: "Culinary position",
        },
      });
    }

    // Create real database application
    const application = await prisma.jobApplication.create({
      data: {
        jobId: dbJob.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        availability: availability.trim(),
        coverLetter: coverLetter.trim() || null,
        resumeUrl,
        status: "NEW",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully.",
      applicationId: application.id,
      resumeUrl,
    });
  } catch (error: any) {
    console.error("Error submitting job application:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit job application." },
      { status: 500 }
    );
  }
}
