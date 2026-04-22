exports.handler = async (event) => {
  const headers = {'Access-Control-Allow-Origin':'*','Content-Type':'application/json'};
  if(event.httpMethod==='OPTIONS') return {statusCode:200,headers:{...headers,'Access-Control-Allow-Headers':'Content-Type,x-admin-pwd','Access-Control-Allow-Methods':'POST,OPTIONS'},body:''};
  if(event.httpMethod!=='POST') return {statusCode:405,body:'Method Not Allowed'};

  const pwd = event.headers['x-admin-pwd'] || event.headers['X-Admin-Pwd'];
  if(pwd !== process.env.ADMIN_PASSWORD) return {statusCode:401,headers,body:JSON.stringify({error:'No autorizado'})};

  try {
    const {id, estado, guia, transportadora} = JSON.parse(event.body);
    if(!id) return {statusCode:400,headers,body:JSON.stringify({error:'Falta id del pedido'})};

    const body = {};
    if(estado !== undefined) body.estado = estado;
    if(guia !== undefined) body.guia = guia;
    if(transportadora !== undefined) body.transportadora = transportadora;

    const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/pedidos?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(body)
    });

    if(!res.ok) {
      const err = await res.text();
      return {statusCode:400,headers,body:JSON.stringify({error:err})};
    }
    return {statusCode:200,headers,body:JSON.stringify({ok:true})};
  } catch(err) {
    return {statusCode:500,headers,body:JSON.stringify({error:err.message})};
  }
};
