exports.handler = async (event) => {
  const headers = {'Access-Control-Allow-Origin':'*','Content-Type':'application/json'};
  if(event.httpMethod==='OPTIONS') return {statusCode:200,headers:{...headers,'Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET,OPTIONS'},body:''};

  const pwd = event.queryStringParameters?.pwd || '';
  if(pwd !== process.env.ADMIN_PASSWORD) return {statusCode:401,headers,body:JSON.stringify({error:'No autorizado'})};

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

    // Obtener usuarios de Supabase Auth
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=1000`, {
      headers:{
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    const data = await res.json();
    const users = data.users || [];

    // Obtener pedidos para contar por email
    const pedidosRes = await fetch(`${SUPABASE_URL}/rest/v1/pedidos?select=email`, {
      headers:{
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    const pedidos = await pedidosRes.json();

    // Contar pedidos por email
    const pedidosPorEmail = {};
    (Array.isArray(pedidos)?pedidos:[]).forEach(p=>{
      if(p.email) pedidosPorEmail[p.email.toLowerCase()] = (pedidosPorEmail[p.email.toLowerCase()]||0)+1;
    });

    // Mapear usuarios
    const clientes = users.map(u=>({
      id: u.id,
      email: u.email,
      nombre: u.user_metadata?.nombre || u.user_metadata?.full_name || u.email?.split('@')[0] || '—',
      telefono: u.user_metadata?.telefono || '',
      created_at: u.created_at,
      pedidos_count: pedidosPorEmail[u.email?.toLowerCase()] || 0
    }));

    return {statusCode:200,headers,body:JSON.stringify(clientes)};
  } catch(err){
    console.error('get-clientes error:', err);
    return {statusCode:500,headers,body:JSON.stringify({error:err.message})};
  }
};