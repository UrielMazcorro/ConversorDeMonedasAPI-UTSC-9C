const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Ruta para convertir monedas
app.get("/api/convert", async (req, res) => {
  const { from, to, amount } = req.query;

  if (!from || !to || !amount) {
    return res.status(400).json({ error: "Parámetros incompletos" });
  }

  try {
    const url = `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`;
    const response = await axios.get(url);

    res.json({
      result: response.data.result,
      rate: response.data.info.rate,
      date: response.data.date
    });
  } catch (error) {
    res.status(500).json({ error: "Error al convertir moneda" });
  }
});

app.listen(PORT, () => {
  console.log(` Servidor backend escuchando en http://localhost:${PORT}`);
});
