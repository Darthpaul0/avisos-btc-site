// Avisos BTC – lógica ligera de la landing

// Tema oscuro automático por preferencia del sistema
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const root = document.documentElement;
if (prefersDark) root.classList.add('dark');

// Toggle manual
const themeBtn = document.getElementById('themeToggle');
themeBtn?.addEventListener('click', () => {
  root.classList.toggle('dark');
});

// Año dinámico
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Chart helper
function makeChart(ctx, type, data, options) {
  // Chart.js is loaded globally via CDN in index.html
  return new Chart(ctx, { type, data, options });
}

// Hero mini-chart (actividad de avisos)
const heroCtx = document.getElementById('chartHero');
if (heroCtx) {
  const days = Array.from({ length: 14 }, (_, i) => `D${i + 1}`);
  makeChart(
    heroCtx,
    'line',
    {
      labels: days,
      datasets: [
        {
          label: 'Alertas',
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

// Acierto (30d)
const aciertoCtx = document.getElementById('chartAcierto');
if (aciertoCtx) {
  const labels = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
  makeChart(
    aciertoCtx,
    'line',
    {
      labels,
      datasets: [
        {
          label: 'Acierto %',
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
          ticks: { callback: (v) => v + '%' },
        },
      },
    }
  );
}

// Rendimiento por estrategia (bar)
const estrCtx = document.getElementById('chartEstrategias');
if (estrCtx) {
  const estrategias = ['Breakout', 'RSI', 'EMA x', 'Reversión'];
  makeChart(
    estrCtx,
    'bar',
    {
      labels: estrategias,
      datasets: [
        { label: 'Rendimiento %', data: estrategias.map(() => (Math.random() * 8 - 2).toFixed(2)) },
      ],
    },
    {
      plugins: { legend: { display: true } },
      scales: { y: { ticks: { callback: (v) => v + '%' } } },
    }
  );
}

// --- Cookie banner (consentimiento básico) ---
function initCookieBanner() {
  try {
    if (localStorage.getItem('cookieConsent')) return;

    const banner = document.createElement('div');
    banner.className =
      'fixed bottom-0 inset-x-0 bg-slate-900 text-white text-sm p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between z-50';
    banner.innerHTML = `
      <span>Usamos cookies esenciales y, con tu consentimiento, analíticas. Podrás cambiarlo más adelante.</span>
      <div class="flex gap-2">
        <button id="acceptCookies" class="bg-orange-600 px-3 py-1 rounded">Aceptar</button>
        <button id="dismissCookies" class="bg-slate-700 px-3 py-1 rounded">Ahora no</button>
      </div>
    `;

    document.body.appendChild(banner);

    document.getElementById('acceptCookies')?.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'true');
      banner.remove();
      // TODO: inicializar aquí analítica opcional (p. ej., PostHog) respetando el consentimiento
    });

    document.getElementById('dismissCookies')?.addEventListener('click', () => {
      banner.remove(); // no guardamos consentimiento
    });
  } catch (_) {
    // si localStorage no está disponible, no mostramos banner
  }
}

// Ejecutar banner tras cargar el DOM
window.addEventListener('DOMContentLoaded', initCookieBanner);
