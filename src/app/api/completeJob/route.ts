import { prisma } from "@/util/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  console.log("Received job data:", body);
  try {
    const updateJobStatusAndNewRepoLink = await prisma.job.update({
      where: {
        id: body.jobId,
      },
      data: {
        status: "REWARDABLE",
        newRepoLink: body.newRepoLink,
      },
    });
    console.log(updateJobStatusAndNewRepoLink);
    return NextResponse.json(updateJobStatusAndNewRepoLink);
  } catch (err) {
    console.log(err);
    return NextResponse.json(err);
  }
}
