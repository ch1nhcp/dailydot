import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { meetings } from "@/lib/schema";

const createMeetingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  organizerBlocks: z.array(z.any()).default([]),
});

const SHORT_ID_LENGTH = 8;

const generateShortId = () =>
  crypto.randomUUID().replace(/-/g, "").slice(0, SHORT_ID_LENGTH);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createMeetingSchema.safeParse(body ?? {});

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid meeting payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const meetingId = generateShortId();
  const createdAt = new Date();

  await db.insert(meetings).values({
    id: meetingId,
    title: parsed.data.title,
    organizerBlocks: parsed.data.organizerBlocks,
    createdAt,
  });

  return NextResponse.json(
    {
      id: meetingId,
      title: parsed.data.title,
      organizerBlocks: parsed.data.organizerBlocks,
      createdAt,
    },
    { status: 201 },
  );
}
