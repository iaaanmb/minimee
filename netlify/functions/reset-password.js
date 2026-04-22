exports.handler = async (event) => {
  const headers = {'Access-Control-Allow-Origin':'*','Content-Type':'application/json'};
  if(event.httpMethod==='OPTIONS') return {statusCode:200,headers:{...headers,'Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST,OPTIONS'},body:''};
  if(event.httpMethod!=='POST') return {statusCode:405,body:'Method Not Allowed'};
  try {
    const {email} = JSON.parse(event.body);
    if(!email) return {statusCode:400,headers,body:JSON.stringify({error:'Email requerido'})};

    // Usar anon key — el redirect_to solo funciona con anon key, no service key
    const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impkcm9ldnVtd2pnY3liZXBwYXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzI4NTYsImV4cCI6MjA1NzY0ODg1Nn0.oRjLB4x3EmIgMfTXLpGEjQLpRQTfAqJV2C2MVvdvucs';

    const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/recover`, {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'apikey': ANON_KEY
      },
      body: JSON.stringify({
        email,
        redirect_to: 'https://minime.com.co/reset.html'
      })
    });

    const text = await res.text();
    console.log('Supabase recover:', res.status, text);
    return {statusCode:200,headers,body:JSON.stringify({ok:true})};
  } catch(err){
    return {statusCode:500,headers,body:JSON.stringify({error:err.message})};
  }
};
