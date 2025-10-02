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
  const days = Array.from({ length: 14 }, (_, i) => `D${i+1}`);
  makeChart(heroCtx, 'line', {
    labels: days,
    datasets: [{
      label: 'Alertas',
      data: days.map(() => Math.round(Math.random() * 20) + 5),
      tension: 0.35,
      fill: true,
    }]
  }, {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { ticks: { callback: v => v } } }
  });
}

// Acierto (30d)
const aciertoCtx = document.getElementById('chartAcierto');
if (aciertoCtx) {
  const labels = Array.from({ length: 30 }, (_, i) => `${i+1}`);
  makeChart(aciertoCtx, 'line', {
    labels,
    datasets: [{ label: 'Acierto %', data: labels.map(() => Math.round(45 + Math.random()*35)), fill: false, tension: 0.35 }]
  }, {
    plugins: { legend: { display: true } },
    scales: { y: { suggestedMin: 0, suggestedMax: 100, ticks: { callback: v => v + '%' } } }
  });
}

// Rendimiento por estrategia (bar)
const estrCtx = document.getElementById('chartEstrategias');
if (estrCtx) {
  const estrategias = ['Breakout', 'RSI', 'EMA x', 'Reversión'];
  makeChart(estrCtx, 'bar', {
    labels: estrategias,
    datasets: [{ label: 'Rendimiento %', data: estrategias.map(() => (Math.random()*8 - 2).toFixed(2)) }]
  }, {
    plugins: { legend: { display: true } },
    scales: { y: { ticks: { callback: v => v + '%' } } }
  });
}

// TODO (integración):
// - Reemplazar datos dummy por API real (fetch a backend o Supabase).
// - Conectar botones de suscripción a Stripe Checkout.
// - Añadir tracking mínimo (PostHog) respetando consentimiento de cookies.
// - Añadir página de Términos/Privacidad si se necesita en MVP.
