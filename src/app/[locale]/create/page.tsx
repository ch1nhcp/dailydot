"use client";

import { ArrowLeft, Copy, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  AvailabilityGrid,
  AvailabilityMap,
  countActiveSlots,
  emptyAvailability,
} from "@/components/availability-grid";
import { Toast, useToast } from "@/components/toast";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createMeeting } from "@/lib/meeting-storage";
import { cn } from "@/lib/utils";

type CreatePageProps = {
  params: { locale: string };
};

const CreateMeetingPage = ({ params }: CreatePageProps) => {
  const [title, setTitle] = useState("Product lounge sync");
  const [availability, setAvailability] = useState<AvailabilityMap>(() =>
    emptyAvailability(),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast, showToast } = useToast();
  const router = useRouter();

  const selectedSlots = useMemo(
    () => countActiveSlots(availability),
    [availability],
  );

  const handleCopy = async (shareUrl: string) => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast({
        title: "Copied",
        description: "Share the invite link with your team.",
        tone: "success",
      });
      setTimeout(() => setCopied(false), 1200);
    } catch (error) {
      console.error(error);
      showToast({
        title: "Clipboard unavailable",
        description: "Press Ctrl/Cmd+C to copy instead.",
        tone: "error",
      });
    }
  };

  const handleCreate = () => {
    if (!title.trim()) {
      showToast({ title: "Add a meeting title", tone: "error" });
      return;
    }

    if (selectedSlots === 0) {
      showToast({
        title: "Mark at least one block",
        description: "Drag to paint your availability.",
        tone: "error",
      });
      return;
    }

    setIsSaving(true);
    try {
      const meeting = createMeeting(title.trim(), availability);
      setMeetingId(meeting.id);
      showToast({
        title: "Meeting ready",
        description: "Share the Quickmeet link so people can add their blocks.",
        tone: "success",
      });
    } catch (error) {
      console.error(error);
      showToast({
        title: "Could not save",
        description: "Reload and try again.",
        tone: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const shareUrl = useMemo(() => {
    if (!meetingId || typeof window === "undefined") return "";
    return `${window.location.origin}/${params.locale}/meet/${meetingId}`;
  }, [meetingId, params.locale]);

  return (
    <div className="container py-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-primary text-sm font-semibold">Quickmeet</p>
          <h1 className="text-foreground text-3xl font-bold sm:text-4xl">
            Paint your availability
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
            Drag across the weekly grid to mark when you can meet. Generate a
            short ID and send the link so everyone can respond.
          </p>
        </div>
        <Link
          href={`/${params.locale}`}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "hidden sm:inline-flex",
          )}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Home
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <AvailabilityGrid
          value={availability}
          onChange={setAvailability}
          legend={`${selectedSlots} selected`}
        />

        <div className="space-y-4">
          <div className="bg-card/60 rounded-2xl border p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary h-5 w-5" />
              <p className="text-sm font-semibold">Meeting details</p>
            </div>
            <div className="mt-4 space-y-3">
              <label
                className="text-foreground text-sm font-medium"
                htmlFor="title"
              >
                Title
              </label>
              <Input
                id="title"
                value={title}
                maxLength={80}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="What are we scheduling?"
              />
              <p className="text-muted-foreground text-xs">
                Quickmeet uses a Things-inspired card style so your invite feels
                calm and focused.
              </p>
              <Button
                onClick={handleCreate}
                disabled={isSaving}
                className="w-full justify-center text-base font-semibold"
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isSaving ? "Generating" : "Create invite"}
              </Button>
            </div>
          </div>

          <div className="bg-muted/40 rounded-2xl border p-4 shadow-inner">
            <p className="text-foreground text-sm font-semibold">
              Shareable link
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Every invite gets a short ID. Copy the link below to invite
              teammates.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <code className="bg-background text-muted-foreground inline-flex w-full items-center justify-between truncate rounded-xl px-3 py-2 font-mono text-xs">
                {shareUrl || "Create to reveal a link"}
              </code>
              <Button
                variant="outline"
                size="sm"
                disabled={!shareUrl}
                onClick={() => shareUrl && handleCopy(shareUrl)}
                className="shrink-0"
              >
                <Copy className="mr-2 h-4 w-4" />
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            {meetingId ? (
              <div className="text-muted-foreground mt-4 flex flex-wrap gap-2 text-xs">
                <span className="bg-primary/10 text-primary rounded-full px-2.5 py-1">
                  ID {meetingId}
                </span>
                <Button
                  variant="link"
                  size="sm"
                  className="text-primary px-0"
                  onClick={() =>
                    router.push(`/${params.locale}/meet/${meetingId}`)
                  }
                >
                  Open participant view
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
};

export default CreateMeetingPage;
