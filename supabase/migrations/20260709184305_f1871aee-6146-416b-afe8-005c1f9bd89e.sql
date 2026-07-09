
-- =========================================================
-- ENUMS
-- =========================================================
CREATE TYPE public.gk_day AS ENUM ('Moon','Water','Fire','Wind','Tree','Bone');
CREATE TYPE public.alchemy_component_type AS ENUM ('powder','solution','extract','oil','base');
CREATE TYPE public.alchemy_station AS ENUM ('mortar','alchemy_workbench_i','alchemy_workbench_ii','kiln','still');
CREATE TYPE public.tech_point_color AS ENUM ('red','green','blue');
CREATE TYPE public.audit_section AS ENUM ('zombies','tavern','refugee_camp','souls_room','technologies','recipes','npc_dialogue','endings_perks','vendor_tiers');

-- =========================================================
-- PROFILES  (single default row; no auth)
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL DEFAULT 'Keeper',
  owns_all_dlc BOOLEAN NOT NULL DEFAULT TRUE,
  current_day public.gk_day NOT NULL DEFAULT 'Moon',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO anon, authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles open" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.profiles (id, display_name)
VALUES ('00000000-0000-0000-0000-000000000001','Keeper');

-- =========================================================
-- STATIONS
-- =========================================================
CREATE TABLE public.stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  notes TEXT
);
GRANT SELECT ON public.stations TO anon, authenticated;
GRANT ALL ON public.stations TO service_role;
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stations read" ON public.stations FOR SELECT USING (true);

-- =========================================================
-- VENDORS
-- =========================================================
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  location TEXT,
  day_available public.gk_day,
  dlc BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT
);
GRANT SELECT ON public.vendors TO anon, authenticated;
GRANT ALL ON public.vendors TO service_role;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendors read" ON public.vendors FOR SELECT USING (true);

-- =========================================================
-- ITEMS
-- =========================================================
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  dlc BOOLEAN NOT NULL DEFAULT FALSE,
  how_to_get TEXT,
  base_buy_price NUMERIC,
  base_sell_price NUMERIC,
  description TEXT
);
GRANT SELECT ON public.items TO anon, authenticated;
GRANT ALL ON public.items TO service_role;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "items read" ON public.items FOR SELECT USING (true);
CREATE INDEX ON public.items (category);
CREATE INDEX ON public.items (name);

-- =========================================================
-- VENDOR PRICES
-- =========================================================
CREATE TABLE public.vendor_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  buy_price NUMERIC,
  sell_price NUMERIC,
  notes TEXT,
  UNIQUE(vendor_id, item_id)
);
GRANT SELECT ON public.vendor_prices TO anon, authenticated;
GRANT ALL ON public.vendor_prices TO service_role;
ALTER TABLE public.vendor_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendor_prices read" ON public.vendor_prices FOR SELECT USING (true);

-- =========================================================
-- RECIPES
-- =========================================================
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  station_id UUID REFERENCES public.stations(id) ON DELETE SET NULL,
  output_item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
  output_amount INTEGER NOT NULL DEFAULT 1,
  energy_cost NUMERIC NOT NULL DEFAULT 0,
  dlc BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT
);
GRANT SELECT ON public.recipes TO anon, authenticated;
GRANT ALL ON public.recipes TO service_role;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recipes read" ON public.recipes FOR SELECT USING (true);

CREATE TABLE public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL DEFAULT 1
);
GRANT SELECT ON public.recipe_ingredients TO anon, authenticated;
GRANT ALL ON public.recipe_ingredients TO service_role;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recipe_ingredients read" ON public.recipe_ingredients FOR SELECT USING (true);

-- =========================================================
-- TECHNOLOGY
-- =========================================================
CREATE TABLE public.technology_trees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT
);
GRANT SELECT ON public.technology_trees TO anon, authenticated;
GRANT ALL ON public.technology_trees TO service_role;
ALTER TABLE public.technology_trees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tech_trees read" ON public.technology_trees FOR SELECT USING (true);

CREATE TABLE public.technologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES public.technology_trees(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  red_cost INTEGER NOT NULL DEFAULT 0,
  green_cost INTEGER NOT NULL DEFAULT 0,
  blue_cost INTEGER NOT NULL DEFAULT 0,
  soul_cost INTEGER NOT NULL DEFAULT 0,
  gratitude_cost INTEGER NOT NULL DEFAULT 0,
  dlc BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT
);
GRANT SELECT ON public.technologies TO anon, authenticated;
GRANT ALL ON public.technologies TO service_role;
ALTER TABLE public.technologies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "technologies read" ON public.technologies FOR SELECT USING (true);

CREATE TABLE public.technology_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technology_id UUID NOT NULL REFERENCES public.technologies(id) ON DELETE CASCADE,
  prerequisite_technology_id UUID REFERENCES public.technologies(id) ON DELETE CASCADE,
  npc_slug TEXT,
  quest_slug TEXT,
  dlc_required BOOLEAN NOT NULL DEFAULT FALSE,
  note TEXT
);
GRANT SELECT ON public.technology_requirements TO anon, authenticated;
GRANT ALL ON public.technology_requirements TO service_role;
ALTER TABLE public.technology_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tech_reqs read" ON public.technology_requirements FOR SELECT USING (true);

CREATE TABLE public.technology_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technology_id UUID NOT NULL REFERENCES public.technologies(id) ON DELETE CASCADE,
  unlocks_recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
  unlocks_station_id UUID REFERENCES public.stations(id) ON DELETE SET NULL,
  unlocks_label TEXT
);
GRANT SELECT ON public.technology_unlocks TO anon, authenticated;
GRANT ALL ON public.technology_unlocks TO service_role;
ALTER TABLE public.technology_unlocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tech_unlocks read" ON public.technology_unlocks FOR SELECT USING (true);

-- =========================================================
-- NPC + QUESTS
-- =========================================================
CREATE TABLE public.npc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  location TEXT,
  day_available public.gk_day,
  dlc BOOLEAN NOT NULL DEFAULT FALSE,
  short_description TEXT
);
GRANT SELECT ON public.npc TO anon, authenticated;
GRANT ALL ON public.npc TO service_role;
ALTER TABLE public.npc ENABLE ROW LEVEL SECURITY;
CREATE POLICY "npc read" ON public.npc FOR SELECT USING (true);

CREATE TABLE public.questlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  npc_id UUID REFERENCES public.npc(id) ON DELETE SET NULL,
  dlc BOOLEAN NOT NULL DEFAULT FALSE,
  summary TEXT
);
GRANT SELECT ON public.questlines TO anon, authenticated;
GRANT ALL ON public.questlines TO service_role;
ALTER TABLE public.questlines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "questlines read" ON public.questlines FOR SELECT USING (true);

CREATE TABLE public.quest_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questline_id UUID NOT NULL REFERENCES public.questlines(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  required_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  dependencies JSONB NOT NULL DEFAULT '[]'::jsonb,
  reward_notes TEXT,
  unlocks TEXT,
  UNIQUE(questline_id, step_number)
);
GRANT SELECT ON public.quest_steps TO anon, authenticated;
GRANT ALL ON public.quest_steps TO service_role;
ALTER TABLE public.quest_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quest_steps read" ON public.quest_steps FOR SELECT USING (true);

-- =========================================================
-- USER PROGRESS + HISTORY
-- =========================================================
CREATE TABLE public.user_quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  questline_id UUID NOT NULL REFERENCES public.questlines(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 1,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_id, questline_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_quest_progress TO anon, authenticated;
GRANT ALL ON public.user_quest_progress TO service_role;
ALTER TABLE public.user_quest_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progress open" ON public.user_quest_progress FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  questline_id UUID NOT NULL REFERENCES public.questlines(id) ON DELETE CASCADE,
  old_step INTEGER,
  new_step INTEGER,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_history TO anon, authenticated;
GRANT ALL ON public.task_history TO service_role;
ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "history open" ON public.task_history FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX ON public.task_history (profile_id, created_at DESC);

-- =========================================================
-- ALCHEMY
-- =========================================================
CREATE TABLE public.alchemy_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  component_type public.alchemy_component_type NOT NULL,
  element TEXT,
  source_item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
  station public.alchemy_station,
  dlc BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT
);
GRANT SELECT ON public.alchemy_components TO anon, authenticated;
GRANT ALL ON public.alchemy_components TO service_role;
ALTER TABLE public.alchemy_components ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alch_comp read" ON public.alchemy_components FOR SELECT USING (true);

CREATE TABLE public.alchemy_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  station public.alchemy_station NOT NULL,
  result_item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  energy_cost NUMERIC NOT NULL DEFAULT 0,
  dlc BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT
);
GRANT SELECT ON public.alchemy_recipes TO anon, authenticated;
GRANT ALL ON public.alchemy_recipes TO service_role;
ALTER TABLE public.alchemy_recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alch_rec read" ON public.alchemy_recipes FOR SELECT USING (true);

-- =========================================================
-- AUDIT CHECKLIST
-- =========================================================
CREATE TABLE public.player_unlock_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  section public.audit_section NOT NULL,
  label TEXT NOT NULL,
  detail TEXT,
  unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  dlc BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_id, section, label)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.player_unlock_audit TO anon, authenticated;
GRANT ALL ON public.player_unlock_audit TO service_role;
ALTER TABLE public.player_unlock_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit open" ON public.player_unlock_audit FOR ALL USING (true) WITH CHECK (true);

-- =========================================================
-- SEED DATA (original short placeholder text)
-- =========================================================

-- Stations
INSERT INTO public.stations (slug, name, notes) VALUES
 ('workbench','Carpenter Workbench','Wood shaping and simple builds.'),
 ('forge','Forge','Metal parts and tools.'),
 ('kitchen','Kitchen','Cooking food items.'),
 ('mortar','Mortar','Grind items into powders.'),
 ('alch_wb_i','Alchemy Workbench I','Tier I potions.'),
 ('alch_wb_ii','Alchemy Workbench II','Tier II potions.'),
 ('church_altar','Church Altar','Sermon prep.');

-- Vendors
INSERT INTO public.vendors (slug, name, location, day_available, dlc, notes) VALUES
 ('merchant_town','Town Merchant','Town Square','Water',FALSE,'General trader.'),
 ('witch','Witch','Swamp Hut','Moon',TRUE,'Sells alchemy oddities.'),
 ('smith','Smith','Forge Row','Fire',FALSE,'Metal supplies.'),
 ('astro','Astrologer','Watchtower','Wind',TRUE,'Star lore trader.');

-- Items
INSERT INTO public.items (slug, name, category, dlc, how_to_get, base_buy_price, base_sell_price, description) VALUES
 ('wood','Wood','material',FALSE,'Chop trees.', 5, 2,'Basic construction material.'),
 ('stone','Stone','material',FALSE,'Mine deposits.', 6, 3,'Rough building stone.'),
 ('iron_ore','Iron Ore','material',FALSE,'Mine deposits.', 12, 6,'Raw ore.'),
 ('iron_ingot','Iron Ingot','material',FALSE,'Smelt at forge.', 30, 15,'Smelted iron.'),
 ('flesh','Flesh','corpse',FALSE,'Autopsy corpses.', NULL, NULL,'Body component.'),
 ('bone','Bone','corpse',FALSE,'Autopsy corpses.', NULL, NULL,'Body component.'),
 ('herb_blue','Bluecap Herb','herb',FALSE,'Forage in meadow.', 4, 2,'Common alchemy herb.'),
 ('herb_red','Redroot Herb','herb',FALSE,'Forage in wood.', 4, 2,'Common alchemy herb.'),
 ('candle','Church Candle','church',FALSE,'Craft at kitchen.', 8, 4,'For sermons.'),
 ('powder_blue','Bluecap Powder','alchemy',FALSE,'Mortar Bluecap Herb.', 10, 5,'Powdered herb.'),
 ('solution_blue','Bluecap Solution','alchemy',FALSE,'Alch WB I.', 20, 10,'Basic solution.'),
 ('extract_star','Star Extract','alchemy',TRUE,'Alch WB II.', 60, 30,'DLC exclusive extract.'),
 ('bread','Bread','food',FALSE,'Kitchen.', 12, 6,'Simple loaf.'),
 ('wine','Wine','food',FALSE,'Cellar age.', 40, 20,'Aged drink.');

-- NPCs
INSERT INTO public.npc (slug, name, location, day_available, dlc, short_description) VALUES
 ('bishop','The Bishop','Church','Fire',FALSE,'Oversees sermons and doctrine.'),
 ('inquisitor','The Inquisitor','Town','Wind',FALSE,'Assigns town errands.'),
 ('astronomer','Astronomer','Watchtower','Moon',TRUE,'DLC star-lore guide.'),
 ('barkeep','Tavern Keeper','Tavern','Water',FALSE,'Runs the tavern events.'),
 ('witch_npc','Swamp Witch','Swamp','Moon',TRUE,'Trades in odd reagents.'),
 ('gravedigger','Gravedigger','Graveyard','Bone',FALSE,'Talks corpse quality.');

-- Questlines
INSERT INTO public.questlines (slug, name, npc_id, dlc, summary) VALUES
 ('bishop_line','Bishop''s Sermons', (SELECT id FROM public.npc WHERE slug='bishop'), FALSE, 'Prepare and deliver weekly sermons.'),
 ('inquisitor_line','Inquisitor''s Errands', (SELECT id FROM public.npc WHERE slug='inquisitor'), FALSE, 'Deliver requested materials.'),
 ('astronomer_line','Star Charts', (SELECT id FROM public.npc WHERE slug='astronomer'), TRUE, 'Chart the night sky.'),
 ('tavern_line','Tavern Events', (SELECT id FROM public.npc WHERE slug='barkeep'), FALSE, 'Host and support tavern nights.'),
 ('witch_line','Swamp Trades', (SELECT id FROM public.npc WHERE slug='witch_npc'), TRUE, 'Barter reagents at the hut.');

-- Quest steps
INSERT INTO public.quest_steps (questline_id, step_number, title, description, required_items, dependencies, reward_notes, unlocks) VALUES
 ((SELECT id FROM public.questlines WHERE slug='bishop_line'),1,'Bring candles','Deliver 3 candles to the altar.','[{"slug":"candle","amount":3}]','[]','Small faith gain.','Sermon slot'),
 ((SELECT id FROM public.questlines WHERE slug='bishop_line'),2,'Prepare sermon','Study a sermon topic.','[]','["bishop_line:1"]','Sermon quality perk.','Advanced sermons'),
 ((SELECT id FROM public.questlines WHERE slug='bishop_line'),3,'Deliver first sermon','Hold sermon on Fire day.','[]','["bishop_line:2"]','Coin reward.','Faith tier'),
 ((SELECT id FROM public.questlines WHERE slug='inquisitor_line'),1,'Gather iron','Bring 5 iron ingots.','[{"slug":"iron_ingot","amount":5}]','[]','Coin reward.','Town favor'),
 ((SELECT id FROM public.questlines WHERE slug='inquisitor_line'),2,'Deliver bread','Bring 4 loaves of bread.','[{"slug":"bread","amount":4}]','["inquisitor_line:1"]','Reputation.','Trade access'),
 ((SELECT id FROM public.questlines WHERE slug='astronomer_line'),1,'Meet astronomer','Visit the watchtower on Moon day.','[]','[]','Access to charts.','Chart menu'),
 ((SELECT id FROM public.questlines WHERE slug='astronomer_line'),2,'Bring star extract','Craft and deliver 1 star extract.','[{"slug":"extract_star","amount":1}]','["astronomer_line:1"]','Star token.','DLC recipe'),
 ((SELECT id FROM public.questlines WHERE slug='tavern_line'),1,'Restock wine','Bring 3 bottles of wine.','[{"slug":"wine","amount":3}]','[]','Coin.','Tavern events'),
 ((SELECT id FROM public.questlines WHERE slug='witch_line'),1,'Trade for herbs','Bring 5 bluecap herb.','[{"slug":"herb_blue","amount":5}]','[]','Reagent bundle.','Swamp access');

-- Progress: initialize default profile at step 1 for every questline
INSERT INTO public.user_quest_progress (profile_id, questline_id, current_step)
SELECT '00000000-0000-0000-0000-000000000001', q.id, 1 FROM public.questlines q;

-- Vendor prices
INSERT INTO public.vendor_prices (vendor_id, item_id, buy_price, sell_price) VALUES
 ((SELECT id FROM public.vendors WHERE slug='merchant_town'),(SELECT id FROM public.items WHERE slug='bread'),12,6),
 ((SELECT id FROM public.vendors WHERE slug='merchant_town'),(SELECT id FROM public.items WHERE slug='wine'),40,20),
 ((SELECT id FROM public.vendors WHERE slug='smith'),(SELECT id FROM public.items WHERE slug='iron_ingot'),30,15),
 ((SELECT id FROM public.vendors WHERE slug='smith'),(SELECT id FROM public.items WHERE slug='iron_ore'),12,6),
 ((SELECT id FROM public.vendors WHERE slug='witch'),(SELECT id FROM public.items WHERE slug='herb_blue'),4,2),
 ((SELECT id FROM public.vendors WHERE slug='witch'),(SELECT id FROM public.items WHERE slug='extract_star'),60,30),
 ((SELECT id FROM public.vendors WHERE slug='astro'),(SELECT id FROM public.items WHERE slug='candle'),8,4);

-- Recipes
INSERT INTO public.recipes (slug, name, station_id, output_item_id, output_amount, energy_cost, dlc, notes) VALUES
 ('r_iron_ingot','Smelt Iron Ingot',(SELECT id FROM public.stations WHERE slug='forge'),(SELECT id FROM public.items WHERE slug='iron_ingot'),1,3,FALSE,'Requires forge.'),
 ('r_bread','Bake Bread',(SELECT id FROM public.stations WHERE slug='kitchen'),(SELECT id FROM public.items WHERE slug='bread'),1,2,FALSE,'Simple kitchen recipe.'),
 ('r_candle','Craft Church Candle',(SELECT id FROM public.stations WHERE slug='kitchen'),(SELECT id FROM public.items WHERE slug='candle'),2,1,FALSE,'Bulk two per craft.'),
 ('r_bluecap_powder','Grind Bluecap Powder',(SELECT id FROM public.stations WHERE slug='mortar'),(SELECT id FROM public.items WHERE slug='powder_blue'),1,1,FALSE,'Mortar recipe.'),
 ('r_bluecap_solution','Brew Bluecap Solution',(SELECT id FROM public.stations WHERE slug='alch_wb_i'),(SELECT id FROM public.items WHERE slug='solution_blue'),1,2,FALSE,'Alchemy WB I.'),
 ('r_star_extract','Distill Star Extract',(SELECT id FROM public.stations WHERE slug='alch_wb_ii'),(SELECT id FROM public.items WHERE slug='extract_star'),1,4,TRUE,'DLC recipe.');

INSERT INTO public.recipe_ingredients (recipe_id, item_id, amount) VALUES
 ((SELECT id FROM public.recipes WHERE slug='r_iron_ingot'),(SELECT id FROM public.items WHERE slug='iron_ore'),2),
 ((SELECT id FROM public.recipes WHERE slug='r_bread'),(SELECT id FROM public.items WHERE slug='wood'),1),
 ((SELECT id FROM public.recipes WHERE slug='r_candle'),(SELECT id FROM public.items WHERE slug='flesh'),1),
 ((SELECT id FROM public.recipes WHERE slug='r_bluecap_powder'),(SELECT id FROM public.items WHERE slug='herb_blue'),1),
 ((SELECT id FROM public.recipes WHERE slug='r_bluecap_solution'),(SELECT id FROM public.items WHERE slug='powder_blue'),2),
 ((SELECT id FROM public.recipes WHERE slug='r_star_extract'),(SELECT id FROM public.items WHERE slug='solution_blue'),2),
 ((SELECT id FROM public.recipes WHERE slug='r_star_extract'),(SELECT id FROM public.items WHERE slug='herb_red'),1);

-- Tech trees
INSERT INTO public.technology_trees (slug, name, description) VALUES
 ('theology','Theology','Sermons, faith, church tools.'),
 ('smithing','Smithing','Forge and metalwork.'),
 ('alchemy','Alchemy','Powders, solutions, extracts.'),
 ('astronomy','Astronomy','DLC star study branch.');

INSERT INTO public.technologies (tree_id, slug, name, red_cost, green_cost, blue_cost, soul_cost, gratitude_cost, dlc, description) VALUES
 ((SELECT id FROM public.technology_trees WHERE slug='theology'),'tech_sermon_i','Basic Sermons',0,0,1,0,0,FALSE,'Unlock weekly sermon.'),
 ((SELECT id FROM public.technology_trees WHERE slug='theology'),'tech_sermon_ii','Advanced Sermons',0,0,2,1,0,FALSE,'Improved sermons.'),
 ((SELECT id FROM public.technology_trees WHERE slug='smithing'),'tech_forge_i','Forge Basics',2,0,0,0,0,FALSE,'Smelt iron ingots.'),
 ((SELECT id FROM public.technology_trees WHERE slug='smithing'),'tech_forge_ii','Fine Smithing',3,0,1,0,1,FALSE,'Advanced tools.'),
 ((SELECT id FROM public.technology_trees WHERE slug='alchemy'),'tech_alch_i','Basic Alchemy',0,2,0,0,0,FALSE,'Powders and mortar.'),
 ((SELECT id FROM public.technology_trees WHERE slug='alchemy'),'tech_alch_ii','Solutions',0,3,0,0,0,FALSE,'Alch WB I.'),
 ((SELECT id FROM public.technology_trees WHERE slug='alchemy'),'tech_alch_iii','Extracts',0,4,1,0,1,FALSE,'Alch WB II.'),
 ((SELECT id FROM public.technology_trees WHERE slug='astronomy'),'tech_astro_i','Star Charts',0,0,3,0,0,TRUE,'DLC star charts.');

INSERT INTO public.technology_requirements (technology_id, prerequisite_technology_id, npc_slug, quest_slug, dlc_required, note) VALUES
 ((SELECT id FROM public.technologies WHERE slug='tech_sermon_ii'),(SELECT id FROM public.technologies WHERE slug='tech_sermon_i'),'bishop','bishop_line',FALSE,'Requires Bishop line step 2.'),
 ((SELECT id FROM public.technologies WHERE slug='tech_forge_ii'),(SELECT id FROM public.technologies WHERE slug='tech_forge_i'),NULL,NULL,FALSE,'Requires Forge Basics.'),
 ((SELECT id FROM public.technologies WHERE slug='tech_alch_ii'),(SELECT id FROM public.technologies WHERE slug='tech_alch_i'),NULL,NULL,FALSE,'Requires Basic Alchemy.'),
 ((SELECT id FROM public.technologies WHERE slug='tech_alch_iii'),(SELECT id FROM public.technologies WHERE slug='tech_alch_ii'),'witch_npc','witch_line',FALSE,'Requires witch trades.'),
 ((SELECT id FROM public.technologies WHERE slug='tech_astro_i'),NULL,'astronomer','astronomer_line',TRUE,'DLC required + Astronomer met.');

INSERT INTO public.technology_unlocks (technology_id, unlocks_recipe_id, unlocks_station_id, unlocks_label) VALUES
 ((SELECT id FROM public.technologies WHERE slug='tech_forge_i'),(SELECT id FROM public.recipes WHERE slug='r_iron_ingot'),(SELECT id FROM public.stations WHERE slug='forge'),'Iron smelting'),
 ((SELECT id FROM public.technologies WHERE slug='tech_alch_i'),(SELECT id FROM public.recipes WHERE slug='r_bluecap_powder'),(SELECT id FROM public.stations WHERE slug='mortar'),'Mortar recipes'),
 ((SELECT id FROM public.technologies WHERE slug='tech_alch_ii'),(SELECT id FROM public.recipes WHERE slug='r_bluecap_solution'),(SELECT id FROM public.stations WHERE slug='alch_wb_i'),'Tier I solutions'),
 ((SELECT id FROM public.technologies WHERE slug='tech_alch_iii'),(SELECT id FROM public.recipes WHERE slug='r_star_extract'),(SELECT id FROM public.stations WHERE slug='alch_wb_ii'),'Tier II extracts');

-- Alchemy
INSERT INTO public.alchemy_components (slug, name, component_type, element, source_item_id, station, dlc, notes) VALUES
 ('c_powder_blue','Bluecap Powder','powder','water',(SELECT id FROM public.items WHERE slug='herb_blue'),'mortar',FALSE,'Ground bluecap.'),
 ('c_powder_red','Redroot Powder','powder','fire',(SELECT id FROM public.items WHERE slug='herb_red'),'mortar',FALSE,'Ground redroot.'),
 ('c_solution_blue','Bluecap Solution','solution','water',(SELECT id FROM public.items WHERE slug='powder_blue'),'alchemy_workbench_i',FALSE,'Basic solution.'),
 ('c_extract_star','Star Extract','extract','wind',(SELECT id FROM public.items WHERE slug='solution_blue'),'alchemy_workbench_ii',TRUE,'DLC extract.');

INSERT INTO public.alchemy_recipes (slug, name, station, result_item_id, ingredients, energy_cost, dlc, notes) VALUES
 ('a_powder_blue','Bluecap Powder','mortar',(SELECT id FROM public.items WHERE slug='powder_blue'),'[{"slug":"herb_blue","amount":1}]',1,FALSE,'Basic powder.'),
 ('a_powder_red','Redroot Powder','mortar',(SELECT id FROM public.items WHERE slug='herb_red' ),'[{"slug":"herb_red","amount":1}]',1,FALSE,'Basic powder.'),
 ('a_solution_blue','Bluecap Solution','alchemy_workbench_i',(SELECT id FROM public.items WHERE slug='solution_blue'),'[{"slug":"powder_blue","amount":2}]',2,FALSE,'Tier I.'),
 ('a_extract_star','Star Extract','alchemy_workbench_ii',(SELECT id FROM public.items WHERE slug='extract_star'),'[{"slug":"solution_blue","amount":2},{"slug":"herb_red","amount":1}]',4,TRUE,'DLC.');

-- Audit checklist (default profile)
INSERT INTO public.player_unlock_audit (profile_id, section, label, detail, dlc) VALUES
 ('00000000-0000-0000-0000-000000000001','zombies','Basic zombie assignment','Assign 1 zombie to any task.',FALSE),
 ('00000000-0000-0000-0000-000000000001','zombies','Advanced zombie routes','Chain 3+ zombie stations.',FALSE),
 ('00000000-0000-0000-0000-000000000001','tavern','Tavern opened','Complete tavern first restock.',FALSE),
 ('00000000-0000-0000-0000-000000000001','tavern','Tavern event hosted','Trigger first weekend event.',FALSE),
 ('00000000-0000-0000-0000-000000000001','refugee_camp','Camp unlocked','Meet refugee camp guide.',TRUE),
 ('00000000-0000-0000-0000-000000000001','refugee_camp','First camp quest done','Complete opening camp job.',TRUE),
 ('00000000-0000-0000-0000-000000000001','souls_room','Souls room found','Discover the souls room.',FALSE),
 ('00000000-0000-0000-0000-000000000001','souls_room','First soul harvested','Harvest a soul at the room.',FALSE),
 ('00000000-0000-0000-0000-000000000001','technologies','Alchemy tier II unlocked','Own Alch WB II.',FALSE),
 ('00000000-0000-0000-0000-000000000001','technologies','Astronomy tree started','Buy Star Charts.',TRUE),
 ('00000000-0000-0000-0000-000000000001','recipes','Star extract known','Recipe list shows Star Extract.',TRUE),
 ('00000000-0000-0000-0000-000000000001','npc_dialogue','Astronomer dialogue tier 2','Second astronomer conversation opened.',TRUE),
 ('00000000-0000-0000-0000-000000000001','endings_perks','First ending path chosen','Any main ending path started.',FALSE),
 ('00000000-0000-0000-0000-000000000001','vendor_tiers','Witch tier 2 stock','Witch shows tier 2 wares.',TRUE),
 ('00000000-0000-0000-0000-000000000001','vendor_tiers','Smith tier 2 stock','Smith shows tier 2 wares.',FALSE);
