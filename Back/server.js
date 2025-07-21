require('dotenv').config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/convert", async (req, res) => {
  const { from, to, amount } = req.query;

  if (!from || !to || !amount) {
    return res.status(400).json({ error: "Parámetros incompletos" });
  }

  try {
    const API_URL = process.env.EXCHANGE_API_URL || 'https://api.exchangerate.host';
    const url = `${API_URL}/convert?from=${from}&to=${to}&amount=${amount}`;

    const response = await axios.get(url);

    if (!response.data || !response.data.result) {
      return res.status(500).json({ error: "Error en la API externa" });
    }

    const result = response.data.result;
    const rate = response.data.info.rate;
    const date = response.data.date;

    res.json({
      result,
      rate,
      source: from.toUpperCase(),
      date
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: "Error al convertir moneda" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
