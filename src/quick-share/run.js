import {capturePage} from '../library/capture.js';
import {sanitizeCapture} from '../library/sanitize.js';
import {uploadCapture} from '../library/github.js';
import {readConfig} from './config.js';
const tabId=Number(new URL(location.href).searchParams.get('tab'));
const status=document.getElementById('status');
async function showError(message){status.textContent=message;try{await chrome.action.setBadgeText({text:'!',tabId});await chrome.action.setBadgeBackgroundColor({color:'#b3261e',tabId});}catch{}const current=await chrome.tabs.getCurrent();if(current)await chrome.tabs.update(current.id,{active:true});}
async function run(){
 let locked=false;
 try{
  const config=await readConfig();
  if(!config?.token||!config.consent){await showError('Configuration initiale nécessaire : ouvrez Réglages du partage. Une fois configuré, retournez sur Amazon et cliquez sur l’icône.');return;}
  if(!await chrome.permissions.contains({origins:['https://api.github.com/*']})){await showError('Autorisation GitHub manquante : ouvrez les réglages.');return;}
  await navigator.locks.request('amazon-quick-share-'+tabId,{ifAvailable:true},async lock=>{
   if(!lock){const current=await chrome.tabs.getCurrent();if(current)await chrome.tabs.remove(current.id);return;}
   locked=true;
   const raw=await capturePage(tabId);
   const report=sanitizeCapture(raw,'unknown','Capture par partage rapide : contexte connecté/déconnecté non déclaré.');
   status.textContent='Envoi sur GitHub…';
   const result=await uploadCapture(report,config.token);
   await chrome.storage.local.set({quickShareLastResult:{at:new Date().toISOString(),path:result.path,url:result.url||null}});
   try{await chrome.action.setBadgeText({text:'OK',tabId});await chrome.action.setBadgeBackgroundColor({color:'#137333',tabId});}catch{}
   status.textContent='Page enregistrée : '+result.path;
   const current=await chrome.tabs.getCurrent();if(current)await chrome.tabs.remove(current.id);
  });
 }catch(e){await showError('Échec du partage : '+e.message);}
}
run();
