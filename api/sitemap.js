const {readPublicCars}=require('../lib/publicCatalog');
const xml=s=>String(s??'').replace(/[<>&'\"]/g,m=>({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','\"':'&quot;'}[m]));
module.exports=async(req,res)=>{
  try{
    if(req.method!=='GET') return res.status(405).end('Method not allowed');
    const cars=await readPublicCars();
    const base='https://solodealer.store';
    const fixed=['/','/avto-pid-vyplatu','/avto-v-kredyt','/avto-bez-pershoho-vnesku','/avto-z-minimalnym-pershym-vneskom','/avto-pry-neidealnii-kredytnii-istorii','/avto-pid-vyplatu-dlia-taksi','/pro-solodealer','/faq','/anketa'];
    const urls=[...fixed,...cars.map(c=>`/auto/${encodeURIComponent(c.id)}`)];
    const body=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`  <url><loc>${xml(base+u)}</loc></url>`).join('\n')}\n</urlset>`;
    res.setHeader('Content-Type','application/xml; charset=utf-8');
    res.setHeader('Cache-Control','public, max-age=0, s-maxage=3600');
    return res.status(200).send(body);
  }catch(e){
    console.error('sitemap',e);
    return res.status(500).send('Sitemap error');
  }
};
