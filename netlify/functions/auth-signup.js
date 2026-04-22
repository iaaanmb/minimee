exports.handler = async (event) => {
  const headers = {'Access-Control-Allow-Origin':'*','Content-Type':'application/json'};
  if(event.httpMethod==='OPTIONS') return {statusCode:200,headers:{...headers,'Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST,OPTIONS'},body:''};
  if(event.httpMethod!=='POST') return {statusCode:405,body:'Method Not Allowed'};
  try {
    const {email, password, nombre} = JSON.parse(event.body);
    if(!email||!password||!nombre) return {statusCode:400,headers,body:JSON.stringify({error:'Todos los campos son obligatorios'})};
    
    const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users`, {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({
        email, 
        password, 
        email_confirm: true, 
        user_metadata: {nombre, full_name: nombre}
      })
    });
    
    const data = await res.json();
    console.log('SUPABASE RESPONSE STATUS:', res.status);
    console.log('SUPABASE RESPONSE:', JSON.stringify(data));
    
    if(!res.ok) return {statusCode:400,headers,body:JSON.stringify({error: data.msg || data.message || 'Error creando usuario'})};
    return {statusCode:200,headers,body:JSON.stringify({ok:true})};
  } catch(err) {
    console.error('AUTH SIGNUP ERROR:', err.message);
    return {statusCode:500,headers,body:JSON.stringify({error:err.message})};
  }
};