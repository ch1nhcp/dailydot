import { env } from "@/env.mjs";

export const siteConfig = {
  title: "Quickmeet by Daily Dot",
  description:
    "Coordinate availability in minutes with Quickmeet. Share a short meeting link, gather blocks from your team, and see overlap instantly in a clean, Things-inspired UI.",
  keywords: ["Scheduling", "Meetings", "Availability", "Next.js"],
  url: env.APP_URL,
  googleSiteVerificationId: env.GOOGLE_SITE_VERIFICATION_ID || "",
};
