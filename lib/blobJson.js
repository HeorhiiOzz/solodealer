async function streamToText(stream){
  if(!stream) return '';
  return await new Response(stream).text();
}

async function readLatestJsonArray(prefix){
  const token=process.env.BLOB_READ_WRITE_TOKEN;
  if(!token) return null;
  const {list,get}=await import('@vercel/blob');
  const r=await list({prefix,limit:100,token});
  const blobs=[...(r.blobs||[])].sort((a,b)=>new Date(b.uploadedAt)-new Date(a.uploadedAt));
  for(const b of blobs){
    try{
      const result=await get(b.url,{access:'public',token,useCache:false});
      if(!result||result.statusCode!==200) continue;
      const text=await streamToText(result.stream);
      const parsed=JSON.parse(text);
      if(Array.isArray(parsed)) return parsed;
    }catch(e){
      console.error('Blob snapshot unreadable:',b.pathname,e?.message||e);
    }
  }
  return null;
}

async function readLatestJsonObject(prefix){
  const token=process.env.BLOB_READ_WRITE_TOKEN;
  if(!token) return null;
  const {list,get}=await import('@vercel/blob');
  const r=await list({prefix,limit:100,token});
  const blobs=[...(r.blobs||[])].sort((a,b)=>new Date(b.uploadedAt)-new Date(a.uploadedAt));
  for(const b of blobs){
    try{
      const result=await get(b.url,{access:'public',token,useCache:false});
      if(!result||result.statusCode!==200) continue;
      const text=await streamToText(result.stream);
      const parsed=JSON.parse(text);
      if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed)) return parsed;
    }catch(e){
      console.error('Blob settings snapshot unreadable:',b.pathname,e?.message||e);
    }
  }
  return null;
}

module.exports={readLatestJsonArray,readLatestJsonObject};
