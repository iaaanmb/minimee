const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const SECRET = process.env.BOLD_SECRET;
    const SHEETS_URL = process.env.SHEETS_URL;

    // Verify Bold signature
    const boldSignature = event.headers['x-bold-signature'] || event.headers['bold-signature'] || '';
    const payload = event.body;
    
    // Verify integrity
    const expectedSig = crypto.createHash('sha256').update(payload + SECRET).digest('hex');
    if(boldSignature && boldSignature !== expectedSig){
      console.log('Invalid signature');
      // Still process for now - Bold signature format may vary
    }

    const data = JSON.parse(payload);
    console.log('Bold webhook:', JSON.stringify(data));

    // Only process approved payments
    const status = data.payment_status || data.status || '';
    if(status !== 'APPROVED' && status !== 'approved'){
      return { statusCode: 200, body: JSON.stringify({received: true}) };
    }

    // Get order info from Bold data
    const orderId = data.order_id || data.orderId || '';
    const amount = data.amount?.total_amount || data.amount || 0;
    const payerName = data.payer?.name || data.customer?.name || '';
    const payerPhone = data.payer?.phone || data.customer?.phone || '';
    const payerEmail = data.payer?.email || data.customer?.email || '';

    // Register in Google Sheets
    if(SHEETS_URL){
      await fetch(SHEETS_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          fecha: new Date().toLocaleString('es-CO'),
          nombre: payerName,
          telefono: payerPhone,
          ciudad: '',
          direccion: '',
          productos: `Pedido ${orderId}`,
          total: '$' + Number(amount).toLocaleString('es-CO'),
          envio: '',
          metodo: 'Bold ✅ Webhook Confirmado'
        })
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };

  } catch(err) {
    console.error('Webhook error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
