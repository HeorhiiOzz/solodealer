const crypto=require('crypto');
const HASH='7a6dc546069b028304e9bf001a98a5e47093f88b69cb62e8fce2fc5b56a7b379';
const DEFAULTS={usd_uah_rate:42,annual_rate:20,min_down_payment:10,max_months:60};
function okPass(req){let p=req.headers['x-admin-password']||'';return crypto.createHash('sha256').update(String(p)).digest('hex')===HASH}
async function readSettings(){
  if(!process.env.BLOB_READ_WRITE_TOKEN)return DEFAULTS;
  const {list}=await import('@vercel/blob');
  const r=await list({prefix:'settings/finance-',limit:100,token:process.env.BLOB_READ_WRITE_TOKEN});
  if(!r.blobs?.length)return DEFAULTS;
  const b=[...r.blobs].sort((a,b)=>new Date(b.uploadedAt)-new Date(a.uploadedAt))[0];
  const fr=await fetch(b.url,{cache:'no-store'});
  const saved=await fr.json();
  return {...DEFAULTS,...saved,annual_rate:20,min_down_payment:10,max_months:60};
}
module.exports=async(req,res)=>{
  try{
    if(req.method==='GET'){
      const settings=await readSettings();
      res.setHeader('Cache-Control','public, max-age=0, s-maxage=60');
      return res.status(200).json(settings);
    }
    if(req.method==='POST'){
      if(!okPass(req))return res.status(401).json({error:'Невірний пароль'});
      if(!process.env.BLOB_READ_WRITE_TOKEN)return res.status(503).json({error:'Спочатку підключи Vercel Blob у Storage'});
      const rate=Number(req.body?.usd_uah_rate);
      if(!Number.isFinite(rate)||rate<20||rate>100)return res.status(400).json({error:'Вкажи коректний курс долара'});
      const settings={...DEFAULTS,usd_uah_rate:Math.round(rate*100)/100};
      const {put}=await import('@vercel/blob');
      await put(`settings/finance-${Date.now()}.json`,JSON.stringify(settings),{access:'public',addRandomSuffix:false,contentType:'application/json',cacheControlMaxAge:60,token:process.env.BLOB_READ_WRITE_TOKEN});
      return res.status(200).json({ok:true,settings});
    }
    return res.status(405).json({error:'Method not allowed'});
  }catch(e){console.error('finance settings',e);return res.status(500).json({error:'Помилка сервера'})}
};
