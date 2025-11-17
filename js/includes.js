// js/includes.js
document.addEventListener("DOMContentLoaded", () => {
  const loadHtml = (selector, url) => {
    const el = document.querySelector(selector);
    if (!el) return Promise.resolve();
    return fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
        return res.text();
      })
      .then((html) => (el.innerHTML = html))
      .catch((err) => {
        console.error(err);
      });
  };

  // --- Calcular basePath robusto ---
  // Si estamos en GitHub Pages 'usuario.github.io/REPO' y no hay dominio custom,
  // debemos usar '/REPO' como base. Si hay dominio propio (avisosbtc.com) -> base ''.
  // Heurística:
  // - Si hostname contiene 'github.io' => probablemente GitHub Pages without custom domain.
  // - Si hay CNAME/custom domain, hostname será tu dominio (avisosbtc.com) -> no añadir repo.
  const hostname = window.location.hostname; // ej. 'usuario.github.io' o 'avisosbtc.com'
  let basePath = "";

  if (hostname.includes("github.io")) {
    // extrae posible repo del pathname: /repo/... -> repo es segmento 1
    const firstSeg = window.location.pathname.split("/")[1];
    if (firstSeg) basePath = `/${firstSeg}`;
  } else {
    // dominio propio (o local) -> no prefijo
    basePath = "";
  }

  // Si estamos dentro de /pages/, necesitamos subir un nivel desde la página
  const inPages = window.location.pathname.includes("/pages/");
  const pagesPrefix = inPages ? ".." : "."; // used to build relative path from page file

  // Construcción final: si basePath está definido y no vacío, lo usamos delante.
  // Ejemplos resultantes:
  // - En dominio propio: `${pagesPrefix}/_includes/header.html` -> './_includes/header.html' o '../_includes/header.html'
  // - En GH Pages sin custom domain: `${basePath}/_includes/header.html` -> '/repo/_includes/header.html'
  const headerUrl = basePath
    ? `${basePath}/_includes/header.html`
    : `${pagesPrefix}/_includes/header.html`;
  const footerUrl = basePath
    ? `${basePath}/_includes/footer.html`
    : `${pagesPrefix}/_includes/footer.html`;
  const cookiesUrl = basePath
    ? `${basePath}/_includes/cookies_simple.html`
    : `${pagesPrefix}/_includes/cookies_simple.html`;

  Promise.all([
    loadHtml("#main-header", headerUrl),
    loadHtml("#main-footer", footerUrl),
    loadHtml("#cookie-banner-container", cookiesUrl),
  ]).then(() => {
    document.dispatchEvent(new CustomEvent("includes:ready"));
    if (typeof initializeDynamicContent === "function") {
      initializeDynamicContent();
    }
  });
});
