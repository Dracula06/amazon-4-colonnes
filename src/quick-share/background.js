import {marketplaceOf} from '../library/marketplaces.js';
const busy=new Set();
chrome.action.onClicked.addListener(async tab=>{
 if(!tab.id||!marketplaceOf(tab.url||'')){await chrome.action.setBadgeText({text:'!',tabId:tab.id});return;}
 if(busy.has(tab.id))return;
 busy.add(tab.id);
 try{
  await chrome.action.setBadgeText({text:'…',tabId:tab.id});
  await chrome.tabs.create({url:chrome.runtime.getURL('quick-share.html')+'?tab='+tab.id,active:false});
 }catch{await chrome.action.setBadgeText({text:'!',tabId:tab.id});}
 finally{setTimeout(()=>busy.delete(tab.id),3000);}
});
