// ================= MAIN APP CONTROLLER =================

// 1. Live Header Clock & Date
function initLiveClock() {
  const clockEl = document.getElementById("live-clock");
  if (!clockEl) return;

  function update() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  update();
  setInterval(update, 1000);
}

// 2. Global Bottom Navigation & Section Switcher
function showSection(sectionId) {
  const sections = document.querySelectorAll("main section, .app-section");
  sections.forEach((sec) => {
    sec.style.display = "none";
  });

  const target = document.getElementById(sectionId);
  if (target) {
    target.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Active state indicator on bottom buttons
  const navButtons = document.querySelectorAll(".nav-btn, .bottom-nav button");
  navButtons.forEach((btn) => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-target") === sectionId) {
      btn.classList.add("active");
    }
  });
}

// 3. Panel Close Handler
function closeAllPanels() {
  const panels = [
    "camera-result-panel",
    "soil-test-panel",
    "soil-sensor-panel"
  ];
  panels.forEach((id) => {
    const p = document.getElementById(id);
    if (p) p.style.display = "none";
  });
}

// 4. Online/Offline Network Toast Notification
function initNetworkWatcher() {
  function updateNetworkStatus() {
    const banner = document.getElementById("network-status-banner");
    if (!banner) return;

    if (navigator.onLine) {
      banner.style.display = "none";
    } else {
      banner.textContent = "⚠️ Internet Ledu. Live updates aagipoyayi.";
      banner.style.display = "block";
      banner.style.background = "#d32f2f";
      banner.style.color = "#ffffff";
    }
  }

  window.addEventListener("online", updateNetworkStatus);
  window.addEventListener("offline", updateNetworkStatus);
  updateNetworkStatus();
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  initLiveClock();
  initNetworkWatcher();
});
