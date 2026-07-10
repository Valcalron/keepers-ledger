import { GK_DAYS, DAY_GLYPHS, DAY_VISITORS, type GkDay } from "@/lib/gk";
import { cn } from "@/lib/utils";

export function DaySelector({
  value,
  onChange,
}: {
  value: GkDay;
  onChange: (d: GkDay) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
      {GK_DAYS.map((d) => {
        const active = d === value;
        return (
          <button
            key={d}
            onClick={() => onChange(d)}
            className={cn(
              "min-h-20 rounded-md border px-3 py-2 text-center transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground shadow"
                : "border-border bg-card hover:bg-secondary",
            )}
          >
            <div className="text-lg leading-none">{DAY_GLYPHS[d]}</div>
            <div className="mt-1 text-xs font-medium">{d}</div>
            <div className="mt-0.5 text-[11px] opacity-75">{DAY_VISITORS[d]}</div>
          </button>
        );
      })}
    </div>
  );
}
