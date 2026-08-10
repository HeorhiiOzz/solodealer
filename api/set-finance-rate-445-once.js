module.exports=async(req,res)=>{
  try{
    if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
    if(!process.env.BLOB_READ_WRITE_TOKEN)return res.status(503).json({error:'Blob unavailable'});
    const settings={usd_uah_rate:44.5,annual_rate:20,min_down_payment:10,max_months:60};
    const {put}=await import('@vercel/blob');
    await put(`settings/finance-${Date.now()}.json`,JSON.stringify(settings),{access:'public',addRandomSuffix:false,contentType:'application/json',cacheControlMaxAge:60,token:process.env.BLOB_READ_WRITE_TOKEN});
    return res.status(200).json({ok:true,settings});
  }catch(e){console.error(e);return res.status(500).json({error:'Server error'})}
};
