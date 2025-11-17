document.addEventListener("DOMContentLoaded", () => {
  const loadHtml = (selector, url) => {
    const element = document.querySelector(selector);
    if (!element) return Promise.resolve();

    return fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
        return res.text();
      })
      .then((html) => {
        element.innerHTML = html;
      })
      .catch((err) => console.error(err));
  };

  const inPages = window.location.pathname.includes("/pages/");

  // Rutas correctas según tu estructura real
  const headerUrl = inPages
    ? "../_includes/header.html"
    : "./_includes/header.html";
  const footerUrl = inPages
    ? "../_includes/footer.html"
    : "./_includes/footer.html";
  const cookiesUrl = inPages
    ? "../_includes/cookies_simple.html"
    : "./_includes/cookies_simple.html";

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
