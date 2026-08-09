const crypto=require('crypto');
const {readClients,writeClients}=require('../lib/clientStore');

const clean=(v,n=500)=>String(v??'').trim().slice(0,n);
const keyContact=v=>clean(v,120).toLowerCase().replace(/[\s()\-]/g,'');

module.exports=async(req,res)=>{
  try{
    if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
    const b=req.body||{};
    if(clean(b.website,80)) return res.status(200).json({ok:true});
    const name=clean(b.name,120),contact=clean(b.contact,120);
    if(name.length<2||contact.length<4) return res.status(400).json({error:'Вкажіть ім’я та контакт'});

    const clients=await readClients();
    const now=new Date().toISOString();
    const match=keyContact(contact);
    let client=clients.find(c=>keyContact(c.contact)===match);
    const event={at:now,type:'lead',text:'Нова заявка із сайту'};

    if(client){
      client.name=name||client.name;
      client.source=client.source||'Сайт';
      client.budget=clean(b.budget,80)||client.budget||'';
      client.car_id=clean(b.car_id,120)||client.car_id||'';
      client.car_name=clean(b.car_name,180)||client.car_name||'';
      client.notes=[client.notes,clean(b.notes,1200)].filter(Boolean).join('\n\n');
      client.updated_at=now;
      client.history=[...(client.history||[]),event].slice(-50);
      if(client.status==='lost') client.status='new';
    }else{
      client={
        id:crypto.randomUUID(),
        name,contact,
        source:'Сайт',
        status:'new',
        budget:clean(b.budget,80),
        first_payment:'',
        payment_type:'',
        car_id:clean(b.car_id,120),
        car_name:clean(b.car_name,180),
        next_contact:'',
        notes:clean(b.notes,1200),
        created_at:now,
        updated_at:now,
        history:[event]
      };
      clients.unshift(client);
    }
    await writeClients(clients);
    return res.status(200).json({ok:true,id:client.id});
  }catch(e){
    console.error(e);
    return res.status(500).json({error:'Не вдалося зберегти заявку'});
  }
};