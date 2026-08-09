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
        id:crypto.randomUUID(),
        name,contact,
        source,
        status:'new',
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
    return res.status(200).json({ok:true,id:client.id});
  }catch(e){
    console.error(e);
    return res.status(500).json({error:'Не вдалося зберегти заявку'});
  }
};