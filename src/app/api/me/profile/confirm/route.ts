import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const session = (await getSession()) as { id?: string } | null;
  if (!session?.id) return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  const profile = await prisma.memberPersonalProfile.upsert({
    where: { userId: session.id },
    create: { userId: session.id, lastConfirmedAt: new Date() },
    update: { lastConfirmedAt: new Date() },
    select: { lastConfirmedAt: true },
  });
  return NextResponse.json({ success: true, lastConfirmedAt: profile.lastConfirmedAt?.toISOString() });
}
