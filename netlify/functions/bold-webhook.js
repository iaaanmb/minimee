const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const SECRET = process.env.BOLD_SECRET;
    const SHEETS_URL = process.env.SHEETS_URL;

    const payload = event.body;
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
    const totalFmt = '$' + Number(amount).toLocaleString('es-CO');

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
          total: totalFmt,
          envio: '',
          metodo: 'Bold ✅ Webhook Confirmado'
        })
      });
    }

    // Send confirmation email via EmailJS REST API
    if(payerEmail){
      try {
        await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: 'minime_service',
            template_id: 'template_s319duc',
            user_id: 'f5J7OB5n6jACg3FcX',
            template_params: {
              nombre: payerName || 'clienta',
              email: payerEmail,
              productos: `Pedido ${orderId}`,
              total: totalFmt,
              ciudad: '',
              direccion: ''
            }
          })
        });
        console.log('Email enviado a', payerEmail);
      } catch(emailErr){
        console.log('Email error:', emailErr.message);
      }
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
