import {MARKETPLACES} from './marketplaces.js';
export async function capturePage(tabId){
  const [result]=await chrome.scripting.executeScript({target:{tabId},args:[MARKETPLACES],func:(marketplaces)=>{
    const host=location.hostname.replace(/^www\./,'');
    if(location.protocol!=='https:'||!Object.prototype.hasOwnProperty.call(marketplaces,host))throw Error('Page hors Amazon FR, ES, IT, UK ou DE');
    const live=[...document.querySelectorAll('input,textarea,select')].map(e=>({tag:e.tagName,id:e.id,name:e.getAttribute('name'),type:e.getAttribute('type'),value:e.value,checked:e.checked,selectedIndex:e.selectedIndex}));
    return {html:'<!doctype html>\n'+document.documentElement.outerHTML,liveFormState:live,metadata:{capturedAt:new Date().toISOString(),url:location.href,canonical:document.querySelector('link[rel="canonical"]')?.href||null,marketplace:marketplaces[host],hostname:host,language:document.documentElement.lang,asin:location.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i)?.[1]||null,viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio,scrollX,scrollY},extensionLayoutPresent:!!document.querySelector('#ppd.al-layout,#ppd.ald-layout'),limitations:['DOM courant uniquement; HTML initial non capturé','Pas de contenu interne des iframes, shadow roots, canvas ou ressources téléchargées','La mise en page peut déjà être modifiée par des extensions','Badges et disposition automatiques non validés hors FR']},resources:{scripts:[...document.scripts].map(e=>({src:e.src,type:e.type,inline:!e.src})),stylesheets:[...document.querySelectorAll('link[rel="stylesheet"]')].map(e=>e.href),frames:[...document.querySelectorAll('iframe')].map(e=>({src:e.src,title:e.title})),images:[...document.images].map(e=>({src:e.currentSrc||e.src}))}};
  }});
  if(!result?.result)throw Error('Capture vide');
  let diagnostic;try{diagnostic=await chrome.tabs.sendMessage(tabId,{action:'status'});}catch{diagnostic={available:false,reason:'Aucun diagnostic de disposition disponible sur cet onglet'};}
  return {schemaVersion:1,...result.result,diagnostic,extensionVersion:chrome.runtime.getManifest().version};
}
