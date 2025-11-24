import {
  ArrowRight,
  CalendarClock,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

const HomePage = async ({ params }: HomePageProps) => {
  const { locale } = await params;

  const featureCards = [
    {
      title: "Drag & drop availability",
      description:
        "Paint a calm weekly grid with rounded, Things-inspired cards. No clutter, just blocks that matter.",
      icon: <CalendarClock className="text-primary h-5 w-5" />,
    },
    {
      title: "Shareable meeting IDs",
      description:
        "Generate an 8-character Quickmeet ID and pass around one clean link for everyone to respond.",
      icon: <Share2 className="text-primary h-5 w-5" />,
    },
    {
      title: "See overlap instantly",
      description:
        "Responses flow into a heat-mapped grid so you can spot the best hour without spreadsheets.",
      icon: <Users className="text-primary h-5 w-5" />,
    },
  ];

  return (
    <main className="from-primary/5 via-background to-background min-h-screen bg-gradient-to-b">
      <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 w-full border-b backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href={`/${locale}`} className="text-foreground font-semibold">
            <span className="bg-primary/10 text-primary rounded-xl px-3 py-1 text-sm font-semibold">
              Quickmeet
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}/create`}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Create
            </Link>
            <Link
              href={`/${locale}/results/demo`}
              className={buttonVariants({ size: "sm" })}
            >
              Live demo
            </Link>
          </div>
        </div>
      </header>

      <section className="relative container overflow-hidden py-16 sm:py-20">
        <div
          className="bg-primary/10 absolute inset-0 -z-10 mx-auto max-w-4xl rounded-[32px] blur-3xl"
          aria-hidden
        />
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold">
              <Sparkles className="h-4 w-4" /> New: Quickmeet landing + demo
            </div>
            <h1 className="text-foreground text-4xl leading-tight font-bold sm:text-5xl">
              Replace polls with a weekly drag-and-drop grid.
            </h1>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Quickmeet makes availability feel calm. Paint blocks across a
              Mon–Sun, 24h grid, share an 8-character ID, and watch overlaps
              glow.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${locale}/create`}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "shadow-primary/10 font-semibold shadow-lg",
                )}
              >
                Start a Quickmeet <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href={`/${locale}/meet/demo`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "font-semibold",
                )}
              >
                Open participant view
              </Link>
            </div>
          </div>

          <div className="bg-card/70 shadow-primary/5 rounded-3xl border p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="text-foreground text-sm font-semibold">
                Weekly demo grid
              </p>
              <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
                Mon–Sun
              </span>
            </div>
            <div className="text-muted-foreground mt-4 grid grid-cols-7 gap-2 text-[11px] font-semibold">
              {"MTWTFSS".split("").map((day) => (
                <div
                  key={day}
                  className="border-primary/20 bg-primary/10 text-primary rounded-xl border px-3 py-2 text-center"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {["09:00", "13:00", "17:00"].map((time) => (
                <div
                  key={time}
                  className="border-border/60 bg-background flex items-center gap-3 rounded-2xl border px-3 py-2 shadow-inner"
                >
                  <span className="bg-primary/10 text-primary rounded-full px-2 py-1 text-[11px] font-semibold">
                    {time}
                  </span>
                  <div className="flex flex-1 gap-1">
                    {[...Array(5)].map((_, idx) => (
                      <span
                        key={`${time}-${idx}`}
                        className="bg-primary/70 h-8 flex-1 rounded-xl"
                        style={{ opacity: 0.35 + idx * 0.12 }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground mt-4 text-xs">
              Rounded cards, oklch blues, and subtle shadows keep things in
              focus.
            </p>
          </div>
        </div>
      </section>

      <section className="container pb-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {featureCards.map((card) => (
            <div
              key={card.title}
              className="bg-card/60 rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="text-primary flex items-center gap-2">
                {card.icon}
              </div>
              <h3 className="text-foreground mt-3 text-lg font-semibold">
                {card.title}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default HomePage;
