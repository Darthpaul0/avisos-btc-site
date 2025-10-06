document.addEventListener("DOMContentLoaded", () => {
  const loadHtml = (selector, url) => {
    const element = document.querySelector(selector);
    if (element) {
      fetch(url)
        .then((response) => {
          if (!response.ok) throw new Error(`Failed to load ${url}`);
          return response.text();
        })
        .then((data) => {
          element.innerHTML = data;
        })
        .catch((error) => console.error("Error loading HTML:", error));
    }
  };

  // Use absolute paths from the root
  loadHtml("#main-header", "/_includes/header.html");
  loadHtml("#main-footer", "/_includes/footer.html");
});
