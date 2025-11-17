// ui.js
export function onDomReady(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
  } else fn();
}

export function setDynamicYear(id = "year") {
  const el = document.getElementById(id);
  if (el) el.textContent = new Date().getFullYear();
}

export function initCookieBanner() {
  const banner = document.getElementById("cookie-banner");
  if (!banner) return;

  const consentData = JSON.parse(
    localStorage.getItem("cookieConsent") || "null"
  );
  const now = Date.now();
  const sixMonths = 1000 * 60 * 60 * 24 * 180; // 180 días

  // Si ya hay consentimiento y no ha caducado, no mostramos el banner
  if (consentData && now - consentData.timestamp < sixMonths) {
    if (consentData.status === "accepted") enableAnalytics();
    return;
  }

  // Si no hay consentimiento o ha caducado, mostrar el banner
  banner.classList.remove("hidden");

  const acceptBtn = document.getElementById("cookie-accept");
  const rejectBtn = document.getElementById("cookie-reject");

  acceptBtn?.addEventListener("click", () => {
    localStorage.setItem(
      "cookieConsent",
      JSON.stringify({ status: "accepted", timestamp: Date.now() })
    );
    banner.classList.add("hidden");
  });

  rejectBtn?.addEventListener("click", () => {
    localStorage.setItem(
      "cookieConsent",
      JSON.stringify({ status: "rejected", timestamp: Date.now() })
    );
    banner.classList.add("hidden");
  });
}

// /js/ui.js (solo esta función)
export function initMobileMenu({
  buttonId = "mobileMenuButton",
  menuId = "mobileMenu",
} = {}) {
  const btn = document.getElementById(buttonId);
  const menu = document.getElementById(menuId);
  if (!btn || !menu) return;

  // Asegura un estado inicial coherente: si no está visible, que esté hidden
  if (!menu.classList.contains("menu-visible")) {
    menu.classList.add("menu-hidden");
    menu.classList.remove("menu-visible");
  }

  function open() {
    menu.classList.add("menu-visible");
    menu.classList.remove("menu-hidden");
    btn.setAttribute("aria-expanded", "true");
  }
  function close() {
    menu.classList.add("menu-hidden");
    menu.classList.remove("menu-visible");
    btn.setAttribute("aria-expanded", "false");
  }
  function toggle() {
    if (menu.classList.contains("menu-visible")) {
      close();
    } else {
      open();
    }
  }

  btn.addEventListener("click", toggle);

  // Cerrar al navegar a anclas internas + scroll suave
  menu.querySelectorAll("a[href^='#'], a[href*='index.html#']").forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").split("#")[1];
      const target = id ? document.getElementById(id) : null;
      if (target) {
        e.preventDefault();
        close();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}
