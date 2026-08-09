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

  const style=document.createElement('style');
  style.textContent=`.sd-thumbs{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:10px 0 4px}.sd-thumb{border:1px solid #303039;background:#0c0c10;border-radius:11px;padding:0;overflow:hidden;aspect-ratio:4/3;cursor:pointer;opacity:.72;transition:.18s}.sd-thumb:hover,.sd-thumb.active{opacity:1;border-color:#b85ad0;transform:translateY(-1px)}.sd-thumb img{width:100%;height:100%;object-fit:cover;display:block}.sd-count{font-size:12px;color:#888;margin:8px 0 2px}@media(max-width:620px){.sd-thumbs{grid-template-columns:repeat(5,80px);overflow-x:auto;padding-bottom:4px}.sd-thumb{width:80px}}`;
  document.head.appendChild(style);

  window.sdPickPhoto=function(btn){
    const main=document.getElementById('sdMainPhoto');
    if(!main||!btn)return;
    main.src=btn.dataset.src||'';
    document.querySelectorAll('.sd-thumb').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
  };

  window.openCar=function(id){
    const c=cars.find(x=>x.id===id);if(!c)return;
    const imgs=(c.images||[]).filter(Boolean);
    const main=imgs[0]||'';
    mt.textContent=c.name;
    const thumbs=imgs.length>1?`<div class="sd-count">Фото: ${imgs.length}</div><div class="sd-thumbs">${imgs.map((u,i)=>`<button class="sd-thumb ${i===0?'active':''}" type="button" data-src="${esc(u)}" onclick="sdPickPhoto(this)"><img src="${esc(u)}" alt="${esc(c.name)} — фото ${i+1}" loading="lazy"></button>`).join('')}</div>`:'';
    mb.innerHTML=`<div class="photo" style="height:330px;margin-top:18px;border-radius:18px;overflow:hidden"><div class="fallback">${esc((c.brand||'S')[0])}</div>${main?`<img id="sdMainPhoto" src="${esc(main)}" alt="${esc(c.name)}" onerror="this.style.display='none'">`:''}</div>${thumbs}<div class="price">від ${money(c.price)}</div><div class="finance-note" style="margin-top:12px">Доступно в кредит / під виплату</div>${c.first_payment?`<div class="first-payment">Перший внесок <b>${money(c.first_payment)}</b></div>`:''}<div class="specs"><div class="spec"><small>Рік</small>${c.year||'—'}</div><div class="spec"><small>Пробіг</small>${Number(c.mileage||0).toLocaleString('uk-UA')} км</div><div class="spec"><small>Двигун</small>${esc(c.engine||c.fuel||'—')}</div><div class="spec"><small>Привід</small>${esc(c.drive||'—')}</div><div class="spec"><small>Батарея</small>${esc(c.battery||'—')}</div><div class="spec"><small>Запас ходу</small>${c.range_km?c.range_km+' км':'—'}</div></div><div class="desc">${esc(c.description||'')}</div><div class="actions"><a class="primary" href="/auto/${encodeURIComponent(c.id)}">Сторінка авто</a><a class="secondary" href="/anketa?src=car-modal">Залишити заявку</a></div>`;
    carModal.classList.add('open');
  };
})();