import { supabase } from "@/integrations/supabase/client";

export const DEFAULT_PROFILE_ID = "00000000-0000-0000-0000-000000000001";

export const GK_DAYS = ["Sloth", "Gluttony", "Envy", "Pride", "Lust", "Wrath"] as const;
export type GkDay = (typeof GK_DAYS)[number];

export const DAY_GLYPHS: Record<GkDay, string> = {
  Sloth: "☾",
  Gluttony: "△",
  Envy: "≈",
  Pride: "≡",
  Lust: "❦",
  Wrath: "☠",
};

export function sb() {
  return supabase;
}
