import {SENSITIVE,MARK,safeText,safeURL} from './privacy-policy.js';
export function cleanStructured(value,{base='https://www.amazon.fr',cleanHTML=()=>MARK,maxDepth=6}={},depth=0){
 if(depth>maxDepth)return MARK;
 if(Array.isArray(value))return value.map(v=>cleanStructured(v,{base,cleanHTML,maxDepth},depth+1));
 if(value&&typeof value==='object'){const out={};for(const [k,v] of Object.entries(value)){if(SENSITIVE.test(k)||/offerlisting|impression|bidid|requestid|clickurl|pixel|tracking|deviceid/i.test(k))out[k]=MARK;else if(/htmlcontent|srcdoc|htmlencoded/i.test(k))out[k]=typeof v==='string'?cleanHTML(v):MARK;else out[k]=cleanStructured(v,{base,cleanHTML,maxDepth},depth+1);}return out;}
 if(typeof value!=='string')return value;
 if(/^\s*(?:https?:|\/\/)/i.test(value))return safeURL(value,base);
 if(value.length>100&&/^[A-Za-z0-9_+\/=.%:-]+$/.test(value))return MARK;
 return safeText(value);
}
