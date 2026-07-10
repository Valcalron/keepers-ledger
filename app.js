const STORAGE_KEY = "keepers-ledger-save-v1";
const days = ["Moon", "Water", "Fire", "Wind", "Tree", "Bone"];

const seed = {
  currentDay: "Moon",
  tasks: [
    { id: crypto.randomUUID(), title: "Meet the astrologer", npc: "Astrologer", location: "Lighthouse", day: "Moon", priority: "High", notes: "Check what he needs next and write it down here before sleeping.", done: false, blocked: false },
    { id: crypto.randomUUID(), title: "Trade for herbs", npc: "Swamp Witch", location: "Swamp", day: "Moon", priority: "Normal", notes: "Bring silver and any requested reagent.", done: false, blocked: false },
    { id: crypto.randomUUID(), title: "Prepare sermon materials", npc: "Bishop", location: "Church", day: "Bone", priority: "Normal", notes: "Check church quality, faith needs, and graveyard rating before the next sermon.", done: false, blocked: false },
    { id: crypto.randomUUID(), title: "Advance Snake quest", npc: "Snake", location: "Cellar", day: "Any", priority: "High", notes: "Only available at night. Keep track of required keys, stamps, or dungeon steps here.", done: false, blocked: true }
  ],
  collections: [
    { id: "npc-astrologer", category: "NPCs", name: "Astrologer", detail: "Moon at the lighthouse. Story and science progression.", done: false },
    { id: "npc-bishop", category: "NPCs", name: "Bishop", detail: "Bone at the church. Sermons, graveyard, and church rating.", done: false },
    { id: "npc-merchant", category: "NPCs", name: "Merchant", detail: "Trade route and business progression.", done: false },
    { id: "npc-snake", category: "NPCs", name: "Snake", detail: "Night visitor tied to cellar and dungeon progression.", done: false },
    { id: "npc-witch", category: "NPCs", name: "Swamp Witch", detail: "Alchemy, herbs, and swamp access.", done: false },
    { id: "tech-theology", category: "Technologies", name: "Theology basics", detail: "Graveyard, church, prayers, faith.", done: false },
    { id: "tech-anatomy", category: "Technologies", name: "Anatomy and alchemy", detail: "Body parts, embalming, alchemy unlocks.", done: false },
    { id: "tech-smithing", category: "Technologies", name: "Smithing path", detail: "Ore, ingots, tools, and metal parts.", done: false },
    { id: "item-iron", category: "Items", name: "Iron ingot", detail: "Common crafting bottleneck. Keep a spare stack.", done: false },
    { id: "item-faith", category: "Items", name: "Faith", detail: "Needed for study, writing, and several church systems.", done: false },
    { id: "recipe-burger", category: "Recipes", name: "Burger", detail: "Useful for event and stamina planning.", done: false },
    { id: "recipe-wine", category: "Recipes", name: "Wine", detail: "Useful for trade, energy, and some requests.", done: false },
    { id: "alchemy-health", category: "Alchemy", name: "Health solution", detail: "Record the exact recipe once discovered.", done: false },
    { id: "alchemy-speed", category: "Alchemy", name: "Speed potion", detail: "Record recipe and preferred production chain.", done: false },
    { id: "unlock-church", category: "Unlocks", name: "Open the church", detail: "Track graveyard quality, Bishop request, and sermon prep.", done: false },
    { id: "unlock-dungeon", category: "Unlocks", name: "Dungeon access", detail: "Track Snake quest requirements and key steps.", done: false }
  ],
  npcs: [
    { name: "Astrologer", day: "Moon", location: "Lighthouse", note: "Story, science, and memory fragments." },
    { name: "Swamp Witch", day: "Moon", location: "Swamp", note: "Alchemy and herb errands." },
    { name: "Merchant", day: "Water", location: "Town", note: "Trade routes, crates, and business tasks." },
    { name: "Ms. Charm", day: "Fire", location: "Dead Horse", note: "Song and social quest chain." },
    { name: "Inquisitor", day: "Wind", location: "Witch Hill", note: "Dark organs, events, and approval chain." },
    { name: "Snake", day: "Any", location: "Cellar at night", note: "Night quests, dungeon, and gate progress." },
    { name: "Bishop", day: "Bone", location: "Church", note: "Graveyard rating, church, sermons, faith." }
  ],
  unlocks: [
    { title: "Church loop", goal: "Run reliable sermons.", checks: ["Raise graveyard quality", "Repair church basics", "Prepare prayer", "Bring faith plan", "Spend faith before it piles up"] },
    { title: "Alchemy loop", goal: "Stop forgetting recipes and reagents.", checks: ["Unlock alchemy workbench", "Record discovered recipes", "Tag missing powders, solutions, extracts", "Stockpile glassware"] },
    { title: "Dungeon loop", goal: "Know why you went downstairs.", checks: ["Track Snake request", "Bring food and gear", "Record floor target", "Mark key drops and blockers"] },
    { title: "Trade loop", goal: "Turn errands into weekly routes.", checks: ["Check current merchant request", "Prepare crates or goods", "Bring money", "Write the next required item immediately"] }
  ]
};

let state = loadState();

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(seed);
  try {
    return { ...structuredClone(seed), ...JSON.parse(raw) };
  } catch {
    return structuredClone(seed);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return [...document.querySelectorAll(selector)];
}

function emptyNode() {
  return $("#emptyTemplate").content.firstElementChild.cloneNode(true);
}

function setView(view) {
  $all(".view").forEach((section) => section.classList.toggle("active-view", section.id === view));
  $all(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  $("#viewTitle").textContent = $(`.nav-item[data-view="${view}"]`).textContent;
  render();
}

function setDay(day) {
  state.currentDay = day;
  saveState();
  render();
}

function nextDay() {
  const index = days.indexOf(state.currentDay);
  setDay(days[(index + 1) % days.length]);
}

function matchesDay(item) {
  return item.day === state.currentDay || item.day === "Any";
}

function textMatch(item, query) {
  if (!query) return true;
  return Object.values(item).join(" ").toLowerCase().includes(query.toLowerCase());
}

function renderDashboard() {
  $("#todayName").textContent = state.currentDay;
  $("#todayHint").textContent = `Cycle order: ${days.join(" - ")}`;
  $all(".day").forEach((button) => button.classList.toggle("active", button.dataset.day === state.currentDay));

  const npcs = state.npcs.filter(matchesDay);
  const tasks = state.tasks.filter((task) => !task.done && !task.blocked && matchesDay(task));
  const blocked = state.tasks.filter((task) => !task.done && task.blocked);
  const bring = tasks.flatMap((task) => extractBringItems(task.notes));

  renderMiniList("#npcTodayList", npcs, (npc) => `<strong>${npc.name}</strong><p>${npc.location} - ${npc.note}</p>`);
  renderMiniList("#taskTodayList", tasks, (task) => `<strong>${task.title}</strong><p>${task.npc || "No NPC"} - ${task.location || "No location"}</p>`);
  renderMiniList("#blockedList", blocked, (task) => `<strong>${task.title}</strong><p>${task.notes || "No blocker note yet."}</p>`);
  renderChips("#bringList", bring);

  $("#npcTodayCount").textContent = npcs.length;
  $("#taskTodayCount").textContent = tasks.length;
  $("#blockedCount").textContent = blocked.length;
  $("#bringCount").textContent = bring.length;
}

function extractBringItems(notes) {
  if (!notes) return [];
  const match = notes.match(/bring ([^.]+)/i);
  if (!match) return [];
  return match[1].split(/,| and /).map((item) => item.trim()).filter(Boolean);
}

function renderMiniList(selector, items, template) {
  const root = $(selector);
  root.innerHTML = "";
  if (!items.length) {
    root.append(emptyNode());
    return;
  }
  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = "mini-card";
    div.innerHTML = template(item);
    root.append(div);
  });
}

function renderChips(selector, items) {
  const root = $(selector);
  root.innerHTML = "";
  if (!items.length) {
    root.append(emptyNode());
    return;
  }
  [...new Set(items)].forEach((item) => {
    const span = document.createElement("span");
    span.className = "chip";
    span.textContent = item;
    root.append(span);
  });
}

function renderTasks() {
  const query = $("#taskSearch").value;
  const filter = $("#taskFilter").value;
  const root = $("#taskBoard");
  root.innerHTML = "";

  let tasks = state.tasks.filter((task) => textMatch(task, query));
  if (filter === "today") tasks = tasks.filter((task) => !task.done && matchesDay(task));
  if (filter === "blocked") tasks = tasks.filter((task) => !task.done && task.blocked);
  if (filter === "done") tasks = tasks.filter((task) => task.done);
  if (filter === "all") tasks = tasks.filter((task) => !task.done);

  if (!tasks.length) {
    root.append(emptyNode());
    return;
  }

  tasks.forEach((task) => {
    const article = document.createElement("article");
    article.className = `task-card priority-${task.priority} ${task.done ? "done" : ""}`;
    article.innerHTML = `
      <header><strong>${escapeHtml(task.title)}</strong><span class="tag">${task.priority}</span></header>
      <p>${escapeHtml(task.npc || "No NPC")} - ${escapeHtml(task.location || "No location")}</p>
      <p><span class="tag">${task.day}</span> ${task.blocked ? "<span class='tag'>Blocked</span>" : ""}</p>
      <p>${escapeHtml(task.notes || "")}</p>
      <div class="task-actions">
        <button data-action="done" data-id="${task.id}">${task.done ? "Reopen" : "Done"}</button>
        <button data-action="blocked" data-id="${task.id}">${task.blocked ? "Unblock" : "Block"}</button>
        <button data-action="delete" data-id="${task.id}">Delete</button>
      </div>`;
    root.append(article);
  });
}

function renderCollections() {
  const categorySelect = $("#collectionCategory");
  const categories = ["All", ...new Set(state.collections.map((item) => item.category))];
  const previous = categorySelect.value || "All";
  categorySelect.innerHTML = categories.map((cat) => `<option ${cat === previous ? "selected" : ""}>${cat}</option>`).join("");

  const query = $("#collectionSearch").value;
  const category = categorySelect.value || "All";
  const root = $("#collectionGrid");
  root.innerHTML = "";

  renderCollectionStats();

  const items = state.collections.filter((item) => (category === "All" || item.category === category) && textMatch(item, query));
  if (!items.length) {
    root.append(emptyNode());
    return;
  }

  items.forEach((item) => {
    const article = document.createElement("article");
    article.className = `collection-card ${item.done ? "done" : ""}`;
    article.innerHTML = `
      <header><strong>${escapeHtml(item.name)}</strong><span class="tag">${escapeHtml(item.category)}</span></header>
      <p>${escapeHtml(item.detail)}</p>
      <div class="card-actions"><button data-collection-id="${item.id}">${item.done ? "Collected" : "Mark collected"}</button></div>`;
    root.append(article);
  });
}

function renderCollectionStats() {
  const root = $("#collectionStats");
  const categories = [...new Set(state.collections.map((item) => item.category))];
  root.innerHTML = "";
  categories.forEach((category) => {
    const items = state.collections.filter((item) => item.category === category);
    const done = items.filter((item) => item.done).length;
    const div = document.createElement("div");
    div.className = "stat";
    div.innerHTML = `<span>${category}</span><strong>${done}/${items.length}</strong>`;
    root.append(div);
  });
}

function renderNpcs() {
  const root = $("#npcGrid");
  root.innerHTML = "";
  state.npcs.forEach((npc) => {
    const article = document.createElement("article");
    article.className = "npc-card";
    article.innerHTML = `<header><strong>${escapeHtml(npc.name)}</strong><span class="tag">${npc.day}</span></header><p>${escapeHtml(npc.location)}</p><p>${escapeHtml(npc.note)}</p>`;
    root.append(article);
  });
}

function renderUnlocks() {
  const root = $("#unlockList");
  root.innerHTML = "";
  state.unlocks.forEach((unlock) => {
    const article = document.createElement("article");
    article.className = "unlock-card";
    article.innerHTML = `<h3>${escapeHtml(unlock.title)}</h3><p>${escapeHtml(unlock.goal)}</p><div class="chip-list">${unlock.checks.map((check) => `<span class="chip">${escapeHtml(check)}</span>`).join("")}</div>`;
    root.append(article);
  });
}

function render() {
  renderDashboard();
  renderTasks();
  renderCollections();
  renderNpcs();
  renderUnlocks();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
}

function wireEvents() {
  $all(".nav-item").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
  $all(".day").forEach((button) => button.addEventListener("click", () => setDay(button.dataset.day)));
  $("#nextDayBtn").addEventListener("click", nextDay);
  $("#addTaskBtn").addEventListener("click", () => $("#taskForm").classList.toggle("hidden"));
  $("#taskSearch").addEventListener("input", renderTasks);
  $("#taskFilter").addEventListener("change", renderTasks);
  $("#collectionSearch").addEventListener("input", renderCollections);
  $("#collectionCategory").addEventListener("change", renderCollections);
  $("#resetSeedBtn").addEventListener("click", () => {
    if (!confirm("Restore seed collection lists? Your custom task progress stays.")) return;
    state.collections = structuredClone(seed.collections);
    saveState();
    renderCollections();
  });

  $("#taskForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.tasks.unshift({
      id: crypto.randomUUID(),
      title: $("#taskTitle").value.trim(),
      npc: $("#taskNpc").value.trim(),
      location: $("#taskLocation").value.trim(),
      day: $("#taskDay").value,
      priority: $("#taskPriority").value,
      notes: $("#taskNotes").value.trim(),
      done: false,
      blocked: false
    });
    event.target.reset();
    $("#taskForm").classList.add("hidden");
    saveState();
    render();
  });

  document.addEventListener("click", (event) => {
    const actionButton = event.target.closest("button[data-action]");
    if (actionButton) {
      const task = state.tasks.find((item) => item.id === actionButton.dataset.id);
      if (!task) return;
      if (actionButton.dataset.action === "done") task.done = !task.done;
      if (actionButton.dataset.action === "blocked") task.blocked = !task.blocked;
      if (actionButton.dataset.action === "delete") state.tasks = state.tasks.filter((item) => item.id !== task.id);
      saveState();
      render();
    }

    const collectionButton = event.target.closest("button[data-collection-id]");
    if (collectionButton) {
      const item = state.collections.find((entry) => entry.id === collectionButton.dataset.collectionId);
      if (!item) return;
      item.done = !item.done;
      saveState();
      renderCollections();
      renderDashboard();
    }
  });

  $("#exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "keepers-ledger-save.json";
    link.click();
    URL.revokeObjectURL(link.href);
  });

  $("#importFile").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    state = JSON.parse(await file.text());
    saveState();
    render();
  });
}

wireEvents();
render();
