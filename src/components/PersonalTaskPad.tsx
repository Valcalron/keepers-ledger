import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { GK_DAYS, type GkDay } from "@/lib/gk";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const STORAGE_KEY = "keepers-ledger-personal-tasks-v1";

type PersonalTask = {
  id: string;
  title: string;
  note: string;
  day: GkDay | "Any";
  priority: "High" | "Normal" | "Low";
  done: boolean;
  blocked: boolean;
  createdAt: string;
};

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadTasks(): PersonalTask[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks: PersonalTask[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function PersonalTaskPad({ day }: { day: GkDay }) {
  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [taskDay, setTaskDay] = useState<GkDay | "Any">(day);
  const [priority, setPriority] = useState<PersonalTask["priority"]>("Normal");

  useEffect(() => {
    setTasks(loadTasks());
  }, []);

  useEffect(() => {
    setTaskDay(day);
  }, [day]);

  function commit(next: PersonalTask[]) {
    setTasks(next);
    saveTasks(next);
  }

  function addTask() {
    const trimmed = title.trim();
    if (!trimmed) return;
    commit([
      {
        id: createId(),
        title: trimmed,
        note: note.trim(),
        day: taskDay,
        priority,
        done: false,
        blocked: false,
        createdAt: new Date().toISOString(),
      },
      ...tasks,
    ]);
    setTitle("");
    setNote("");
    setPriority("Normal");
  }

  function patchTask(id: string, patch: Partial<PersonalTask>) {
    commit(tasks.map((task) => (task.id === id ? { ...task, ...patch } : task)));
  }

  function deleteTask(id: string) {
    commit(tasks.filter((task) => task.id !== id));
  }

  const visibleTasks = useMemo(
    () => tasks.filter((task) => !task.done && (task.day === "Any" || task.day === day)),
    [tasks, day],
  );
  const blockedTasks = tasks.filter((task) => !task.done && task.blocked);
  const completedCount = tasks.filter((task) => task.done).length;

  return (
    <Card className="parchment">
      <CardHeader>
        <CardTitle className="ledger-heading text-lg">Personal task pad</CardTitle>
        <p className="text-xs text-muted-foreground">
          Fast notes for the thing the game told you once. Saved only in this browser.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 lg:grid-cols-[1fr_150px_120px_auto]">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") addTask();
            }}
            placeholder="Example: Bring silver star wine to Gerry"
          />
          <select
            value={taskDay}
            onChange={(event) => setTaskDay(event.target.value as GkDay | "Any")}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="Any">Any day</option>
            {GK_DAYS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as PersonalTask["priority"])}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option>High</option>
            <option>Normal</option>
            <option>Low</option>
          </select>
          <Button onClick={addTask}>
            <Plus className="h-4 w-4" /> Add
          </Button>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional note: where, item count, why you need it, or what blocks it."
            className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm lg:col-span-4"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">Today: {visibleTasks.length}</Badge>
          <Badge variant="outline">Blocked: {blockedTasks.length}</Badge>
          <Badge variant="outline">Completed: {completedCount}</Badge>
        </div>

        {visibleTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No personal reminders for {day}. Add one before you sleep in-game.
          </p>
        ) : (
          <ul className="space-y-2">
            {visibleTasks.map((task) => (
              <li key={task.id} className="rounded-md border border-parchment-edge bg-card/60 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium">{task.title}</div>
                    {task.note && <div className="mt-1 text-xs text-muted-foreground">{task.note}</div>}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant={task.priority === "High" ? "default" : "secondary"}>{task.priority}</Badge>
                    <Badge variant="outline">{task.day}</Badge>
                    {task.blocked && <Badge variant="destructive">Blocked</Badge>}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => patchTask(task.id, { done: true })}>Done</Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => patchTask(task.id, { blocked: !task.blocked })}
                  >
                    {task.blocked ? "Unblock" : "Block"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteTask(task.id)}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
