import { supabase } from "@/integrations/supabase/client";

export const DEFAULT_PROFILE_ID = "00000000-0000-0000-0000-000000000001";

export const GK_DAYS = ["Pride", "Gluttony", "Envy", "Wrath", "Sloth", "Lust"] as const;
export type GkDay = (typeof GK_DAYS)[number];

export const DAY_GLYPHS: Record<GkDay, string> = {
  Pride: "☀",
  Gluttony: "♃",
  Envy: "☿",
  Wrath: "♂",
  Sloth: "☾",
  Lust: "♀",
};

export const DAY_VISITORS: Record<GkDay, string> = {
  Pride: "Bishop",
  Gluttony: "Merchant",
  Envy: "Snake",
  Wrath: "Inquisitor",
  Sloth: "Astrologer",
  Lust: "Ms. Charm",
};

export function sb() {
  return supabase;
}
