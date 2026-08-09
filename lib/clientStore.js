const crypto=require('crypto');

function getToken(){
  const token=process.env.BLOB_READ_WRITE_TOKEN;
  if(!token) throw new Error('Vercel Blob не підключено');
  return token;
}

function getKey(){
  return crypto.createHash('sha256').update(getToken()+'|solodealer-crm-v1').digest();
}

function encrypt(value){
  const iv=crypto.randomBytes(12);
  const cipher=crypto.createCipheriv('aes-256-gcm',getKey(),iv);
  const data=Buffer.concat([cipher.update(JSON.stringify(value),'utf8'),cipher.final()]);
  return {
    v:1,
    iv:iv.toString('base64'),
    tag:cipher.getAuthTag().toString('base64'),
    data:data.toString('base64')
  };
}

function decrypt(payload){
  if(!payload||payload.v!==1) throw new Error('Невідомий формат CRM');
  const decipher=crypto.createDecipheriv('aes-256-gcm',getKey(),Buffer.from(payload.iv,'base64'));
  decipher.setAuthTag(Buffer.from(payload.tag,'base64'));
  const out=Buffer.concat([decipher.update(Buffer.from(payload.data,'base64')),decipher.final()]);
  return JSON.parse(out.toString('utf8'));
}

async function readClients(){
  if(!process.env.BLOB_READ_WRITE_TOKEN) return [];
  const {list}=await import('@vercel/blob');
  const r=await list({prefix:'crm/clients-',limit:100,token:getToken()});
  if(!r.blobs?.length) return [];
  const b=[...r.blobs].sort((a,b)=>new Date(b.uploadedAt)-new Date(a.uploadedAt))[0];
  const fr=await fetch(b.url,{cache:'no-store'});
  if(!fr.ok) throw new Error('Не вдалося прочитати CRM');
  return decrypt(await fr.json());
}

async function writeClients(clients){
  const {put}=await import('@vercel/blob');
  const body=JSON.stringify(encrypt(clients));
  await put(`crm/clients-${Date.now()}.enc.json`,body,{
    access:'public',
    addRandomSuffix:false,
    contentType:'application/json',
    cacheControlMaxAge:60,
    token:getToken()
  });
}

module.exports={readClients,writeClients};