import {MARKETPLACES} from './marketplaces.js';
import {captureAllowed} from './privacy-policy.js';
export async function capturePage(tabId){
 const tab=await chrome.tabs.get(tabId);if(!captureAllowed(tab.url||''))throw Error('Capture bloquée : page personnelle, paiement ou domaine non autorisé');
 const [result]=await chrome.scripting.executeScript({target:{tabId},args:[MARKETPLACES],func:marketplaces=>{
  const host=location.hostname.replace(/^www\./,'');if(!Object.hasOwn(marketplaces,host))throw Error('Domaine non autorisé');
  if(/(?:^|\/)(?:ap|checkout|cart|your-account|your-orders|order-history|payments?|signin|sign-in)(?:\/|$)|\/gp\/(?:buy|css|your-account)|\/hz\/(?:mycd|contact-us)/i.test(location.pathname))throw Error('Page personnelle refusée');
  return {html:'<!doctype html>\n'+document.documentElement.outerHTML,metadata:{capturedAt:new Date().toISOString(),url:location.href,asin:location.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i)?.[1]||null,marketplace:marketplaces[host],hostname:host,language:document.documentElement.lang,viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio,scrollX,scrollY},extensionLayoutPresent:!!document.querySelector('#ppd.al-layout,#ppd.ald-layout'),limitations:['DOM courant, pas le HTML initial','Pas de valeurs vivantes de formulaires collectées séparément','Pas de shadow roots, contenu des iframes, canvas ou ressources externes','DOM potentiellement modifié par nos extensions et les autres']},resources:{scripts:[...document.scripts].map(e=>({src:e.src,type:e.type,inline:!e.src})),stylesheets:[...document.querySelectorAll('link[rel="stylesheet"]')].map(e=>e.href),frames:[...document.querySelectorAll('iframe')].map(e=>({src:e.src})),images:[...document.images].map(e=>({src:e.currentSrc||e.src}))}};
 }});
 if(!result?.result)throw Error('Capture vide');let diagnostic;try{diagnostic=await chrome.tabs.sendMessage(tabId,{action:'status'});}catch{diagnostic={available:false};}
 return {schemaVersion:2,...result.result,diagnostic,extensionVersion:chrome.runtime.getManifest().version};
}
