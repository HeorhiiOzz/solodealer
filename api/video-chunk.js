const crypto=require('crypto');
const PREFIX='tmp/changan-v11/';
const EXPECTED_SIZE=93368;
const EXPECTED_SHA='8f52a0fa763c25b3449c3d08938e799b9289249b4a4e8449fcd8249fa1882cff';
const EXPECTED_PARTS=21;
module.exports=async(req,res)=>{try{
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 if(!process.env.BLOB_READ_WRITE_TOKEN)return res.status(503).json({error:'Blob token missing'});
 const token=process.env.BLOB_READ_WRITE_TOKEN;const {put,list}=await import('@vercel/blob');res.setHeader('X-Robots-Tag','noindex, nofollow');
 if(req.query?.action==='put'){
   const n=Number(req.query.i);if(!Number.isInteger(n)||n<0||n>=EXPECTED_PARTS)return res.status(400).json({error:'bad index'});
   const data=String(req.query.data||'');if(!data)return res.status(400).json({error:'no data'});
   const buf=Buffer.from(data,'base64url');if(!buf.length||buf.length>4100)return res.status(400).json({error:'bad chunk size',size:buf.length});
   const name=PREFIX+String(n).padStart(2,'0')+'.bin';
   const b=await put(name,buf,{access:'public',addRandomSuffix:false,contentType:'application/octet-stream',token});
   return res.json({ok:true,i:n,size:buf.length,url:b.url});
 }
 if(req.query?.action==='assemble'){
   const lr=await list({prefix:PREFIX,limit:100,token});const blobs=lr.blobs.slice().sort((a,b)=>a.pathname.localeCompare(b.pathname));
   if(blobs.length!==EXPECTED_PARTS)return res.status(400).json({error:'wrong part count',count:blobs.length,parts:blobs.map(x=>x.pathname)});
   const chunks=[];for(const b of blobs){const r=await fetch(b.url,{cache:'no-store'});if(!r.ok)throw new Error('chunk fetch '+r.status);chunks.push(Buffer.from(await r.arrayBuffer()));}
   const buf=Buffer.concat(chunks),sha=crypto.createHash('sha256').update(buf).digest('hex');
   if(buf.length!==EXPECTED_SIZE||sha!==EXPECTED_SHA)return res.status(400).json({error:'verify fail',size:buf.length,sha256:sha,partSizes:chunks.map(x=>x.length)});
   const out=await put('hero/changan-q05-clean-v11.mp4',buf,{access:'public',addRandomSuffix:false,contentType:'video/mp4',token});
   const check=await fetch(out.url,{cache:'no-store'});const remote=Buffer.from(await check.arrayBuffer()),remoteSha=crypto.createHash('sha256').update(remote).digest('hex');
   if(remote.length!==EXPECTED_SIZE||remoteSha!==EXPECTED_SHA)throw new Error('remote verify fail');
   return res.json({ok:true,url:out.url,size:buf.length,sha256:sha,remoteSize:remote.length,remoteSha,partSizes:chunks.map(x=>x.length)});
 }
 return res.json({ok:true,prefix:PREFIX,expectedParts:EXPECTED_PARTS});
}catch(e){console.error(e);res.setHeader('X-Robots-Tag','noindex, nofollow');return res.status(500).json({error:String(e?.message||e)})}};