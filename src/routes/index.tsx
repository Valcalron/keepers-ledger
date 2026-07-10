import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_PROFILE_ID, GK_DAYS, type GkDay } from "@/lib/gk";
import { DaySelector } from "@/components/DaySelector";
import { PersonalTaskPad } from "@/components/PersonalTaskPad";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

type NpcSummary = {
  id: string;
  name: string;
  location: string | null;
  short_description: string | null;
  day_available: GkDay | null;
  dlc: boolean;
};

type Step = {
  id: string;
  step_number: number;
  title: string;
  description: string | null;
  required_items: Array<{ slug: string; amount: number }>;
  dependencies: string[];
  questline: {
    id: string;
    slug: string;
    name: string;
    dlc: boolean;
    npc: { name: string; day_available: GkDay | null } | null;
  };
};

const LOCAL_NPCS: NpcSummary[] = [
  {
    id: "local-bishop",
    name: "Bishop",
    location: "Graveyard / Church",
    short_description: "Church, sermons, graveyard quality, and early unlocks.",
    day_available: "Pride",
    dlc: false,
  },
  {
    id: "local-merchant",
    name: "Merchant",
    location: "Trade office south of the tavern",
    short_description: "Garden, trade license, crates, and merchant questline.",
    day_available: "Gluttony",
    dlc: false,
  },
  {
    id: "local-snake",
    name: "Snake",
    location: "Cellar / Alchemy Lab / Dungeon",
    short_description: "Early nights at first, then Envy after the gate is opened.",
    day_available: "Envy",
    dlc: false,
  },
  {
    id: "local-inquisitor",
    name: "Inquisitor",
    location: "Witch Hill",
    short_description: "Witch Hill, vineyard access, dark organs, and main quest progress.",
    day_available: "Wrath",
    dlc: false,
  },
  {
    id: "local-astrologer",
    name: "Astrologer",
    location: "Sealight Lighthouse",
    short_description: "Writing supplies, science, Snake links, and main quest pieces.",
    day_available: "Sloth",
    dlc: false,
  },
  {
    id: "local-ms-charm",
    name: "Ms. Charm",
    location: "The Dead Horse",
    short_description: "Songs, social quests, Snake links, and late main quest pieces.",
    day_available: "Lust",
    dlc: false,
  },
];

function Dashboard() {
  const [day, setDay] = useState<GkDay>(GK_DAYS[0]);

  const { data: npcs } = useQuery({
    queryKey: ["npcs-by-day", day],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("npc")
          .select("*")
          .eq("day_available", day)
          .order("name");
        if (error) throw error;
        return (data?.length ? data : LOCAL_NPCS.filter((npc) => npc.day_available === day)) as NpcSummary[];
      } catch {
        return LOCAL_NPCS.filter((npc) => npc.day_available === day);
      }
    },
  });

  const { data: activeSteps } = useQuery({
    queryKey: ["active-steps"],
    queryFn: async () => {
      try {
        const { data: progress, error: pErr } = await supabase
          .from("user_quest_progress")
          .select("questline_id, current_step, completed")
          .eq("profile_id", DEFAULT_PROFILE_ID)
          .eq("completed", false);
        if (pErr) throw pErr;
        if (!progress?.length) return [] as Step[];

        const pairs = progress.map((p) => ({ q: p.questline_id, s: p.current_step }));
        const { data: steps, error: sErr } = await supabase
          .from("quest_steps")
          .select(
            "id, step_number, title, description, required_items, dependencies, questline:questlines(id, slug, name, dlc, npc:npc(name, day_available))",
          )
          .in(
            "questline_id",
            pairs.map((p) => p.q),
          );
        if (sErr) throw sErr;

        return (steps ?? []).filter((s: any) =>
          pairs.some((p) => p.q === s.questline.id && p.s === s.step_number),
        ) as unknown as Step[];
      } catch {
        return [] as Step[];
      }
    },
  });

  const { itemsToBring, blocked } = useMemo(() => {
    const items: Record<string, number> = {};
    const blockedList: Array<{ title: string; reason: string }> = [];
    for (const s of activeSteps ?? []) {
      for (const req of s.required_items ?? []) {
        items[req.slug] = (items[req.slug] ?? 0) + req.amount;
      }
      if (s.questline.npc?.day_available && s.questline.npc.day_available !== day) {
        blockedList.push({
          title: `${s.questline.name} — ${s.title}`,
          reason: `NPC ${s.questline.npc.name} only available on ${s.questline.npc.day_available} day.`,
        });
      }
      if (s.dependencies && s.dependencies.length > 0) {
        blockedList.push({
          title: `${s.questline.name} — ${s.title}`,
          reason: `Depends on: ${s.dependencies.join(", ")}`,
        });
      }
    }
    return { itemsToBring: items, blocked: blockedList };
  }, [activeSteps, day]);

  const todaySteps = (activeSteps ?? []).filter(
    (s) => !s.questline.npc?.day_available || s.questline.npc.day_available === day,
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-ink">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Set the in-game day, capture your own reminders, and see what the ledger thinks is next.
        </p>
      </div>

      <div className="parchment rounded-lg p-4">
        <div className="mb-3 text-xs uppercase tracking-widest text-ink-soft">
          In-game day
        </div>
        <DaySelector value={day} onChange={setDay} />
        <div className="mt-2 text-xs text-muted-foreground">
          Cycle order: {GK_DAYS.join(" · ")}
        </div>
      </div>

      <PersonalTaskPad day={day} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="parchment">
          <CardHeader>
            <CardTitle className="ledger-heading text-lg">
              NPCs available on {day}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!npcs?.length ? (
              <p className="text-sm text-muted-foreground">
                No NPCs recorded for this day.
              </p>
            ) : (
              <ul className="space-y-2">
                {npcs.map((n) => (
                  <li
                    key={n.id}
                    className="flex items-center justify-between border-b border-parchment-edge pb-2 last:border-0"
                  >
                    <div>
                      <div className="font-medium">{n.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {n.location ?? "Unknown"} — {n.short_description}
                      </div>
                    </div>
                    {n.dlc && <Badge variant="secondary">DLC</Badge>}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="parchment">
          <CardHeader>
            <CardTitle className="ledger-heading text-lg">
              Active tasks for today
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!todaySteps.length ? (
              <p className="text-sm text-muted-foreground">
                No database quest steps loaded. Use the personal task pad above while we build the checklist out.
              </p>
            ) : (
              <ul className="space-y-2">
                {todaySteps.map((s) => (
                  <li key={s.id} className="border-b border-parchment-edge pb-2 last:border-0">
                    <div className="font-medium">
                      {s.questline.name}: {s.title}
                    </div>
                    {s.description && (
                      <div className="text-xs text-muted-foreground">{s.description}</div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="parchment">
          <CardHeader>
            <CardTitle className="ledger-heading text-lg">Items to bring</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(itemsToBring).length === 0 ? (
              <p className="text-sm text-muted-foreground">Add item reminders in the personal task pad notes.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {Object.entries(itemsToBring).map(([slug, amt]) => (
                  <li key={slug} className="flex justify-between border-b border-parchment-edge py-1 last:border-0">
                    <span className="capitalize">{slug.replace(/_/g, " ")}</span>
                    <span className="font-mono">×{amt}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="parchment">
          <CardHeader>
            <CardTitle className="ledger-heading text-lg">Blocked tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {blocked.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing blocked in the database tracker.</p>
            ) : (
              <ul className="space-y-2">
                {blocked.map((b, i) => (
                  <li key={i} className="border-b border-parchment-edge pb-2 last:border-0">
                    <div className="font-medium">{b.title}</div>
                    <div className="text-xs text-crimson">{b.reason}</div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
