exports.handler = async (event) => {
  const headers = {'Access-Control-Allow-Origin':'*','Content-Type':'application/json'};
  if(event.httpMethod==='OPTIONS') return {statusCode:200,headers:{...headers,'Access-Control-Allow-Headers':'Content-Type, x-admin-pwd','Access-Control-Allow-Methods':'POST,OPTIONS'},body:''};
  if(event.httpMethod!=='POST') return {statusCode:405,body:'Method Not Allowed'};

  const pwd = event.headers?.['x-admin-pwd'] || '';
  if(pwd !== process.env.ADMIN_PASSWORD) return {statusCode:401,headers,body:JSON.stringify({error:'No autorizado'})};

  try {
    const { userId } = JSON.parse(event.body);
    if(!userId) return {statusCode:400,headers,body:JSON.stringify({error:'userId requerido'})};

    const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
      }
    });

    if(!res.ok){
      const err = await res.text();
      throw new Error(err);
    }

    return {statusCode:200,headers,body:JSON.stringify({ok:true})};
  } catch(err){
    return {statusCode:500,headers,body:JSON.stringify({error:err.message})};
  }
};
