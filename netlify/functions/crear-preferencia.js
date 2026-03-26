const crypto = require('crypto');

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
    const { total, description } = JSON.parse(event.body);
    const SECRET = process.env.BOLD_SECRET;
    const API_KEY = process.env.BOLD_API_KEY;

    if (!SECRET) throw new Error('BOLD_SECRET not configured');
    if (!API_KEY) throw new Error('BOLD_API_KEY not configured');

    // Ensure amount is a clean integer string — no decimals, no spaces
    const amount = String(Math.round(Number(total)));

    const orderId = 'MINIME-' + Date.now();
    const integrityString = `${orderId}${amount}COP${SECRET}`;
    const signature = crypto.createHash('sha256').update(integrityString).digest('hex');

    console.log('orderId:', orderId);
    console.log('amount:', amount);
    console.log('integrityString:', integrityString);
    console.log('signature:', signature);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderId, signature, amount, apiKey: API_KEY })
    };

  } catch (err) {
    console.error('Error Bold:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
