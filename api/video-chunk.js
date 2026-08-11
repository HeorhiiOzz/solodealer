const crypto=require('crypto');
const HASH='7a6dc546069b028304e9bf001a98a5e47093f88b69cb62e8fce2fc5b56a7b379';
const CHUNK_BYTES=2*1024*1024;
const MAX_BYTES=100*1024*1024;
const MAX_PARTS=Math.ceil(MAX_BYTES/CHUNK_BYTES);

function okPass(req){
  const p=req.headers['x-admin-password']||'';
  return crypto.createHash('sha256').update(String(p)).digest('hex')===HASH;
}
function safeId(v){
  const s=String(v||'').trim();
  return /^[a-zA-Z0-9-]{8,80}$/.test(s)?s:'';
}
function safeName(v){
  return String(v||'video.mp4').replace(/[^a-zA-Z0-9._-]/g,'_').slice(-120)||'video.mp4';
}
function videoType(v,name){
  const t=String(v||'').toLowerCase();
  if(/^video\/(mp4|webm|quicktime)$/.test(t))return t;
  const n=String(name||'').toLowerCase();
  if(n.endsWith('.webm'))return 'video/webm';
  if(n.endsWith('.mov'))return 'video/quicktime';
  return 'video/mp4';
}

module.exports=async(req,res)=>{
  res.setHeader('X-Robots-Tag','noindex, nofollow');
  res.setHeader('Cache-Control','no-store');
  try{
    if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
    if(!okPass(req))return res.status(401).json({error:'Невірний пароль'});
    if(!process.env.BLOB_READ_WRITE_TOKEN)return res.status(503).json({error:'Vercel Blob не підключено'});

    const action=String(req.query?.action||'init');
    const token=process.env.BLOB_READ_WRITE_TOKEN;
    const {put,list,del}=await import('@vercel/blob');

    if(action==='init'){
      const size=Number(req.body?.size||0);
      const filename=safeName(req.body?.filename);
      if(!Number.isFinite(size)||size<=0)return res.status(400).json({error:'Файл порожній'});
      if(size>MAX_BYTES)return res.status(413).json({error:'Відео завелике. Максимум 100 МБ'});
      const uploadId=crypto.randomUUID();
      return res.status(200).json({ok:true,uploadId,chunkSize:CHUNK_BYTES,maxBytes:MAX_BYTES,filename});
    }

    const uploadId=safeId(req.body?.uploadId);
    if(!uploadId)return res.status(400).json({error:'Некоректна сесія завантаження'});
    const prefix=`tmp/video/${uploadId}/`;

    if(action==='put'){
      const index=Number(req.body?.index),total=Number(req.body?.total);
      if(!Number.isInteger(total)||total<1||total>MAX_PARTS)return res.status(400).json({error:'Некоректна кількість частин'});
      if(!Number.isInteger(index)||index<0||index>=total)return res.status(400).json({error:'Некоректний номер частини'});
      const data=String(req.body?.data||'');
      if(!data)return res.status(400).json({error:'Частина відео порожня'});
      const buf=Buffer.from(data,'base64');
      if(!buf.length||buf.length>CHUNK_BYTES)return res.status(413).json({error:'Частина відео завелика'});
      const pathname=`${prefix}${String(index).padStart(3,'0')}.bin`;
      await put(pathname,buf,{access:'public',addRandomSuffix:false,contentType:'application/octet-stream',token});
      return res.status(200).json({ok:true,index,total});
    }

    if(action==='assemble'){
      const total=Number(req.body?.total);
      const filename=safeName(req.body?.filename);
      const contentType=videoType(req.body?.contentType,filename);
      if(!Number.isInteger(total)||total<1||total>MAX_PARTS)return res.status(400).json({error:'Некоректна кількість частин'});
      const lr=await list({prefix,limit:1000,token});
      const blobs=(lr.blobs||[]).slice().sort((a,b)=>a.pathname.localeCompare(b.pathname));
      if(blobs.length!==total)return res.status(409).json({error:`Завантажено ${blobs.length} з ${total} частин. Спробуй ще раз.`});
      const chunks=[];
      let bytes=0;
      for(const b of blobs){
        const r=await fetch(b.url,{cache:'no-store'});
        if(!r.ok)throw new Error(`Не вдалося прочитати частину: ${r.status}`);
        const chunk=Buffer.from(await r.arrayBuffer());
        bytes+=chunk.length;
        if(bytes>MAX_BYTES)return res.status(413).json({error:'Відео завелике. Максимум 100 МБ'});
        chunks.push(chunk);
      }
      const body=Buffer.concat(chunks,bytes);
      const out=await put(`cars/videos/${Date.now()}-${safeName(filename)}`,body,{access:'public',addRandomSuffix:true,contentType,token});
      try{if(blobs.length)await del(blobs.map(b=>b.url),{token})}catch(e){console.error('video temp cleanup',e)}
      return res.status(200).json({ok:true,url:out.url,size:bytes,contentType});
    }

    if(action==='cancel'){
      const lr=await list({prefix,limit:1000,token});
      const urls=(lr.blobs||[]).map(b=>b.url);
      if(urls.length)await del(urls,{token});
      return res.status(200).json({ok:true,deleted:urls.length});
    }

    return res.status(400).json({error:'Невідома дія'});
  }catch(e){
    console.error('video chunk',e);
    return res.status(500).json({error:e?.message||'Помилка завантаження відео'});
  }
};