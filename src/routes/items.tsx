import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/items")({
  component: ItemsPage,
});

function ItemsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [selected, setSelected] = useState<string | null>(null);

  const { data: items } = useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const { data } = await supabase.from("items").select("*").order("name");
      return data ?? [];
    },
  });

  const categories = useMemo(
    () => Array.from(new Set((items ?? []).map((i) => i.category))).sort(),
    [items],
  );

  const filtered = (items ?? []).filter(
    (i) =>
      (cat === "all" || i.category === cat) &&
      (q === "" || i.name.toLowerCase().includes(q.toLowerCase())),
  );

  const currentSlug = selected ?? filtered[0]?.slug ?? null;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4">
        <h1 className="text-3xl font-serif">Items & Recipes</h1>
        <p className="text-sm text-muted-foreground">
          Search the catalog. Every item shows how to get it, what it makes, and vendors.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <Card className="parchment max-h-[70vh] overflow-auto">
          <CardContent className="p-2">
            <ul className="space-y-1">
              {filtered.map((i) => (
                <li key={i.id}>
                  <button
                    onClick={() => setSelected(i.slug)}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                      currentSlug === i.slug
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{i.name}</span>
                      {i.dlc && (
                        <Badge variant="outline" className="text-[10px]">
                          DLC
                        </Badge>
                      )}
                    </div>
                    <div className="text-[11px] opacity-75 capitalize">{i.category}</div>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="p-3 text-sm text-muted-foreground">No matches.</li>
              )}
            </ul>
          </CardContent>
        </Card>

        {currentSlug && <ItemDetail slug={currentSlug} />}
      </div>
    </div>
  );
}

function ItemDetail({ slug }: { slug: string }) {
  const { data } = useQuery({
    queryKey: ["item-detail", slug],
    queryFn: async () => {
      const { data: item } = await supabase
        .from("items")
        .select("*")
        .eq("slug", slug)
        .single();
      if (!item) return null;
      const [{ data: madeBy }, { data: usedIn }, { data: prices }] =
        await Promise.all([
          supabase
            .from("recipes")
            .select("*, station:stations(name), ingredients:recipe_ingredients(amount, item:items(name, slug))")
            .eq("output_item_id", item.id),
          supabase
            .from("recipe_ingredients")
            .select("amount, recipe:recipes(id, name, output_item_id, station:stations(name))")
            .eq("item_id", item.id),
          supabase
            .from("vendor_prices")
            .select("*, vendor:vendors(name, location, day_available)")
            .eq("item_id", item.id),
        ]);
      return { item, madeBy: madeBy ?? [], usedIn: usedIn ?? [], prices: prices ?? [] };
    },
  });

  if (!data?.item) return null;
  const { item, madeBy, usedIn, prices } = data;

  return (
    <div className="space-y-4">
      <Card className="parchment">
        <CardHeader>
          <CardTitle className="ledger-heading text-2xl flex items-center justify-between">
            <span>{item.name}</span>
            <div className="flex gap-2">
              <Badge variant="outline" className="capitalize">{item.category}</Badge>
              {item.dlc && <Badge>DLC</Badge>}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {item.description && <p className="text-muted-foreground">{item.description}</p>}
          {item.how_to_get && (
            <div><span className="text-muted-foreground">How to get:</span> {item.how_to_get}</div>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            <div><span className="text-muted-foreground">Base buy:</span> {item.base_buy_price ?? "—"}</div>
            <div><span className="text-muted-foreground">Base sell:</span> {item.base_sell_price ?? "—"}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="parchment">
        <CardHeader><CardTitle className="ledger-heading text-lg">Recipes that make it</CardTitle></CardHeader>
        <CardContent>
          {madeBy.length === 0 ? (
            <p className="text-sm text-muted-foreground">Not crafted from a recipe.</p>
          ) : (
            <ul className="space-y-2">
              {madeBy.map((r: any) => (
                <li key={r.id} className="border-b border-parchment-edge pb-2 last:border-0">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Station: {r.station?.name ?? "—"} · Output: ×{r.output_amount} · Energy: {r.energy_cost}
                  </div>
                  <div className="text-xs">
                    Ingredients: {r.ingredients?.map((g: any) => `${g.item?.name} ×${g.amount}`).join(", ") || "—"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="parchment">
        <CardHeader><CardTitle className="ledger-heading text-lg">Recipes that use it</CardTitle></CardHeader>
        <CardContent>
          {usedIn.length === 0 ? (
            <p className="text-sm text-muted-foreground">Not used in any recipe.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {usedIn.map((u: any, i: number) => (
                <li key={i} className="border-b border-parchment-edge py-1 last:border-0">
                  <span className="font-medium">{u.recipe?.name}</span>{" "}
                  <span className="text-xs text-muted-foreground">
                    (×{u.amount}, {u.recipe?.station?.name ?? "—"} → {u.recipe?.output_item?.name})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="parchment">
        <CardHeader><CardTitle className="ledger-heading text-lg">Vendors</CardTitle></CardHeader>
        <CardContent>
          {prices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No vendor recorded.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {prices.map((p: any) => (
                <li key={p.id} className="flex justify-between border-b border-parchment-edge py-1 last:border-0">
                  <span>
                    {p.vendor?.name}{" "}
                    <span className="text-xs text-muted-foreground">
                      ({p.vendor?.location}, {p.vendor?.day_available ?? "any"})
                    </span>
                  </span>
                  <span className="font-mono text-xs">
                    buy {p.buy_price ?? "—"} / sell {p.sell_price ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
