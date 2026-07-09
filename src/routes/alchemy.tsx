import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/alchemy")({
  component: AlchemyPage,
});

const STATIONS = [
  { key: "powders", label: "Powders", type: "powder", station: "mortar" },
  { key: "solutions", label: "Solutions", type: "solution", station: "alchemy_workbench_i" },
  { key: "extracts", label: "Extracts", type: "extract", station: "alchemy_workbench_ii" },
  { key: "wb1", label: "Workbench I", type: null, station: "alchemy_workbench_i" },
  { key: "wb2", label: "Workbench II", type: null, station: "alchemy_workbench_ii" },
] as const;

function AlchemyPage() {
  const { data } = useQuery({
    queryKey: ["alchemy"],
    queryFn: async () => {
      const [{ data: comps }, { data: recs }] = await Promise.all([
        supabase
          .from("alchemy_components")
          .select("*, source_item:items(name, slug)")
          .order("name"),
        supabase
          .from("alchemy_recipes")
          .select("*, result_item:items(name, slug)")
          .order("name"),
      ]);
      return { comps: comps ?? [], recs: recs ?? [] };
    },
  });

  if (!data) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="text-3xl font-serif">Alchemy</h1>
        <p className="text-sm text-muted-foreground">
          Powders, solutions, extracts, and workbench recipes.
        </p>
      </div>

      <Tabs defaultValue="powders">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
          {STATIONS.map((s) => (
            <TabsTrigger key={s.key} value={s.key}>
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {STATIONS.map((s) => {
          const comps = s.type ? data.comps.filter((c) => c.component_type === s.type) : [];
          const recs = data.recs.filter((r) => r.station === s.station);
          return (
            <TabsContent key={s.key} value={s.key} className="space-y-4">
              {s.type && (
                <Card className="parchment">
                  <CardContent className="p-4">
                    <h2 className="ledger-heading mb-3 text-lg">Components</h2>
                    {comps.length === 0 ? (
                      <p className="text-sm text-muted-foreground">None recorded.</p>
                    ) : (
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {comps.map((c) => (
                          <li
                            key={c.id}
                            className="rounded border border-parchment-edge bg-card/60 p-2 text-sm"
                          >
                            <div className="flex justify-between">
                              <span className="font-medium">{c.name}</span>
                              {c.dlc && <Badge variant="secondary">DLC</Badge>}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Element: {c.element ?? "—"} · Source: {(c.source_item as any)?.name ?? "—"} · Station: {c.station}
                            </div>
                            {c.notes && (
                              <div className="mt-1 text-xs text-muted-foreground">{c.notes}</div>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card className="parchment">
                <CardContent className="p-4">
                  <h2 className="ledger-heading mb-3 text-lg">Recipes ({s.station})</h2>
                  {recs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recipes here yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {recs.map((r: any) => (
                        <li
                          key={r.id}
                          className="rounded border border-parchment-edge bg-card/60 p-3 text-sm"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium">{r.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Result: {r.result_item?.name ?? "—"} · Energy: {r.energy_cost}
                              </div>
                            </div>
                            {r.dlc && <Badge>DLC</Badge>}
                          </div>
                          <div className="mt-2 text-xs">
                            Ingredients:{" "}
                            {(r.ingredients as any[])
                              ?.map((i) => `${i.slug} ×${i.amount}`)
                              .join(", ") || "—"}
                          </div>
                          {r.notes && (
                            <div className="mt-1 text-xs text-muted-foreground">{r.notes}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
