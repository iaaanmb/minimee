exports.handler = async (event) => {
  const headers = {'Access-Control-Allow-Origin':'*','Content-Type':'application/json'};
  if(event.httpMethod==='OPTIONS') return {statusCode:200,headers:{...headers,'Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST,OPTIONS'},body:''};
  if(event.httpMethod!=='POST') return {statusCode:405,body:'Method Not Allowed'};
  try {
    const {token} = JSON.parse(event.body);
    // Verificar token y obtener usuario
    const userRes = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      headers:{'apikey':process.env.SUPABASE_SERVICE_KEY,'Authorization':`Bearer ${token}`}
    });
    const userData = await userRes.json();
    if(!userData.email) return {statusCode:401,headers,body:JSON.stringify({error:'Sesión inválida'})};
    // Obtener pedidos de ese email, solo confirmados
    const pedidosRes = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/pedidos?email=eq.${encodeURIComponent(userData.email)}&order=created_at.desc&select=id,fecha,productos,total,envio,metodo,estado,guia,transportadora`,
      {headers:{'apikey':process.env.SUPABASE_SERVICE_KEY,'Authorization':`Bearer ${process.env.SUPABASE_SERVICE_KEY}`}}
    );
    const pedidos = await pedidosRes.json();
    return {statusCode:200,headers,body:JSON.stringify(pedidos)};
  } catch(err) {
    return {statusCode:500,headers,body:JSON.stringify({error:err.message})};
  }
};