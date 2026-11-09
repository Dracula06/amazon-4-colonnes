export const MARKETPLACES=Object.freeze({'amazon.fr':'FR','amazon.es':'ES','amazon.it':'IT','amazon.co.uk':'UK','amazon.de':'DE'});
export function marketplaceOf(value){try{const u=new URL(value);if(u.protocol!=='https:')return null;const host=u.hostname.replace(/^www\./,'');return Object.hasOwn(MARKETPLACES,host)?{host,country:MARKETPLACES[host]}:null;}catch{return null;}}
