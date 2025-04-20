import { prisma } from "@/util/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  console.log("Received job data:", body);
  try {
    const updateJobStatus = await prisma.job.update({
      where: {
        id: body.jobId,
      },
      data: { status: "FINISHED" },
    });
    console.log("updateJobStatus : ", updateJobStatus);
    return NextResponse.json(updateJobStatus);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error, status: 400 });
  }
}
