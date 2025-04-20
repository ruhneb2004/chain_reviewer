import { prisma } from "@/util/client";
import { NextResponse } from "next/server";

type jobDataType = {
  title: string;
  description: string;
  reward: number;
  repoLink: string;
  userId: string;
};

//this is for creating the job only
export async function POST(req: Request) {
  const body: jobDataType = await req.json();
  const { title, description, reward, repoLink, userId } = body;
  console.log("Received job data:", body);
  try {
    const createJob = await prisma.job.create({
      data: {
        title,
        description,
        reward,
        repoLink,
        status: "PENDING",
        activeJob: false,
        assigner: {
          connect: { id: userId },
        },
      },
    });
    if (createJob) {
      return NextResponse.json({
        message: "created the job successfully",
        createJob,
      });
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err });
  }
}

//this is for retrieving the all jobs, not the user specific
export async function GET() {
  try {
    const data = await prisma.job.findMany();
    if (data) {
      return NextResponse.json({ data }, { status: 200 });
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err }, { status: 500 });
  }
}
