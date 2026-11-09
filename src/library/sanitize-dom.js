import {SENSITIVE,MARK,safeText,safeURL} from './privacy-policy.js';
import {cleanStructured} from './structured-data.js';
export function sanitizeHTML(html,base){
 const counts={metaValues:0,scripts:0,attributes:0,personalRegions:0,classTokens:0,structuredAttributes:0,embeddedHTML:0,depthLimits:0};
 const parse=s=>new DOMParser().parseFromString(s,'text/html');
 const decode=s=>{if(!/&(?:lt|gt|quot|amp|#\d+);/.test(s))return s;const t=document.createElement('textarea');t.innerHTML=s;return t.value;};
 function cleanDoc(source,depth){
  if(depth>3||source.length>4000000){counts.depthLimits++;return MARK;}
  const doc=parse(source);cleanRoot(doc,depth);return '<!doctype html>\n'+doc.documentElement.outerHTML;
 }
 function cleanRoot(root,depth){
  if(depth>3){root.replaceChildren(root.ownerDocument.createTextNode(MARK));counts.depthLimits++;return;}
  for(const el of root.querySelectorAll('meta')){if(el.hasAttribute('charset'))continue;const name=el.getAttribute('name')||el.getAttribute('property')||'';if(!/^(title|description|viewport|robots|keywords|theme-color|og:(title|description|type|site_name|image|url)|twitter:(card|title|description|image))$/i.test(name)||SENSITIVE.test(name)){el.setAttribute('content',MARK);counts.metaValues++;}}
  for(const el of root.querySelectorAll('script')){el.textContent='';counts.scripts++;}
  for(const el of root.querySelectorAll('#nav-tools,#nav-global-location-slot,#glow-ingress-block,#contextualIngressPtLink,#contextualIngressPt,#deliveryBlockMessage,#deliveryBlockMessage_feature_div,.a-profile-content')){el.replaceChildren(el.ownerDocument.createTextNode(MARK));for(const a of ['aria-label','title','data-label'])if(el.hasAttribute(a))el.setAttribute(a,MARK);counts.personalRegions++;}
  for(const el of root.querySelectorAll('*')){
   for(const a of [...el.attributes]){
    let v=a.value;
    if(a.name==='class'){const tokens=v.split(/\s+/).filter(t=>{const secret=/^(address|session|customer|hashed|raw)-[\w-]+$/i.test(t);if(secret)counts.classTokens++;return !secret;});el.setAttribute('class',tokens.join(' '));continue;}
    if((a.name==='aria-label'||a.name==='title')&&/^(livrer à|deliver to|entregar a|lieferung an|consegna a)/i.test(v)){el.setAttribute(a.name,MARK);counts.attributes++;continue;}
    if(SENSITIVE.test(a.name)||/^on/i.test(a.name)||a.name==='srcdoc'||a.name==='srcset'){el.setAttribute(a.name,MARK);counts.attributes++;continue;}
    if(a.name==='style'){el.setAttribute(a.name,safeText(v.replace(/url\([^)]*\)/gi,'url("[RETIRE]")')));continue;}
    if(/^\s*[\[{]/.test(v)){
     try{const parsed=JSON.parse(v);const cleaned=cleanStructured(parsed,{base,cleanHTML:s=>{counts.embeddedHTML++;return cleanDoc(decode(s),depth+1);}});el.setAttribute(a.name,JSON.stringify(cleaned));counts.structuredAttributes++;continue;}
     catch{el.setAttribute(a.name,MARK);counts.attributes++;continue;}
    }
    if(/^(href|src|action|poster|formaction)$/.test(a.name)||/(?:^|[-_])(?:url|uri|addr|src)$/.test(a.name)||/^https?:\/\//i.test(v)){el.setAttribute(a.name,safeURL(v,base));continue;}
    if(v.length>400||(/^[A-Za-z0-9_+\/=.%:-]{100,}$/.test(v))||/<script|&lt;script/i.test(v)){el.setAttribute(a.name,MARK);counts.attributes++;continue;}
    el.setAttribute(a.name,safeText(v));
   }
   if(el.matches('input,textarea,select,option')){for(const a of ['value','checked','selected'])el.removeAttribute(a);if(el.matches('textarea,option'))el.textContent=MARK;}
   if(el.tagName==='TEMPLATE')cleanRoot(el.content,depth+1);
  }
  const comments=root.ownerDocument.createTreeWalker(root,NodeFilter.SHOW_COMMENT);const remove=[];while(comments.nextNode())remove.push(comments.currentNode);for(const n of remove)n.remove();
  const walker=root.ownerDocument.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(walker.nextNode()){const n=walker.currentNode;n.nodeValue=safeText(n.nodeValue).replace(/\b(offerListingId|sessionId|csrfToken|token)\s*[:=]\s*[^,\s\]}&]+/gi,'$1='+MARK);}
 }
 return {html:cleanDoc(html,0),counts};
}
