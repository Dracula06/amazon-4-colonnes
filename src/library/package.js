export const MAX_BYTES=18000;
export const bytes=s=>new TextEncoder().encode(s).length;
export function packageCapture(report){
 const payload=JSON.stringify(report);
 if(bytes(payload)<=MAX_BYTES)return [{name:'capture.json',content:payload}];
 const parts=[];let start=0;
 while(start<payload.length){let lo=1,hi=Math.min(payload.length-start,MAX_BYTES),best=0;
 const encode=n=>JSON.stringify({format:'amazon-capture-part-v1',part:parts.length+1,data:payload.slice(start,start+n)});
 while(lo<=hi){const n=Math.floor((lo+hi)/2);if(bytes(encode(n))<=MAX_BYTES){best=n;lo=n+1}else hi=n-1}
 if(best&&start+best<payload.length){const c=payload.charCodeAt(start+best-1);if(c>=0xD800&&c<=0xDBFF)best--}
 if(!best)throw Error('Decoupage impossible');parts.push({name:'part-'+String(parts.length+1).padStart(4,'0')+'.json',content:encode(best)});start+=best;
 }
 const summary={asin:report.metadata?.asin||null,marketplace:report.metadata?.marketplace||null,extensionLayoutPresent:!!report.metadata?.extensionLayoutPresent,analysis:report.analysis||null};
 const index={format:'amazon-capture-index-v1',encoding:'utf-8',reassembly:'Concatener les champs data des parties dans l ordre puis JSON.parse.',payloadBytes:bytes(payload),summary,parts:parts.map(p=>({name:p.name,bytes:bytes(p.content)}))};
 let content=JSON.stringify(index);if(bytes(content)>MAX_BYTES){index.summary={asin:summary.asin,marketplace:summary.marketplace};content=JSON.stringify(index)}
 if(bytes(content)>MAX_BYTES)throw Error('Index trop volumineux');return [...parts,{name:'index.json',content}];
}
