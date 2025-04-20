import { prisma } from "@/util/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  console.log("Received job data:", body);
  try {
    const updateDeveloperJob = await prisma.user.update({
      where: {
        address: body.address,
      },
      data: {
        takenJobs: {
          connect: { id: body.jobId },
        },
      },
    });
    console.log(updateDeveloperJob);
    const updateJobToActive = await prisma.job.update({
      where: {
        id: body.jobId,
      },
      data: {
        activeJob: true,
        status: "APPROVED",
      },
    });
    console.log(updateJobToActive);
    return NextResponse.json({
      message: `The dev with address ${body.address} has been successfully approved!`,
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: " successfully failed the job!" });
  }
}
