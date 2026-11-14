import test from 'node:test';
import assert from 'node:assert/strict';
import { stripInlineHandlers } from '../src/library/sanitize-dom.js';

test('stripInlineHandlers neutralise les inline event handlers pour eviter la violation CSP', () => {
  const dirty = '<!doctype html><html><body onload="init()"><img src="x.jpg" onerror="alert(1)"><div onclick="handleClick()">Test</div></body></html>';
  const cleaned = stripInlineHandlers(dirty);

  // Les attributs onload/onerror/onclick ne doivent plus exister sous forme d event handler
  assert.equal(/(\s+)onload\s*=/i.test(cleaned), false, 'onload doit etre neutralise');
  assert.equal(/(\s+)onerror\s*=/i.test(cleaned), false, 'onerror doit etre neutralise');
  assert.equal(/(\s+)onclick\s*=/i.test(cleaned), false, 'onclick doit etre neutralise');

  assert.ok(cleaned.includes('data-blocked-on-load="init()"'));
  assert.ok(cleaned.includes('data-blocked-on-error="alert(1)"'));
  assert.ok(cleaned.includes('data-blocked-on-click="handleClick()"'));
});
