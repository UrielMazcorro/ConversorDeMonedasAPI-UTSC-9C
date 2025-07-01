document.getElementById("convertir").addEventListener("click", async () => {
  const from = document.getElementById("from").value.toUpperCase();
  const to = document.getElementById("to").value.toUpperCase();
  const amount = document.getElementById("amount").value;

  const resultadoDiv = document.getElementById("resultado");
  resultadoDiv.textContent = "Convirtiendo...";

  try {
    const response = await fetch(`http://localhost:3001/api/convert?from=${from}&to=${to}&amount=${amount}`);
    const data = await response.json();

    if (data.error) {
      resultadoDiv.textContent = "❌ " + data.error;
    } else {
      resultadoDiv.textContent = `✅ ${amount} ${from} = ${data.result.toFixed(2)} ${to} (Tasa: ${data.rate})`;
    }
  } catch (err) {
    resultadoDiv.textContent = "❌ Error al conectar con el servidor";
  }
});
