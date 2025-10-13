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

(function initBTCChart() {
  const canvas = document.getElementById("chartBTC");
  if (!canvas) return; // si no existe la sección, no hacemos nada

  // 1) Ruta del Excel. Ajusta si lo colocas en otra carpeta:
  //    Ejemplos válidos:
  //    - "./btc_price.xlsx" (misma carpeta que index.html)
  //    - "/data/btc_price.xlsx"  (carpeta /data en el servidor)
  const BTC_XLSX_URL = "/data/btc_price.xlsx";

  // 2) Cargar y parsear el Excel
  fetch(BTC_XLSX_URL)
    .then((r) => {
      if (!r.ok) throw new Error("No se pudo cargar btc_price.xlsx");
      return r.arrayBuffer();
    })
    .then((buf) => {
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

      // 3) Normalizar filas -> [{year, price}] o [{date, price}]
      const series = normalizeBTCData(rows);
      if (!series.length)
        throw new Error("No se encontraron columnas compatibles");

      // 4) Preparar labels y datos para Chart.js
      //    Si hay 'year', usamos años; si hay 'date', usamos fechas completas
      const useYears = !!series[0].year;
      const labels = series.map((d) => (useYears ? String(d.year) : d.date));
      const prices = series.map((d) => d.price);
      const minY = Math.max(Number.EPSILON, Math.min(...prices));
      const maxY = Math.max(...prices);
      const logTicks = buildLogTicks(minY, maxY);

      // 5) Pintar gráfico (usamos tu helper makeChart)
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "rgba(234,88,12,0.25)"); // orange-600
      gradient.addColorStop(1, "rgba(234,88,12,0.00)");

      // Utilidad: formato compacto bonito para euros (cambia "€" por "$" si tus datos son USD)
      const CURRENCY = "€";
      const fmtCompact = (n) => {
        if (n < 1)
          return (
            CURRENCY +
            new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(
              n
            )
          );
        return (
          CURRENCY +
          new Intl.NumberFormat("es-ES", {
            notation: "compact",
            maximumFractionDigits: 2,
          }).format(n)
        );
      };

      // Ticks de potencias de 10 en el rango [min,max]
      function buildLogTicks(min, max) {
        const minExp = Math.floor(Math.log10(min));
        const maxExp = Math.ceil(Math.log10(max));
        const values = [];
        for (let e = minExp; e <= maxExp; e++) values.push(Math.pow(10, e));
        return values;
      }

      makeChart(
        canvas,
        "line",
        {
          labels,
          datasets: [
            {
              label: "BTC",
              data: prices,
              borderColor: "rgb(234,88,12)",
              borderWidth: 2.25, // más grosor
              backgroundColor: gradient,
              fill: true,
              tension: 0.25,
              pointRadius: 0,
              pointHoverRadius: 3,
            },
          ],
        },
        {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  " " +
                  CURRENCY +
                  new Intl.NumberFormat("es-ES", {
                    maximumFractionDigits: 2,
                  }).format(ctx.parsed.y),
              },
            },
          },
          scales: {
            x: {
              ticks: { maxRotation: 0 },
              grid: { display: false },
            },
            y: {
              type: "logarithmic",
              min: logTicks[0],
              max: logTicks[logTicks.length - 1],
              afterBuildTicks: (axis) => {
                // Forzamos ticks limpios: 10^n
                axis.ticks = logTicks.map((v) => ({ value: v }));
              },
              ticks: {
                // Evita demasiadas marcas
                maxTicksLimit: 10,
                callback: (value) => fmtCompact(value),
              },
              grid: {
                color: "rgba(148,163,184,0.18)",
                drawTicks: false,
              },
            },
          },
        }
      );
    })
    .catch((err) => {
      // Mensaje discreto en caso de error
      const wrapper = canvas.closest(".rounded-2xl") || canvas.parentElement;
      if (wrapper) {
        const note = document.createElement("div");
        note.className = "mt-3 text-sm text-rose-600 dark:text-rose-400";
        note.textContent = "No se pudo cargar el Excel de BTC: " + err.message;
        wrapper.appendChild(note);
      }
      console.error(err);
    });

  // --- Helpers ---
  function formatCurrency(n) {
    return (
      "€" + Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(n)
    );
  }

  // Soporta:
  //  - Columnas: "Año" y "Precio"  → se grafican cierres por año.
  //  - Columnas: "Fecha"(YYYY-MM-DD) y "Precio" → se grafican fechas (línea densa).
  //  - Columnas "Year"/"Date"/"Price" en inglés.
  //  - Si hay datos diarios y quieres agrupar por año, descomenta el bloque de agregación anual.
  function normalizeBTCData(rows) {
    const keys = rows.length ? Object.keys(rows[0]) : [];
    const keyYear = keys.find((k) => /^(año|anio|year)$/i.test(k)) || null;
    const keyDate = keys.find((k) => /fecha|date/i.test(k)) || null;
    const keyPrice = keys.find((k) => /precio|price/i.test(k)) || null;

    if (!keyPrice || (!keyYear && !keyDate)) return [];

    // A) Preferimos year+price si existe (tabla anual)
    if (keyYear) {
      const out = rows
        .map((r) => ({
          year: Number(String(r[keyYear]).trim()),
          price: Number(String(r[keyPrice]).toString().replace(",", ".")),
        }))
        .filter((d) => Number.isFinite(d.year) && Number.isFinite(d.price))
        .sort((a, b) => a.year - b.year);

      return out;
    }

    // B) Si hay fecha diaria/mensual
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

    // Formato final de etiquetas legibles
    const out = raw.map((d) => ({
      date: d.date.toISOString().slice(0, 10), // YYYY-MM-DD
      price: d.price,
    }));

    // --- (Opcional) Agregar por año (tomar último precio del año)
    // const byYear = new Map();
    // for (const r of raw) {
    //   const y = r.date.getFullYear();
    //   byYear.set(y, r.price); // último del año
    // }
    // return Array.from(byYear, ([year, price]) => ({ year, price }))
    //             .sort((a, b) => a.year - b.year);

    return out;
  }
})();

// Ejecutar banner tras cargar el DOM
window.addEventListener("DOMContentLoaded", initializeDynamicContent);
