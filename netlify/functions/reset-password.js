exports.handler = async (event) => {
  const headers = {'Access-Control-Allow-Origin':'*','Content-Type':'application/json'};
  if(event.httpMethod==='OPTIONS') return {statusCode:200,headers:{...headers,'Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST,OPTIONS'},body:''};
  if(event.httpMethod!=='POST') return {statusCode:405,body:'Method Not Allowed'};
  try {
    const {email} = JSON.parse(event.body);
    if(!email) return {statusCode:400,headers,body:JSON.stringify({error:'Email requerido'})};

    const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/recover`, {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({
        email,
        redirect_to: 'https://minime.com.co/reset.html'
      })
    });

    const text = await res.text();
    console.log('Supabase recover response:', res.status, text);

    return {statusCode:200,headers,body:JSON.stringify({ok:true})};
  } catch(err){
    console.error('reset-password error:', err);
    return {statusCode:500,headers,body:JSON.stringify({error:err.message})};
  }
};