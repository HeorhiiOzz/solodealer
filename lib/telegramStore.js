const crypto=require('crypto');

function getBlobToken(){
  const token=process.env.BLOB_READ_WRITE_TOKEN;
  if(!token) throw new Error('Vercel Blob не підключено');
  return token;
}

function getKey(){
  return crypto.createHash('sha256').update(getBlobToken()+'|solodealer-telegram-v1').digest();
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
  if(!payload||payload.v!==1) throw new Error('Невідомий формат налаштувань Telegram');
  const decipher=crypto.createDecipheriv('aes-256-gcm',getKey(),Buffer.from(payload.iv,'base64'));
  decipher.setAuthTag(Buffer.from(payload.tag,'base64'));
  const out=Buffer.concat([decipher.update(Buffer.from(payload.data,'base64')),decipher.final()]);
  return JSON.parse(out.toString('utf8'));
}

async function readTelegramSettings(){
  if(!process.env.BLOB_READ_WRITE_TOKEN) return null;
  const {list}=await import('@vercel/blob');
  const r=await list({prefix:'settings/telegram-',limit:100,token:getBlobToken()});
  if(!r.blobs?.length) return null;
  const b=[...r.blobs].sort((a,b)=>new Date(b.uploadedAt)-new Date(a.uploadedAt))[0];
  const fr=await fetch(b.url,{cache:'no-store'});
  if(!fr.ok) throw new Error('Не вдалося прочитати налаштування Telegram');
  return decrypt(await fr.json());
}

async function writeTelegramSettings(settings){
  const {put}=await import('@vercel/blob');
  const body=JSON.stringify(encrypt(settings));
  await put(`settings/telegram-${Date.now()}.enc.json`,body,{
    access:'public',
    addRandomSuffix:false,
    contentType:'application/json',
    cacheControlMaxAge:60,
    token:getBlobToken()
  });
}

module.exports={readTelegramSettings,writeTelegramSettings};
