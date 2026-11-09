import {SENSITIVE,MARK,safeText,safeURL,captureAllowed} from './privacy-policy.js';
export function sanitizeCapture(raw,context,notes){
 if(!captureAllowed(raw.metadata?.url||''))throw Error('Capture de compte, paiement ou domaine non autorisée');
 const doc=new DOMParser().parseFromString(raw.html,'text/html');
 const counts={metaValues:0,scriptBodies:0,attributes:0,formFields:0,personalRegions:0,comments:0};
 const safeMeta=/^(?:title|description|viewport|robots|keywords|theme-color|og:(?:title|description|type|site_name|image|url)|twitter:(?:card|title|description|image))$/i;
 for(const el of doc.querySelectorAll('meta')){
  if(el.hasAttribute('charset'))continue;
  const label=el.getAttribute('name')||el.getAttribute('property')||el.getAttribute('http-equiv')||'';
  if(!safeMeta.test(label)||SENSITIVE.test(label)){el.setAttribute('content',MARK);counts.metaValues++;}
 }
 for(const el of doc.querySelectorAll('script')){el.textContent='';counts.scriptBodies++;}
 for(const el of doc.querySelectorAll('#nav-tools,#nav-global-location-slot,#glow-ingress-block,#contextualIngressPt,#deliveryBlockMessage,#deliveryBlockMessage_feature_div,.a-profile-content')){el.replaceChildren(doc.createTextNode(MARK));counts.personalRegions++;}
 for(const el of doc.querySelectorAll('*')){
  for(const a of [...el.attributes]){
   if(SENSITIVE.test(a.name)||/^on/i.test(a.name)||a.name==='srcdoc'||a.name==='srcset'||/^data-a-(?:modal|popover|state|dynamic-image)$/.test(a.name)){el.setAttribute(a.name,MARK);counts.attributes++;}
   else if(/^(?:href|src|action|poster|data-src|data-url)$/.test(a.name)){el.setAttribute(a.name,safeURL(a.value,raw.metadata.url));}
   else if(a.name==='style'){el.setAttribute(a.name,safeText(a.value.replace(/url\([^)]*\)/gi,'url("[RETIRE]")')));}
   else if((a.name.startsWith('data-')&&(/[\{\[]/.test(a.value)||a.value.length>400))||(/^[A-Za-z0-9_+\/=.-]{100,}$/.test(a.value))){el.setAttribute(a.name,MARK);counts.attributes++;}
   else {el.setAttribute(a.name,safeText(a.value));}
  }
  if(el.matches('input,textarea,select,option')){for(const a of ['value','checked','selected'])el.removeAttribute(a);if(el.matches('textarea,option'))el.textContent=MARK;counts.formFields++;}
 }
 const walker=doc.createTreeWalker(doc,NodeFilter.SHOW_COMMENT);const comments=[];while(walker.nextNode())comments.push(walker.currentNode);for(const n of comments){n.remove();counts.comments++;}
 const texts=doc.createTreeWalker(doc,NodeFilter.SHOW_TEXT);while(texts.nextNode())texts.currentNode.nodeValue=safeText(texts.currentNode.nodeValue);
 const resourceURL=x=>safeURL(x,raw.metadata.url);
 const resources=raw.resources||{};
 return {schemaVersion:2,metadata:{capturedAt:raw.metadata.capturedAt,asin:raw.metadata.asin,url:resourceURL(raw.metadata.url),viewport:raw.metadata.viewport,extensionLayoutPresent:!!raw.metadata.extensionLayoutPresent,language:safeText(raw.metadata.language||''),limitations:raw.metadata.limitations||[],declaredContext:context},extensionVersion:raw.extensionVersion,notes:safeText(notes),html:'<!doctype html>\n'+doc.documentElement.outerHTML,resources:{scripts:(resources.scripts||[]).map(x=>({src:x.src?resourceURL(x.src):'',type:safeText(x.type),inline:!!x.inline})),stylesheets:(resources.stylesheets||[]).map(resourceURL),frames:(resources.frames||[]).map(x=>({src:resourceURL(x.src)})),images:(resources.images||[]).map(x=>({src:resourceURL(x.src)}))},diagnostic:{logistics:raw.diagnostic?.logistics?{kind:raw.diagnostic.logistics.kind,code:raw.diagnostic.logistics.code}:null},sanitization:{version:2,counts,guarantee:'Filtre heuristique : confidentialité non garantie sur tout HTML inconnu.',losses:['Valeurs meta non publiques masquées avant traitement des attributs','Scripts, valeurs de formulaires, commentaires et zones personnelles masqués','URL sans paramètres ni fragments externes ; profils et longues valeurs opaques masqués','Notes et texte libre : emails et formats de jetons GitHub masqués ; adresses et noms résiduels possibles']}};
}
