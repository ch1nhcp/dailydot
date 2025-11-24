import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { meetings, responses } from "@/lib/schema";

const responseSchema = z.object({
  participantName: z.string().min(1, "Participant name is required"),
  blocks: z.array(z.any()).default([]),
});

export async function POST(
  request: Request,
  { params }: { params: { meetingId: string } },
) {
  const body = await request.json().catch(() => null);
  const parsed = responseSchema.safeParse(body ?? {});

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid response payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const meetingId = params.meetingId;
  const meeting = await db.query.meetings.findFirst({
    where: eq(meetings.id, meetingId),
  });

  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  const now = new Date();

  const [savedResponse] = await db
    .insert(responses)
    .values({
      meetingId,
      participantName: parsed.data.participantName,
      blocks: parsed.data.blocks,
      respondedAt: now,
    })
    .returning();

  return NextResponse.json(
    {
      ...savedResponse,
      respondedAt: now,
    },
    { status: 201 },
  );
}
