"use client";

import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";

export type ToastPayload = {
  title: string;
  description?: string;
  tone?: ToastTone;
};

export const useToast = () => {
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hide = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = null;
    setToast(null);
  }, []);

  const showToast = useCallback(
    (payload: ToastPayload) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setToast(payload);
      timeoutRef.current = setTimeout(() => hide(), 2600);
    },
    [hide],
  );

  useEffect(
    () => () => timeoutRef.current && clearTimeout(timeoutRef.current),
    [],
  );

  return useMemo(() => ({ toast, showToast, hide }), [toast, showToast, hide]);
};

export const Toast = ({ toast }: { toast: ToastPayload | null }) => {
  if (!toast) return null;

  const tone = toast.tone ?? "info";

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-full max-w-sm justify-end px-2 sm:right-8 sm:bottom-8">
      <div
        className={cn(
          "bg-card/95 pointer-events-auto flex w-full gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur",
          tone === "success" && "border-primary/30",
          tone === "error" && "border-destructive/40",
          tone === "info" && "border-border",
        )}
      >
        <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
          {tone === "success" && <CheckCircle2 className="h-5 w-5" />}
          {tone === "error" && (
            <AlertTriangle className="text-destructive h-5 w-5" />
          )}
          {tone === "info" && <Info className="h-5 w-5" />}
        </div>
        <div className="flex flex-1 flex-col">
          <p className="text-sm leading-tight font-semibold">{toast.title}</p>
          {toast.description ? (
            <p className="text-muted-foreground mt-1 text-sm leading-snug">
              {toast.description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};
