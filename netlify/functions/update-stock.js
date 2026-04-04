exports.handler = async (event) => {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: {...headers, 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS'}, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const pwd = JSON.parse(event.body).pwd || '';
  if (pwd !== process.env.ADMIN_PASSWORD) return { statusCode: 401, headers, body: JSON.stringify({ error: 'No autorizado' }) };

  try {
    const { id, agotado } = JSON.parse(event.body);
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
    await fetch(`${SUPABASE_URL}/rest/v1/productos?id=eq.${id}`, {
      method: 'PATCH',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ agotado })
    });
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch(err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
