import {marketplaceOf} from './marketplaces.js';
import {compactCapture} from './compact.js';
import {packageCapture,bytes,MAX_BYTES} from './package.js';
import {publishFiles} from './git-transport.js';
export async function allowGitHub(){return chrome.permissions.request({origins:['https://api.github.com/*']});}
export async function uploadCapture(report,token){
 if(!token.trim())throw Error('Jeton GitHub requis');
 const market=marketplaceOf(report.metadata?.url||'');if(!market)throw Error('URL de marketplace non reconnue');
 const enriched={...report,metadata:{...report.metadata,marketplace:market.country,hostname:market.host}};
 const compact=compactCapture(enriched);
 const chunks=packageCapture(compact);
 const id=report.metadata?.asin&&/^[A-Z0-9]{10}$/.test(report.metadata.asin)?report.metadata.asin:'page';
 const stamp=new Date().toISOString().replace(/[:.]/g,'-');
 const folder='bibliotheque-pages/'+market.country+'/'+id+'/'+stamp+'-'+crypto.randomUUID();
 const files=chunks.map(f=>({path:folder+'/'+f.name,content:f.content}));
 if(files.some(f=>bytes(f.content)>MAX_BYTES))throw Error('Plafond de taille dépassé : aucun envoi');
 if(files.reduce((n,f)=>n+bytes(f.content),0)>8*1024*1024)throw Error('Capture totale > 8 Mio : export local requis');
 const sha=await publishFiles(token.trim(),files,'docs: capture compacte '+market.country+' '+id);
 const path=folder+'/'+chunks[chunks.length-1].name;
 return {path,url:'https://github.com/Dracula06/amazon-4-colonnes/blob/'+sha+'/'+path,files:files.length};
}
