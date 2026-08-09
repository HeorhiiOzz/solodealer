const {readTelegramSettings}=require('./telegramStore');

const esc=s=>String(s??'').replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));

async function tgCall(token,method,payload={}){
  const ac=new AbortController();
  const timer=setTimeout(()=>ac.abort(),5000);
  try{
    const r=await fetch(`https://api.telegram.org/bot${token}/${method}`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload),
      signal:ac.signal
    });
    const d=await r.json().catch(()=>({}));
    if(!r.ok||!d.ok) throw new Error(d.description||`Telegram ${method} error`);
    return d;
  }finally{
    clearTimeout(timer);
  }
}

async function sendTelegramMessage(settings,text){
  if(!settings?.botToken||!settings?.chatId) return {skipped:true};
  return tgCall(settings.botToken,'sendMessage',{
    chat_id:settings.chatId,
    text,
    parse_mode:'HTML',
    disable_web_page_preview:true,
    reply_markup:{inline_keyboard:[[{text:'Відкрити CRM',url:'https://solodealer.store/crm'}]]}
  });
}

async function notifyLead(client,{isNew=true}={}){
  const settings=await readTelegramSettings();
  if(!settings?.enabled||!settings?.botToken||!settings?.chatId) return {skipped:true};
  const title=isNew?'🚨 <b>Нова заявка SoloDealer</b>':'🔁 <b>Повторна заявка SoloDealer</b>';
  const rows=[
    title,
    '',
    `👤 <b>Клієнт:</b> ${esc(client.name)||'—'}`,
    `📱 <b>Контакт:</b> ${esc(client.contact)||'—'}`,
    client.city?`📍 <b>Місто:</b> ${esc(client.city)}`:'',
    client.car_name?`🚘 <b>Авто:</b> ${esc(client.car_name)}`:'',
    client.budget?`💰 <b>Бюджет:</b> ${esc(client.budget)}`:'',
    client.payment_type?`💳 <b>Формат:</b> ${esc(client.payment_type)}`:'',
    client.first_payment?`💵 <b>Перший внесок:</b> ${esc(client.first_payment)}`:'',
    client.monthly_payment?`📆 <b>Платіж/міс:</b> ${esc(client.monthly_payment)}`:'',
    client.term?`⏳ <b>Термін:</b> ${esc(client.term)}`:'',
    `📣 <b>Джерело:</b> ${esc(client.source||'Сайт')}`,
    client.notes?`\n📝 <b>Коментар:</b> ${esc(String(client.notes).slice(-700))}`:''
  ].filter(Boolean);
  return sendTelegramMessage(settings,rows.join('\n'));
}

module.exports={tgCall,sendTelegramMessage,notifyLead};
