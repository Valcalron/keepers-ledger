import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_PROFILE_ID } from "@/lib/gk";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/npcs")({
  component: NpcTracker,
});

function NpcTracker() {
  const [selected, setSelected] = useState<string | null>(null);

  const { data: npcs } = useQuery({
    queryKey: ["npcs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("npc").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const currentSlug = selected ?? npcs?.[0]?.slug ?? null;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4">
        <h1 className="text-3xl font-serif">NPC Tracker</h1>
        <p className="text-sm text-muted-foreground">
          Manage each NPC's questline. Undo any misstep from Task History.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <Card className="parchment">
          <CardHeader className="pb-2">
            <CardTitle className="ledger-heading text-base">NPCs</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <ul className="space-y-1">
              {npcs?.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => setSelected(n.slug)}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      currentSlug === n.slug
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{n.name}</span>
                      {n.dlc && (
                        <Badge variant="outline" className="text-[10px]">
                          DLC
                        </Badge>
                      )}
                    </div>
                    <div className="text-[11px] opacity-75">
                      {n.day_available ?? "—"} · {n.location}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {currentSlug && <NpcDetail slug={currentSlug} />}
      </div>
    </div>
  );
}

function NpcDetail({ slug }: { slug: string }) {
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["npc-detail", slug],
    queryFn: async () => {
      const { data: npc } = await supabase.from("npc").select("*").eq("slug", slug).single();
      if (!npc) return null;
      const { data: questlines } = await supabase
        .from("questlines")
        .select("*, steps:quest_steps(*)")
        .eq("npc_id", npc.id);
      const { data: progress } = await supabase
        .from("user_quest_progress")
        .select("*")
        .eq("profile_id", DEFAULT_PROFILE_ID);
      return { npc, questlines: questlines ?? [], progress: progress ?? [] };
    },
  });

  const mutate = useMutation({
    mutationFn: async ({
      questlineId,
      oldStep,
      newStep,
      action,
    }: {
      questlineId: string;
      oldStep: number;
      newStep: number;
      action: string;
    }) => {
      await supabase
        .from("user_quest_progress")
        .update({ current_step: newStep, updated_at: new Date().toISOString() })
        .eq("profile_id", DEFAULT_PROFILE_ID)
        .eq("questline_id", questlineId);
      await supabase.from("task_history").insert({
        profile_id: DEFAULT_PROFILE_ID,
        questline_id: questlineId,
        old_step: oldStep,
        new_step: newStep,
        action,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["npc-detail"] });
      qc.invalidateQueries({ queryKey: ["active-steps"] });
      qc.invalidateQueries({ queryKey: ["task-history"] });
      toast.success("Progress updated");
    },
  });

  if (!data?.npc) return null;
  const { npc, questlines, progress } = data;

  return (
    <div className="space-y-4">
      <Card className="parchment">
        <CardHeader>
          <CardTitle className="ledger-heading text-xl flex items-center justify-between">
            <span>{npc.name}</span>
            {npc.dlc && <Badge>DLC</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <div><span className="text-muted-foreground">Location:</span> {npc.location}</div>
          <div><span className="text-muted-foreground">Day:</span> {npc.day_available ?? "—"}</div>
          <div className="sm:col-span-2 text-muted-foreground">{npc.short_description}</div>
        </CardContent>
      </Card>

      {questlines.length === 0 && (
        <p className="text-sm text-muted-foreground">No questlines recorded for this NPC.</p>
      )}

      {questlines.map((q: any) => {
        const p = progress.find((x) => x.questline_id === q.id);
        const currentStep: number = p?.current_step ?? 1;
        const steps = [...(q.steps ?? [])].sort((a: any, b: any) => a.step_number - b.step_number);
        const current = steps.find((s: any) => s.step_number === currentStep);
        const previous = steps.find((s: any) => s.step_number === currentStep - 1);
        const next = steps.find((s: any) => s.step_number === currentStep + 1);

        return (
          <Card key={q.id} className="parchment">
            <CardHeader>
              <CardTitle className="ledger-heading text-lg">{q.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{q.summary}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <StepPanel label="Previous" step={previous} tone="muted" />
                <StepPanel label={`Current — step ${currentStep}`} step={current} tone="current" />
                <StepPanel label="Next" step={next} tone="muted" />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    next
                      ? mutate.mutate({
                          questlineId: q.id,
                          oldStep: currentStep,
                          newStep: currentStep + 1,
                          action: "advance",
                        })
                      : mutate.mutate({
                          questlineId: q.id,
                          oldStep: currentStep,
                          newStep: currentStep,
                          action: "mark_complete",
                        })
                  }
                >
                  <Check className="h-4 w-4" /> Mark Complete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!next}
                  onClick={() =>
                    mutate.mutate({
                      questlineId: q.id,
                      oldStep: currentStep,
                      newStep: currentStep + 1,
                      action: "view_next",
                    })
                  }
                >
                  <ChevronRight className="h-4 w-4" /> View Next Step
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!previous}
                  onClick={() =>
                    mutate.mutate({
                      questlineId: q.id,
                      oldStep: currentStep,
                      newStep: currentStep - 1,
                      action: "view_previous",
                    })
                  }
                >
                  <ChevronLeft className="h-4 w-4" /> View Previous Step
                </Button>
                <UndoLastButton questlineId={q.id} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function StepPanel({
  label,
  step,
  tone,
}: {
  label: string;
  step: any;
  tone: "current" | "muted";
}) {
  return (
    <div
      className={`rounded-md border p-3 ${
        tone === "current"
          ? "border-primary bg-secondary/50"
          : "border-parchment-edge bg-card/50"
      }`}
    >
      <div className="text-[10px] uppercase tracking-widest text-ink-soft">{label}</div>
      {!step ? (
        <div className="mt-1 text-sm text-muted-foreground">—</div>
      ) : (
        <>
          <div className="mt-1 text-sm font-medium">{step.title}</div>
          {step.description && (
            <div className="mt-1 text-xs text-muted-foreground">{step.description}</div>
          )}
          {step.required_items?.length > 0 && (
            <div className="mt-2 text-xs">
              <span className="text-muted-foreground">Bring:</span>{" "}
              {step.required_items.map((r: any) => `${r.slug} ×${r.amount}`).join(", ")}
            </div>
          )}
          {step.reward_notes && (
            <div className="mt-1 text-xs">
              <span className="text-muted-foreground">Reward:</span> {step.reward_notes}
            </div>
          )}
          {step.unlocks && (
            <div className="mt-1 text-xs">
              <span className="text-muted-foreground">Unlocks:</span> {step.unlocks}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function UndoLastButton({ questlineId }: { questlineId: string }) {
  const qc = useQueryClient();
  const undo = useMutation({
    mutationFn: async () => {
      const { data: last } = await supabase
        .from("task_history")
        .select("*")
        .eq("profile_id", DEFAULT_PROFILE_ID)
        .eq("questline_id", questlineId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!last) throw new Error("Nothing to undo");
      await supabase
        .from("user_quest_progress")
        .update({ current_step: last.old_step ?? 1 })
        .eq("profile_id", DEFAULT_PROFILE_ID)
        .eq("questline_id", questlineId);
      await supabase.from("task_history").insert({
        profile_id: DEFAULT_PROFILE_ID,
        questline_id: questlineId,
        old_step: last.new_step,
        new_step: last.old_step,
        action: "undo",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["npc-detail"] });
      qc.invalidateQueries({ queryKey: ["task-history"] });
      toast.success("Undone");
    },
    onError: (e) => toast.error((e as Error).message),
  });
  return (
    <Button size="sm" variant="ghost" onClick={() => undo.mutate()}>
      <Undo2 className="h-4 w-4" /> Undo Last Change
    </Button>
  );
}
