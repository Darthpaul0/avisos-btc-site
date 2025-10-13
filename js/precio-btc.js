async function obtenerPrecioBTC() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur"
    );
    const data = await res.json();
    const precioEUR = data.bitcoin.eur;

    // Formatear 1 BTC
    const precioFormateado = precioEUR.toLocaleString("es-ES", {
      style: "currency",
      currency: "EUR",
    });
    document.getElementById("btc-price").textContent = precioFormateado;

    // Calcular y mostrar valor de 10.000 BTC
    const total = precioEUR * 10000;
    const totalFormateado = total.toLocaleString("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    });
    const outputSpan = document.getElementById("btc-10000-eur");
    if (outputSpan) outputSpan.textContent = totalFormateado;
  } catch (error) {
    console.error("Error obteniendo precio de BTC:", error);
    document.getElementById("btc-price").textContent = "Error";
  }
}

obtenerPrecioBTC();
setInterval(obtenerPrecioBTC, 60000);
