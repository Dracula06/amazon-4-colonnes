const ROOT='https://api.github.com/repos/Dracula06/amazon-4-colonnes';
async function request(token,path,method='GET',body){
 const res=await fetch(ROOT+path,{method,redirect:'error',headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'},...(body?{body:JSON.stringify(body)}:{})});
 if(!res.ok)throw Error('GitHub HTTP '+res.status+' ('+path+'). Vérifiez les droits Contents Read and write. En cas de conflit ou coupure, vérifiez le dépôt avant de réessayer.');
 return res.json();
}
export async function publishFiles(token,files,message){
 const ref=await request(token,'/git/ref/heads/main');
 const parent=await request(token,'/git/commits/'+ref.object.sha);
 const tree=await request(token,'/git/trees','POST',{base_tree:parent.tree.sha,tree:files.map(f=>({path:f.path,mode:'100644',type:'blob',content:f.content}))});
 const commit=await request(token,'/git/commits','POST',{message,tree:tree.sha,parents:[ref.object.sha]});
 await request(token,'/git/refs/heads/main','PATCH',{sha:commit.sha,force:false});
 return commit.sha;
}
