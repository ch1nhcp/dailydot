import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { meetings } from "@/lib/schema";

interface ResponseBlock {
  id?: string;
  status?: string;
  [key: string]: unknown;
}

const aggregateBlocks = (
  responses: { blocks: unknown }[],
): Array<{
  blockId: string;
  total: number;
  counts: Record<string, number>;
}> => {
  const buckets = new Map<
    string,
    { blockId: string; total: number; counts: Record<string, number> }
  >();

  for (const response of responses) {
    const blocks = Array.isArray(response.blocks) ? response.blocks : [];

    for (const rawBlock of blocks as ResponseBlock[]) {
      if (!rawBlock || typeof rawBlock !== "object") continue;

      const blockId = rawBlock.id?.toString();
      if (!blockId) continue;

      const status = rawBlock.status ?? "selected";
      const entry =
        buckets.get(blockId) ??
        ({ blockId, total: 0, counts: {} } as {
          blockId: string;
          total: number;
          counts: Record<string, number>;
        });

      entry.total += 1;
      entry.counts[status] = (entry.counts[status] ?? 0) + 1;
      buckets.set(blockId, entry);
    }
  }

  return Array.from(buckets.values());
};

export async function GET(
  _request: Request,
  { params }: { params: { meetingId: string } },
) {
  const meeting = await db.query.meetings.findFirst({
    where: eq(meetings.id, params.meetingId),
    with: {
      responses: true,
    },
  });

  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  const aggregate = aggregateBlocks(meeting.responses ?? []);

  return NextResponse.json({
    meeting: {
      id: meeting.id,
      title: meeting.title,
      organizerBlocks: meeting.organizerBlocks ?? [],
      createdAt: meeting.createdAt,
    },
    responses: meeting.responses,
    totalResponses: meeting.responses.length,
    aggregate,
  });
}
