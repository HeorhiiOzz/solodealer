const crypto=require('crypto');
const {readClients,writeClients}=require('../lib/clientStore');
const {scheduleClientReminder,isClosed}=require('../lib/reminderQueue');
const {notifyLead}=require('../lib/telegramNotify');
const HASH='7a6dc546069b028304e9bf001a98a5e47093f88b69cb62e8fce2fc5b56a7b379';

function okPass(req){
  const p=req.headers['x-admin-password']||'';
  return crypto.createHash('sha256').update(String(p)).digest('hex')===HASH;
}

const clean=(v,n=500)=>String(v??'').trim().slice(0,n);
const keyContact=v=>clean(v,120).toLowerCase().replace(/[\s()\-]/g,'');

async function handleLead(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const b=req.body||{};
  if(clean(b.website,80)) return res.status(200).json({ok:true});
  const name=clean(b.name,120),contact=clean(b.contact,120);
  if(name.length<2||contact.length<4) return res.status(400).json({error:'Вкажіть ім’я та контакт'});

  const clients=await readClients();
  const now=new Date().toISOString();
  const match=keyContact(contact);
  let client=clients.find(c=>keyContact(c.contact)===match);
  const isNew=!client;
  const source=clean(b.source,60)||'Сайт';
  const event={at:now,type:'lead',text:`Нова заявка: ${source}`};

  const incoming={
    budget:clean(b.budget,80),
    car_id:clean(b.car_id,120),
    car_name:clean(b.car_name,180),
    payment_type:clean(b.payment_type,60),
    first_payment:clean(b.first_payment,80),
    monthly_payment:clean(b.monthly_payment,80),
    term:clean(b.term,80),
    city:clean(b.city,100),
    notes:clean(b.notes,1600)
  };

  if(client){
    client.name=name||client.name;
    client.source=source||client.source||'Сайт';
    for(const k of ['budget','car_id','car_name','payment_type','first_payment','monthly_payment','term','city']){
      if(incoming[k]) client[k]=incoming[k];
    }
    if(incoming.notes) client.notes=[client.notes,incoming.notes].filter(Boolean).join('\n\n');
    client.updated_at=now;
    client.history=[...(client.history||[]),event].slice(-50);
    if(client.status==='lost') client.status='new';
  }else{
    client={
      id:crypto.randomUUID(),name,contact,source,status:'new',
      budget:incoming.budget,
      first_payment:incoming.first_payment,
      payment_type:incoming.payment_type,
      monthly_payment:incoming.monthly_payment,
      term:incoming.term,
      city:incoming.city,
      car_id:incoming.car_id,
      car_name:incoming.car_name,
      next_contact:'',
      notes:incoming.notes,
      created_at:now,
      updated_at:now,
      history:[event]
    };
    clients.unshift(client);
  }

  await writeClients(clients);
  try{ await notifyLead(client,{isNew}); }
  catch(e){ console.error('Telegram notify failed',e); }
  return res.status(200).json({ok:true,id:client.id});
}

module.exports=async(req,res)=>{
  try{
    if(String(req.query?.op||'')==='lead') return await handleLead(req,res);

    if(!okPass(req)) return res.status(401).json({error:'Невірний пароль'});
    if(req.method==='GET'){
      const clients=await readClients();
      return res.status(200).json({clients,storage:!!process.env.BLOB_READ_WRITE_TOKEN});
    }
    if(req.method==='POST'){
      const clients=req.body?.clients;
      if(!Array.isArray(clients)) return res.status(400).json({error:'Некоректний список клієнтів'});

      const previous=await readClients();
      const oldById=new Map(previous.map(c=>[String(c.id),c]));
      await writeClients(clients);

      let remindersScheduled=0;
      const reminderErrors=[];
      for(const client of clients){
        if(!client?.id||!client?.next_contact||isClosed(client)) continue;
        const old=oldById.get(String(client.id));
        const changed=!old||String(old.next_contact||'')!==String(client.next_contact||'');
        const reopened=old&&isClosed(old)&&!isClosed(client);
        if(!changed&&!reopened) continue;
        try{
          await scheduleClientReminder(client);
          remindersScheduled++;
        }catch(e){
          console.error('Reminder schedule error',client.id,e);
          reminderErrors.push(String(client.id));
        }
      }

      return res.status(200).json({ok:true,count:clients.length,reminders_scheduled:remindersScheduled,reminder_errors:reminderErrors.length});
    }
    return res.status(405).json({error:'Method not allowed'});
  }catch(e){
    console.error(e);
    return res.status(500).json({error:String(req.query?.op||'')==='lead'?'Не вдалося зберегти заявку':'Помилка CRM'});
  }
};