const ROOT='https://api.github.com/repos/Dracula06/amazon-4-colonnes';
export async function allowGitHub(){return chrome.permissions.request({origins:['https://api.github.com/*']});}
function b64(text){const bytes=new TextEncoder().encode(text);let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s);}
export async function uploadCapture(report,token){
  if(!token.trim())throw Error('Jeton GitHub requis');
  const content=JSON.stringify(report,null,2);
  if(new TextEncoder().encode(content).length>8*1024*1024)throw Error('Copie > 8 Mio : utilisez export local, aucun envoi effectué.');
  const id=report.metadata?.asin&&/^[A-Z0-9]{10}$/.test(report.metadata.asin)?report.metadata.asin:'page';
  const stamp=new Date().toISOString().replace(/[:.]/g,'-');
  const path='bibliotheque-pages/'+id+'/'+stamp+'-'+crypto.randomUUID()+'.json';
  const res=await fetch(ROOT+'/contents/'+path,{method:'PUT',redirect:'error',headers:{'Authorization':'Bearer '+token.trim(),'Accept':'application/vnd.github+json','Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'},body:JSON.stringify({message:'docs: capture de page '+id,content:b64(content),branch:'main'})});
  if(!res.ok){throw Error('GitHub HTTP '+res.status+'. Vérifiez le jeton, Contents: Read and write, et la branche main. En cas de coupure réseau, vérifiez le dépôt avant de réessayer.');}
  const result=await res.json();return {path,url:result.content?.html_url};
}
