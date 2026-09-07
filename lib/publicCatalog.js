const seed=require('../seed.json');

async function readPublicCars(){
  let cars=seed;
  if(process.env.BLOB_READ_WRITE_TOKEN){
    try{
      const {list}=await import('@vercel/blob');
      const r=await list({prefix:'catalog/catalog-',limit:100,token:process.env.BLOB_READ_WRITE_TOKEN});
      if(r.blobs?.length){
        const b=[...r.blobs].sort((a,b)=>new Date(b.uploadedAt)-new Date(a.uploadedAt))[0];
        const fr=await fetch(b.url,{cache:'no-store'});
        if(!fr.ok) throw new Error(`Blob catalog HTTP ${fr.status}`);
        const text=await fr.text();
        const parsed=JSON.parse(text);
        if(!Array.isArray(parsed)) throw new Error('Blob catalog is not an array');
        cars=parsed;
      }
    }catch(e){
      console.error('Public catalog Blob unavailable, using seed fallback:',e?.message||e);
      cars=seed;
    }
  }
  return Array.isArray(cars)?cars.filter(c=>c&&c.published!==false):[];
}

module.exports={readPublicCars};
