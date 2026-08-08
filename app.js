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
    ["hydrophilic-cloths", "Hydrophilic cloths", "must", 12, "10 × 60 × 60 cm", "2 × 100 × 100 cm"],
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
    ["moltons", "Molton mattress protectors", "must", 2, "Suggested: 2–3"],
    ["baby-nail-file", "Baby nail file", "must"]
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
const itemImages = {
  "bodysuits": [0, 0], "socks": [1, 0], "hats": [2, 0], "cardigan": [3, 0],
  "changing-pad": [0, 1], "disposable-diapers": [1, 1], "washable-diapers": [3, 1],
  "cot": [0, 2], "sleeping-bags": [1, 2], "baby-bath": [2, 2], "bath-towels": [3, 2],
  "nursing-pillow": [0, 3], "breast-pump": [1, 3], "car-seat": [2, 3], "stroller": [3, 3],
  "sweaters": [0, 0, 2], "changing-table": [1, 0, 2], "pad-covers": [2, 0, 2], "hydrophilic-cloths": [3, 0, 2],
  "burp-cloths": [0, 1, 2], "trash-bin": [1, 1, 2], "mattress": [2, 1, 2], "bottom-sheets": [3, 1, 2],
  "blankets": [0, 2, 2], "moltons": [1, 2, 2], "bath-support": [2, 2, 2], "nursing-bras": [3, 2, 2],
  "milk-bottle": [0, 3, 2], "bottle-brush": [1, 3, 2],
  "baby-monitor": [0, 0, 3], "play-mat": [1, 0, 3], "bouncer": [2, 0, 3],
  "toys": [0, 1, 3], "high-chair": [1, 1, 3], "rocking-chair": [2, 1, 3],
  "carrier": [0, 2, 3], "changing-mat": [1, 2, 3], "stroller-accessories": [2, 2, 3],
  "baby-nail-file": [0, 0, 4]
};
const storageKey = "little-list-progress-v1";
const sectionStorageKey = "little-list-sections-v1";
let state = loadState();
let sectionState = loadSectionState();
let activeFilter = "all";
let editingId = null;

function loadState() {
  try { return JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { return {}; }
}
function loadSectionState() {
  try { return JSON.parse(localStorage.getItem(sectionStorageKey)) || {}; } catch { return {}; }
}
function saveState() { localStorage.setItem(storageKey, JSON.stringify(state)); }
function saveSectionState() { localStorage.setItem(sectionStorageKey, JSON.stringify(sectionState)); }
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
  const candidate = state && typeof state === "object" ? state[id] : null;
  const saved = candidate && typeof candidate === "object" ? candidate : { status: "not-bought", quantity: 0 };
  const item = allItems().find(entry => entry[0] === id);
  const allowed = statusOptions(item).some(([value]) => value === saved.status);
  return allowed ? saved : { status: "not-bought", quantity: 0 };
}
function isResolved(id) { return resolvedStatuses.has(itemState(id).status); }
function labelFor(type) { return type === "must" ? "Must-have" : type === "later" ? "Buy later" : "Optional"; }
function reasonText(item, current) {
  if (current.status === "bought" || current.status === "rented") return "Completed";
  if (current.status === "partial") return `Bought ${current.quantity || 0} of ${item[3]}`;
  if (current.status === "plan-rent") return "Planning to rent";
  return "Not started";
}

function render() {
  const root = document.querySelector("#checklist");
  root.innerHTML = categories.map((category, categoryIndex) => {
    const resolved = category.items.filter(item => isResolved(item[0])).length;
    const itemMarkup = category.items.map(item => renderItem(item, category.id)).join("");
    const collapsed = sectionState[category.id] ?? categoryIndex > 0;
    return `<section class="category ${collapsed ? "collapsed" : ""}" data-category="${category.id}">
      <button class="category-header" type="button" aria-expanded="${!collapsed}">
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
  const rentable = notes.includes("Rentable");
  const canExplain = target > 1 || rentable;
  const reasonButtons = [
    `<button type="button" class="reason-choice ${current.status === "not-bought" ? "active" : ""}" data-status="not-bought">Not started</button>`,
    target > 1 ? `<button type="button" class="reason-choice ${current.status === "partial" ? "active" : ""}" data-status="partial">Bought partially</button>` : "",
    rentable ? `<button type="button" class="reason-choice ${current.status === "plan-rent" ? "active" : ""}" data-status="plan-rent">Planning to rent</button>` : ""
  ].join("");
  const quantityEditor = current.status === "partial" ? `<label class="partial-editor"><span>Quantity bought</span><span class="quantity-wrap"><input class="quantity-input" type="number" min="1" max="${target - 1}" inputmode="numeric" value="${current.quantity || 1}" data-id="${id}"><span>/ ${target}</span></span></label>` : "";
  const isEditing = editingId === id;
  const editor = !isResolved(id) && canExplain ? `<button type="button" class="edit-reason" aria-expanded="${isEditing}">${isEditing ? "Close" : "Edit"}</button>
    <div class="edit-panel" ${isEditing ? "" : "hidden"}><p>Why is this still open?</p><div class="reason-choices">${reasonButtons}</div>${quantityEditor}</div>` : "";
  const stateLine = canExplain ? `<div class="item-state"><span>${reasonText(item, current)}</span>${editor}</div>` : "";
  const image = itemImages[id];
  const thumbnail = image ? `<span class="item-thumbnail ${image[2] ? `sprite-${image[2]}` : ""}" role="img" aria-label="Illustration of ${name}" style="--image-x:${image[0]};--image-y:${image[1]}"></span>` : "";
  return `<article class="item ${image ? "has-image" : ""} ${isResolved(id) ? "is-resolved" : ""}" data-id="${id}" data-category="${categoryId}" data-priority="${priority}" data-name="${name.toLowerCase()}">
    <button class="status-dot" type="button" aria-label="${isResolved(id) ? "Mark" : "Mark"} ${name} ${isResolved(id) ? "as incomplete" : "as completed"}"></button>
    ${thumbnail}
    <div class="item-main"><p class="item-name">${name}</p><div class="tags">${tags}</div>${stateLine}</div>
  </article>`;
}

function bindListEvents() {
  document.querySelectorAll(".category-header").forEach(button => button.addEventListener("click", () => {
    const category = button.closest(".category");
    category.classList.toggle("collapsed");
    sectionState[category.dataset.category] = category.classList.contains("collapsed");
    saveSectionState();
    button.setAttribute("aria-expanded", String(!category.classList.contains("collapsed")));
    updateToggleLabel();
  }));
  document.querySelectorAll(".edit-reason").forEach(button => button.addEventListener("click", () => {
    const panel = button.nextElementSibling;
    panel.hidden = !panel.hidden;
    editingId = panel.hidden ? null : button.closest(".item").dataset.id;
    button.setAttribute("aria-expanded", String(!panel.hidden));
    button.textContent = panel.hidden ? "Edit" : "Close";
  }));
  document.querySelectorAll(".reason-choice").forEach(button => button.addEventListener("click", () => {
    const id = button.closest(".item").dataset.id;
    const item = allItems().find(entry => entry[0] === id);
    const quantity = button.dataset.status === "partial" ? (itemState(id).quantity || 1) : 0;
    updateItem(id, { status: button.dataset.status, quantity });
  }));
  document.querySelectorAll(".quantity-input").forEach(input => input.addEventListener("change", event => {
    const quantity = Math.max(1, Math.min(Number(event.target.max), Number(event.target.value) || 1));
    updateItem(event.target.dataset.id, { quantity, status: "partial" });
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
  if (resolvedStatuses.has(changes.status)) editingId = null;
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
      const matchesFilter = activeFilter === "all" ||
        (activeFilter === "needed" && !resolvedStatuses.has(current.status)) ||
        (activeFilter === "must" && item.dataset.priority === "must") ||
        (activeFilter === "resolved" && resolvedStatuses.has(current.status));
      item.hidden = !matchesFilter;
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

document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => {
  document.querySelector(".filter.active").classList.remove("active"); button.classList.add("active");
  activeFilter = button.dataset.filter; applyFilters();
}));
document.querySelector("#toggleSections").addEventListener("click", () => {
  const visible = [...document.querySelectorAll(".category:not([hidden])")];
  const collapse = !visible.every(category => category.classList.contains("collapsed"));
  visible.forEach(category => { category.classList.toggle("collapsed", collapse); category.querySelector(".category-header").setAttribute("aria-expanded", String(!collapse)); });
  visible.forEach(category => { sectionState[category.dataset.category] = collapse; });
  saveSectionState();
  updateToggleLabel();
});
render();
