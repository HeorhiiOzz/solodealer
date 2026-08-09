const TOPIC='client-reminders';
const MAX_RETENTION_SECONDS=7*24*60*60;
const MAX_DELAY_SECONDS=MAX_RETENTION_SECONDS-120;

function isClosed(client){
  return ['deal','lost'].includes(String(client?.status||''));
}

async function scheduleClientReminder(client){
  if(!client?.id||!client?.next_contact||isClosed(client)) return {skipped:true};
  const due=Date.parse(client.next_contact);
  if(!Number.isFinite(due)) return {skipped:true};

  const remaining=Math.max(0,Math.floor((due-Date.now())/1000));
  const delaySeconds=Math.min(remaining,MAX_DELAY_SECONDS);
  const retentionSeconds=Math.min(
    MAX_RETENTION_SECONDS,
    Math.max(300,delaySeconds+120)
  );

  const {send}=await import('@vercel/queue');
  return send(TOPIC,{
    clientId:String(client.id),
    nextContact:String(client.next_contact)
  },{
    delaySeconds,
    retentionSeconds
  });
}

module.exports={TOPIC,scheduleClientReminder,isClosed};
