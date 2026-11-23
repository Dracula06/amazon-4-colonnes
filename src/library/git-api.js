const ROOT='https://api.github.com/repos/Dracula06/amazon-dom-captures';
export function createGitRequest(token){return async function request(path,method='GET',body){
 const res=await fetch(ROOT+path,{method,cache:'no-store',redirect:'error',signal:AbortSignal.timeout(45000),headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'},...(body?{body:JSON.stringify(body)}:{})});
 const data=await res.json().catch(()=>({}));
 if(!res.ok){const detail=String(data.message||res.statusText||'Erreur GitHub').replace(/github_pat_[\w]+|gh[pousr]_[\w]+/g,'[RETIRE]').slice(0,300);const error=Error('GitHub HTTP '+res.status+' '+method+' '+path+' : '+detail);error.status=res.status;error.path=path;error.requestId=res.headers.get('x-github-request-id');throw error;}
 return data;
};}
