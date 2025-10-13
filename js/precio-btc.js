async function obtenerPrecioBTC() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur"
    );
    const data = await res.json();
    const price = data.bitcoin.eur.toLocaleString("en-US", {
      style: "currency",
      currency: "EUR",
    });
    document.getElementById("btc-price").textContent = price;
  } catch (error) {
    console.error("Error obteniendo precio de BTC:", error);
    document.getElementById("btc-price").textContent = "Error";
  }
}

obtenerPrecioBTC();
setInterval(obtenerPrecioBTC, 30000);
