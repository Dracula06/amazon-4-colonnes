import {marketplaceOf} from './marketplaces.js';
import {compactCapture} from './compact.js';
import {packageCapture,bytes,MAX_BYTES} from './package.js';
import {publishFiles} from './git-transport.js';
import {sanitizeCapture} from './sanitize.js';
import {analyzeCapture} from './discovery.js';
import {extractProductContext} from './product-context.js';
export async function allowGitHub(){return chrome.permissions.request({origins:['https://api.github.com/*']});}
export async function uploadCapture(report,token){
 if(!token.trim())throw Error('Jeton GitHub requis');const market=marketplaceOf(report.metadata?.url||'');if(!market)throw Error('URL non autorisée');
 const clean=sanitizeCapture(report,report.metadata?.declaredContext||'unknown',report.notes||'');
 const enriched={...clean,metadata:{...clean.metadata,marketplace:market.country,hostname:market.host}};
 const analysis={...analyzeCapture(enriched),product:extractProductContext(enriched)};
 const chunks=packageCapture({...compactCapture(enriched),analysis});
 const id=/^[A-Z0-9]{10}$/.test(report.metadata?.asin||'')?report.metadata.asin:'page';
 const folder='bibliotheque-pages/'+market.country+'/'+id+'/'+new Date().toISOString().replace(/[:.]/g,'-')+'-'+crypto.randomUUID();
 const files=chunks.map(f=>({path:folder+'/'+f.name,content:f.content}));
 if(files.some(f=>bytes(f.content)>MAX_BYTES)||files.reduce((n,f)=>n+bytes(f.content),0)>8*1024*1024)throw Error('Budget de taille dépassé : aucun envoi');
 const sha=await publishFiles(token.trim(),files,'docs: capture contextualisée '+market.country+' '+id);const path=folder+'/'+chunks.at(-1).name;
 return {path,url:'https://github.com/Dracula06/amazon-4-colonnes/blob/'+sha+'/'+path,files:files.length};
}
