document.addEventListener("DOMContentLoaded", () => {
  const loadHtml = (selector, url) => {
    const element = document.querySelector(selector);
    if (!element) return Promise.resolve(); // Resolve immediately if element doesn't exist

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

  const headerPromise = loadHtml("#main-header", "/_includes/header.html");
  const footerPromise = loadHtml("#main-footer", "/_includes/footer.html");

  // Wait for all includes to finish loading
  Promise.all([headerPromise, footerPromise]).then(() => {
    // Now that the HTML is loaded, run the scripts that depend on it
    if (typeof initializeDynamicContent === "function") {
      initializeDynamicContent();
    }
  });
});
