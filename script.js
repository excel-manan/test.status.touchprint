const themeStorageKey = "touchprint-status-theme";
let latestStatusData = null;

function formatStatus(status) {
  if (!status) {
    return "Unknown";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatUpdatedAt(value) {
  if (!value) {
    return "No checks yet";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `Updated ${date.toLocaleString()}`;
}

function formatRecordTime(value) {
  if (!value) {
    return "Unknown time";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function openRecords(siteId) {
  if (!latestStatusData) {
    return;
  }

  const site = latestStatusData.sites.find((item) => item.id === siteId);
  const result = latestStatusData.results?.[siteId];
  const records = (result?.history || []).slice().reverse();
  const modal = document.getElementById("records-modal");
  const subtitle = document.getElementById("records-subtitle");
  const list = document.getElementById("records-list");

  document.getElementById("records-title").textContent = `${site?.name || "Site"} records`;
  subtitle.textContent = site?.url || "";

  if (!records.length) {
    list.innerHTML = '<div class="record-empty">No history yet.</div>';
  } else {
    list.innerHTML = records
      .map((record) => `
        <div class="record-row">
          <div class="record-time">${formatRecordTime(record.time)}</div>
          <div class="record-status">${formatStatus(record.status)}</div>
          <div class="record-latency">${record.responseTimeMs == null ? "No latency" : `${record.responseTimeMs} ms`}</div>
        </div>
      `)
      .join("");
  }

  modal.hidden = false;
}

function closeRecords() {
  document.getElementById("records-modal").hidden = true;
}

function createServiceCards(data) {
  const serviceList = document.getElementById("service-list");
  serviceList.innerHTML = "";

  data.sites
    .filter((site) => site.show !== false)
    .forEach((site) => {
      const result = data.results?.[site.id] ?? {
        status: "unknown",
        message: "No data",
        responseTimeMs: null,
        uptime30d: null,
        history: []
      };

      const history = (result.history || []).slice(-60);
      const bars = history
        .map((item) => {
          const status = typeof item === "string" ? item : item.status;
          return `<span class="mini-bar bar-${status || "unknown"}" aria-hidden="true"></span>`;
        })
        .join("");

      const row = document.createElement("article");
      row.className = "service-row";
      row.innerHTML = `
        <div class="service-line">
          <span class="status-dot dot-${result.status || "unknown"}" aria-hidden="true"></span>
          <h3 class="service-name">${site.name}</h3>
          <span class="status-label">${result.message || "Unknown"}</span>
          <span class="service-meta">${result.uptime30d == null ? "No uptime yet" : `${result.uptime30d}% uptime`}</span>
          <button class="service-action" type="button" data-site-records="${site.id}">Records</button>
        </div>
        <div class="mini-bars" aria-label="${site.name} history">
          ${bars || '<span class="empty-history">No history</span>'}
        </div>
      `;

      serviceList.appendChild(row);
    });
}

function renderStatusPage(data) {
  latestStatusData = data;
  document.getElementById("summary-title").textContent = data.overallStatus || "Status unavailable";
  document.getElementById("summary-text").textContent = data.overallMessage || "No message";
  document.getElementById("summary-grid").textContent = `${data.sites?.filter((site) => site.show !== false).length || 0} services`;
  document.getElementById("updated-at").textContent = formatUpdatedAt(data.lastUpdated);
  createServiceCards(data);
}

function applyTheme(theme) {
  document.body.setAttribute("data-bs-theme", theme);
  document.querySelector(".theme-toggle-text").textContent = theme === "dark" ? "Light" : "Dark";
}

function initThemeToggle() {
  const savedTheme = localStorage.getItem(themeStorageKey);
  const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const activeTheme = savedTheme || preferredTheme;

  applyTheme(activeTheme);

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const currentTheme = document.body.getAttribute("data-bs-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    localStorage.setItem(themeStorageKey, nextTheme);
    applyTheme(nextTheme);
  });
}

function initRecordsEvents() {
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-site-records]");
    if (trigger) {
      openRecords(trigger.getAttribute("data-site-records"));
      return;
    }

    if (event.target.closest("[data-close-records='true']") || event.target.id === "records-close") {
      closeRecords();
    }
  });
}

async function initStatusPage() {
  try {
    const response = await fetch("./status.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    renderStatusPage(data);
  } catch {
    renderStatusPage({
      overallStatus: "Status unavailable",
      overallMessage: "Could not load status.json",
      lastUpdated: "",
      sites: [],
      results: {}
    });
  }
}

initThemeToggle();
initRecordsEvents();
initStatusPage();
setInterval(initStatusPage, 60 * 1000);
