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
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

    const data = JSON.parse(event.body);
    const id = 'pedido-' + Date.now();

    // Llamar Sheets y Supabase en paralelo
    await Promise.allSettled([
      SHEETS_URL ? fetch(SHEETS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }) : Promise.resolve(),

      (SUPABASE_URL && SUPABASE_KEY) ? fetch(`${SUPABASE_URL}/rest/v1/pedidos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          id,
          fecha: data.fecha || '',
          nombre: data.nombre || '',
          telefono: data.telefono || '',
          ciudad: data.ciudad || '',
          direccion: data.direccion || '',
          productos: data.productos || '',
          total: data.total || '',
          envio: data.envio || '',
          metodo: data.metodo || '',
          email: data.email || ''
        })
      }) : Promise.resolve()
    ]);

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
