export async function publishWithRetry(request,files,message,{sleep=ms=>new Promise(r=>setTimeout(r,ms)),attempts=3}={}){
 for(let attempt=0;attempt<attempts;attempt++){
  const ref=await request('/git/ref/heads/main');const base=ref.object.sha;
  const parent=await request('/git/commits/'+base);
  const tree=await request('/git/trees','POST',{base_tree:parent.tree.sha,tree:files.map(f=>({path:f.path,mode:'100644',type:'blob',content:f.content}))});
  const commit=await request('/git/commits','POST',{message,tree:tree.sha,parents:[base]});
  try{await request('/git/refs/heads/main','PATCH',{sha:commit.sha,force:false});return commit.sha;}
  catch(error){
   let current;try{current=await request('/git/ref/heads/main');}catch{throw error;}
   const head=current.object.sha;
   if(head===commit.sha)return commit.sha;
   if(head!==base){
    try{const cmp=await request('/compare/'+commit.sha+'...'+head);if(cmp.status==='ahead'||cmp.status==='identical')return commit.sha;}catch{}
    if([409,422].includes(error.status)&&attempt+1<attempts){await sleep(250*(attempt+1));continue;}
   }
   throw error;
  }
 }
 throw Error('Publication non confirmee');
}
