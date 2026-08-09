const crypto=require('crypto');
const {readTelegramSettings,writeTelegramSettings}=require('../lib/telegramStore');
const {tgCall,sendTelegramMessage}=require('../lib/telegramNotify');
const HASH='7a6dc546069b028304e9bf001a98a5e47093f88b69cb62e8fce2fc5b56a7b379';

function okPass(req){
  const p=req.headers['x-admin-password']||'';
  return crypto.createHash('sha256').update(String(p)).digest('hex')===HASH;
}

module.exports=async(req,res)=>{
  try{
    if(!okPass(req)) return res.status(401).json({error:'Невірний пароль'});

    if(req.method==='GET'){
      const s=await readTelegramSettings();
      return res.status(200).json({
        configured:!!(s?.enabled&&s?.botToken&&s?.chatId),
        bot_username:s?.botUsername||'',
        chat_name:s?.chatName||'',
        connected_at:s?.connectedAt||''
      });
    }

    if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
    const action=String(req.body?.action||'');

    if(action==='connect'){
      const token=String(req.body?.token||'').trim();
      if(token.length<20) return res.status(400).json({error:'Встав токен бота від BotFather'});

      const me=await tgCall(token,'getMe',{});
      const updates=await tgCall(token,'getUpdates',{limit:50,timeout:0,allowed_updates:['message']});
      const msgs=(updates.result||[]).map(u=>u.message).filter(m=>m?.chat?.id);
      const priv=msgs.filter(m=>m.chat.type==='private');
      const m=(priv.length?priv:msgs).slice(-1)[0];
      if(!m) return res.status(409).json({error:'Я ще не бачу твій Telegram. Відкрий створеного бота, натисни Start або надішли /start — і натисни «Підключити» ще раз.'});

      const first=m.chat.first_name||'',last=m.chat.last_name||'',username=m.chat.username?`@${m.chat.username}`:'';
      const settings={
        enabled:true,
        botToken:token,
        chatId:String(m.chat.id),
        botUsername:me.result?.username||'',
        chatName:[first,last].filter(Boolean).join(' ')||username||'Telegram',
        connectedAt:new Date().toISOString()
      };
      await writeTelegramSettings(settings);
      await sendTelegramMessage(settings,'✅ <b>SoloDealer підключено</b>\n\nТепер нові заявки з сайту та анкети будуть приходити сюди.');
      return res.status(200).json({ok:true,configured:true,bot_username:settings.botUsername,chat_name:settings.chatName});
    }

    if(action==='test'){
      const s=await readTelegramSettings();
      if(!s?.enabled||!s?.botToken||!s?.chatId) return res.status(400).json({error:'Telegram ще не підключено'});
      await sendTelegramMessage(s,'🔔 <b>Тест SoloDealer</b>\n\nВсе працює. Нові заявки будуть приходити сюди.');
      return res.status(200).json({ok:true});
    }

    if(action==='disconnect'){
      await writeTelegramSettings({enabled:false,connectedAt:new Date().toISOString()});
      return res.status(200).json({ok:true,configured:false});
    }

    return res.status(400).json({error:'Невідома дія'});
  }catch(e){
    console.error('Telegram settings error',e);
    return res.status(500).json({error:e?.message||'Помилка Telegram'});
  }
};
