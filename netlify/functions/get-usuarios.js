exports.handler = async (event) => {
  const headers = {'Access-Control-Allow-Origin':'*','Content-Type':'application/json'};
  if(event.httpMethod==='OPTIONS') return {statusCode:200,headers:{...headers,'Access-Control-Allow-Headers':'Content-Type, x-admin-pwd','Access-Control-Allow-Methods':'GET,OPTIONS'},body:''};
  const pwd = event.headers?.['x-admin-pwd'] || event.queryStringParameters?.pwd || '';
  if(pwd !== process.env.ADMIN_PASSWORD) return {statusCode:401,headers,body:JSON.stringify({error:'No autorizado'})};
  try {
    const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users?per_page=1000`, {
      headers:{
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
      }
    });
    const data = await res.json();
    const users = (data.users || []).map(u => ({
      id: u.id,
      email: u.email,
      nombre: u.user_metadata?.nombre || u.user_metadata?.full_name || u.email?.split('@')[0],
      created_at: u.created_at,
      last_sign_in: u.last_sign_in_at
    }));
    return {statusCode:200,headers,body:JSON.stringify(users)};
  } catch(err) {
    return {statusCode:500,headers,body:JSON.stringify({error:err.message})};
  }
};