exports.handler = async (event) => {
  const headers = {'Access-Control-Allow-Origin':'*','Content-Type':'application/json'};
  if(event.httpMethod==='OPTIONS') return {statusCode:200,headers:{...headers,'Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST,OPTIONS'},body:''};
  if(event.httpMethod!=='POST') return {statusCode:405,body:'Method Not Allowed'};
  try {
    const {email, password} = JSON.parse(event.body);

    // Login con Supabase
    const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':process.env.SUPABASE_SERVICE_KEY},
      body: JSON.stringify({email, password})
    });
    const data = await res.json();
    if(data.error||data.error_description) return {statusCode:401,headers,body:JSON.stringify({error:'Correo o contraseña incorrectos'})};

    // Obtener metadata completa del usuario
    const userRes = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      headers:{
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${data.access_token}`
      }
    });
    const userData = await userRes.json();
    const nombre = userData?.user_metadata?.nombre 
      || userData?.user_metadata?.full_name 
      || email.split('@')[0];

    return {statusCode:200,headers,body:JSON.stringify({
      ok: true,
      token: data.access_token,
      nombre: nombre,
      email: userData?.email || email
    })};
  } catch(err) {
    return {statusCode:500,headers,body:JSON.stringify({error:err.message})};
  }
};