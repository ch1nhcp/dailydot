"use client";

import { Fragment, useCallback, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const hours = Array.from({ length: 24 }, (_, i) => i);

export type AvailabilityMap = Record<string, boolean>;

export type Heatmap = Record<string, number>;

const slotKey = (dayIndex: number, hour: number) => `${dayIndex}-${hour}`;

const formatHour = (hour: number) =>
  `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}${hour >= 12 ? "p" : "a"}`;

export type AvailabilityGridProps = {
  value: AvailabilityMap;
  onChange?: (next: AvailabilityMap) => void;
  readOnly?: boolean;
  heatmap?: Heatmap;
  maxHeat?: number;
  legend?: string;
};

export const AvailabilityGrid = ({
  value,
  onChange,
  readOnly = false,
  heatmap,
  maxHeat,
  legend,
}: AvailabilityGridProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragIntent = useRef<boolean | null>(null);

  const handleToggle = useCallback(
    (key: string, nextValue: boolean) => {
      if (!onChange) return;
      onChange({ ...value, [key]: nextValue });
    },
    [onChange, value],
  );

  const handleStart = useCallback(
    (key: string) => {
      if (readOnly) return;
      const currentlySelected = Boolean(value[key]);
      const nextValue = !currentlySelected;
      dragIntent.current = nextValue;
      handleToggle(key, nextValue);
      setIsDragging(true);
    },
    [handleToggle, readOnly, value],
  );

  const handleEnter = useCallback(
    (key: string) => {
      if (!isDragging || readOnly || dragIntent.current === null) return;
      handleToggle(key, dragIntent.current);
    },
    [handleToggle, isDragging, readOnly],
  );

  const handleEnd = useCallback(() => {
    dragIntent.current = null;
    setIsDragging(false);
  }, []);

  const maxHeatValue = useMemo(
    () => maxHeat ?? Math.max(...Object.values(heatmap ?? { 0: 0 })),
    [heatmap, maxHeat],
  );

  return (
    <div className="bg-card/60 w-full overflow-hidden rounded-2xl border p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3">
        <div className="space-y-1">
          <p className="text-foreground text-sm font-semibold">Weekly grid</p>
          <p className="text-muted-foreground text-sm">
            Drag to paint blocks across Mon–Sun, 24 hours.
          </p>
        </div>
        {legend ? (
          <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
            {legend}
          </span>
        ) : null}
      </div>
      <div
        className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))]"
        onPointerUp={handleEnd}
        onPointerLeave={handleEnd}
      >
        <div className="h-10" aria-hidden />
        {days.map((day) => (
          <div
            key={day}
            className="text-muted-foreground flex h-10 items-center justify-center text-xs font-semibold"
          >
            {day}
          </div>
        ))}
        {hours.map((hour) => (
          <Fragment key={hour}>
            <div className="text-muted-foreground flex h-12 items-center justify-end pr-3 text-[11px] tracking-wide uppercase">
              {formatHour(hour)}
            </div>
            {days.map((day, dayIndex) => {
              const key = slotKey(dayIndex, hour);
              const selected = Boolean(value[key]);
              const count = heatmap?.[key] ?? 0;
              const intensity = maxHeatValue > 0 ? count / maxHeatValue : 0;
              const backgroundTint =
                !selected && intensity > 0
                  ? `linear-gradient(135deg, color-mix(in oklab, var(--primary) ${Math.max(
                      intensity * 90,
                      12,
                    )}%, transparent), transparent)`
                  : undefined;

              return (
                <button
                  key={key}
                  type="button"
                  aria-label={`${day} ${hour}:00`}
                  onPointerDown={() => handleStart(key)}
                  onPointerEnter={() => handleEnter(key)}
                  className={cn(
                    "relative flex h-12 w-full items-center justify-center rounded-xl border text-xs transition",
                    selected
                      ? "border-primary/40 bg-primary/90 text-primary-foreground shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                      : "border-border/70 bg-background/70 text-muted-foreground hover:border-primary/30 hover:bg-primary/5",
                    readOnly && "cursor-default",
                  )}
                  style={{ backgroundImage: backgroundTint }}
                >
                  {selected ? (
                    <span className="bg-primary-foreground h-2 w-2 rounded-full" />
                  ) : null}
                  {!selected && intensity > 0 ? (
                    <span className="bg-primary/15 text-primary absolute right-1 bottom-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                      {count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export const emptyAvailability = () => {
  const slots: AvailabilityMap = {};
  days.forEach((_, dayIndex) => {
    hours.forEach((hour) => {
      slots[slotKey(dayIndex, hour)] = false;
    });
  });
  return slots;
};

export const countActiveSlots = (availability: AvailabilityMap) =>
  Object.values(availability).filter(Boolean).length;

export const weekdays = days;
export const dayHours = hours;
