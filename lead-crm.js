(()=>{
  window.lead=async function(e){
    e.preventDefault();
    const f=e.target;
    const fields=[...f.querySelectorAll('input,textarea')];
    const payload={
      name:fields[0]?.value||'',
      contact:fields[1]?.value||'',
      budget:fields[2]?.value||'',
      notes:fields[3]?.value||'',
      source:'Сайт',
      website:''
    };
    const box=document.getElementById('status');
    const btn=f.querySelector('button[type="submit"],button:not([type])');
    try{
      if(btn){btn.disabled=true;btn.textContent='Надсилаємо…'}
      const r=await fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const d=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(d.error||'Помилка');
      if(box)box.innerHTML='<div class="notice">✅ Дякуємо! Заявку прийнято.</div>';
      f.reset();
    }catch(err){
      if(box)box.innerHTML='<div class="notice">⚠️ Не вдалося відправити. Спробуйте ще раз.</div>';
    }finally{
      if(btn){btn.disabled=false;btn.textContent='Надіслати заявку'}
    }
  };

  const addSimpleLink=(parent,href,text)=>{
    if(!parent||parent.querySelector(`a[href="${href}"]`))return;
    const a=document.createElement('a');a.href=href;a.textContent=text;parent.appendChild(a);
  };
  const nav=document.querySelector('.links');
  addSimpleLink(nav,'/pro-solodealer','Про нас');
  addSimpleLink(nav,'/faq','FAQ');
  const foot=document.querySelector('.foot-links');
  addSimpleLink(foot,'/pro-solodealer','Про SoloDealer');
  addSimpleLink(foot,'/faq','FAQ');
  const seo=document.querySelector('.seo-links');
  if(seo&&!seo.querySelector('a[href="/pro-solodealer"]')){
    const about=document.createElement('a');about.className='seo-link';about.href='/pro-solodealer';about.innerHTML='<b>Про SoloDealer →</b><span>Як працює сервіс і що відбувається після заявки.</span>';seo.appendChild(about);
    const faq=document.createElement('a');faq.className='seo-link';faq.href='/faq';faq.innerHTML='<b>Часті питання →</b><span>Перший внесок, кредит, виплата, документи та актуальність авто.</span>';seo.appendChild(faq);
  }

  // Каталог: людяний фільтр стану авто замість сухого «з пробігом».
  const filters=document.querySelector('.filters');
  const grid=document.getElementById('grid');
  let conditionSelect=null;
  if(filters&&!document.getElementById('condition')){
    conditionSelect=document.createElement('select');
    conditionSelect.id='condition';
    conditionSelect.className='field';
    conditionSelect.setAttribute('aria-label','Стан авто');
    conditionSelect.innerHTML='<option value="">Стан авто</option><option value="new">Нове авто</option><option value="runin">Після обкатки</option>';
    const max=document.getElementById('max');
    filters.insertBefore(conditionSelect,max||filters.lastElementChild);
    const style=document.createElement('style');
    style.textContent='@media(min-width:901px){.filters{grid-template-columns:1.4fr 1fr 1fr 1fr 1fr auto!important}}';
    document.head.appendChild(style);
  }else conditionSelect=document.getElementById('condition');

  const applyCondition=()=>{
    if(!grid||!conditionSelect)return;
    const mode=conditionSelect.value;
    [...grid.querySelectorAll('.card')].forEach(card=>{
      if(!mode){card.style.display='';return}
      const meta=card.querySelector('.meta')?.textContent||'';
      const match=meta.match(/([\d\s.,]+)\s*км/i);
      if(!match){card.style.display='none';return}
      const km=Number(match[1].replace(/[^\d]/g,''))||0;
      card.style.display=(mode==='new'?km===0:km>0)?'':'none';
    });
  };
  if(conditionSelect)conditionSelect.addEventListener('change',applyCondition);
  if(grid){
    new MutationObserver(applyCondition).observe(grid,{childList:true});
    setTimeout(applyCondition,0);
  }
  if(typeof window.resetF==='function'){
    const originalReset=window.resetF;
    window.resetF=function(){originalReset();if(conditionSelect)conditionSelect.value='';applyCondition()};
  }

  window.openCar=function(id){
    if(!id)return;
    location.href='/auto/'+encodeURIComponent(id);
  };
})();