export function compactCapture(report){
 const doc=new DOMParser().parseFromString(report.html,'text/html');
 const counts={styles:0,scripts:0,comments:0,svgBodies:0,attributes:0};
 const inventory={styles:[],scripts:[],svg:[]};
 for(const el of [...doc.querySelectorAll('style')]){inventory.styles.push({id:el.id||null,media:el.getAttribute('media'),characters:el.textContent.length});const marker=doc.createElement('template');marker.setAttribute('data-capture-omitted','style');el.replaceWith(marker);counts.styles++;}
 for(const el of [...doc.querySelectorAll('script')]){inventory.scripts.push({id:el.id||null,type:el.type||null,src:el.getAttribute('src')||null});const marker=doc.createElement('template');marker.setAttribute('data-capture-omitted','script');el.replaceWith(marker);counts.scripts++;}
 const walker=doc.createTreeWalker(doc,NodeFilter.SHOW_COMMENT);const comments=[];while(walker.nextNode())comments.push(walker.currentNode);for(const node of comments){node.remove();counts.comments++;}
 for(const el of doc.querySelectorAll('svg')){inventory.svg.push({id:el.id||null,label:el.getAttribute('aria-label'),title:el.querySelector('title')?.textContent||null});const titles=[...el.querySelectorAll('title,desc')].map(n=>n.cloneNode(true));el.replaceChildren(...titles);el.setAttribute('data-capture-omitted','svg-geometry');counts.svgBodies++;}
 for(const el of doc.querySelectorAll('*'))for(const a of [...el.attributes]){
  if(a.name==='data-csa-c-id'||(a.name.startsWith('data-')&&['[RETIRÉ]','[DONNÉE STRUCTURÉE : VOIR BRUT LOCAL]'].includes(a.value))){el.removeAttribute(a.name);counts.attributes++;}
 }
 const texts=doc.createTreeWalker(doc.body,NodeFilter.SHOW_TEXT);const nodes=[];while(texts.nextNode())nodes.push(texts.currentNode);for(const node of nodes){if(!node.parentElement.closest('pre,code,textarea'))node.nodeValue=node.nodeValue.replace(/[\t\r\n ]+/g,' ');}
 const bytes=s=>new TextEncoder().encode(s).length;
 return {...report,html:'<!doctype html>\n'+doc.documentElement.outerHTML,compaction:{version:1,inputHtmlBytes:bytes(report.html),counts,inventory,losses:['Corps des styles intégrés omis ; styles inline des éléments conservés','Scripts remplacés par marqueurs ; sources et types inventoriés','Commentaires et identifiants data-csa-c-id retirés','Géométrie SVG retirée ; titre et description conservés','Espaces de formatage réduits hors pre/code/textarea','Les marqueurs template ne reconstituent pas la structure interne des scripts/styles/SVG ; pas de fidélité visuelle garantie']}};
}
