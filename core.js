(()=>{
'use strict';
const clean=s=>String(s||'').replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim();
const shipName=s=>clean(s).replace(/^(?:exp[ée]di[ée]\s+(?:depuis|par)|exp[ée]diteur|ships\s+from)\s*:?\s*/i,'').replace(/[.,;]+$/,'').trim();
const sellerName=s=>clean(s).replace(/^(?:vendu\s+par|sold\s+by)\s*:?\s*/i,'').replace(/[.,;]+$/,'').trim();
const amazon=s=>/^amazon(?:\.(?:fr|de|it|es|co\.uk|com)|\s+fulfillment|\s+eu(?:\s+.*)?)?$/i.test(clean(s));
const direct=s=>amazon(s)||/^amazon\s+(?:seconde\s+main|warehouse|resale)(?:\s+deals)?$/i.test(clean(s));
function combined(s){s=clean(s);let m=s.match(/^(?:exp[ée]di[ée]\s+et\s+vendu|vendu\s+et\s+exp[ée]di[ée])\s+par\s+(.+?)[.;]?$/i);if(m)return {ship:shipName(m[1]),seller:sellerName(m[1])};
m=s.match(/^vendu\s+par\s+(.+?)\s+et\s+exp[ée]di[ée]\s+(?:par|depuis)\s+(.+?)[.;]?$/i);if(m)return {seller:sellerName(m[1]),ship:shipName(m[2])};
m=s.match(/^exp[ée]di[ée]\s+(?:par|depuis)\s+(.+?)\s+et\s+vendu\s+par\s+(.+?)[.;]?$/i);if(m)return {ship:shipName(m[1]),seller:sellerName(m[2])};return null;}
function classify(rawShip,rawSeller){
let ship=shipName(rawShip),seller=sellerName(rawSeller);const a=combined(rawSeller),b=combined(rawShip),pair=a||b;
let conflict=false;
if(pair){if(ship&& !combined(rawShip)&&ship.toLocaleLowerCase()!==pair.ship.toLocaleLowerCase())conflict=true;ship=pair.ship;seller=pair.seller;}
let kind='unknown',code='À VÉRIFIER',label='Expéditeur non identifié';
if(conflict){label='Informations d’expédition contradictoires';}
else if(amazon(ship)){if(direct(seller)){kind='amazon';code='AMAZON';label=/seconde\s+main|warehouse|resale/i.test(seller)?'Amazon Seconde main · expédié par Amazon':'Vendu et expédié par Amazon'}else{kind='fba';code='FBA';label='Expédié par Amazon'}}
else if(ship&&seller&&!/^(?:voir|choisir|s[ée]lection|indisponible|non identifi)/i.test(ship)){kind='fbm';code='FBM';label='Expédié hors Amazon'}
return {kind,code,label,ship,seller};}
globalThis.ALCore={clean,shipName,sellerName,classify,combined,version:'0.3.1-core'};
})();