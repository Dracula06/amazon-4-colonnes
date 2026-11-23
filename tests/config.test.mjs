import test from 'node:test';
import assert from 'node:assert/strict';
import { exportAllConfig, importAllConfig } from '../src/quick-share/config.js';

// Mock chrome.storage.local
const storage = new Map();
globalThis.chrome = {
  storage: {
    local: {
      get: async (keys) => {
        if (typeof keys === 'string') {
          return { [keys]: storage.get(keys) };
        }
        const out = {};
        for (const k of keys) {
          out[k] = storage.get(k);
        }
        return out;
      },
      set: async (obj) => {
        for (const [k, v] of Object.entries(obj)) {
          storage.set(k, v);
        }
      },
      remove: async (key) => {
        storage.delete(key);
      },
      setAccessLevel: async () => {}
    }
  }
};

test('exportAllConfig et importAllConfig exportent et réimportent fidèlement la configuration', async () => {
  storage.clear();

  const sampleConfig = {
    github: { token: 'ghp_sample123456789' },
    discord: { webhookUrl: 'https://discord.com/api/webhooks/test/123' },
    telegram: {
      botToken: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ',
      chatId: '-1001234567890',
      webhookUrl: ''
    },
    display: { minWidth: 1400 },
    affiliateTags: { FR: 'dracoule-21', DE: 'dracoule-de-21' }
  };

  await importAllConfig(sampleConfig);

  const exported = await exportAllConfig();

  assert.equal(exported.version, 1);
  assert.ok(exported.exportedAt);
  assert.equal(exported.github.token, 'ghp_sample123456789');
  assert.equal(exported.discord.webhookUrl, 'https://discord.com/api/webhooks/test/123');
  assert.equal(exported.telegram.botToken, '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ');
  assert.equal(exported.telegram.chatId, '-1001234567890');
  assert.equal(exported.display.minWidth, 1400);
  assert.equal(exported.affiliateTags.FR, 'dracoule-21');
  assert.equal(exported.affiliateTags.DE, 'dracoule-de-21');
});
