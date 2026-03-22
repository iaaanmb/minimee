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

    if (!SECRET) throw new Error('BOLD_SECRET not configured');

    // Generate unique order ID (only alphanumeric and hyphens, max 60 chars)
    const orderId = 'MINIME-' + Date.now();

    // Bold integrity signature: orderId + amount + currency + secret
    const integrityString = `${orderId}${total}COP${SECRET}`;
    const signature = crypto.createHash('sha256').update(integrityString).digest('hex');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderId, signature, total })
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
