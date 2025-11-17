document.addEventListener("DOMContentLoaded", () => {
  const loadHtml = (selector, url) => {
    const el = document.querySelector(selector);
    if (!el) return Promise.resolve();

    return fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
        return res.text();
      })
      .then((html) => {
        el.innerHTML = html;
      })
      .catch((err) => console.error(err));
  };

  // Detectar si estamos en /pages/
  const inPages = window.location.pathname.includes("/pages/");

  // Rutas correctas según tu estructura real
  const prefix = inPages ? ".." : ".";

  const headerUrl = `${prefix}/includes/header.html`;
  const footerUrl = `${prefix}/includes/footer.html`;
  const cookiesUrl = `${prefix}/includes/cookies_simple.html`;

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
