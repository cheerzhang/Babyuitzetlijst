const categories = [
  { id: "clothes", title: "Baby clothes", icon: "♧", items: [
    ["bodysuits", "Bodysuits", "must", 6, "Suggested: 6–8", "Size 50–56"],
    ["socks", "Pairs of socks", "must", 4, "Suggested: 4"],
    ["hats", "Little hats", "must", 2, "Suggested: 2"],
    ["sweaters", "Baby sweaters", "optional", 2, "Suggested: 2"],
    ["cardigan", "Cardigan or jacket", "must", 1, "Suggested: 1"]
  ]},
  { id: "diapers", title: "Changing diapers", icon: "◒", items: [
    ["changing-table", "Changing table", "optional"],
    ["changing-pad", "Changing pad", "must", 1],
    ["pad-covers", "Changing pad covers", "must", 2, "Suggested: 2"],
    ["hydrophilic-cloths", "Hydrophilic cloths", "must", 12, "Suggested: 12"],
    ["disposable-diapers", "Packs of disposable diapers", "must", 2, "Suggested: 2 packs", "Newborn size"],
    ["washcloths", "Hydrophilic washcloths", "must", 6, "Suggested: 6"],
    ["burp-cloths", "Burp cloths", "must", 6, "Suggested: 6"],
    ["diaper-cream", "Diaper cream", "must", 1, "Etos"],
    ["baby-wipes", "Baby wipes", "must", 1, "Etos"],
    ["washable-diapers", "Washable diapers", "optional"],
    ["trash-bin", "Trash bin", "must", 1]
  ]},
  { id: "bed", title: "For the nursery", icon: "☾", items: [
    ["mattress", "Mattress", "must", 1],
    ["cot", "Cradle or cot", "must", 1, "Co-sleeper", "Rentable"],
    ["bottom-sheets", "Bottom or fitted sheets", "must", 2, "Suggested: 2–3"],
    ["sleeping-bags", "Sleeping bags", "must", 2, "Suggested: 2–3"],
    ["blankets", "Blankets", "must", 2, "Suggested: 2–3"],
    ["moltons", "Molton mattress protectors", "must", 2, "Suggested: 2–3"]
  ]},
  { id: "bath", title: "Bath time", icon: "≈", items: [
    ["baby-bath", "Baby bath or tummy tub", "must", 1, "Suggested: 1 baby bath"],
    ["bath-towels", "Large bath towels or capes", "must", 2, "Suggested: 2–3"],
    ["hairbrush", "Small hairbrush or comb", "optional"],
    ["shampoo", "Baby shampoo and wash gel", "later"],
    ["baby-oil", "Baby oil", "later"],
    ["bath-support", "Bath support", "optional", null, "Good to have"]
  ]},
  { id: "feeding", title: "Breastfeeding", icon: "◡", items: [
    ["nursing-bras", "Nursing bras", "must", 2, "Suggested: 2–3"],
    ["breast-pads", "Breast pads", "must", 1],
    ["nipple-cream", "Nipple cream", "must", 1],
    ["nursing-pillow", "Nursing pillow", "must", 1],
    ["breast-pump", "Breast pump", "optional", null, "Rentable"],
    ["milk-bottle", "Bottle for expressed milk", "must", 1, "Suggested: 1"],
    ["bottle-brush", "Bottle brush", "optional"]
  ]},
  { id: "home", title: "Handy at home", icon: "⌂", items: [
    ["baby-monitor", "Baby monitor", "later"],
    ["play-mat", "Play mat", "later"],
    ["bouncer", "Bouncer", "optional", null, "Rentable"],
    ["toys", "Toys and stuffed animals", "later"],
    ["high-chair", "High chair", "later"],
    ["rocking-chair", "Rocking chair", "optional"]
  ]},
  { id: "travel", title: "Out and about", icon: "↗", items: [
    ["car-seat", "Infant car seat (0+)", "must", 1, "i-Size (R129)"],
    ["stroller", "Stroller", "must", 1],
    ["carrier", "Baby carrier or sling", "optional", null, "Rentable"],
    ["changing-mat", "Changing mat", "must", 1],
    ["stroller-accessories", "Stroller rain accessories", "optional"]
  ]}
];

const resolvedStatuses = new Set(["bought", "rented"]);
const storageKey = "little-list-progress-v1";
let state = loadState();
let activeFilter = "all";
let searchTerm = "";

function loadState() {
  try { return JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { return {}; }
}
function saveState() { localStorage.setItem(storageKey, JSON.stringify(state)); }
function allItems() { return categories.flatMap(category => category.items); }
function statusOptions(item) {
  const target = item[3];
  const rentable = item.slice(4).includes("Rentable");
  const options = [["not-bought", "Not bought"]];
  if (target > 1) options.push(["partial", "Partially bought"]);
  options.push(["bought", "Bought"]);
  if (rentable) options.push(["plan-rent", "Planning to rent"], ["rented", "Rented"]);
  return options;
}
function itemState(id) {
  const saved = state[id] || { status: "not-bought", quantity: 0 };
  const item = allItems().find(entry => entry[0] === id);
  const allowed = statusOptions(item).some(([value]) => value === saved.status);
  return allowed ? saved : { status: "not-bought", quantity: 0 };
}
function isResolved(id) { return resolvedStatuses.has(itemState(id).status); }
function labelFor(type) { return type === "must" ? "Must-have" : type === "later" ? "Buy later" : "Optional"; }

function render() {
  const root = document.querySelector("#checklist");
  root.innerHTML = categories.map(category => {
    const resolved = category.items.filter(item => isResolved(item[0])).length;
    const itemMarkup = category.items.map(item => renderItem(item, category.id)).join("");
    return `<section class="category" data-category="${category.id}">
      <button class="category-header" type="button" aria-expanded="true">
        <span class="category-icon" aria-hidden="true">${category.icon}</span>
        <span class="category-title"><strong>${category.title}</strong><span>${category.items.length} items</span></span>
        <span class="category-progress">${resolved}/${category.items.length} resolved</span><span class="chevron" aria-hidden="true">⌄</span>
      </button><div class="items">${itemMarkup}</div></section>`;
  }).join("");
  bindListEvents();
  applyFilters();
  updateProgress();
}

function renderItem(item, categoryId) {
  const [id, name, priority, target, ...notes] = item;
  const current = itemState(id);
  const tags = [`<span class="tag ${priority}">${labelFor(priority)}</span>`]
    .concat(notes.filter(Boolean).map(note => `<span class="tag ${note === "Rentable" ? "rent" : ""}">${note}</span>`)).join("");
  const options = statusOptions(item).map(([value, label]) => `<option value="${value}" ${current.status === value ? "selected" : ""}>${label}</option>`).join("");
  const quantity = target > 1 ? `<label class="quantity-wrap"><span class="sr-only">Quantity purchased</span><input class="quantity-input" type="number" min="0" max="${target}" inputmode="numeric" value="${current.quantity || 0}" data-id="${id}"><span>/ ${target}</span></label>` : "";
  return `<article class="item ${isResolved(id) ? "is-resolved" : ""}" data-id="${id}" data-category="${categoryId}" data-priority="${priority}" data-name="${name.toLowerCase()}">
    <button class="status-dot" type="button" aria-label="Mark ${name} as bought"></button>
    <div class="item-main"><p class="item-name">${name}</p><div class="tags">${tags}</div></div>
    <div class="item-controls ${target > 1 ? "" : "no-quantity"}"><label><span class="sr-only">Status for ${name}</span><select class="status-select" data-id="${id}">${options}</select></label>${quantity}</div>
  </article>`;
}

function bindListEvents() {
  document.querySelectorAll(".category-header").forEach(button => button.addEventListener("click", () => {
    const category = button.closest(".category");
    category.classList.toggle("collapsed");
    button.setAttribute("aria-expanded", String(!category.classList.contains("collapsed")));
    updateToggleLabel();
  }));
  document.querySelectorAll(".status-select").forEach(select => select.addEventListener("change", event => updateItem(event.target.dataset.id, { status: event.target.value })));
  document.querySelectorAll(".quantity-input").forEach(input => input.addEventListener("change", event => {
    const quantity = Math.max(0, Math.min(Number(event.target.max), Number(event.target.value) || 0));
    const status = quantity === 0 ? "not-bought" : quantity >= Number(event.target.max) ? "bought" : "partial";
    updateItem(event.target.dataset.id, { quantity, status });
  }));
  document.querySelectorAll(".status-dot").forEach(button => button.addEventListener("click", () => {
    const id = button.closest(".item").dataset.id;
    const item = allItems().find(entry => entry[0] === id);
    const next = isResolved(id) ? { status: "not-bought", quantity: 0 } : { status: "bought", quantity: item[3] || 0 };
    updateItem(id, next);
  }));
}

function updateItem(id, changes) {
  state[id] = { ...itemState(id), ...changes };
  const item = allItems().find(entry => entry[0] === id);
  if (changes.status === "bought" && item[3]) state[id].quantity = item[3];
  if (["not-bought", "plan-rent", "rented"].includes(changes.status)) state[id].quantity = 0;
  saveState(); render();
}

function updateProgress() {
  const total = allItems().length;
  const resolved = allItems().filter(item => isResolved(item[0])).length;
  const percent = Math.round((resolved / total) * 100);
  document.querySelector("#progressDetail").textContent = `${resolved} of ${total} items resolved`;
  document.querySelector("#progressPercent").textContent = `${percent}%`;
  document.querySelector("#progressBar").style.width = `${percent}%`;
  document.querySelector(".progress-track").setAttribute("aria-valuenow", percent);
}

function applyFilters() {
  let visibleCount = 0;
  document.querySelectorAll(".category").forEach(category => {
    let categoryVisible = 0;
    category.querySelectorAll(".item").forEach(item => {
      const current = itemState(item.dataset.id);
      const matchesSearch = item.dataset.name.includes(searchTerm);
      const matchesFilter = activeFilter === "all" ||
        (activeFilter === "needed" && !resolvedStatuses.has(current.status)) ||
        (activeFilter === "must" && item.dataset.priority === "must") ||
        (activeFilter === "resolved" && resolvedStatuses.has(current.status));
      item.hidden = !(matchesSearch && matchesFilter);
      if (!item.hidden) categoryVisible++;
    });
    category.hidden = categoryVisible === 0;
    visibleCount += categoryVisible;
  });
  document.querySelector("#emptyState").hidden = visibleCount !== 0;
}

function updateToggleLabel() {
  const categoriesShown = [...document.querySelectorAll(".category:not([hidden])")];
  const allCollapsed = categoriesShown.length && categoriesShown.every(category => category.classList.contains("collapsed"));
  document.querySelector("#toggleSections").textContent = allCollapsed ? "Expand all" : "Collapse all";
}

document.querySelector("#searchInput").addEventListener("input", event => { searchTerm = event.target.value.trim().toLowerCase(); applyFilters(); });
document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => {
  document.querySelector(".filter.active").classList.remove("active"); button.classList.add("active");
  activeFilter = button.dataset.filter; applyFilters();
}));
document.querySelector("#toggleSections").addEventListener("click", () => {
  const visible = [...document.querySelectorAll(".category:not([hidden])")];
  const collapse = !visible.every(category => category.classList.contains("collapsed"));
  visible.forEach(category => { category.classList.toggle("collapsed", collapse); category.querySelector(".category-header").setAttribute("aria-expanded", String(!collapse)); });
  updateToggleLabel();
});
const resetDialog = document.querySelector("#resetDialog");
document.querySelector("#resetButton").addEventListener("click", () => resetDialog.showModal());
document.querySelector("#confirmReset").addEventListener("click", () => { state = {}; localStorage.removeItem(storageKey); render(); });
render();
