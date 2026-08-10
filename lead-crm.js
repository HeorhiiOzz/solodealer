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
  addSimpleLink(foot,'/avto-bez-pershoho-vnesku','Без першого внеску');
  addSimpleLink(foot,'/avto-z-minimalnym-pershym-vneskom','Мінімальний внесок');
  addSimpleLink(foot,'/avto-pry-neidealnii-kredytnii-istorii','Кредитна історія');
  addSimpleLink(foot,'/avto-pid-vyplatu-dlia-taksi','Авто для таксі');
  const seo=document.querySelector('.seo-links');
  const addSeoCard=(href,title,text)=>{
    if(!seo||seo.querySelector(`a[href="${href}"]`))return;
    const a=document.createElement('a');a.className='seo-link';a.href=href;a.innerHTML=`<b>${title} →</b><span>${text}</span>`;seo.appendChild(a);
  };
  addSeoCard('/avto-bez-pershoho-vnesku','Авто без першого внеску','Перевірка доступних варіантів без стартового платежу.');
  addSeoCard('/avto-z-minimalnym-pershym-vneskom','Мінімальний перший внесок','Підбір авто з найменшою стартовою сумою.');
  addSeoCard('/avto-pry-neidealnii-kredytnii-istorii','Неідеальна кредитна історія','Індивідуальний розгляд доступних варіантів.');
  addSeoCard('/avto-pid-vyplatu-dlia-taksi','Авто під виплату для таксі','Економні авто для роботи в таксі та доставці.');
  addSeoCard('/pro-solodealer','Про SoloDealer','Як працює сервіс і що відбувається після заявки.');
  addSeoCard('/faq','Часті питання','Перший внесок, кредит, виплата, документи та актуальність авто.');

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

  // «Хіт продажів» у hero тепер відкриває сторінку цього авто.
  const heroCard=document.querySelector('.hero-card');
  const openHeroCar=()=>{
    try{
      const heroCar=cars.find(c=>c.id==='byd-qin-plus-2026')||cars.find(c=>(c.images||[]).length);
      if(heroCar?.id)location.href='/auto/'+encodeURIComponent(heroCar.id);
    }catch(e){}
  };
  if(heroCard){
    heroCard.style.cursor='pointer';
    heroCard.setAttribute('role','link');
    heroCard.setAttribute('tabindex','0');
    heroCard.setAttribute('aria-label','Відкрити авто — хіт продажів');
    heroCard.addEventListener('click',openHeroCar);
    heroCard.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openHeroCar()}});
  }

  window.openCar=function(id){
    if(!id)return;
    location.href='/auto/'+encodeURIComponent(id);
  };
})();