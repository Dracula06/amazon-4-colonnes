import assert from 'node:assert/strict';
import {packageCapture,bytes,MAX_BYTES} from '../src/library/package.js';
import {captureAllowed,safeURL,safeText} from '../src/library/privacy-policy.js';
let n=0;
for(const html of ['', 'a'.repeat(950000),'€é😀\\"\n'.repeat(60000)]){const r={metadata:{asin:'B0HFZH1Z9G'},html};const f=packageCapture(r);assert(f.every(x=>bytes(x.content)<=MAX_BYTES));const copy=f.length===1?JSON.parse(f[0].content):JSON.parse(f.slice(0,-1).map(x=>JSON.parse(x.content).data).join(''));assert.deepEqual(copy,r);n++;}
for(const host of ['fr','es','it','co.uk','de']){assert(captureAllowed('https://www.amazon.'+host+'/dp/B0HFZH1Z9G'));n++;}
for(const path of ['/ap/signin','/gp/css/homepage.html','/checkout','/cart','/your-orders']){assert(!captureAllowed('https://www.amazon.fr'+path));n++;}
assert(!captureAllowed('https://www.amazon.fr.evil.test/dp/X'));n++;
assert.equal(safeURL('https://www.amazon.fr/dp/X?token=secret#personal'),'https://www.amazon.fr/dp/X');n++;
assert(!safeURL('https://www.amazon.fr/gp/profile/amzn1.account.EXAMPLE').includes('amzn1.account'));n++;
assert(!safeText('user@example.test').includes('@'));n++;
console.log(n+' tests package/politique OK');
