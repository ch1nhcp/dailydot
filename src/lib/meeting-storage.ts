import {
  AvailabilityMap,
  dayHours,
  weekdays,
} from "@/components/availability-grid";

export type ParticipantResponse = {
  name: string;
  availability: AvailabilityMap;
  submittedAt: number;
};

export type Meeting = {
  id: string;
  title: string;
  organizerAvailability: AvailabilityMap;
  responses: ParticipantResponse[];
  createdAt: number;
};

const STORAGE_KEY = "quickmeet:meetings";

const isBrowser = () =>
  typeof window !== "undefined" && typeof localStorage !== "undefined";

const readMeetings = (): Record<string, Meeting> => {
  if (!isBrowser()) return {};
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as Record<string, Meeting>) : {};
  } catch {
    return {};
  }
};

const writeMeetings = (meetings: Record<string, Meeting>) => {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
};

const generateId = () => {
  const raw =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10);
  return raw.slice(0, 8).replace(/-/g, "").toUpperCase();
};

export const createMeeting = (title: string, availability: AvailabilityMap) => {
  const meetings = readMeetings();
  const id = generateId();

  const meeting: Meeting = {
    id,
    title,
    organizerAvailability: availability,
    responses: [],
    createdAt: Date.now(),
  };

  writeMeetings({ ...meetings, [id]: meeting });
  return meeting;
};

export const getMeeting = (id: string): Meeting | null => {
  const meetings = readMeetings();
  return meetings[id] ?? null;
};

export const addResponse = (
  id: string,
  response: Omit<ParticipantResponse, "submittedAt">,
): Meeting | null => {
  const meetings = readMeetings();
  const meeting = meetings[id];

  if (!meeting) return null;

  const existing = meeting.responses.filter(
    (item) =>
      item.name.trim().toLowerCase() !== response.name.trim().toLowerCase(),
  );

  const updated: Meeting = {
    ...meeting,
    responses: [...existing, { ...response, submittedAt: Date.now() }],
  };

  writeMeetings({ ...meetings, [id]: updated });
  return updated;
};

export const aggregateAvailability = (meeting: Meeting) => {
  const totals: Record<string, number> = {};
  const participants = [
    { name: "Organizer", availability: meeting.organizerAvailability },
    ...meeting.responses,
  ];

  weekdays.forEach((_, dayIndex) => {
    dayHours.forEach((hour) => {
      const key = `${dayIndex}-${hour}`;
      const count = participants.reduce(
        (acc, participant) => (participant.availability[key] ? acc + 1 : acc),
        0,
      );
      totals[key] = count;
    });
  });

  return {
    heatmap: totals,
    max: Math.max(...Object.values(totals)),
    contributors: participants.length,
  };
};
