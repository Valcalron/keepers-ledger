import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_PROFILE_ID } from "@/lib/gk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/audit")({
  component: AuditPage,
});

const SECTIONS: { key: string; label: string }[] = [
  { key: "zombies", label: "Zombies" },
  { key: "tavern", label: "Tavern" },
  { key: "refugee_camp", label: "Refugee Camp" },
  { key: "souls_room", label: "Souls Room" },
  { key: "technologies", label: "Technologies" },
  { key: "recipes", label: "Recipes" },
  { key: "npc_dialogue", label: "NPC Dialogue" },
  { key: "endings_perks", label: "Endings & Perks" },
  { key: "vendor_tiers", label: "Vendor Tiers" },
];

function AuditPage() {
  const qc = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", DEFAULT_PROFILE_ID)
        .single();
      return data;
    },
  });

  const { data: audit } = useQuery({
    queryKey: ["audit"],
    queryFn: async () => {
      const { data } = await supabase
        .from("player_unlock_audit")
        .select("*")
        .eq("profile_id", DEFAULT_PROFILE_ID)
        .order("label");
      return data ?? [];
    },
  });

  const toggleAudit = useMutation({
    mutationFn: async ({ id, unlocked }: { id: string; unlocked: boolean }) => {
      await supabase
        .from("player_unlock_audit")
        .update({ unlocked, updated_at: new Date().toISOString() })
        .eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["audit"] }),
  });

  const toggleDlc = useMutation({
    mutationFn: async (owns: boolean) => {
      await supabase
        .from("profiles")
        .update({ owns_all_dlc: owns })
        .eq("id", DEFAULT_PROFILE_ID);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-serif">Missing Unlock Audit</h1>
          <p className="text-sm text-muted-foreground">
            For players who finished the main game but suspect they missed systems.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-parchment-edge bg-card/60 px-3 py-2">
          <Switch
            id="dlc"
            checked={profile?.owns_all_dlc ?? true}
            onCheckedChange={(v) => toggleDlc.mutate(!!v)}
          />
          <Label htmlFor="dlc" className="text-sm">Owns all DLC</Label>
        </div>
      </div>

      {SECTIONS.map((s) => {
        const rows = (audit ?? []).filter((a) => a.section === s.key);
        const showDlc = profile?.owns_all_dlc ?? true;
        const visible = rows.filter((r) => showDlc || !r.dlc);
        const done = visible.filter((r) => r.unlocked).length;
        return (
          <Card key={s.key} className="parchment">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="ledger-heading text-lg">{s.label}</CardTitle>
              <span className="text-xs text-muted-foreground">
                {done} / {visible.length} unlocked
              </span>
            </CardHeader>
            <CardContent>
              {visible.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing to check here.</p>
              ) : (
                <ul className="space-y-2">
                  {visible.map((row) => (
                    <li
                      key={row.id}
                      className="flex items-start gap-3 rounded border border-parchment-edge bg-card/50 p-2"
                    >
                      <Checkbox
                        checked={row.unlocked}
                        onCheckedChange={(v) =>
                          toggleAudit.mutate({ id: row.id, unlocked: !!v })
                        }
                        className="mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-medium ${
                              row.unlocked ? "line-through text-muted-foreground" : ""
                            }`}
                          >
                            {row.label}
                          </span>
                          {row.dlc && (
                            <Badge variant="outline" className="text-[10px]">DLC</Badge>
                          )}
                        </div>
                        {row.detail && (
                          <div className="text-xs text-muted-foreground">{row.detail}</div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
