// /js/cookies_simple.js
document.addEventListener("includes:ready", () => {
  const banner = document.getElementById("cookie-banner");
  const closeBtn = document.getElementById("cookie-close");
  if (!banner || !closeBtn) return;

  // Mostrar solo si no se ha cerrado antes
  if (!localStorage.getItem("cookieInfoClosed")) {
    banner.classList.remove("hidden");
  }

  closeBtn.addEventListener("click", () => {
    localStorage.setItem("cookieInfoClosed", "true");
    banner.classList.add("hidden");
  });
});
