exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { items, envio } = JSON.parse(event.body);
    const token = process.env.MP_ACCESS_TOKEN;

    const todosItems = [...items];
    if (envio && envio.costo > 0) {
      todosItems.push({
        title: `Envío — ${envio.ciudad}`,
        quantity: 1,
        unit_price: envio.costo,
        currency_id: 'COP'
      });
    }

    const body = {
      items: todosItems,
      back_urls: {
        success: 'https://minime.com.co/?pago=exitoso',
        failure: 'https://minime.com.co/?pago=fallido',
        pending: 'https://minime.com.co/?pago=pendiente'
      },
      auto_return: 'approved',
      statement_descriptor: 'MINIMEE',
      payment_methods: {
        excluded_payment_types: [],
        installments: 1
      }
    };

    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (data.init_point) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ init_point: data.init_point })
      };
    } else {
      throw new Error(JSON.stringify(data));
    }

  } catch (err) {
    console.error('Error MP:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
