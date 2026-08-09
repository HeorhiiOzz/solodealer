const seed=require('../seed.json');

async function readPublicCars(){
  let cars=seed;
  if(process.env.BLOB_READ_WRITE_TOKEN){
    const {list}=await import('@vercel/blob');
    const r=await list({prefix:'catalog/catalog-',limit:100,token:process.env.BLOB_READ_WRITE_TOKEN});
    if(r.blobs?.length){
      const b=[...r.blobs].sort((a,b)=>new Date(b.uploadedAt)-new Date(a.uploadedAt))[0];
      const fr=await fetch(b.url,{cache:'no-store'});
      if(fr.ok) cars=await fr.json();
    }
  }
  return Array.isArray(cars)?cars.filter(c=>c&&c.published!==false):[];
}

module.exports={readPublicCars};
