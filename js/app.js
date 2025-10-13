// Avisos BTC – lógica ligera de la landing

function initializeDynamicContent() {
  // --- Año dinámico en footer ---
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- Cookie banner (consentimiento básico) ---
  initCookieBanner();

  // --- Menú móvil ---
  initMobileMenu();
}

// --- Chart helper ---
function makeChart(ctx, type, data, options) {
  // Chart.js is loaded globally via CDN in index.html
  return new Chart(ctx, { type, data, options });
}

// --- Hero mini-chart (actividad de avisos) ---
try {
  const heroCtx = document.getElementById("chartHero");
  if (heroCtx) {
    const days = Array.from({ length: 14 }, (_, i) => `D${i + 1}`);
    makeChart(
      heroCtx,
      "line",
      {
        labels: days,
        datasets: [
          {
            label: "Alertas",
            data: days.map(() => Math.round(Math.random() * 20) + 5),
            tension: 0.35,
            fill: true,
          },
        ],
      },
      {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { ticks: { callback: (v) => v } } },
      }
    );
  }
} catch {
  /* no-op */
}

// --- Acierto (30d) ---
try {
  const aciertoCtx = document.getElementById("chartAcierto");
  if (aciertoCtx) {
    const labels = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
    makeChart(
      aciertoCtx,
      "line",
      {
        labels,
        datasets: [
          {
            label: "Acierto %",
            data: labels.map(() => Math.round(45 + Math.random() * 35)),
            fill: false,
            tension: 0.35,
          },
        ],
      },
      {
        plugins: { legend: { display: true } },
        scales: {
          y: {
            suggestedMin: 0,
            suggestedMax: 100,
            ticks: { callback: (v) => v + "%" },
          },
        },
      }
    );
  }
} catch {
  /* no-op */
}

// --- Rendimiento por estrategia (bar) ---
try {
  const estrCtx = document.getElementById("chartEstrategias");
  if (estrCtx) {
    const estrategias = ["Breakout", "RSI", "EMA x", "Reversión"];
    makeChart(
      estrCtx,
      "bar",
      {
        labels: estrategias,
        datasets: [
          {
            label: "Rendimiento %",
            data: estrategias.map(() => (Math.random() * 8 - 2).toFixed(2)),
          },
        ],
      },
      {
        plugins: { legend: { display: true } },
        scales: { y: { ticks: { callback: (v) => v + "%" } } },
      }
    );
  }
} catch {
  /* no-op */
}

// --- Cookie banner (consentimiento básico) ---
function initCookieBanner() {
  try {
    if (localStorage.getItem("cookieConsent")) return;

    const banner = document.createElement("div");
    banner.className =
      "fixed bottom-0 inset-x-0 bg-slate-900 text-white text-sm p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between z-50";
    banner.innerHTML = `
      <span>Usamos cookies esenciales y, con tu consentimiento, analíticas. Podrás cambiarlo más adelante.</span>
      <div class="flex gap-2">
        <button id="acceptCookies" class="bg-orange-600 px-3 py-1 rounded">Aceptar</button>
        <button id="dismissCookies" class="bg-slate-700 px-3 py-1 rounded">Ahora no</button>
      </div>
    `;

    document.body.appendChild(banner);

    document.getElementById("acceptCookies")?.addEventListener("click", () => {
      localStorage.setItem("cookieConsent", "true");
      banner.remove();
      // TODO: inicializar aquí analítica opcional respetando el consentimiento
    });

    document.getElementById("dismissCookies")?.addEventListener("click", () => {
      banner.remove(); // no guardamos consentimiento
    });
  } catch {
    // si localStorage no está disponible, no mostramos banner
  }
}

function initMobileMenu() {
  const menuBtn = document.getElementById("mobileMenuButton");
  const menu = document.getElementById("mobileMenu");

  if (!menuBtn || !menu) return;

  menuBtn.addEventListener("click", () => {
    menu.classList.toggle("menu-visible");
  });

  // Cerrar menú y hacer scroll suave al hacer clic en enlaces internos
  menu
    .querySelectorAll("a[href^='#'], a[href*='index.html#']")
    .forEach((link) => {
      link.addEventListener("click", (e) => {
        const targetId = link.getAttribute("href").split("#")[1];
        const targetEl = document.getElementById(targetId);

        if (targetEl) {
          e.preventDefault(); // evitar salto brusco
          menu.classList.remove("menu-visible"); // cerrar menú
          targetEl.scrollIntoView({ behavior: "smooth" }); // scroll suave
        }
      });
    });
}

// ================= BTC en datos (carga Excel + Chart) =================
// Requisitos previos en la página:
//  - <canvas id="chartBTC"></canvas>
//  - Chart.js ya cargado (la página lo tiene).
//  - SheetJS (xlsx.full.min.js) añadido en <head>.

// ================= BTC en datos (Excel + Chart con toggle de escala) =================
(function initBTCChart() {
  const canvas = document.getElementById("chartBTC");
  if (!canvas) return;

  const BTC_XLSX_URL = "/data/btc_price.xlsx";
  const readout = document.getElementById("btcHoverReadout");
  const btnLin = document.getElementById("btnScaleLinear");
  const btnLog = document.getElementById("btnScaleLog");

  // --- Utilidades de formato
  const CURRENCY = "€";
  const fmtNum = (n, opts = { maximumFractionDigits: 2 }) =>
    new Intl.NumberFormat("es-ES", opts).format(n);
  const fmtCompact = (n) => {
    if (n < 1) return CURRENCY + fmtNum(n);
    return (
      CURRENCY + fmtNum(n, { notation: "compact", maximumFractionDigits: 2 })
    );
  };

  // --- Crosshair / guía vertical + visor Año·Precio
  const hoverGuidePlugin = {
    id: "hoverGuide",
    afterDatasetsDraw(chart, args, pluginOptions) {
      const { ctx, tooltip, chartArea, scales } = chart;
      const active = tooltip?.dataPoints?.[0];
      if (!active) return;

      // línea vertical
      const x = active.element.x;
      ctx.save();
      ctx.strokeStyle = "rgba(148,163,184,0.35)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x, chartArea.top);
      ctx.lineTo(x, chartArea.bottom);
      ctx.stroke();
      ctx.restore();

      // visor año·precio en el header (fuera del canvas)
      const label = active.label;
      const value = active.parsed.y;
      if (readout)
        readout.textContent = `${label} · ${CURRENCY}${fmtNum(value)}`;
    },
    afterEvent(chart) {
      // cuando no hay hover, limpia el visor
      const { tooltip } = chart;
      if (!tooltip?.dataPoints?.length && readout) readout.textContent = "—";
    },
  };
  Chart.register(hoverGuidePlugin); // registro global

  // --- Cargar Excel y dibujar
  fetch(BTC_XLSX_URL)
    .then((r) => {
      if (!r.ok) throw new Error("No se pudo cargar btc_price.xlsx");
      return r.arrayBuffer();
    })
    .then((buf) => {
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

      const series = normalizeBTCData(rows);
      if (!series.length)
        throw new Error(
          "Estructura del Excel no reconocida (se esperaban columnas Año/Precio o Fecha/Precio)"
        );

      const useYears = !!series[0].year;
      const labels = series.map((d) => (useYears ? String(d.year) : d.date));
      const prices = series.map((d) => d.price);

      // colores y estilos
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "rgba(234,88,12,0.25)"); // orange-600
      gradient.addColorStop(1, "rgba(234,88,12,0.00)");

      // ticks X legibles: 6–9 marcas según ancho
      const step = Math.max(1, Math.ceil(labels.length / 8));

      // Construye opciones base (lineal por defecto)
      const baseOptions = (scaleType) => ({
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              label: (ctx) => " " + CURRENCY + fmtNum(ctx.parsed.y),
              title: (items) => items[0]?.label ?? "",
            },
          },
        },
        scales: {
          x: {
            grid: { display: true, color: "rgba(148,163,184,0.12)" },
            ticks: {
              autoSkip: false,
              callback: (val, i) => (i % step === 0 ? labels[i] : ""),
              maxRotation: 0,
            },
          },
          y: {
            type: "linear",
            beginAtZero: false,
            suggestedMin: Math.min(...prices) * 0.9,
            suggestedMax: Math.max(...prices) * 1.05,
            ticks: { callback: (v) => fmtCompact(v) },
            grid: { color: "rgba(148,163,184,0.18)", drawTicks: false },
          },
        },
      });

      // dataset
      const data = {
        labels,
        datasets: [
          {
            label: "BTC",
            data: prices,
            borderColor: "rgb(234,88,12)",
            borderWidth: 2.25,
            backgroundColor: gradient,
            fill: true,
            tension: 0.25,
            pointRadius: 2,
            pointHoverRadius: 4,
          },
        ],
      };

      // pinta (lineal por defecto)
      let scaleType = "linear";
      let chart = makeChart(canvas, "line", data, baseOptions(scaleType)); // helper de tu app.js
    })
    .catch((err) => {
      const wrapper = canvas.closest(".rounded-2xl") || canvas.parentElement;
      if (wrapper) {
        const note = document.createElement("div");
        note.className = "mt-3 text-sm text-rose-600 dark:text-rose-400";
        note.textContent = "No se pudo cargar el Excel de BTC: " + err.message;
        wrapper.appendChild(note);
      }
      console.error(err);
    });

  // --- Normalizador de datos de Excel
  function normalizeBTCData(rows) {
    const keys = rows.length ? Object.keys(rows[0]) : [];
    const keyYear = keys.find((k) => /^(año|anio|year)$/i.test(k)) || null;
    const keyDate = keys.find((k) => /fecha|date/i.test(k)) || null;
    const keyPrice = keys.find((k) => /precio|price/i.test(k)) || null;
    if (!keyPrice || (!keyYear && !keyDate)) return [];

    if (keyYear) {
      return rows
        .map((r) => ({
          year: Number(String(r[keyYear]).trim()),
          price: Number(String(r[keyPrice]).toString().replace(",", ".")),
        }))
        .filter((d) => Number.isFinite(d.year) && Number.isFinite(d.price))
        .sort((a, b) => a.year - b.year);
    }

    const raw = rows
      .map((r) => {
        const d = new Date(r[keyDate]);
        const price = Number(String(r[keyPrice]).toString().replace(",", "."));
        return {
          date: isNaN(d) ? null : d,
          price: Number.isFinite(price) ? price : null,
        };
      })
      .filter((d) => d.date && d.price != null)
      .sort((a, b) => a.date - b.date);

    return raw.map((d) => ({
      date: d.date.toISOString().slice(0, 10),
      price: d.price,
    }));
  }
})();

// Ejecutar banner tras cargar el DOM
window.addEventListener("DOMContentLoaded", initializeDynamicContent);
