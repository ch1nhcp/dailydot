"use client";

import { ArrowLeft, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  AvailabilityGrid,
  AvailabilityMap,
  countActiveSlots,
  emptyAvailability,
} from "@/components/availability-grid";
import { Toast, useToast } from "@/components/toast";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addResponse,
  aggregateAvailability,
  getMeeting,
  Meeting,
} from "@/lib/meeting-storage";
import { cn } from "@/lib/utils";

type MeetPageProps = {
  params: { locale: string; id: string };
};

const MeetPage = ({ params }: MeetPageProps) => {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [availability, setAvailability] = useState<AvailabilityMap>(() =>
    emptyAvailability(),
  );
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const selectedSlots = useMemo(
    () => countActiveSlots(availability),
    [availability],
  );

  const overlap = useMemo(
    () => (meeting ? aggregateAvailability(meeting) : null),
    [meeting],
  );

  const handleSubmit = () => {
    if (!meeting) {
      showToast({
        title: "Meeting not found",
        description: "Create a new invite to continue.",
        tone: "error",
      });
      return;
    }
    if (!name.trim()) {
      showToast({ title: "Add your name", tone: "error" });
      return;
    }
    if (selectedSlots === 0) {
      showToast({
        title: "Mark at least one block",
        description: "Paint your availability before submitting.",
        tone: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = addResponse(meeting.id, {
        name: name.trim(),
        availability,
      });
      if (!updated) {
        showToast({
          title: "Meeting missing",
          description: "This invite is no longer available.",
          tone: "error",
        });
        setStatus("error");
        return;
      }
      setMeeting(updated);
      setAvailability(emptyAvailability());
      setName("");
      showToast({
        title: "Availability submitted",
        description: "Your blocks are now counted.",
        tone: "success",
      });
    } catch (error) {
      console.error(error);
      showToast({
        title: "Something went wrong",
        description: "Try again in a moment.",
        tone: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="container flex min-h-[70vh] items-center justify-center">
        <div className="bg-card text-muted-foreground flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm">
          <Loader2 className="text-primary h-4 w-4 animate-spin" /> Loading
          meeting…
        </div>
      </div>
    );
  }

  if (status === "error" || !meeting) {
    return (
      <div className="container flex min-h-[70vh] flex-col items-center justify-center text-center">
        <p className="text-primary text-sm font-semibold">Quickmeet</p>
        <h1 className="text-foreground mt-2 text-3xl font-bold">
          We couldn’t find that invite
        </h1>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          The meeting ID you opened isn’t saved in this browser. Start a new
          invite to paint availability and share a fresh link.
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
          <p className="text-primary text-sm font-semibold">Quickmeet</p>
          <h1 className="text-foreground text-3xl font-bold sm:text-4xl">
            {meeting.title}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Organizer blocks are pinned below. Paint yours, add your name, and
            we’ll surface overlaps.
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
            href={`/${params.locale}/results/${meeting.id}`}
            className={buttonVariants({ variant: "outline" })}
          >
            View results
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="bg-card/60 rounded-2xl border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground text-sm font-semibold">
                  Organizer availability
                </p>
                <p className="text-muted-foreground text-xs">
                  Pinned blocks for this invite.
                </p>
              </div>
              <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
                {countActiveSlots(meeting.organizerAvailability)} slots
              </span>
            </div>
            <div className="mt-4">
              <AvailabilityGrid
                value={meeting.organizerAvailability}
                readOnly
                legend="Host"
                heatmap={overlap?.heatmap}
                maxHeat={overlap?.max}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card/60 rounded-2xl border p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Users className="text-primary h-5 w-5" />
              <p className="text-sm font-semibold">Add your blocks</p>
            </div>
            <div className="mt-3 space-y-3">
              <label
                className="text-foreground text-sm font-medium"
                htmlFor="name"
              >
                Your name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="How should we show you?"
              />
              <AvailabilityGrid
                value={availability}
                onChange={setAvailability}
                legend={`${selectedSlots} selected`}
              />
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isSubmitting ? "Submitting" : "Send availability"}
              </Button>
            </div>
          </div>

          <div className="bg-muted/50 rounded-2xl border p-4">
            <p className="text-foreground text-sm font-semibold">Responses</p>
            {meeting.responses.length === 0 ? (
              <p className="text-muted-foreground mt-2 text-sm">
                No one has responded yet. Be the first.
              </p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {meeting.responses.map((response) => (
                  <li
                    key={response.name}
                    className="border-border/60 bg-background flex items-center justify-between rounded-xl border px-3 py-2"
                  >
                    <span className="text-foreground font-medium">
                      {response.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {countActiveSlots(response.availability)} blocks
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
};

export default MeetPage;
