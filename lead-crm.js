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
})();