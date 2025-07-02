import React, { useEffect, useState } from 'react';
import { Select, InputNumber, Button, Typography, Space, Card, message } from 'antd';
import 'flag-icon-css/css/flag-icons.min.css';
import './CurrencyConverter.css';

const { Option } = Select;
const { Text } = Typography;

function CurrencyConverter() {
  const [symbols, setSymbols] = useState({});
  const [currencyToCountry, setCurrencyToCountry] = useState({});
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState(1);
  const [result, setResult] = useState(null);
  const [rate, setRate] = useState(null);

  useEffect(() => {
    async function fetchSymbols() {
      try {
        const res = await fetch('https://api.exchangerate.host/symbols');
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
        console.error('❌ Error al cargar símbolos:', err);
      }
    }

    fetchSymbols();
  }, []);

  const obtenerCodigoPais = (moneda) => {
    const posibles = {
      USD: 'us', EUR: 'eu', GBP: 'gb', MXN: 'mx', ARS: 'ar',
      BRL: 'br', JPY: 'jp', CNY: 'cn', INR: 'in', CAD: 'ca',
      CLP: 'cl', COP: 'co', KRW: 'kr', RUB: 'ru', TRY: 'tr',
      default: 'xx',
    };
    return posibles[moneda] || moneda.slice(0, 2).toLowerCase() || posibles.default;
  };

  const convertir = async () => {
    if (!from || !to || !amount) {
      message.error('Completa todos los campos.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/api/convert?from=${from}&to=${to}&amount=${amount}`);
      const data = await res.json();
      if (data.error) {
        message.error(data.error);
        setResult(null);
      } else {
        setResult(data.result);
        setRate(data.rate);
      }
    } catch (err) {
      message.error('Error al conectar con el servidor.');
      console.error('Error:', err);
    }
  };

  const bandera = (codigo) =>
    codigo ? `flag-icon flag-icon-${currencyToCountry[codigo] || 'xx'}` : '';

  return (
    <div className="container">
      <Card title="💱 Conversor de Monedas" style={{ maxWidth: 450 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <label>De:</label>
          <div className="input-group">
            <span className={bandera(from)} />
            <Select
              showSearch
              placeholder="Ej: USD"
              value={from}
              onChange={setFrom}
              style={{ width: '100%' }}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.value.toLowerCase().includes(input.toLowerCase()) ||
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {Object.entries(symbols).map(([code, data]) => (
                <Option key={code} value={code}>
                  {code} - {data.description}
                </Option>
              ))}
            </Select>
          </div>

          <label>A:</label>
          <div className="input-group">
            <span className={bandera(to)} />
            <Select
              showSearch
              placeholder="Ej: MXN"
              value={to}
              onChange={setTo}
              style={{ width: '100%' }}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.value.toLowerCase().includes(input.toLowerCase()) ||
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {Object.entries(symbols).map(([code, data]) => (
                <Option key={code} value={code}>
                  {code} - {data.description}
                </Option>
              ))}
            </Select>
          </div>

          <label>Cantidad:</label>
          <InputNumber
            min={1}
            value={amount}
            onChange={setAmount}
            style={{ width: '100%' }}
          />

          <Button type="primary" onClick={convertir} block>
            Convertir
          </Button>

          {result !== null && (
            <Text strong>
              ✅ {amount} {from} = {result.toFixed(2)} {to} (Tasa: {rate})
            </Text>
          )}
        </Space>
      </Card>
    </div>
  );
}

export default CurrencyConverter;
