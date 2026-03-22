const crypto = require('crypto');
 
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
 
  try {
    const { items, envio } = JSON.parse(event.body);
    const BOLD_API_KEY = process.env.BOLD_API_KEY;
    const BOLD_SECRET = process.env.BOLD_SECRET;
 
    // Calculate total
    let total = items.reduce((s, i) => s + (i.unit_price * i.quantity), 0);
    if (envio && envio.costo > 0) total += envio.costo;
 
    // Bold requiere el amount como entero (sin decimales)
    const totalEntero = Math.round(total);
 
    // Generate unique order ID
    const orderId = 'MINIME-' + Date.now();
 
    // Create integrity signature: orderId + amount + currency + secret
    const integrityString = `${orderId}${totalEntero}COP${BOLD_SECRET}`;
    const signature = crypto.createHash('sha256').update(integrityString).digest('hex');
 
    // Build product description
    const description = items.map(i => `${i.title} x${i.quantity}`).join(', ');
 
    // Return Bold checkout URL with params
    const boldUrl = `https://checkout.bold.co/payment/link?` +
      `api_key=${BOLD_API_KEY}` +
      `&order_id=${orderId}` +
      `&amount=${totalEntero}` +
      `&currency=COP` +
      `&description=${encodeURIComponent(description)}` +
      `&integrity_signature=${signature}` +
      `&redirect_url=${encodeURIComponent('https://minime.com.co/?pago=exitoso')}`;
 
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ init_point: boldUrl })
    };
 
  } catch (err) {
    console.error('Error Bold:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
 
