const seed=require('../seed.json');
const {readLatestJsonArray}=require('./blobJson');

async function readPublicCars(){
  let cars=seed;
  if(process.env.BLOB_READ_WRITE_TOKEN){
    try{
      const recovered=await readLatestJsonArray('catalog/catalog-');
      if(Array.isArray(recovered)&&recovered.length) cars=recovered;
    }catch(e){
      console.error('Public catalog Blob recovery failed:',e?.message||e);
      cars=seed;
    }
  }
  return Array.isArray(cars)?cars.filter(c=>c&&c.published!==false):[];
}

module.exports={readPublicCars};
