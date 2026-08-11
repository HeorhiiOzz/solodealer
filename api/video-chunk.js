const crypto=require('crypto');
const vehicleHandler=require('./vehicle');
const HASH='7a6dc546069b028304e9bf001a98a5e47093f88b69cb62e8fce2fc5b56a7b379';
const CHUNK_BYTES=2*1024*1024;
const MAX_BYTES=100*1024*1024;
const MAX_PARTS=Math.ceil(MAX_BYTES/CHUNK_BYTES);

function okPass(req){
  const p=req.headers['x-admin-password']||'';
  return crypto.createHash('sha256').update(String(p)).digest('hex')===HASH;
}
function safeId(v){
  const s=String(v||'').trim();
  return /^[a-zA-Z0-9-]{8,80}$/.test(s)?s:'';
}
function safeName(v){
  return String(v||'video.mp4').replace(/[^a-zA-Z0-9._-]/g,'_').slice(-120)||'video.mp4';
}
function videoType(v,name){
  const t=String(v||'').toLowerCase();
  if(/^video\/(mp4|webm|quicktime)$/.test(t))return t;
  const n=String(name||'').toLowerCase();
  if(n.endsWith('.webm'))return 'video/webm';
  if(n.endsWith('.mov'))return 'video/quicktime';
  return 'video/mp4';
}

function financeEnhancer(){return `<style id="payoutCalcStyle">.mode-switch{grid-template-columns:1fr 1fr!important;align-items:stretch}.mode-switch #modeCredit{grid-column:1;grid-row:1}.mode-switch #modePayout{grid-column:2;grid-row:1}.mode-switch #modeInstallment{grid-column:1/-1;grid-row:2;justify-self:center;width:min(72%,260px);margin-top:2px}.mode-switch .mode-btn{min-width:0}.finance-extra{border-color:#4d3840!important;background:#120d10!important}.finance-extra b{color:#ffd1d7}.payout-note{display:none;margin:10px 0 0;padding:9px 10px;border-radius:11px;background:#0c130e;border:1px solid #294234;color:#bfe7ca;font-size:12px;line-height:1.5}.payout-note.show{display:block}@media(max-width:520px){.calc-details{grid-template-columns:1fr!important}.mode-switch #modeInstallment{width:min(82%,260px)}}</style><script id="payoutCalcScript">(()=>{const calc=document.querySelector('.calculator');if(!calc)return;let soloMode='credit';const sub=document.getElementById('calcSub'),existingSwitch=document.querySelector('.mode-switch');let modeWrap=document.querySelector('.mode-wrap');if(!modeWrap){modeWrap=document.createElement('div');modeWrap.className='mode-wrap';modeWrap.innerHTML='<div class="calc-label mode-label"><span>Формат фінансування</span></div><div class="mode-switch" role="group" aria-label="Формат фінансування"><button id="modeCredit" class="mode-btn active" type="button">Кредит 20%</button><button id="modePayout" class="mode-btn" type="button">Під виплату 25%</button></div>';sub.insertAdjacentElement('afterend',modeWrap)}else if(existingSwitch&&!document.getElementById('modePayout')){existingSwitch.insertAdjacentHTML('beforeend','<button id="modePayout" class="mode-btn" type="button">Під виплату 25%</button>')}const payoutNote=document.createElement('div');payoutNote.id='payoutNote';payoutNote.className='payout-note';payoutNote.textContent='✓ «Під виплату»: орієнтовна ставка 25% річних. Нижче окремо показана сума відсотків за весь обраний строк.';(document.getElementById('installmentNote')||modeWrap).insertAdjacentElement('afterend',payoutNote);const instNote=document.getElementById('installmentNote');if(instNote)instNote.textContent='✓ Розстрочка 0,01%: перший внесок від 60%, строк до 24 місяців.';const details=document.getElementById('calcDetails');if(details){const total=document.getElementById('totalUah')?.parentElement;if(total){total.querySelector('small').textContent='Перший внесок + усі платежі';total.insertAdjacentHTML('beforebegin','<div class="calc-result finance-extra"><small>Відсотки / переплата за строк</small><b id="interestUah">—</b></div><div class="calc-result"><small>Платежі після першого внеску</small><b id="paymentsUah">—</b></div>')}const price=document.getElementById('priceUah')?.parentElement;if(price)price.querySelector('small').textContent='Ціна авто'}const dt=document.getElementById('detailsToggle');if(dt)dt.textContent='Деталі: за що ви платите ↓';window.toggleCalcDetails=function(){const d=document.getElementById('calcDetails'),b=document.getElementById('detailsToggle');if(!d||!b)return;const open=d.classList.toggle('open');b.textContent=open?'Сховати деталі ↑':'Деталі: за що ви платите ↓'};function modeData(){if(soloMode==='installment'&&IS_NEW)return{annual:0.01,minDown:60,maxMonths:24,title:'Калькулятор розстрочки',sub:'Розрахунок у гривні за орієнтовною ставкою 0,01% річних.',term:'Термін розстрочки',principal:'Сума розстрочки',label:'Розстрочка 0,01%',src:'installment-calculator'};if(soloMode==='payout')return{annual:25,minDown:financeSettings.min_down_payment||10,maxMonths:financeSettings.max_months||60,title:'Калькулятор «Під виплату»',sub:'Розрахунок у гривні за орієнтовною ставкою 25% річних.',term:'Термін виплати',principal:'Сума під виплату',label:'Під виплату 25%',src:'payout-calculator'};const annual=Number(financeSettings.annual_rate)||20;return{annual,minDown:financeSettings.min_down_payment||10,maxMonths:financeSettings.max_months||60,title:'Кредитний калькулятор',sub:'Розрахунок у гривні за орієнтовною ставкою '+annual+'% річних.',term:'Термін кредиту',principal:'Сума кредиту',label:'Кредит',src:'credit-calculator'}}window.setFinanceMode=function(mode){if(mode==='installment'&&!IS_NEW)mode='credit';soloMode=mode;const md=modeData(),dp=document.getElementById('downPct'),mo=document.getElementById('months');if(dp){dp.min=md.minDown;if(Number(dp.value)<md.minDown)dp.value=md.minDown}if(mo){mo.max=md.maxMonths;if(Number(mo.value)>md.maxMonths)mo.value=md.maxMonths}const termPill=document.querySelector('.calc-meta .calc-pill:last-child');if(termPill)termPill.textContent='до '+md.maxMonths+' міс.';[['modeCredit',mode==='credit'],['modeInstallment',mode==='installment'],['modePayout',mode==='payout']].forEach(([id,on])=>{const el=document.getElementById(id);if(el)el.classList.toggle('active',on)});const inst=document.getElementById('installmentNote');if(inst)inst.classList.toggle('show',mode==='installment');payoutNote.classList.toggle('show',mode==='payout');document.getElementById('calcTitle').textContent=md.title;document.getElementById('calcSub').textContent=md.sub;document.getElementById('termLabel').textContent=md.term;document.getElementById('principalLabel').textContent=md.principal;window.calcCredit()};window.calcCredit=function(){const dp=document.getElementById('downPct'),mo=document.getElementById('months');if(!dp||!mo)return;const md=modeData(),down=Math.max(md.minDown,Number(dp.value)||md.minDown),n=Math.min(md.maxMonths,Number(mo.value)||md.maxMonths),rate=Number(financeSettings.usd_uah_rate)||42,annual=md.annual,price=PRICE_USD*rate,downAmt=price*down/100,principal=Math.max(0,price-downAmt),r=annual/100/12,pmt=principal?(r?principal*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1):principal/n):0,payments=pmt*n,interest=Math.max(0,payments-principal),total=downAmt+payments;dp.min=md.minDown;mo.max=md.maxMonths;document.getElementById('downLabel').textContent=down+'%';document.getElementById('monthsLabel').textContent=n+' міс.';document.getElementById('monthlyPayment').textContent=uah(pmt);document.getElementById('downUah').textContent=uah(downAmt);document.getElementById('loanUah').textContent=uah(principal);document.getElementById('priceUah').textContent=uah(price);const iu=document.getElementById('interestUah'),pu=document.getElementById('paymentsUah');if(iu)iu.textContent=uah(interest);if(pu)pu.textContent=uah(payments);document.getElementById('totalUah').textContent=uah(total);document.getElementById('ratePill').textContent=(annual===0.01?'0,01':annual)+'% річних';document.getElementById('fxPill').textContent='Курс: '+rate.toLocaleString('uk-UA')+' грн/$';const q=new URLSearchParams({src:md.src,finance_mode:md.label,car:CAR_NAME,price_usd:String(PRICE_USD),rate:String(rate),annual_rate:String(annual),down_pct:String(down),first_payment:uah(downAmt),loan_amount:uah(principal),interest_total:uah(interest),payments_total:uah(payments),months:String(n),monthly_payment:uah(pmt),total_payment:uah(total)});document.getElementById('calcApply').href='/anketa?'+q.toString()};document.getElementById('modeCredit')?.addEventListener('click',()=>window.setFinanceMode('credit'));document.getElementById('modeInstallment')?.addEventListener('click',()=>window.setFinanceMode('installment'));document.getElementById('modePayout')?.addEventListener('click',()=>window.setFinanceMode('payout'));window.setFinanceMode('credit')})();</script>`}

async function serveVehicle(req,res){
  const send=res.send.bind(res);
  res.send=body=>{
    if(typeof body==='string'&&body.includes('class="calculator"')&&!body.includes('payoutCalcScript'))body=body.replace('</body>',()=>financeEnhancer()+'</body>');
    return send(body);
  };
  return vehicleHandler(req,res);
}

module.exports=async(req,res)=>{
  if(String(req.query?.op||'')==='vehicle')return serveVehicle(req,res);
  res.setHeader('X-Robots-Tag','noindex, nofollow');
  res.setHeader('Cache-Control','no-store');
  try{
    if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
    if(!okPass(req))return res.status(401).json({error:'Невірний пароль'});
    if(!process.env.BLOB_READ_WRITE_TOKEN)return res.status(503).json({error:'Vercel Blob не підключено'});

    const action=String(req.query?.action||'init');
    const token=process.env.BLOB_READ_WRITE_TOKEN;
    const {put,list,del}=await import('@vercel/blob');

    if(action==='init'){
      const size=Number(req.body?.size||0);
      const filename=safeName(req.body?.filename);
      if(!Number.isFinite(size)||size<=0)return res.status(400).json({error:'Файл порожній'});
      if(size>MAX_BYTES)return res.status(413).json({error:'Відео завелике. Максимум 100 МБ'});
      const uploadId=crypto.randomUUID();
      return res.status(200).json({ok:true,uploadId,chunkSize:CHUNK_BYTES,maxBytes:MAX_BYTES,filename});
    }

    const uploadId=safeId(req.body?.uploadId);
    if(!uploadId)return res.status(400).json({error:'Некоректна сесія завантаження'});
    const prefix=`tmp/video/${uploadId}/`;

    if(action==='put'){
      const index=Number(req.body?.index),total=Number(req.body?.total);
      if(!Number.isInteger(total)||total<1||total>MAX_PARTS)return res.status(400).json({error:'Некоректна кількість частин'});
      if(!Number.isInteger(index)||index<0||index>=total)return res.status(400).json({error:'Некоректний номер частини'});
      const data=String(req.body?.data||'');
      if(!data)return res.status(400).json({error:'Частина відео порожня'});
      const buf=Buffer.from(data,'base64');
      if(!buf.length||buf.length>CHUNK_BYTES)return res.status(413).json({error:'Частина відео завелика'});
      const pathname=`${prefix}${String(index).padStart(3,'0')}.bin`;
      await put(pathname,buf,{access:'public',addRandomSuffix:false,contentType:'application/octet-stream',token});
      return res.status(200).json({ok:true,index,total});
    }

    if(action==='assemble'){
      const total=Number(req.body?.total);
      const filename=safeName(req.body?.filename);
      const contentType=videoType(req.body?.contentType,filename);
      if(!Number.isInteger(total)||total<1||total>MAX_PARTS)return res.status(400).json({error:'Некоректна кількість частин'});
      const lr=await list({prefix,limit:1000,token});
      const blobs=(lr.blobs||[]).slice().sort((a,b)=>a.pathname.localeCompare(b.pathname));
      if(blobs.length!==total)return res.status(409).json({error:`Завантажено ${blobs.length} з ${total} частин. Спробуй ще раз.`});
      const chunks=[];
      let bytes=0;
      for(const b of blobs){
        const r=await fetch(b.url,{cache:'no-store'});
        if(!r.ok)throw new Error(`Не вдалося прочитати частину: ${r.status}`);
        const chunk=Buffer.from(await r.arrayBuffer());
        bytes+=chunk.length;
        if(bytes>MAX_BYTES)return res.status(413).json({error:'Відео завелике. Максимум 100 МБ'});
        chunks.push(chunk);
      }
      const body=Buffer.concat(chunks,bytes);
      const out=await put(`cars/videos/${Date.now()}-${safeName(filename)}`,body,{access:'public',addRandomSuffix:true,contentType,token});
      try{if(blobs.length)await del(blobs.map(b=>b.url),{token})}catch(e){console.error('video temp cleanup',e)}
      return res.status(200).json({ok:true,url:out.url,size:bytes,contentType});
    }

    if(action==='cancel'){
      const lr=await list({prefix,limit:1000,token});
      const urls=(lr.blobs||[]).map(b=>b.url);
      if(urls.length)await del(urls,{token});
      return res.status(200).json({ok:true,deleted:urls.length});
    }

    return res.status(400).json({error:'Невідома дія'});
  }catch(e){
    console.error('video chunk',e);
    return res.status(500).json({error:e?.message||'Помилка завантаження відео'});
  }
};
