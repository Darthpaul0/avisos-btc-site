// charts.js
// Helper simple que envuelve Chart.js (cargado por CDN como global)
export function makeChart(ctx, type, data, options) {
  if (!window.Chart) {
    console.error(
      "Chart.js no encontrado. Asegúrate de cargarlo antes de app.js"
    );
    return null;
  }
  return new Chart(ctx, { type, data, options });
}

/* ========== Mini-charts de la landing ========== */
export function renderHeroMiniChart(id = "chartHero") {
  const el = document.getElementById(id);
  if (!el) return;

  const labels = Array.from({ length: 14 }, (_, i) => `D${i + 1}`);
  const data = labels.map(() => Math.round(Math.random() * 20) + 5);

  makeChart(
    el,
    "line",
    {
      labels,
      datasets: [{ label: "Alertas", data, tension: 0.35, fill: true }],
    },
    {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { ticks: { callback: (v) => v } } },
    }
  );
}

export function renderAciertoChart(id = "chartAcierto") {
  const el = document.getElementById(id);
  if (!el) return;

  const labels = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
  const data = labels.map(() => Math.round(45 + Math.random() * 35));

  makeChart(
    el,
    "line",
    {
      labels,
      datasets: [{ label: "Acierto %", data, tension: 0.35, fill: false }],
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

export function renderEstrategiasChart(id = "chartEstrategias") {
  const el = document.getElementById(id);
  if (!el) return;

  const estrategias = ["Breakout", "RSI", "EMA x", "Reversión"];
  const data = estrategias.map(() =>
    Number((Math.random() * 8 - 2).toFixed(2))
  );

  makeChart(
    el,
    "bar",
    {
      labels: estrategias,
      datasets: [{ label: "Rendimiento %", data }],
    },
    {
      plugins: { legend: { display: true } },
      scales: { y: { ticks: { callback: (v) => v + "%" } } },
    }
  );
}

/* ========== BTC Chart (XLSX + normalizador + botones escala) ========== */
export function initBTCChart({
  canvasId = "chartBTC",
  xlsxUrl = "/data/btc_price.xlsx",
  readoutId = "btcHoverReadout",
  btnLinId = "btnScaleLinear",
  btnLogId = "btnScaleLog",
} = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const readout = document.getElementById(readoutId);
  const btnLin = document.getElementById(btnLinId);
  const btnLog = document.getElementById(btnLogId);
  const CURRENCY = "€";

  const fmtNum = (n, opts = { maximumFractionDigits: 2 }) =>
    new Intl.NumberFormat("es-ES", opts).format(n);
  const fmtCompact = (n) =>
    n < 1
      ? CURRENCY + fmtNum(n)
      : CURRENCY + fmtNum(n, { notation: "compact", maximumFractionDigits: 2 });

  // crosshair + visor
  const hoverGuide = {
    id: "hoverGuide",
    afterDatasetsDraw(chart) {
      const { ctx, tooltip, chartArea } = chart;
      const p = tooltip?.dataPoints?.[0];
      if (!p) return;
      const x = p.element.x;
      ctx.save();
      ctx.strokeStyle = "rgba(148,163,184,0.35)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x, chartArea.top);
      ctx.lineTo(x, chartArea.bottom);
      ctx.stroke();
      ctx.restore();

      if (readout)
        readout.textContent = `${p.label} · ${CURRENCY}${fmtNum(p.parsed.y)}`;
    },
    afterEvent(chart) {
      if (!chart.tooltip?.dataPoints?.length && readout)
        readout.textContent = "—";
    },
  };
  if (window.Chart && !Chart.registry.plugins.get("hoverGuide")) {
    Chart.register(hoverGuide);
  }

  fetch(xlsxUrl)
    .then((r) => {
      if (!r.ok)
        throw new Error("No se pudo cargar el archivo de precios BTC.");
      return r.arrayBuffer();
    })
    .then((buf) => {
      if (!window.XLSX) throw new Error("SheetJS (XLSX) no está disponible.");
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

      const series = normalizeBTCData(rows);
      if (!series.length)
        throw new Error("Estructura del Excel no reconocida.");

      const useYears = !!series[0].year;
      const labels = series.map((d) => (useYears ? String(d.year) : d.date));
      const prices = series.map((d) => d.price);

      const ctx2d = canvas.getContext("2d");
      const gradient = ctx2d.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "rgba(234,88,12,0.25)");
      gradient.addColorStop(1, "rgba(234,88,12,0.00)");

      const step = Math.max(1, Math.ceil(labels.length / 8));

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
              label: (c) => " " + CURRENCY + fmtNum(c.parsed.y),
              title: (items) => items[0]?.label ?? "",
            },
          },
        },
        scales: {
          x: {
            grid: { display: true, color: "rgba(148,163,184,0.12)" },
            ticks: {
              autoSkip: false,
              callback: (v, i) => (i % step === 0 ? labels[i] : ""),
              maxRotation: 0,
            },
          },
          y: {
            type: scaleType,
            beginAtZero: false,
            suggestedMin: Math.min(...prices) * 0.9,
            suggestedMax: Math.max(...prices) * 1.05,
            ticks: { callback: (v) => fmtCompact(v) },
            grid: { color: "rgba(148,163,184,0.18)", drawTicks: false },
          },
        },
      });

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

      let scaleType = "linear";
      let chart = makeChart(canvas, "line", data, baseOptions(scaleType));

      const highlight = () => {
        [btnLin, btnLog].forEach((b) =>
          b?.classList.remove("bg-orange-600", "bg-slate-700")
        );
        btnLin?.classList.add(
          scaleType === "linear" ? "bg-orange-600" : "bg-slate-700"
        );
        btnLog?.classList.add(
          scaleType === "logarithmic" ? "bg-orange-600" : "bg-slate-700"
        );
      };

      btnLin?.addEventListener("click", () => {
        if (scaleType === "linear") return;
        scaleType = "linear";
        chart?.destroy();
        chart = makeChart(canvas, "line", data, baseOptions(scaleType));
        highlight();
      });
      btnLog?.addEventListener("click", () => {
        if (scaleType === "logarithmic") return;
        scaleType = "logarithmic";
        chart?.destroy();
        chart = makeChart(canvas, "line", data, baseOptions(scaleType));
        highlight();
      });

      highlight();
    })
    .catch((err) => {
      console.error(err);
      const wrapper = canvas.closest(".rounded-2xl") || canvas.parentElement;
      if (wrapper) {
        const note = document.createElement("div");
        note.className = "mt-3 text-sm text-rose-600 dark:text-rose-400";
        note.textContent =
          "No se pudo renderizar la gráfica de BTC: " + err.message;
        wrapper.appendChild(note);
      }
    });
}

export function normalizeBTCData(rows) {
  const keys = rows.length ? Object.keys(rows[0]) : [];
  const keyYear = keys.find((k) => /^(año|anio|year)$/i.test(k));
  const keyDate = keys.find((k) => /fecha|date/i.test(k));
  const keyPrice = keys.find((k) => /precio|price/i.test(k));
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

export function renderPctPositiveChart(
  id = "chartAcierto",
  xlsxUrl = "/data/avisosbtc_metrics.xlsx"
) {
  const canvas = document.getElementById(id);
  if (!canvas) return;

  fetch(xlsxUrl)
    .then((res) => res.arrayBuffer())
    .then((buf) => {
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

      const data = rows.filter((r) => r.year && r.pct_positive != null);
      const labels = data.map((r) => String(r.year));
      const values = data.map((r) => Number(r.pct_positive));
      const signals = data.map((r) => Number(r.n_signals));

      makeChart(
        canvas,
        "line",
        {
          labels,
          datasets: [
            {
              label: "Acierto %",
              data: values,
              borderColor: "#3B82F6",
              backgroundColor: "rgba(59, 130, 246, 0.25)",
              fill: true,
              tension: 0.3,
              pointRadius: 5,
              pointHoverRadius: 7,
            },
          ],
        },
        {
          plugins: {
            legend: { display: true },
            tooltip: {
              callbacks: {
                label: (ctx) => `Acierto: ${ctx.parsed.y}%`,
                afterLabel: (ctx) => `Señales: ${signals[ctx.dataIndex]}`,
              },
            },
          },
          scales: {
            y: {
              min: 0,
              max: 100,
              ticks: { callback: (v) => `${v}%` },
            },
          },
        }
      );
    })
    .catch(console.error);
}

export function renderMeanReturnChart(
  id = "chartEstrategias",
  xlsxUrl = "/data/avisosbtc_metrics.xlsx"
) {
  const canvas = document.getElementById(id);
  if (!canvas) return;

  fetch(xlsxUrl)
    .then((res) => res.arrayBuffer())
    .then((buf) => {
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

      const data = rows.filter((r) => r.year && r.mean_ret_per_signal != null);
      const labels = data.map((r) => String(r.year));
      const values = data.map((r) => Number(r.mean_ret_per_signal));
      const signals = data.map((r) => Number(r.n_signals));

      makeChart(
        canvas,
        "bar",
        {
          labels,
          datasets: [
            {
              label: "Rendimiento %",
              data: values,
              backgroundColor: "rgba(34,197,94,0.75)",
              borderColor: "#22C55E",
              borderWidth: 1,
            },
          ],
        },
        {
          plugins: {
            legend: { display: true },
            tooltip: {
              callbacks: {
                label: (ctx) => `Rentabilidad: ${ctx.parsed.y.toFixed(2)}%`,
                afterLabel: (ctx) => `Señales: ${signals[ctx.dataIndex]}`,
              },
            },
          },
          scales: {
            y: {
              ticks: { callback: (v) => `${v}%` },
            },
          },
        }
      );
    })
    .catch(console.error);
}
