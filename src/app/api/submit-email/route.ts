import { prisma } from "@/util/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, role, address } = await req.json();
  console.log("Received email:", email, "and role:", role);

  try {
    const userExits = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { address }],
      },
    });
    console.log(userExits);
    if (userExits) return NextResponse.json(userExits);
    const createUser = await prisma.user.create({
      data: { email, role, address },
    });
    return NextResponse.json(createUser);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err });
  }
}
