const DAYS = ["Pride", "Gluttony", "Envy", "Wrath", "Sloth", "Lust"];
const GLYPHS = { Pride: "☀", Gluttony: "♃", Envy: "☿", Wrath: "♂", Sloth: "☾", Lust: "♀" };
const NPCS = [
  { day: "Pride", name: "Bishop", location: "Graveyard / Church", note: "Church, sermons, graveyard quality, early unlocks." },
  { day: "Gluttony", name: "Merchant", location: "Trade office", note: "Garden, trade license, crates, and merchant questline." },
  { day: "Envy", name: "Snake", location: "Cellar / Dungeon", note: "Early nights at first, then Envy after the gate opens." },
  { day: "Wrath", name: "Inquisitor", location: "Witch Hill", note: "Witch Hill, vineyard, dark organs, main quest progress." },
  { day: "Sloth", name: "Astrologer", location: "Sealight Lighthouse", note: "Writing supplies, science, Snake links, main quest pieces." },
  { day: "Lust", name: "Ms. Charm", location: "The Dead Horse", note: "Songs, social quests, Snake links, late main quest pieces." },
];
const STARTER_CHECKS = [
  "Write down the next NPC request before sleeping",
  "Check which day the needed NPC appears",
  "List items to bring before leaving home",
  "Mark blocked tasks with the missing requirement",
  "Export a save backup after a long session",
];
const STORE = "keepers-ledger-pwa-v1";
let state = load();
let deferredInstall = null;

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORE)) || seed();
  } catch {
    return seed();
  }
}

function seed() {
  return {
    day: "Pride",
    tasks: [],
    checks: STARTER_CHECKS.map((label, index) => ({ id: `check-${index}`, label, done: false })),
  };
}

function save() {
  localStorage.setItem(STORE, JSON.stringify(state));
}

function $(id) { return document.getElementById(id); }

function render() {
  renderDays();
  renderTaskFormDays();
  renderTasks();
  renderNpcs();
  renderChecks();
  $("cycleText").textContent = `Cycle order: ${DAYS.join(" → ")}`;
}

function renderDays() {
  $("dayGrid").innerHTML = DAYS.map(day => `
    <button class="day ${state.day === day ? "active" : ""}" data-day="${day}">
      <span>${GLYPHS[day]}</span><strong>${day}</strong><small>${NPCS.find(n => n.day === day).name}</small>
    </button>
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
      <small>${task.day}${task.blocked ? " • Blocked" : ""}</small>
      <div class="actions">
        <button data-task="${task.id}" data-action="done">Done</button>
        <button data-task="${task.id}" data-action="block">${task.blocked ? "Unblock" : "Block"}</button>
        <button data-task="${task.id}" data-action="delete">Delete</button>
      </div>
    </article>
  `).join("") : `<p class="empty">No reminders for ${state.day}. Add one above.</p>`;
}

function renderNpcs() {
  const npcs = NPCS.filter(npc => npc.day === state.day);
  $("npcCount").textContent = npcs.length;
  $("npcList").innerHTML = npcs.map(npc => `
    <article class="mini"><strong>${npc.name}</strong><p>${npc.location}</p><small>${npc.note}</small></article>
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

document.addEventListener("click", event => {
  const dayButton = event.target.closest("[data-day]");
  if (dayButton) {
    state.day = dayButton.dataset.day;
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

document.addEventListener("change", event => {
  const check = event.target.closest("[data-check]");
  if (check) {
    const item = state.checks.find(entry => entry.id === check.dataset.check);
    item.done = check.checked;
    save();
    render();
  }
});

$("addTask").addEventListener("click", addTask);
$("taskTitle").addEventListener("keydown", event => { if (event.key === "Enter") addTask(); });
$("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "keepers-ledger-save.json";
  link.click();
  URL.revokeObjectURL(link.href);
});
$("importFile").addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file) return;
  state = JSON.parse(await file.text());
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
