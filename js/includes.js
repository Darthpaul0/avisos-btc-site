document.addEventListener("DOMContentLoaded", () => {
  const loadHtml = (selector, url) => {
    const element = document.querySelector(selector);
    if (!element) {
      return Promise.resolve();
    }

    return fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load ${url}`);
        return response.text();
      })
      .then((data) => {
        element.innerHTML = data;
      })
      .catch((error) => console.error("Error loading HTML:", error));
  };

  // Detecta si estamos dentro de la carpeta /pages/
  const prefix = window.location.pathname.includes("/pages/") ? ".." : ".";

  const headerPromise = loadHtml(
    "#main-header",
    `${prefix}/_includes/header.html`
  );
  const footerPromise = loadHtml(
    "#main-footer",
    `${prefix}/_includes/footer.html`
  );
  const cookiesPromise = loadHtml(
    "#cookie-banner-container",
    `${prefix}/_includes/cookies.html`
  );

  // Wait for all includes to finish loading
  Promise.all([headerPromise, footerPromise, cookiesPromise]).then(() => {
    document.dispatchEvent(new CustomEvent("includes:ready"));

    if (typeof initializeDynamicContent === "function") {
      initializeDynamicContent();
    }
  });
});
