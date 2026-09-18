const allowedMissionTypes = [
  "Atreides",
  "Bene Gesserit",
  "Chained",
  "Delivery",
  "Harkonnen",
  "Mentat",
  "Planetologist Regular",
  "Story",
  "Swordmaster",
  "Trooper"
];

const missionCatalog = [
  {
    id: "atreides-01",
    name: "A Betrayal Within a Betrayal",
    faction: "Atreides",
    type: "Atreides",
    description: "Investigate who turned on the House and exposed the conspiracy behind the betrayal.",
    reward: "House favor"
  },
  {
    id: "atreides-02",
    name: "A Center of Learning",
    faction: "Atreides",
    type: "Planetologist Regular",
    description: "Scout out a hidden research outpost and recover the materials required for a safe return.",
    reward: "Intel cache"
  },
  {
    id: "atreides-03",
    name: "A New Cultist",
    faction: "Atreides",
    type: "Trooper",
    description: "Take down hostile cultists before they spread chaos through the region.",
    reward: "Weapon parts"
  },
  {
    id: "atreides-04",
    name: "Broken Tools",
    faction: "Atreides",
    type: "Mentat",
    description: "Recover damaged gear and salvage the lost components needed to repair the station inventory.",
    reward: "Advanced tools"
  },
  {
    id: "atreides-05",
    name: "The Long March",
    faction: "Atreides",
    type: "Delivery",
    description: "Escort vital supplies across contested land while defending against enemy scouts.",
    reward: "Supply crate"
  },
  {
    id: "harkonnen-01",
    name: "A Bloody Development",
    faction: "Harkonnen",
    type: "Harkonnen",
    description: "Crush rival operatives before they can disrupt your extraction route.",
    reward: "Resource cache"
  },
  {
    id: "harkonnen-02",
    name: "A Golden Opportunity",
    faction: "Harkonnen",
    type: "Delivery",
    description: "Secure a profitable trade route and keep supplies moving before the price collapses.",
    reward: "Credit boost"
  },
  {
    id: "harkonnen-03",
    name: "Testing the Waters",
    faction: "Harkonnen",
    type: "Bene Gesserit",
    description: "Survey the valley edges and confirm the enemy movement patterns for the next strike.",
    reward: "Map data"
  },
  {
    id: "harkonnen-04",
    name: "The Price of Power",
    faction: "Harkonnen",
    type: "Story",
    description: "Secure a strategic site and defend it against a coordinated counterattack.",
    reward: "Influence points"
  },
  {
    id: "harkonnen-05",
    name: "Shifting Sands",
    faction: "Harkonnen",
    type: "Swordmaster",
    description: "Track enemy movement through shifting dunes and uncover hidden trade routes.",
    reward: "Rare spice"
  }
];

const state = {
  viewMode: "grouped",
  activeType: "all",
  activeFaction: "all",
  completed: {},
  expandedGroups: new Set(["Atreides", "Harkonnen"])
};

const storageKey = "duneAwakeningContractTracker";

const elements = {
  typeFilters: document.querySelector("#typeFilters"),
  factionFilters: document.querySelector("#factionFilters"),
  summaryBar: document.querySelector("#summaryBar"),
  missionsContainer: document.querySelector("#missionsContainer"),
  saveBtn: document.querySelector("#saveBtn"),
  loadInput: document.querySelector("#loadInput"),
  modeButtons: document.querySelectorAll(".mode-btn")
};

document.addEventListener("DOMContentLoaded", () => {
  hydrateState();
  renderFilters();
  bindEvents();
  render();
});

function hydrateState() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (parsed.viewMode === "table" || parsed.viewMode === "grouped") {
      state.viewMode = parsed.viewMode;
    }

    if (parsed.completed && typeof parsed.completed === "object") {
      state.completed = parsed.completed;
    }
  } catch (error) {
    console.warn("Unable to load saved progress", error);
  }
}

function bindEvents() {
  elements.saveBtn.addEventListener("click", saveProgressAsJson);
  elements.loadInput.addEventListener("change", handleJsonLoad);

  elements.modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.viewMode = button.dataset.view;
      persistState();
      render();
    });
  });

  elements.typeFilters.addEventListener("click", (event) => {
    const button = event.target.closest(".filter-pill");
    if (!button) return;
    state.activeType = button.dataset.type;
    render();
  });

  elements.factionFilters.addEventListener("click", (event) => {
    const button = event.target.closest(".filter-pill");
    if (!button) return;
    state.activeFaction = button.dataset.faction;
    render();
  });

  elements.missionsContainer.addEventListener("change", (event) => {
    const target = event.target.closest(".mission-check input, .table-check input");
    if (!target) return;

    const missionId = target.dataset.id;
    if (!missionId) return;

    state.completed[missionId] = Boolean(target.checked);
    persistState();
    render();
  });

  elements.missionsContainer.addEventListener("click", (event) => {
    const toggle = event.target.closest(".accordion-toggle");
    if (!toggle) return;

    const faction = toggle.dataset.faction;
    if (state.expandedGroups.has(faction)) {
      state.expandedGroups.delete(faction);
    } else {
      state.expandedGroups.add(faction);
    }

    render();
  });
}

function renderFilters() {
  const typeValues = ["all", ...allowedMissionTypes];
  const factionValues = ["all", "Atreides", "Harkonnen"];

  elements.typeFilters.innerHTML = typeValues
    .map((type) => {
      const label = type === "all" ? "All" : type;
      const active = state.activeType === type ? "active" : "";
      return `<button class="filter-pill ${active}" data-type="${type}">${label}</button>`;
    })
    .join("");

  elements.factionFilters.innerHTML = factionValues
    .map((faction) => {
      const label = faction === "all" ? "All" : faction;
      const active = state.activeFaction === faction ? "active" : "";
      return `<button class="filter-pill ${active}" data-faction="${faction}">${label}</button>`;
    })
    .join("");

  elements.modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === state.viewMode);
  });
}

function render() {
  renderFilters();

  const visibleMissions = getVisibleMissions();
  const completedCount = visibleMissions.filter((mission) => isMissionComplete(mission.id)).length;
  const totalCount = visibleMissions.length;

  elements.summaryBar.textContent = `Visible missions: ${completedCount}/${totalCount} complete`;

  if (!visibleMissions.length) {
    elements.missionsContainer.innerHTML = '<div class="empty-state">No missions match the current filter selection.</div>';
    return;
  }

  if (state.viewMode === "table") {
    renderTableView(visibleMissions);
  } else {
    renderGroupedView(visibleMissions);
  }
}

function getVisibleMissions() {
  return missionCatalog.filter((mission) => {
    const typeMatch = state.activeType === "all" || mission.type === state.activeType;
    const factionMatch = state.activeFaction === "all" || mission.faction === state.activeFaction;
    return typeMatch && factionMatch;
  });
}

function renderTableView(missions) {
  elements.missionsContainer.innerHTML = `
    <table class="mission-table">
      <thead>
        <tr>
          <th>Mission</th>
          <th>Faction</th>
          <th>Type</th>
          <th>Details</th>
          <th>Done</th>
        </tr>
      </thead>
      <tbody>
        ${missions
          .map((mission) => {
            const complete = isMissionComplete(mission.id);
            return `
              <tr class="${complete ? "is-complete" : ""}">
                <td><strong>${mission.name}</strong></td>
                <td>${mission.faction}</td>
                <td>${mission.type}</td>
                <td>${mission.description}</td>
                <td>
                  <label class="table-check">
                    <input type="checkbox" class="mission-check-input" data-id="${mission.id}" ${complete ? "checked" : ""} />
                  </label>
                </td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

function renderGroupedView(missions) {
  const grouped = new Map();

  missions.forEach((mission) => {
    const groupKey = mission.faction || "Unassigned";
    if (!grouped.has(groupKey)) grouped.set(groupKey, []);
    grouped.get(groupKey).push(mission);
  });

  const groupMarkup = Array.from(grouped.entries())
    .map(([faction, factionMissions]) => {
      const completedCount = factionMissions.filter((mission) => isMissionComplete(mission.id)).length;
      const expanded = state.expandedGroups.has(faction);

      return `
        <section class="group-block ${expanded ? "" : "collapsed"}">
          <button class="accordion-toggle" data-faction="${faction}" aria-expanded="${expanded}">
            <span class="group-name">${faction}</span>
            <span class="group-summary">${completedCount}/${factionMissions.length} complete</span>
          </button>
          <div class="group-content">
            ${factionMissions
              .map((mission) => {
                const complete = isMissionComplete(mission.id);
                return `
                  <div class="mission-row ${complete ? "is-complete" : ""}" data-id="${mission.id}">
                    <label class="mission-check">
                      <input type="checkbox" data-id="${mission.id}" ${complete ? "checked" : ""} />
                    </label>

                    <div class="mission-main">
                      <div class="mission-topline">
                        <span class="mission-name">${mission.name}</span>
                        <span class="mission-pill">${mission.type}</span>
                      </div>
                      <div class="mission-subline">${mission.description}</div>
                    </div>

                    <div class="mission-meta">${mission.reward}</div>

                    <div class="mission-tooltip">
                      <strong>Mission details</strong>
                      <p><strong>Type:</strong> ${mission.type}</p>
                      <p><strong>Faction:</strong> ${mission.faction}</p>
                      <p>${mission.description}</p>
                      <p><strong>Reward:</strong> ${mission.reward}</p>
                    </div>
                  </div>
                `;
              })
              .join("")}
          </div>
        </section>
      `;
    })
    .join("");

  elements.missionsContainer.innerHTML = groupMarkup;
}

function isMissionComplete(missionId) {
  return Boolean(state.completed[missionId]);
}

function persistState() {
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      viewMode: state.viewMode,
      completed: state.completed,
      updatedAt: new Date().toISOString()
    })
  );
}

function saveProgressAsJson() {
  const payload = {
    title: "Dune Awakening Contract Tracker",
    updatedAt: new Date().toISOString(),
    missions: missionCatalog.map((mission) => ({
      id: mission.id,
      name: mission.name,
      faction: mission.faction,
      type: mission.type,
      completed: Boolean(state.completed[mission.id])
    }))
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "dune-awakening-contract-tracker-save.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function handleJsonLoad(event) {
  const [file] = event.target.files;
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      if (!Array.isArray(parsed.missions)) {
        throw new Error("The selected file does not contain a valid mission list.");
      }

      parsed.missions.forEach((mission) => {
        if (mission && mission.id) {
          state.completed[mission.id] = Boolean(mission.completed);
        }
      });

      persistState();
      render();
    } catch (error) {
      console.error(error);
      alert("Unable to load that JSON file. Please choose a valid Dune Awakening Contract Tracker export.");
    } finally {
      event.target.value = "";
    }
  };

  reader.readAsText(file);
}
