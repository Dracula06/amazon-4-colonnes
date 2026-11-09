const KEY='quickShareConfig';
export async function readConfig(){const x=await chrome.storage.local.get(KEY);return x[KEY]||null;}
export async function saveConfig(token){
 await chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});
 await chrome.storage.local.set({[KEY]:{token:token.trim(),consent:true,consentedAt:new Date().toISOString(),destination:'Dracula06/amazon-4-colonnes/main'}});
}
export async function clearConfig(){await chrome.storage.local.remove(KEY);}
