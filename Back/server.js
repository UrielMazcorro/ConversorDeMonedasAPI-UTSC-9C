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
    // Si falta alguno, respondemos con error 400 y mensaje
    return res.status(400).json({ error: "Parámetros incompletos" });
  }

  try {
    // Construimos la URL para llamar a la API externa con las monedas y amount
    const url = `https://api.exchangerate.host/live?access_key=62d14bb148e3f5059fb187cf0767d1ce&source=${from}&currencies=${to}`;
    
    // Hacemos la petición HTTP GET a la API usando axios (esperamos respuesta)
    const response = await axios.get(url);

    // Validamos que la API respondió con éxito
    if (!response.data.success) {
      // Si la API falla, respondemos error 500
      return res.status(500).json({ error: "Error en la API externa" });
    }

    // Formamos la clave del tipo de cambio (ejemplo: 'USD' + 'MXN' = 'USDMXN')
    const key = `${from}${to}`.toUpperCase();
    
    // Obtenemos el tipo de cambio de la respuesta en quotes
    const rate = response.data.quotes[key];

    // Validamos que exista esa tasa para el par de monedas
    if (!rate) {
      // Si no existe, enviamos error 400 indicando par inválido
      return res.status(400).json({ error: "Par de divisas no válido" });
    }

    // Calculamos el resultado multiplicando el monto por la tasa de cambio
    const result = rate * parseFloat(amount);

    // Respondemos con el resultado, la tasa, la moneda origen y la fecha de la tasa
    res.json({
      result,                                   // Total convertido
      rate,                                     // Tasa de cambio usada
      source: response.data.source,             // Moneda base que devuelve la API
      date: new Date(response.data.timestamp * 1000) // Convertimos timestamp a fecha legible
             .toISOString()
             .split("T")[0]                      // Solo fecha (yyyy-mm-dd)
    });
  } catch (error) {
    // En caso de error, lo mostramos en consola y enviamos error 500
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: "Error al convertir moneda" });
  }
});

// Activamos el servidor para que escuche en el puerto
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
