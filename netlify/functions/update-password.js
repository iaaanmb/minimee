exports.handler = async (event) => {
  const headers = {'Access-Control-Allow-Origin':'*','Content-Type':'application/json'};
  if(event.httpMethod==='OPTIONS') return {statusCode:200,headers:{...headers,'Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST,OPTIONS'},body:''};
  if(event.httpMethod!=='POST') return {statusCode:405,body:'Method Not Allowed'};
  try {
    const {token, password} = JSON.parse(event.body);
    if(!token || !password) return {statusCode:400,headers,body:JSON.stringify({error:'Faltan datos'})};

    const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ password })
    });

    const data = await res.json();
    console.log('update-password:', res.status, JSON.stringify(data));
    if(!res.ok) return {statusCode:400,headers,body:JSON.stringify({error: data.msg || data.message || 'Error al actualizar'})};
    return {statusCode:200,headers,body:JSON.stringify({ok:true})};
  } catch(err){
    return {statusCode:500,headers,body:JSON.stringify({error:err.message})};
  }
};
