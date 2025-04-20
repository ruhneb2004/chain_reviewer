import { prisma } from "@/util/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  console.log("Received job data:", body);

  try {
    const currentJob = await prisma.job.findUnique({
      where: {
        id: body.jobId,
      },
      select: {
        appliedDev: true,
      },
    });

    console.log("current job", currentJob);

    if (currentJob?.appliedDev?.includes(body.address)) {
      return NextResponse.json(
        { message: "You have already applied for this job" },
        { status: 400 }
      );
    }

    const applyToJob = await prisma.job.update({
      where: { id: body.jobId },
      data: {
        appliedDev: {
          set: [...(currentJob?.appliedDev || []), body.address],
        },
      },
    });

    console.log(applyToJob);
    return NextResponse.json({
      message: "Applied for the job successfully",
    });
  } catch (err) {
    return NextResponse.json({ err });
  }
}
