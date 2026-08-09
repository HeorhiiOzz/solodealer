const crypto=require('crypto');
const {readClients,writeClients}=require('../lib/clientStore');
const {scheduleClientReminder,isClosed}=require('../lib/reminderQueue');
const HASH='7a6dc546069b028304e9bf001a98a5e47093f88b69cb62e8fce2fc5b56a7b379';

function okPass(req){
  const p=req.headers['x-admin-password']||'';
  return crypto.createHash('sha256').update(String(p)).digest('hex')===HASH;
}

module.exports=async(req,res)=>{
  try{
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

      return res.status(200).json({
        ok:true,
        count:clients.length,
        reminders_scheduled:remindersScheduled,
        reminder_errors:reminderErrors.length
      });
    }
    return res.status(405).json({error:'Method not allowed'});
  }catch(e){
    console.error(e);
    return res.status(500).json({error:'Помилка CRM'});
  }
};
