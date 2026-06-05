import { presentationRatelimit } from "@/lib/ratelimit";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { type Session } from "next-auth";
import { NextResponse } from "next/server";

type GuardResult =
  | { session: Session; error?: never }
  | { session?: never; error: NextResponse };

export async function guardAiRoute(opts?: {
  checkStars?: boolean;
}): Promise<GuardResult> {
  const session = await auth();

  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!session.user.hasAccess) {
    return {
      error: NextResponse.json(
        { error: "You need an active plan to generate presentations." },
        { status: 403 },
      ),
    };
  }

  if (presentationRatelimit) {
    const { success } = await presentationRatelimit.limit(session.user.id);
    if (!success) {
      return {
        error: NextResponse.json(
          { error: "Too many requests. Please wait a moment." },
          { status: 429 },
        ),
      };
    }
  }

  if (opts?.checkStars) {
    const freshUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { stars: true },
    });

    if (!freshUser || freshUser.stars < 10) {
      return {
        error: NextResponse.json(
          { error: "Insufficient stars. Please upgrade your plan." },
          { status: 402 },
        ),
      };
    }
  }

  return { session };
}
