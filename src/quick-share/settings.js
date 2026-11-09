import {readConfig,saveConfig,clearConfig} from './config.js';
import {allowGitHub} from '../library/github.js';
const $=id=>document.getElementById(id);
async function refresh(){const cfg=await readConfig();const last=(await chrome.storage.local.get('quickShareLastResult')).quickShareLastResult;$('status').textContent=(cfg?.consent&&cfg.token?'Partage configuré. Retournez sur une page Amazon et cliquez sur l’icône.':'Partage non configuré.')+(last?'\nDernier envoi : '+last.path:'');}
$('save').onclick=async()=>{try{if(!$('consent').checked)throw Error('Cochez le consentement au partage rapide.');const token=$('token').value.trim();if(!token)throw Error('Saisissez un jeton.');if(!await allowGitHub())throw Error('Permission GitHub refusée.');await saveConfig(token);$('token').value='';await refresh();}catch(e){$('status').textContent=e.message;}};
$('forget').onclick=async()=>{await clearConfig();$('token').value='';$('consent').checked=false;await refresh();};
refresh();
