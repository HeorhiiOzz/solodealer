const crypto=require('crypto');
const seed=require('../seed.json');
const HASH='7a6dc546069b028304e9bf001a98a5e47093f88b69cb62e8fce2fc5b56a7b379';

function okPass(req){
  const p=req.headers['x-admin-password']||'';
  return crypto.createHash('sha256').update(String(p)).digest('hex')===HASH;
}

async function readCars(){
  if(!process.env.BLOB_READ_WRITE_TOKEN) return seed;
  const {list}=await import('@vercel/blob');
  const r=await list({prefix:'catalog/catalog-',limit:100,token:process.env.BLOB_READ_WRITE_TOKEN});
  if(!r.blobs?.length) return seed;
  const b=[...r.blobs].sort((a,b)=>new Date(b.uploadedAt)-new Date(a.uploadedAt))[0];
  const fr=await fetch(b.url,{cache:'no-store'});
  return await fr.json();
}

async function handleUpload(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  if(!okPass(req)) return res.status(401).json({error:'Невірний пароль'});
  if(!process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({error:'Спочатку підключи Vercel Blob у Storage'});
  const {base64,filename}=req.body||{};
  if(!base64) return res.status(400).json({error:'Фото відсутнє'});
  const buf=Buffer.from(base64,'base64');
  if(buf.length>3500000) return res.status(413).json({error:'Фото завелике'});
  const {put}=await import('@vercel/blob');
  const safe=String(filename||'photo.jpg').replace(/[^a-zA-Z0-9._-]/g,'_');
  const b=await put(`cars/${Date.now()}-${safe}`,buf,{access:'public',addRandomSuffix:true,contentType:'image/jpeg',token:process.env.BLOB_READ_WRITE_TOKEN});
  return res.status(200).json({url:b.url});
}

module.exports=async(req,res)=>{
  try{
    if(String(req.query?.op||'')==='upload') return await handleUpload(req,res);

    if(req.method==='GET'){
      const cars=await readCars();
      if(req.query.admin==='1'){
        if(!okPass(req)) return res.status(401).json({error:'Невірний пароль'});
        return res.status(200).json({cars,storage:!!process.env.BLOB_READ_WRITE_TOKEN});
      }
      return res.status(200).json(cars.filter(c=>c.published!==false));
    }

    if(req.method==='POST'){
      if(!okPass(req)) return res.status(401).json({error:'Невірний пароль'});
      if(!process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({error:'Спочатку підключи Vercel Blob у Storage'});
      const cars=req.body?.cars;
      if(!Array.isArray(cars)) return res.status(400).json({error:'Некоректний каталог'});
      const {put}=await import('@vercel/blob');
      await put(`catalog/catalog-${Date.now()}.json`,JSON.stringify(cars),{access:'public',addRandomSuffix:false,contentType:'application/json',cacheControlMaxAge:60,token:process.env.BLOB_READ_WRITE_TOKEN});
      return res.status(200).json({ok:true});
    }

    return res.status(405).json({error:'Method not allowed'});
  }catch(e){
    console.error(e);
    return res.status(500).json({error:String(req.query?.op||'')==='upload'?'Помилка завантаження':'Помилка сервера'});
  }
};