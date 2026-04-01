const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const SHEETS_URL = process.env.SHEETS_URL;
    const data = JSON.parse(event.body);

    // 1. Guardar en Google Sheets (como antes)
    if (SHEETS_URL) {
      try {
        await fetch(SHEETS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } catch(e) {
        console.log('Sheets error:', e.message);
      }
    }

    // 2. Guardar en Netlify Blobs para el panel admin
    try {
      const store = getStore('pedidos');
      const id = 'pedido-' + Date.now();
      await store.setJSON(id, {
        id,
        ...data,
        guardado: new Date().toISOString()
      });
    } catch(e) {
      console.log('Blobs error:', e.message);
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    console.error('log-pedido error:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
