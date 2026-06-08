const statusPageData = {
  lastUpdated: "09 Jun 2026, 9:00 AM NZST",
  overallStatus: "We're fully operational",
  overallMessage: "No active issues affecting core services.",
  summary: "4 services",
  services: [
    {
      name: "Customer Portal",
      status: "operational",
      uptime: "30 day uptime: 99.98%",
      description: "99.98% uptime",
      history: [
        "operational", "operational", "operational", "operational", "operational", "operational",
        "operational", "operational", "operational", "operational", "operational", "operational",
        "operational", "operational", "operational", "operational", "operational", "operational",
        "operational", "operational", "operational", "operational", "operational", "operational",
        "operational", "operational", "operational", "operational", "operational", "operational",
        "operational", "operational", "operational", "operational", "operational", "operational",
        "operational", "operational", "operational", "operational", "operational", "operational",
        "operational", "operational", "operational", "operational", "operational", "operational",
        "operational", "operational", "operational", "operational", "operational", "operational",
        "operational", "operational", "operational", "operational", "operational", "operational"
      ]
    },
    {
      name: "Order Processing API",
      status: "degraded",
      uptime: "99.41% uptime",
      description: "Higher latency",
      history: [
        "operational", "operational", "degraded", "degraded", "operational", "operational",
        "operational", "operational", "operational", "degraded", "operational", "operational",
        "operational", "operational", "operational", "operational", "operational", "operational",
        "degraded", "operational", "operational", "operational", "operational", "operational",
        "operational", "operational", "operational", "operational", "operational", "operational",
        "operational", "operational", "operational", "operational", "operational", "operational",
        "operational", "degraded", "operational", "operational", "operational", "operational",
        "operational", "operational", "operational", "operational", "operational", "operational",
        "operational", "operational", "degraded", "operational", "operational", "operational",
        "operational", "operational", "operational", "operational", "operational", "operational"
      ]
    },
    {
      name: "Authentication",
      status: "operational",
      uptime: "100% uptime",
      description: "Normal",
      history: new Array(60).fill("operational")
    },
    {
      name: "File Uploads",
      status: "maintenance",
      uptime: "Planned work",
      description: "Maintenance",
      history: [
        ...new Array(50).fill("operational"),
        "maintenance", "maintenance", "maintenance", "maintenance", "maintenance",
        "maintenance", "maintenance", "maintenance", "maintenance", "maintenance"
      ]
    }
  ],
  canDo: [
    "Host on GitHub Pages.",
    "Edit service status in script.js.",
    "Show uptime bars and notes.",
    "Keep light and dark theme."
  ],
  cannotDo: [
    "Auto-ping without external automation.",
    "Store secrets safely in browser code.",
    "Run backend checks from GitHub Pages only.",
    "Send alerts without another service."
  ]
};

const statusLabels = {
  operational: "Operational",
  degraded: "Degraded",
  outage: "Outage",
  maintenance: "Maintenance"
};

const themeStorageKey = "touchprint-status-theme";

function createServiceCards(services) {
  const serviceList = document.getElementById("service-list");

  services.forEach((service) => {
    const row = document.createElement("article");
    row.className = "service-row";

    const bars = service.history
      .map((item) => `<span class="mini-bar bar-${item}" aria-hidden="true"></span>`)
      .join("");

    row.innerHTML = `
      <div class="service-line">
        <span class="status-dot dot-${service.status}" aria-hidden="true"></span>
        <h3 class="service-name">${service.name}</h3>
        <span class="status-label">${service.description}</span>
        <span class="service-meta">${service.uptime}</span>
      </div>
      <div class="mini-bars" aria-label="${service.name} history">
        ${bars}
      </div>
    `;

    serviceList.appendChild(row);
  });
}

function createListItems(targetId, items) {
  const list = document.getElementById(targetId);

  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
}

function initStatusPage(data) {
  document.getElementById("updated-at").textContent = data.lastUpdated;
  document.getElementById("summary-title").textContent = data.overallStatus;
  document.getElementById("summary-text").textContent = data.overallMessage;
  document.getElementById("summary-grid").textContent = data.summary;
  createServiceCards(data.services);
  createListItems("can-do-list", data.canDo);
  createListItems("cannot-do-list", data.cannotDo);
}

function applyTheme(theme) {
  const body = document.body;
  const toggleText = document.querySelector(".theme-toggle-text");
  const nextLabel = theme === "dark" ? "Light" : "Dark";

  body.setAttribute("data-bs-theme", theme);
  toggleText.textContent = nextLabel;
}

function initThemeToggle() {
  const savedTheme = localStorage.getItem(themeStorageKey);
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = savedTheme || (systemPrefersDark ? "dark" : "light");
  const toggle = document.getElementById("theme-toggle");

  applyTheme(theme);

  toggle.addEventListener("click", () => {
    const currentTheme = document.body.getAttribute("data-bs-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    localStorage.setItem(themeStorageKey, nextTheme);
    applyTheme(nextTheme);
  });
}

initThemeToggle();
initStatusPage(statusPageData);
