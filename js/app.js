// /js/app.js
import {
  onDomReady,
  setDynamicYear,
  initCookieBanner,
  initMobileMenu,
} from "./ui.js";
import {
  renderHeroMiniChart,
  renderAciertoChart,
  renderEstrategiasChart,
  initBTCChart,
} from "./charts.js";

let booted = false;
function boot() {
  if (booted) return; // evita doble init si llegan dos eventos
  booted = true;

  // UI base
  setDynamicYear("year");
  initCookieBanner();

  // Menú móvil (solo si existen los nodos)
  if (
    document.getElementById("mobileMenuButton") &&
    document.getElementById("mobileMenu")
  ) {
    initMobileMenu({ buttonId: "mobileMenuButton", menuId: "mobileMenu" });
  }

  // Charts (descomenta si procede)
  renderHeroMiniChart("chartHero");
  renderAciertoChart("chartAcierto");
  renderEstrategiasChart("chartEstrategias");
  initBTCChart({ canvasId: "chartBTC", xlsxUrl: "/data/btc_price.xlsx" });
}

// 1) si el header ya viene inline en esta página
onDomReady(() => {
  if (document.getElementById("mobileMenuButton")) boot();
});

// 2) si el header se inyecta asíncronamente por includes.js
document.addEventListener("includes:ready", () => boot(), { once: true });
