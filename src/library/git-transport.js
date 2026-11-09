import {createGitRequest} from './git-api.js';
import {publishWithRetry} from './publish-retry.js';
export async function publishFiles(token,files,message){
 const run=()=>publishWithRetry(createGitRequest(token),files,message);
 if(globalThis.navigator?.locks)return navigator.locks.request('amazon-4-colonnes-github-main',{mode:'exclusive'},run);
 return run();
}
