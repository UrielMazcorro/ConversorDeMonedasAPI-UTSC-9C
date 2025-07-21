// Importamos las dependencias necesarias
const express = require("express");
const cors = require("cors");
const axios = require("axios");

// Creamos la aplicación de Express
const app = express();

// Definimos el puerto (puede ser el del sistema o 3001 por defecto)
const PORT = process.env.PORT || 3001;

// Usamos los middlewares para permitir peticiones externas y parsear JSON
app.use(cors());
app.use(express.json());

// Ruta GET para convertir monedas
app.get("/api/convert", async (req, res) => {
  // Obtenemos los parámetros 'from', 'to' y 'amount' desde la query string (?from=USD&to=MXN&amount=100)
  const { from, to, amount } = req.query;

  // Validamos que los tres parámetros estén presentes
  if (!from || !to || !amount) {
    return res.status(400).json({ error: "Parámetros incompletos" });
  }

  try {
    // Nueva URL para exchangerate.host sin access_key
    const url = `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`;
    
    // Llamamos a la API externa
    const response = await axios.get(url);

    // Verificamos que exista un resultado válido
    if (!response.data || !response.data.result) {
      return res.status(500).json({ error: "Error en la API externa" });
    }

    // Extraemos resultado, tasa y fecha
    const result = response.data.result;
    const rate = response.data.info.rate;
    const date = response.data.date;

    // Respondemos con los datos de conversión
    res.json({
      result,           // Total convertido
      rate,             // Tasa de cambio usada
      source: from.toUpperCase(), // Moneda origen
      date              // Fecha de la tasa
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: "Error al convertir moneda" });
  }
});

// Activamos el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
