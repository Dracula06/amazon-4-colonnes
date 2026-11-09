export function sanitizeCapture(raw,context,notes) {
  const doc=new DOMParser().parseFromString(raw.html,'text/html');
  const counts={scriptBodies:0,attributes:0,formFields:0,personalRegions:0};
  const sensitive=/token|csrf|session|customer|address|password|authorization|cookie|offering|nonce|email|phone|payment|credit|a-state|aapi/i;
  const stripURL=value=>{try{const u=new URL(value,'https://www.amazon.fr');if(!/^https?:$/.test(u.protocol))return '[URL RETIRÉE]';u.search='';u.hash='';u.username='';u.password='';return u.href;}catch{return '[URL RETIRÉE]';}};
  for(const el of doc.querySelectorAll('script')){if(el.textContent){el.textContent='/* contenu de script conservé uniquement dans le brut local */';counts.scriptBodies++;}}
  for(const el of doc.querySelectorAll('#nav-tools,#nav-global-location-slot,#glow-ingress-block,#contextualIngressPt,#deliveryBlockMessage,#deliveryBlockMessage_feature_div')){el.replaceChildren(doc.createTextNode('[ZONE PERSONNELLE MASQUÉE]'));counts.personalRegions++;}
  for(const el of doc.querySelectorAll('*')){
    for(const a of [...el.attributes]){
      if(sensitive.test(a.name)||/^on/i.test(a.name)||a.name==='srcdoc'||a.name==='data-a-dynamic-image'||a.name==='data-a-modal'||a.name==='data-a-popover'||a.name==='data-a-state') {el.setAttribute(a.name,'[RETIRÉ]');counts.attributes++;}
      else if(['href','src','action','poster'].includes(a.name)){el.setAttribute(a.name,stripURL(a.value));}
      else if(a.name==='srcset'){el.setAttribute(a.name,'[VOIR BRUT LOCAL]');counts.attributes++;}
      else if(a.name.startsWith('data-')&&(/[\{\[]/.test(a.value)||a.value.length>400)){el.setAttribute(a.name,'[DONNÉE STRUCTURÉE : VOIR BRUT LOCAL]');counts.attributes++;}
      else if(sensitive.test(a.value)&&a.name!=='class'&&a.name!=='id'){el.setAttribute(a.name,'[RETIRÉ]');counts.attributes++;}
    }
    if(el.matches('input,textarea,select,option')) {el.removeAttribute('value');el.removeAttribute('checked');el.removeAttribute('selected');if(el.matches('textarea,option'))el.textContent='[VALEUR RETIRÉE]';counts.formFields++;}
  }
  return {schemaVersion:1,metadata:{capturedAt:raw.metadata.capturedAt,asin:raw.metadata.asin,url:stripURL(raw.metadata.url),viewport:raw.metadata.viewport,extensionLayoutPresent:raw.metadata.extensionLayoutPresent,limitations:raw.metadata.limitations,declaredContext:context},extensionVersion:raw.extensionVersion,notes,html:'<!doctype html>\n'+doc.documentElement.outerHTML,resources:{scripts:raw.resources.scripts.map(x=>({...x,src:x.src?stripURL(x.src):''})),stylesheets:raw.resources.stylesheets.map(stripURL),frames:raw.resources.frames.map(x=>({src:stripURL(x.src)})),images:raw.resources.images.map(x=>({src:stripURL(x.src)}))},diagnostic:{state:raw.diagnostic?.state||null,logistics:raw.diagnostic?.logistics?{kind:raw.diagnostic.logistics.kind,code:raw.diagnostic.logistics.code}:null},sanitization:{version:1,counts,guarantee:'Filtrage heuristique, pas une anonymisation garantie. Notes et texte libre à relire.',losses:['Scripts intégrés et valeurs de formulaires exclus de la copie GitHub','Certaines données structurées et zones personnelles remplacées; attributs structurels conservés autant que possible','URL sans paramètres ni fragments; inventaire des ressources, pas leur contenu']}};
}
