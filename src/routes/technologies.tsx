import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/technologies")({
  component: TechPage,
});

function TechPage() {
  const [openLock, setOpenLock] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["tech-full"],
    queryFn: async () => {
      const [{ data: trees }, { data: techs }, { data: reqs }, { data: unlocks }] =
        await Promise.all([
          supabase.from("technology_trees").select("*").order("name"),
          supabase.from("technologies").select("*").order("name"),
          supabase.from("technology_requirements").select("*"),
          supabase
            .from("technology_unlocks")
            .select(
              "*, recipe:recipes(name), station:stations(name)",
            ),
        ]);
      return {
        trees: trees ?? [],
        techs: techs ?? [],
        reqs: reqs ?? [],
        unlocks: unlocks ?? [],
      };
    },
  });

  if (!data) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-serif">Technologies</h1>
        <p className="text-sm text-muted-foreground">
          Point costs, prerequisites, and unlocks. Tap a tech to see why it might be locked.
        </p>
      </div>

      {data.trees.map((tree) => {
        const treeTechs = data.techs.filter((t) => t.tree_id === tree.id);
        return (
          <Card key={tree.id} className="parchment">
            <CardHeader>
              <CardTitle className="ledger-heading text-xl">{tree.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{tree.description}</p>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {treeTechs.map((tech) => {
                const reqs = data.reqs.filter((r) => r.technology_id === tech.id);
                const unlocks = data.unlocks.filter((u) => u.technology_id === tech.id);
                return (
                  <div
                    key={tech.id}
                    className="rounded-md border border-parchment-edge bg-card/60 p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-medium">{tech.name}</div>
                      {tech.dlc && <Badge variant="secondary">DLC</Badge>}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
                      {tech.red_cost > 0 && (
                        <span className="rounded bg-red-900/20 px-1.5 py-0.5 text-red-800">
                          ● {tech.red_cost} red
                        </span>
                      )}
                      {tech.green_cost > 0 && (
                        <span className="rounded bg-green-900/20 px-1.5 py-0.5 text-green-800">
                          ● {tech.green_cost} green
                        </span>
                      )}
                      {tech.blue_cost > 0 && (
                        <span className="rounded bg-blue-900/20 px-1.5 py-0.5 text-blue-800">
                          ● {tech.blue_cost} blue
                        </span>
                      )}
                      {tech.soul_cost > 0 && (
                        <span className="rounded bg-purple-900/20 px-1.5 py-0.5 text-purple-800">
                          {tech.soul_cost} soul
                        </span>
                      )}
                      {tech.gratitude_cost > 0 && (
                        <span className="rounded bg-yellow-900/20 px-1.5 py-0.5 text-yellow-800">
                          {tech.gratitude_cost} gratitude
                        </span>
                      )}
                    </div>
                    {tech.description && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {tech.description}
                      </div>
                    )}
                    {unlocks.length > 0 && (
                      <div className="mt-2 text-xs">
                        <span className="text-muted-foreground">Unlocks:</span>{" "}
                        {unlocks
                          .map(
                            (u: any) =>
                              u.unlocks_label ||
                              u.recipe?.name ||
                              u.station?.name ||
                              "—",
                          )
                          .join(", ")}
                      </div>
                    )}
                    <button
                      onClick={() =>
                        setOpenLock(openLock === tech.id ? null : tech.id)
                      }
                      className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Lock className="h-3 w-3" /> Why is this locked?
                    </button>
                    {openLock === tech.id && (
                      <div className="mt-2 rounded border border-parchment-edge bg-parchment/60 p-2 text-xs">
                        {reqs.length === 0 && !tech.dlc ? (
                          <div>No hard requirements — buy when you have the points.</div>
                        ) : (
                          <ul className="space-y-1">
                            {tech.dlc && <li>• Requires DLC ownership.</li>}
                            {reqs.map((r) => (
                              <li key={r.id}>
                                •{" "}
                                {r.prerequisite_technology_id
                                  ? `Prerequisite tech: ${data.techs.find((t) => t.id === r.prerequisite_technology_id)?.name}`
                                  : null}
                                {r.npc_slug ? ` · NPC: ${r.npc_slug}` : ""}
                                {r.quest_slug ? ` · Quest: ${r.quest_slug}` : ""}
                                {r.note ? ` — ${r.note}` : ""}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
