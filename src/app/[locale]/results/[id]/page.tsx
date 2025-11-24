"use client";

import { ArrowLeft, BarChart2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AvailabilityGrid, weekdays } from "@/components/availability-grid";
import { Toast, useToast } from "@/components/toast";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  aggregateAvailability,
  getMeeting,
  Meeting,
} from "@/lib/meeting-storage";
import { cn } from "@/lib/utils";

type ResultsPageProps = {
  params: { locale: string; id: string };
};

const ResultsPage = ({ params }: ResultsPageProps) => {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const { toast, showToast } = useToast();

  useEffect(() => {
    const fetched = getMeeting(params.id);
    if (fetched) {
      setMeeting(fetched);
      setStatus("ready");
    } else {
      setStatus("error");
    }
  }, [params.id]);

  const overlap = useMemo(
    () => (meeting ? aggregateAvailability(meeting) : null),
    [meeting],
  );

  const participants = useMemo(
    () => [
      "Organizer",
      ...(meeting?.responses.map((response) => response.name) ?? []),
    ],
    [meeting],
  );

  const bestSlots = useMemo(() => {
    if (!overlap) return [] as { key: string; label: string; total: number }[];
    const max = overlap.max || 0;
    if (max === 0) return [];
    return Object.entries(overlap.heatmap)
      .filter(([, value]) => value === max)
      .slice(0, 3)
      .map(([key, total]) => {
        const [dayIndex, hour] = key.split("-").map(Number);
        return {
          key,
          total,
          label: `${weekdays[dayIndex]} @ ${hour.toString().padStart(2, "0")}:00`,
        };
      });
  }, [overlap]);

  const copyId = async () => {
    if (!meeting) return;
    try {
      await navigator.clipboard.writeText(meeting.id);
      showToast({
        title: "Meeting ID copied",
        description: "Share it with your team or spin up a new invite.",
        tone: "success",
      });
    } catch (error) {
      console.error(error);
      showToast({
        title: "Clipboard unavailable",
        description: meeting.id,
        tone: "error",
      });
    }
  };

  if (status === "loading") {
    return (
      <div className="container flex min-h-[70vh] items-center justify-center">
        <div className="bg-card text-muted-foreground flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm">
          <Loader2 className="text-primary h-4 w-4 animate-spin" /> Loading
          results…
        </div>
      </div>
    );
  }

  if (status === "error" || !meeting) {
    return (
      <div className="container flex min-h-[70vh] flex-col items-center justify-center text-center">
        <p className="text-primary text-sm font-semibold">Quickmeet</p>
        <h1 className="text-foreground mt-2 text-3xl font-bold">
          Results unavailable
        </h1>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          We couldn’t load that meeting. Double-check the ID or ask the
          organizer to share a fresh link from their browser.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href={`/${params.locale}`}
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back home
          </Link>
          <Link
            href={`/${params.locale}/create`}
            className={buttonVariants({ variant: "default" })}
          >
            Start a Quickmeet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-primary text-sm font-semibold">
            Quickmeet results
          </p>
          <h1 className="text-foreground text-3xl font-bold sm:text-4xl">
            {meeting.title}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Overlaps are highlighted on the grid. Hover the badges to see how
            many teammates can make it.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/${params.locale}`}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "hidden sm:inline-flex",
            )}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Home
          </Link>
          <Link
            href={`/${params.locale}/meet/${meeting.id}`}
            className={buttonVariants({ variant: "outline" })}
          >
            Back to responses
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <AvailabilityGrid
          value={meeting.organizerAvailability}
          readOnly
          heatmap={overlap?.heatmap}
          maxHeat={overlap?.max}
          legend={`${overlap?.contributors ?? 0} people`}
        />

        <div className="space-y-4">
          <div className="bg-card/60 rounded-2xl border p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <BarChart2 className="text-primary h-5 w-5" />
              <p className="text-sm font-semibold">Participation</p>
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              {participants.length} people total ({meeting.responses.length}{" "}
              responses + organizer).
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {participants.map((name) => (
                <span
                  key={name}
                  className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-muted/40 rounded-2xl border p-4 shadow-inner">
            <p className="text-foreground text-sm font-semibold">
              Top overlapping blocks
            </p>
            {bestSlots.length === 0 ? (
              <p className="text-muted-foreground mt-2 text-sm">
                No overlap yet. Invite more people to paint their week.
              </p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {bestSlots.map((slot) => (
                  <li
                    key={slot.key}
                    className="border-border/60 bg-background flex items-center justify-between rounded-xl border px-3 py-2"
                  >
                    <span className="text-foreground font-medium">
                      {slot.label}
                    </span>
                    <span className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs font-semibold">
                      {slot.total} / {overlap?.contributors}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-card/50 rounded-2xl border p-4">
            <p className="text-foreground text-sm font-semibold">
              Need another round?
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Duplicate this invite by creating a new Quickmeet. You’ll get a
              fresh ID to share.
            </p>
            <Button className="mt-3" onClick={copyId}>
              Copy meeting ID
            </Button>
          </div>
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
};

export default ResultsPage;
