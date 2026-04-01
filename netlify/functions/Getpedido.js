const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: ''
    };
  }

  // Verificar contraseña
  const pwd = event.queryStringParameters?.pwd || '';
  if (pwd !== process.env.ADMIN_PASSWORD) {
    return {
      statusCode: 401,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'No autorizado' })
    };
  }

  try {
    const store = getStore('pedidos');
    const { blobs } = await store.list();

    const pedidos = [];
    for (const blob of blobs) {
      try {
        const data = await store.getJSON(blob.key);
        if (data) pedidos.push(data);
      } catch(e) {}
    }

    // Ordenar por fecha descendente
    pedidos.sort((a, b) => new Date(b.guardado) - new Date(a.guardado));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pedidos)
    };
  } catch (err) {
    console.error('get-pedidos error:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
