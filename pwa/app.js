const DAYS = ["Pride", "Gluttony", "Envy", "Wrath", "Sloth", "Lust"];
const DLC_OPTIONS = [
  { id: "breakingDead", label: "Breaking Dead", note: "Zombies and Gunter." },
  { id: "strangerSins", label: "Stranger Sins", note: "Talking Skull tavern story." },
  { id: "gameOfCrone", label: "Game of Crone", note: "Refugee camp story." },
  { id: "betterSaveSoul", label: "Better Save Soul", note: "Soul room and sin shards." },
];
const DAY_ICONS = {
  Pride: "day-pride.svg",
  Gluttony: "day-gluttony.svg",
  Envy: "day-envy.svg",
  Wrath: "day-wrath.svg",
  Sloth: "day-sloth.svg",
  Lust: "day-lust.svg",
};
const NPCS = [
  { day: "Pride", name: "Bishop", location: "Graveyard / Church", note: "Church, sermons, graveyard quality, early unlocks." },
  { day: "Gluttony", name: "Merchant", location: "Trade office", note: "Garden, trade license, crates, and merchant questline." },
  { day: "Envy", name: "Snake", location: "Cellar / Dungeon", note: "Early nights at first, then Envy after the gate opens." },
  { day: "Wrath", name: "Inquisitor", location: "Witch Hill", note: "Witch Hill, vineyard, dark organs, main quest progress." },
  { day: "Sloth", name: "Astrologer", location: "Sealight Lighthouse", note: "Writing supplies, science, Snake links, main quest pieces." },
  { day: "Lust", name: "Ms. Charm", location: "The Dead Horse", note: "Songs, social quests, Snake links, late main quest pieces." },
  { day: "Any", name: "Gerry", location: "Morgue / cellar", note: "Talking skull. Early tutorial and recurring story reminders." },
  { day: "Any", name: "Donkey", location: "Road by the morgue", note: "Corpse deliveries, carrots, oil, and revolution tasks." },
  { day: "Any", name: "Horadric", location: "The Dead Horse", note: "Tavern keeper, early errands, beer, and town connections." },
  { day: "Any", name: "Miss Chain", location: "The Dead Horse", note: "Tavern kitchen, Horadric link, and food-related needs." },
  { day: "Any", name: "Krezvold", location: "Blacksmith", note: "Metal work, early sword, slimes, and smithing access." },
  { day: "Any", name: "Cory", location: "Stone cutter", note: "Stone, marble, and quarry-related purchases." },
  { day: "Any", name: "Tress", location: "Woodcutter", note: "Wood, planks, timber, and early resource purchases." },
  { day: "Any", name: "Dig", location: "Village outskirts", note: "Hemp, oil, and odd early-game errands." },
  { day: "Any", name: "Clotho", location: "Swamp", note: "Witch, alchemy access, memory quest, and swamp shortcuts." },
  { day: "Any", name: "Lighthouse Keeper", location: "Lighthouse", note: "Fishing rod, bait, and fish trade." },
  { day: "Any", name: "Farmer", location: "Wheat farm", note: "Seeds, farming access, and crop supplies." },
  { day: "Any", name: "Miller", location: "Mill", note: "Flour, milling, and farm-side errands." },
  { day: "Any", name: "Rosa", location: "Dairy farm", note: "Milk, butter, and food ingredients." },
  { day: "Any", name: "Shepherd", location: "Village", note: "Burial certificate economy and village trading." },
  { day: "Any", name: "Beekeeper", location: "Village apiary", note: "Honey, beeswax, and bee supplies." },
  { day: "Any", name: "Vagner", location: "The Dead Horse", note: "Poet, ink/paper needs, and Ms. Charm links." },
  { day: "Any", name: "Koukol", location: "Mountain Fort", note: "Inquisitor assistant and Witch Hill related tasks." },
  { day: "Any", name: "Gunter", location: "Morgue / resurrection area", note: "Zombie system and Breaking Dead guidance.", dlc: "breakingDead" },
  { day: "Any", name: "Barman", location: "Talking Skull tavern", note: "Stranger Sins tavern operations.", dlc: "strangerSins" },
  { day: "Any", name: "Adam", location: "Talking Skull tavern", note: "Stranger Sins story and tavern events.", dlc: "strangerSins" },
  { day: "Any", name: "Marquis Teodoro Jr.", location: "Refugee camp", note: "Game of Crone refugee camp progression.", dlc: "gameOfCrone" },
  { day: "Any", name: "Lady Beatrice", location: "Refugee camp", note: "Game of Crone camp politics and story tasks.", dlc: "gameOfCrone" },
  { day: "Any", name: "Euric", location: "Souls room", note: "Better Save Soul tutorial and soul-healing systems.", dlc: "betterSaveSoul" },
  { day: "Any", name: "Smiler", location: "Souls room", note: "Better Save Soul story and sin shard systems.", dlc: "betterSaveSoul" },
];
const STARTER_CHECKS = [
  "Write down the next NPC request before sleeping",
  "Check which day the needed NPC appears",
  "List items to bring before leaving home",
  "Mark blocked tasks with the missing requirement",
  "Export a save backup after a long session",
];
const STORE = "keepers-companion-pwa-v1";
let state = load();
let deferredInstall = null;

function load() {
  try {
    return normalizeState(JSON.parse(localStorage.getItem(STORE)) || seed());
  } catch {
    return seed();
  }
}

function seed() {
  return {
    setupComplete: false,
    day: "Pride",
    dlcs: {},
    tasks: [],
    checks: STARTER_CHECKS.map((label, index) => ({ id: `check-${index}`, label, done: false })),
    customIcons: {},
  };
}

function normalizeState(value) {
  return {
    ...seed(),
    ...value,
    setupComplete: value.setupComplete === true,
    dlcs: value.dlcs && typeof value.dlcs === "object" ? value.dlcs : {},
    tasks: Array.isArray(value.tasks) ? value.tasks : [],
    checks: Array.isArray(value.checks) ? value.checks : seed().checks,
    customIcons: value.customIcons && typeof value.customIcons === "object" ? value.customIcons : {},
  };
}

function save() {
  localStorage.setItem(STORE, JSON.stringify(state));
}

function $(id) { return document.getElementById(id); }
function dayIcon(day) { return state.customIcons[day] || DAY_ICONS[day]; }
function hasDlc(id) { return state.dlcs[id] === true; }
function npcEnabled(npc) { return !npc.dlc || hasDlc(npc.dlc); }

function render() {
  renderSetup();
  if (!state.setupComplete) return;
  $("setupPanel").classList.add("hidden");
  $("mainContent").classList.remove("hidden");
  renderDlcSummary();
  renderDays();
  renderIconInputs();
  renderTaskFormDays();
  renderTasks();
  renderNpcs();
  renderChecks();
  $("cycleText").textContent = `Cycle order: ${DAYS.join(" -> ")}`;
}

function renderSetup() {
  const panel = $("setupPanel");
  const main = $("mainContent");
  if (!state.setupComplete) {
    panel.classList.remove("hidden");
    main.classList.add("hidden");
  }
  $("setupDlcList").innerHTML = DLC_OPTIONS.map(dlc => `
    <label class="dlc-option">
      <input type="checkbox" data-dlc="${dlc.id}" ${hasDlc(dlc.id) ? "checked" : ""}>
      <span><strong>${dlc.label}</strong><small>${dlc.note}</small></span>
    </label>
  `).join("");
}

function renderDlcSummary() {
  const chosen = DLC_OPTIONS.filter(dlc => hasDlc(dlc.id)).map(dlc => dlc.label);
  $("dlcSummary").textContent = chosen.length ? `DLC enabled: ${chosen.join(", ")}` : "Base game only";
}

function renderDays() {
  $("dayGrid").innerHTML = DAYS.map(day => `
    <button class="day ${state.day === day ? "active" : ""}" data-day="${day}">
      <img src="${dayIcon(day)}" alt="${day} day icon"><strong>${day}</strong><small>${NPCS.find(n => n.day === day).name}</small>
    </button>
  `).join("");
}

function renderIconInputs() {
  const holder = $("iconInputs");
  if (!holder) return;
  holder.innerHTML = DAYS.map(day => `
    <div class="icon-row">
      <img src="${dayIcon(day)}" alt="${day} preview">
      <strong>${day}</strong>
      <label class="ghost file-label">Choose<input type="file" accept="image/*" data-icon-input="${day}"></label>
      <button class="ghost" data-reset-icon="${day}" ${state.customIcons[day] ? "" : "disabled"}>Reset</button>
    </div>
  `).join("");
}

function renderTaskFormDays() {
  $("taskDay").innerHTML = [`<option value="Any">Any day</option>`, ...DAYS.map(day => `<option value="${day}" ${day === state.day ? "selected" : ""}>${day}</option>`)].join("");
}

function renderTasks() {
  const visible = state.tasks.filter(task => !task.done && (task.day === "Any" || task.day === state.day));
  $("taskCount").textContent = visible.length;
  $("taskList").innerHTML = visible.length ? visible.map(task => `
    <article class="task priority-${task.priority.toLowerCase()}">
      <div class="task-top"><strong>${escapeHtml(task.title)}</strong><span class="pill">${task.priority}</span></div>
      ${task.note ? `<p>${escapeHtml(task.note)}</p>` : ""}
      <small>${task.day}${task.blocked ? " - Blocked" : ""}</small>
      <div class="actions">
        <button data-task="${task.id}" data-action="done">Done</button>
        <button data-task="${task.id}" data-action="block">${task.blocked ? "Unblock" : "Block"}</button>
        <button data-task="${task.id}" data-action="delete">Delete</button>
      </div>
    </article>
  `).join("") : `<p class="empty">No reminders for ${state.day}. Add one above.</p>`;
}

function renderNpcs() {
  const npcs = NPCS.filter(npc => npcEnabled(npc) && (npc.day === state.day || npc.day === "Any"));
  $("npcCount").textContent = npcs.length;
  $("npcList").innerHTML = npcs.map(npc => `
    <article class="mini"><strong>${npc.name}</strong><p>${npc.location}</p><small>${npc.day === "Any" ? "Any day - " : ""}${npc.note}</small></article>
  `).join("");
}

function renderChecks() {
  const done = state.checks.filter(check => check.done).length;
  $("checkCount").textContent = `${done}/${state.checks.length}`;
  $("checkList").innerHTML = state.checks.map(check => `
    <label class="check"><input type="checkbox" data-check="${check.id}" ${check.done ? "checked" : ""}><span>${escapeHtml(check.label)}</span></label>
  `).join("");
}

function addTask() {
  const title = $("taskTitle").value.trim();
  if (!title) return;
  state.tasks.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
    title,
    note: $("taskNote").value.trim(),
    day: $("taskDay").value,
    priority: $("taskPriority").value,
    blocked: false,
    done: false,
  });
  $("taskTitle").value = "";
  $("taskNote").value = "";
  save();
  render();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

document.addEventListener("click", event => {
  const dayButton = event.target.closest("[data-day]");
  if (dayButton) {
    state.day = dayButton.dataset.day;
    save();
    render();
  }
  const resetButton = event.target.closest("[data-reset-icon]");
  if (resetButton) {
    delete state.customIcons[resetButton.dataset.resetIcon];
    save();
    render();
  }
  const taskButton = event.target.closest("[data-task]");
  if (taskButton) {
    const task = state.tasks.find(item => item.id === taskButton.dataset.task);
    if (!task) return;
    if (taskButton.dataset.action === "done") task.done = true;
    if (taskButton.dataset.action === "block") task.blocked = !task.blocked;
    if (taskButton.dataset.action === "delete") state.tasks = state.tasks.filter(item => item.id !== task.id);
    save();
    render();
  }
});

document.addEventListener("change", async event => {
  const dlcInput = event.target.closest("[data-dlc]");
  if (dlcInput) {
    state.dlcs[dlcInput.dataset.dlc] = dlcInput.checked;
    save();
    return;
  }
  const iconInput = event.target.closest("[data-icon-input]");
  if (iconInput && iconInput.files[0]) {
    state.customIcons[iconInput.dataset.iconInput] = await readImage(iconInput.files[0]);
    save();
    render();
    return;
  }
  const check = event.target.closest("[data-check]");
  if (check) {
    const item = state.checks.find(entry => entry.id === check.dataset.check);
    item.done = check.checked;
    save();
    render();
  }
});

$("saveSetup").addEventListener("click", () => {
  state.setupComplete = true;
  save();
  render();
});
$("editSetup").addEventListener("click", () => {
  state.setupComplete = false;
  render();
});
$("addTask").addEventListener("click", addTask);
$("taskTitle").addEventListener("keydown", event => { if (event.key === "Enter") addTask(); });
$("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "keepers-companion-save.json";
  link.click();
  URL.revokeObjectURL(link.href);
});
$("importFile").addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file) return;
  state = normalizeState(JSON.parse(await file.text()));
  save();
  render();
});

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstall = event;
  $("installBtn").classList.remove("hidden");
});
$("installBtn").addEventListener("click", async () => {
  if (!deferredInstall) return;
  deferredInstall.prompt();
  await deferredInstall.userChoice;
  deferredInstall = null;
  $("installBtn").classList.add("hidden");
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => undefined);
}

render();
