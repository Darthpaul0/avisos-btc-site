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
  try {
    if (localStorage.getItem("cookieConsent")) return;

    const banner = document.createElement("div");
    banner.className =
      "fixed bottom-0 inset-x-0 z-50 bg-slate-900 text-white text-sm p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between";
    banner.innerHTML = `
      <span>Usamos cookies esenciales y, con tu consentimiento, analíticas.</span>
      <div class="flex gap-2">
        <button id="acceptCookies" class="bg-orange-600 px-3 py-1 rounded">Aceptar</button>
        <button id="dismissCookies" class="bg-slate-700 px-3 py-1 rounded">Ahora no</button>
      </div>
    `;
    document.body.appendChild(banner);

    document.getElementById("acceptCookies")?.addEventListener("click", () => {
      localStorage.setItem("cookieConsent", "true");
      banner.remove();
      // aquí puedes inicializar analítica si la usas
    });
    document
      .getElementById("dismissCookies")
      ?.addEventListener("click", () => banner.remove());
  } catch {
    /* no localStorage? sin banner */
  }
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
