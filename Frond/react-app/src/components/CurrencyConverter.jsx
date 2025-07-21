import React, { useEffect, useState } from "react";
import { Input, Button, Typography, Space, Card, message } from "antd";
import "flag-icon-css/css/flag-icons.min.css";
import "./CurrencyConverter.css";

const { Title, Text } = Typography;

function CurrencyConverter() {
  const [symbols, setSymbols] = useState({});
  const [currencyToCountry, setCurrencyToCountry] = useState({});
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [flags, setFlags] = useState({ from: "xx", to: "xx" });

  useEffect(() => {
    async function cargarMonedas() {
      try {
        const res = await fetch("https://api.exchangerate.host/symbols");
        const data = await res.json();

        if (data && data.symbols) {
          setSymbols(data.symbols);
          const mapa = {};
          for (const code in data.symbols) {
            mapa[code] = obtenerCodigoPais(code);
          }
          setCurrencyToCountry(mapa);
        }
      } catch (err) {
        console.error("❌ Error al cargar monedas:", err);
      }
    }
    cargarMonedas();
  }, []);

  function obtenerCodigoPais(moneda) {
    const posibles = {
      USD: "us",
      EUR: "eu",
      GBP: "gb",
      MXN: "mx",
      ARS: "ar",
      BRL: "br",
      JPY: "jp",
      CNY: "cn",
      INR: "in",
      CAD: "ca",
      CLP: "cl",
      COP: "co",
      KRW: "kr",
      RUB: "ru",
      TRY: "tr",
      default: "xx",
    };
    return posibles[moneda] || moneda.slice(0, 2).toLowerCase() || posibles.default;
  }

  useEffect(() => {
    setFlags({
      from: currencyToCountry[from.toUpperCase()] || "xx",
      to: currencyToCountry[to.toUpperCase()] || "xx",
    });
  }, [from, to, currencyToCountry]);

  const monedaValida = (codigo) => currencyToCountry.hasOwnProperty(codigo.toUpperCase());

  const validarInput = (valor) => monedaValida(valor);

  const convertir = async () => {
    setError("");
    setResult("");
    if (!from || !to || !amount) {
      setError("❌ Completa todos los campos.");
      return;
    }
    if (!validarInput(from) || !validarInput(to)) {
      setError("❌ Alguna moneda no es válida.");
      return;
    }
    setResult("🔄 Convirtiendo...");
    try {
      const res = await fetch(
        `http://localhost:3001/api/convert?from=${from.toUpperCase()}&to=${to.toUpperCase()}&amount=${amount}`
      );
      const data = await res.json();
      console.log("Respuesta API:", data);
      if (data.error) {
        setError("❌ " + data.error);
        setResult("");
      } else {
        setResult(
          `✅ ${amount} ${from.toUpperCase()} = ${data.result.toFixed(2)} ${to.toUpperCase()} (Tasa: ${data.rate})`
        );
        setError("");
      }
    } catch (err) {
      setError("❌ Error al conectar con el servidor.");
      setResult("");
      console.error(err);
    }
  };

  return (
    <Card
      title={<Title level={3}>💱 Conversor de Monedas</Title>}
      style={{ maxWidth: 450, margin: "2rem auto", padding: "1.5rem" }}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <label htmlFor="from" style={{ fontWeight: "600" }}>
          De:
        </label>
        <div className="input-group">
          <span className={`flag-icon flag-icon-${flags.from}`}></span>
          <Input
            id="from"
            placeholder="Ej: USD"
            value={from}
            onChange={(e) => setFrom(e.target.value.toUpperCase())}
            status={from && !validarInput(from) ? "error" : ""}
            maxLength={3}
            autoComplete="off"
          />
        </div>

        <label htmlFor="to" style={{ fontWeight: "600" }}>
          A:
        </label>
        <div className="input-group">
          <span className={`flag-icon flag-icon-${flags.to}`}></span>
          <Input
            id="to"
            placeholder="Ej: MXN"
            value={to}
            onChange={(e) => setTo(e.target.value.toUpperCase())}
            status={to && !validarInput(to) ? "error" : ""}
            maxLength={3}
            autoComplete="off"
          />
        </div>

        <label htmlFor="amount" style={{ fontWeight: "600" }}>
          Cantidad:
        </label>
        <Input
          id="amount"
          type="number"
          min={1}
          placeholder="Ej: 100"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          status={amount && amount <= 0 ? "error" : ""}
        />

        <Button type="primary" onClick={convertir} block>
          Convertir
        </Button>

        {error && (
          <Text type="danger" strong style={{ marginTop: 10 }}>
            {error}
          </Text>
        )}
        {result && !error && (
          <Text type="success" strong style={{ marginTop: 10 }}>
            {result}
          </Text>
        )}
      </Space>
    </Card>
  );
}

export default CurrencyConverter;
