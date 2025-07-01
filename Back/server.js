app.get("/api/convert", async (req, res) => {
  const { from, to, amount } = req.query;

  if (!from || !to || !amount) {
    return res.status(400).json({ error: "Parámetros incompletos" });
  }

  try {
    const url = `https://api.exchangerate.host/live?access_key=62d14bb148e3f5059fb187cf0767d1ce&source=${from}&currencies=${to}`;
    const response = await axios.get(url);

    if (!response.data.success) {
      return res.status(500).json({ error: "Error en la API externa" });
    }

    const key = `${from}${to}`.toUpperCase();
    const rate = response.data.quotes[key];

    if (!rate) {
      return res.status(400).json({ error: "Par de divisas no válido" });
    }

    const result = rate * parseFloat(amount);

    res.json({
      result,
      rate,
      source: response.data.source,
      date: new Date(response.data.timestamp * 1000).toISOString().split("T")[0]
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: "Error al convertir moneda" });
  }
});
