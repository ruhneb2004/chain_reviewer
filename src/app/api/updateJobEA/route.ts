import { prisma } from "@/util/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  console.log("Received job data:", body);

  try {
    const updateJobEA = await prisma.job.update({
      where: {
        id: body.jobId,
      },
      data: {
        earnableReward: body.earnableReward,
        status: "ASSIGNERACCEPTENCEPENDING",
      },
    });
    console.log(updateJobEA);
    return NextResponse.json(updateJobEA);
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
}
