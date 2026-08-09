import {handleCallback} from '@vercel/queue';
import clientStore from '../lib/clientStore.js';
import telegramNotify from '../lib/telegramNotify.js';
import reminderQueue from '../lib/reminderQueue.js';

const {readClients,writeClients}=clientStore;
const {notifyReminder}=telegramNotify;
const {scheduleClientReminder,isClosed}=reminderQueue;

export const POST=handleCallback(async(message,metadata)=>{
  const clientId=String(message?.clientId||'');
  const expected=String(message?.nextContact||'');
  if(!clientId||!expected) return;

  const clients=await readClients();
  const index=clients.findIndex(c=>String(c.id)===clientId);
  if(index<0) return;

  const client=clients[index];
  if(isClosed(client)) return;
  if(String(client.next_contact||'')!==expected) return;
  if(String(client.reminder_sent_for||'')===expected) return;

  const due=Date.parse(expected);
  if(!Number.isFinite(due)) return;

  // Queues can delay delivery for up to seven days. For reminders farther
  // in the future, wake up near the limit and schedule the next leg.
  if(due-Date.now()>30000){
    await scheduleClientReminder(client);
    return;
  }

  const result=await notifyReminder(client);
  if(result?.skipped) return;

  const now=new Date().toISOString();
  client.reminder_sent_for=expected;
  client.updated_at=now;
  client.history=[
    ...(client.history||[]),
    {at:now,type:'telegram_reminder',text:'Telegram-нагадування надіслано'}
  ].slice(-60);
  clients[index]=client;
  await writeClients(clients);
},{
  retry:(error,metadata)=>{
    console.error('Reminder worker error',error);
    if((metadata?.deliveryCount||0)>=8) return {acknowledge:true};
    return {afterSeconds:60};
  }
});
