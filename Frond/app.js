const datalist = document.getElementById("monedas");
const currencyToCountry = {}; // Esto se llenará dinámicamente desde la API

// Función que se encarga de obtener todas las monedas desde la API
async function cargarMonedas() {
  try {
    const res = await fetch("https://api.exchangerate.host/symbols");
    const data = await res.json();

    if (data && data.symbols) {
      for (const code in data.symbols) {
        // Agrega cada moneda al datalist
        const option = document.createElement("option");
        option.value = code;
        option.label = data.symbols[code].description;
        datalist.appendChild(option);

        // Asocia código de moneda con país para la banderita
        currencyToCountry[code] = obtenerCodigoPais(code);
      }
    }
  } catch (err) {
    console.error("❌ Error al cargar monedas:", err);
  }
}

// Devuelve un código de país a partir del código de moneda
function obtenerCodigoPais(moneda) {
  const posibles = {
    USD: "us", EUR: "eu", GBP: "gb", MXN: "mx", ARS: "ar",
    BRL: "br", JPY: "jp", CNY: "cn", INR: "in", CAD: "ca",
    CLP: "cl", COP: "co", KRW: "kr", RUB: "ru", TRY: "tr",
    default: "xx"
  };
  return posibles[moneda] || moneda.slice(0, 2).toLowerCase() || posibles.default;
}

// Actualiza las banderitas en los campos "from" y "to"
function updateFlags() {
  const from = document.getElementById("from").value.toUpperCase();
  const to = document.getElementById("to").value.toUpperCase();

  document.getElementById("flagFrom").className = `flag-icon flag-icon-${currencyToCountry[from] || "xx"}`;
  document.getElementById("flagTo").className = `flag-icon flag-icon-${currencyToCountry[to] || "xx"}`;
}

// Ejecuta la conversión cuando haces clic
document.getElementById("convertir").addEventListener("click", async () => {
  const from = document.getElementById("from").value.toUpperCase();
  const to = document.getElementById("to").value.toUpperCase();
  const amount = document.getElementById("amount").value;
  const resultadoDiv = document.getElementById("resultado");

  if (!from || !to || !amount) {
    resultadoDiv.textContent = "❌ Completa todos los campos.";
    return;
  }

  resultadoDiv.textContent = "🔄 Convirtiendo...";

  try {
    const response = await fetch(`http://localhost:3001/api/convert?from=${from}&to=${to}&amount=${amount}`);
    const data = await response.json();

    if (data.error) {
      resultadoDiv.textContent = "❌ " + data.error;
    } else {
      resultadoDiv.textContent = `✅ ${amount} ${from} = ${data.result.toFixed(2)} ${to} (Tasa: ${data.rate})`;
    }
  } catch (err) {
    resultadoDiv.textContent = "❌ Error al conectar con el servidor.";
    console.error("Error:", err);
  }
});

// Cuando el usuario escriba, actualiza las banderas
document.getElementById("from").addEventListener("input", updateFlags);
document.getElementById("to").addEventListener("input", updateFlags);

// Cargar monedas automáticamente al abrir la página
window.addEventListener("DOMContentLoaded", () => {
  cargarMonedas();
});

// Verifica si una moneda está en la lista de symbols
function monedaValida(codigo) {
  return currencyToCountry.hasOwnProperty(codigo.toUpperCase());
}

// Aplica o quita clases de error visual
function validarInput(inputId) {
  const input = document.getElementById(inputId);
  const valor = input.value.toUpperCase();

  if (!monedaValida(valor)) {
    input.classList.add("input-error");
  } else {
    input.classList.remove("input-error");
  }
}

// Agrega validación visual en tiempo real
["from", "to"].forEach(id => {
  document.getElementById(id).addEventListener("input", () => {
    validarInput(id);
    updateFlags(); // seguimos actualizando las banderas
  });
});
