import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Undo2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_PROFILE_ID } from "@/lib/gk";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/history")({
  component: History,
});

function History() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["task-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_history")
        .select("*, questline:questlines(name)")
        .eq("profile_id", DEFAULT_PROFILE_ID)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  const undoLast = useMutation({
    mutationFn: async () => {
      const last = data?.[0];
      if (!last) throw new Error("Nothing to undo");
      await supabase
        .from("user_quest_progress")
        .update({ current_step: last.old_step ?? 1 })
        .eq("profile_id", DEFAULT_PROFILE_ID)
        .eq("questline_id", last.questline_id);
      await supabase.from("task_history").insert({
        profile_id: DEFAULT_PROFILE_ID,
        questline_id: last.questline_id,
        old_step: last.new_step,
        new_step: last.old_step,
        action: "undo",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task-history"] });
      qc.invalidateQueries({ queryKey: ["npc-detail"] });
      qc.invalidateQueries({ queryKey: ["active-steps"] });
      toast.success("Undone");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif">Task History</h1>
          <p className="text-sm text-muted-foreground">
            Every progress change is logged. Undo the last action if you mis-tapped.
          </p>
        </div>
        <Button onClick={() => undoLast.mutate()} disabled={!data?.length}>
          <Undo2 className="h-4 w-4" /> Undo last action
        </Button>
      </div>

      <Card className="parchment">
        <CardHeader>
          <CardTitle className="ledger-heading text-lg">Chronicle</CardTitle>
        </CardHeader>
        <CardContent>
          {!data?.length ? (
            <p className="text-sm text-muted-foreground">No history yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Questline</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Old</TableHead>
                  <TableHead>New</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((h: any) => (
                  <TableRow key={h.id}>
                    <TableCell className="text-xs">
                      {formatDistanceToNow(new Date(h.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>{h.questline?.name ?? "—"}</TableCell>
                    <TableCell className="capitalize">{h.action.replace(/_/g, " ")}</TableCell>
                    <TableCell className="font-mono text-xs">{h.old_step ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{h.new_step ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
