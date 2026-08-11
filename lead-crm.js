(()=>{
  window.lead=async function(e){
    e.preventDefault();
    const f=e.target;
    const fields=[...f.querySelectorAll('input,textarea')];
    const payload={name:fields[0]?.value||'',contact:fields[1]?.value||'',budget:fields[2]?.value||'',notes:fields[3]?.value||'',source:'Сайт',website:''};
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

  if(location.pathname==='/'||location.pathname===''){
    const brandAliases=['Solo Dealer','СолоДілер','Соло Ділер','Солодилер','Соло Дилер','solodealer.store'];
    if(!document.getElementById('brand-site-structured-data')){
      const schema=document.createElement('script');
      schema.id='brand-site-structured-data';schema.type='application/ld+json';
      schema.textContent=JSON.stringify({'@context':'https://schema.org','@type':'WebSite',name:'SoloDealer',alternateName:brandAliases,url:'https://solodealer.store/'});
      document.head.appendChild(schema);
    }
    const seoBox=document.querySelector('.seo-box');
    if(seoBox&&!document.getElementById('brandAliases')){
      const p=document.createElement('p');p.id='brandAliases';p.style.cssText='margin:22px 0 0;color:#6f6f79;font-size:12px;line-height:1.55';
      p.textContent='SoloDealer також можуть шукати як СолоДілер, Соло Ділер, Солодилер або Соло Дилер.';seoBox.appendChild(p);
    }
  }

  const filters=document.querySelector('.filters');
  const grid=document.getElementById('grid');
  let conditionSelect=null;
  if(filters&&!document.getElementById('condition')){
    conditionSelect=document.createElement('select');conditionSelect.id='condition';conditionSelect.className='field';conditionSelect.setAttribute('aria-label','Стан авто');
    conditionSelect.innerHTML='<option value="">Стан авто</option><option value="new">Нове авто</option><option value="runin">Після обкатки</option>';
    const max=document.getElementById('max');filters.insertBefore(conditionSelect,max||filters.lastElementChild);
    const style=document.createElement('style');style.textContent='@media(min-width:901px){.filters{grid-template-columns:1.4fr 1fr 1fr 1fr 1fr auto!important}}';document.head.appendChild(style);
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
  if(grid){new MutationObserver(applyCondition).observe(grid,{childList:true});setTimeout(applyCondition,0)}
  if(typeof window.resetF==='function'){
    const originalReset=window.resetF;
    window.resetF=function(){originalReset();if(conditionSelect)conditionSelect.value='';applyCondition()};
  }

  const heroCard=document.querySelector('.hero-card');
  const heroImg=document.getElementById('heroImg');
  const heroName=document.getElementById('heroName');
  const heroMeta=document.getElementById('heroMeta');
  const heroPrice=document.getElementById('heroPrice');
  let activeHeroCar=null;
  let heroVideo=null;

  const ensureHeroVideo=()=>{
    if(!heroCard)return null;
    if(heroVideo)return heroVideo;
    heroVideo=document.createElement('video');
    heroVideo.id='heroVideo';heroVideo.className='hero-video';heroVideo.autoplay=true;heroVideo.muted=true;heroVideo.loop=true;heroVideo.playsInline=true;heroVideo.preload='metadata';
    heroVideo.setAttribute('muted','');heroVideo.setAttribute('playsinline','');heroVideo.setAttribute('webkit-playsinline','');
    heroCard.insertBefore(heroVideo,heroCard.firstChild);
    if(!document.getElementById('heroVideoStyle')){
      const s=document.createElement('style');s.id='heroVideoStyle';s.textContent='.hero-card .hero-video{display:none;width:100%;height:310px;object-fit:cover;background:#000}@media(max-width:620px){.hero-card .hero-video{height:250px}}';document.head.appendChild(s);
    }
    return heroVideo;
  };

  const playHeroOnTouch=()=>{
    if(!heroVideo||!heroVideo.src)return;
    if(!heroVideo.paused){document.removeEventListener('touchend',playHeroOnTouch,true);return}
    heroVideo.muted=true;heroVideo.playsInline=true;
    heroVideo.setAttribute('muted','');heroVideo.setAttribute('playsinline','');heroVideo.setAttribute('webkit-playsinline','');
    try{
      const play=heroVideo.play();
      if(play?.then)play.then(()=>document.removeEventListener('touchend',playHeroOnTouch,true)).catch(()=>{});
    }catch(e){}
  };
  document.addEventListener('touchend',playHeroOnTouch,{capture:true,passive:true});

  const showHeroImage=()=>{
    if(heroVideo){heroVideo.pause();heroVideo.style.display='none';heroVideo.removeAttribute('src');heroVideo.load()}
    if(heroImg)heroImg.style.display='block';
  };
  const applyHero=()=>{
    try{
      if(typeof cars==='undefined'||!Array.isArray(cars)||!cars.length)return false;
      const h=cars.find(c=>c.featured&&c.published!==false)||cars.find(c=>c.id==='byd-qin-plus-2026'&&c.published!==false)||cars.find(c=>c.published!==false&&(c.images||[]).length);
      if(!h)return false;
      activeHeroCar=h;
      const image=(h.images||[])[0]||'';
      if(heroName)heroName.textContent=h.name||'Хіт продажів';
      if(heroMeta)heroMeta.textContent=[h.year,h.body,h.fuel].filter(Boolean).join(' · ');
      if(heroPrice)heroPrice.textContent='від $'+Number(h.price||0).toLocaleString('en-US');
      if(heroImg){heroImg.src=image;heroImg.alt=(h.name||'Автомобіль')+' '+(h.year||'')+' — SoloDealer'}
      const videoUrl=String(h.video_url||'').trim();
      if(videoUrl){
        const v=ensureHeroVideo();
        v.poster=image;v.src=videoUrl;v.style.display='block';
        if(heroImg)heroImg.style.display='none';
        v.onerror=showHeroImage;
        const play=v.play();if(play?.catch)play.catch(()=>{});
      }else showHeroImage();
      return true;
    }catch(e){return false}
  };
  if(heroCard){
    heroCard.style.cursor='pointer';heroCard.setAttribute('role','link');heroCard.setAttribute('tabindex','0');heroCard.setAttribute('aria-label','Відкрити авто — хіт продажів');
    const openHeroCar=()=>{if(activeHeroCar?.id)location.href='/auto/'+encodeURIComponent(activeHeroCar.id)};
    heroCard.addEventListener('click',openHeroCar);
    heroCard.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openHeroCar()}});
    let tries=0;const timer=setInterval(()=>{tries++;if(applyHero()||tries>40)clearInterval(timer)},200);
    setTimeout(applyHero,0);
  }

  window.openCar=function(id){if(!id)return;location.href='/auto/'+encodeURIComponent(id)};
})();