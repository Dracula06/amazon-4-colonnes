import assert from 'node:assert/strict';
import {packageCapture,MAX_BYTES,bytes} from '../src/library/package.js';
for(const html of ['', 'x'.repeat(950000), '€é😀\\"\n'.repeat(180000)]){
 const input={metadata:{asin:'B0FPMKDXS8',marketplace:'DE'},html};const files=packageCapture(input);
 assert(files.every(f=>bytes(f.content)<=MAX_BYTES));files.forEach(f=>JSON.parse(f.content));
 const restored=files.length===1?JSON.parse(files[0].content):JSON.parse(files.slice(0,-1).map(f=>JSON.parse(f.content).data).join(''));
 assert.deepEqual(restored,input);
}
console.log('3 scénarios de taille et reconstitution OK');
