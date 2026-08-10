module.exports=async(req,res)=>{
  try{
    if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
    if(!process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({error:'Blob unavailable'});
    const {list,put}=await import('@vercel/blob');
    const r=await list({prefix:'catalog/catalog-',limit:100,token:process.env.BLOB_READ_WRITE_TOKEN});
    if(!r.blobs?.length) return res.status(404).json({error:'Catalog not found'});
    const latest=[...r.blobs].sort((a,b)=>new Date(b.uploadedAt)-new Date(a.uploadedAt))[0];
    const fr=await fetch(latest.url,{cache:'no-store'});
    const cars=await fr.json();
    const id='byd-qin-plus-dmi-18000';
    if(cars.some(c=>String(c.id)===id)) return res.status(200).json({ok:true,already_exists:true,id});
    cars.push({
      id,
      name:'BYD Qin Plus DM-i',
      brand:'BYD',
      model:'Qin Plus',
      year:null,
      price:18000,
      first_payment:null,
      mileage:null,
      engine:'1.5L DM-i Plug-in Hybrid',
      body:'Седан',
      fuel:'Plug-in Hybrid',
      drive:'Передній',
      range_km:null,
      battery:'Blade Battery (DM-i)',
      trim:'',
      description:'BYD Qin Plus DM-i — плагін-гібридний седан із системою DM-i Super Hybrid. Бензиновий двигун 1.5 л працює разом з електромотором та батареєю Blade Battery; передній привід. Система орієнтована на рух переважно на електротязі та низьку витрату пального. Точний електричний запас ходу й оснащення залежать від конкретної комплектації. Ціна — $18 000. Доступне придбання в кредит / під виплату.',
      images:[],
      featured:false,
      published:true
    });
    await put(`catalog/catalog-${Date.now()}.json`,JSON.stringify(cars),{access:'public',addRandomSuffix:false,contentType:'application/json',cacheControlMaxAge:60,token:process.env.BLOB_READ_WRITE_TOKEN});
    return res.status(200).json({ok:true,id,count:cars.length});
  }catch(e){console.error(e);return res.status(500).json({error:'Server error'})}
};
