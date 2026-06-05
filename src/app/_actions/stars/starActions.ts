"use server";

import { calculateStarCost, type TextContentLevel } from "@/config/stars";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

export async function getUserStars() {
  const session = await auth();
  if (!session?.user) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { stars: true, totalStarsUsed: true },
  });

  return user;
}

export async function deductStars(opts: {
  presentationId: string;
  slides: number;
  textContent: TextContentLevel;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const cost = calculateStarCost(opts);
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { stars: true },
  });

  if (!user || user.stars < cost) {
    throw new Error("Insufficient stars");
  }

  await db.$transaction([
    db.user.update({
      where: { id: session.user.id },
      data: {
        stars: { decrement: cost },
        totalStarsUsed: { increment: cost },
      },
    }),
    db.starLog.create({
      data: {
        userId: session.user.id,
        delta: -cost,
        reason: "presentation_created",
        presentationId: opts.presentationId,
      },
    }),
  ]);

  return { cost, remaining: user.stars - cost };
}

export async function getStarHistory() {
  const session = await auth();
  if (!session?.user) return [];

  return db.starLog.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { user: { select: { name: true } } },
  });
}

export async function grantStars(
  userId: string,
  amount: number,
  reason: string,
) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new Error("Unauthorized");
  }

  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { stars: { increment: amount } },
    }),
    db.starLog.create({
      data: {
        userId,
        delta: amount,
        reason,
      },
    }),
  ]);

  return { success: true };
}
