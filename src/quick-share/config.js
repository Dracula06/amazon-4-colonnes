import { DEFAULT_DISPLAY_SETTINGS } from '../display/components-registry.js';
import { MARKETPLACES } from '../library/marketplaces.js';

const KEY_GITHUB = 'quickShareConfig';
const KEY_DISCORD = 'discordConfig';
const KEY_DISPLAY = 'displaySettings';
const KEY_AFFILIATE_TAGS = 'affiliateTags';

const DEFAULT_AFFILIATE_TAGS = Object.freeze(
  Object.fromEntries(Object.values(MARKETPLACES).map(code => [code, '']))
);

export async function readConfig() {
  const x = await chrome.storage.local.get(KEY_GITHUB);
  return x[KEY_GITHUB] || null;
}

export async function saveConfig(token) {
  await chrome.storage.local.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' });
  await chrome.storage.local.set({
    [KEY_GITHUB]: {
      token: token.trim(),
      consent: true,
      consentedAt: new Date().toISOString(),
      destination: 'Dracula06/amazon-4-colonnes/main'
    }
  });
}

export async function clearConfig() {
  await chrome.storage.local.remove(KEY_GITHUB);
}

export async function readDiscordConfig() {
  const x = await chrome.storage.local.get(KEY_DISCORD);
  return x[KEY_DISCORD] || null;
}

export async function saveDiscordConfig(webhookUrl) {
  await chrome.storage.local.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' });
  await chrome.storage.local.set({
    [KEY_DISCORD]: {
      webhookUrl: String(webhookUrl || '').trim(),
      updatedAt: new Date().toISOString()
    }
  });
}

export async function clearDiscordConfig() {
  await chrome.storage.local.remove(KEY_DISCORD);
}

export async function readDisplaySettings() {
  const x = await chrome.storage.local.get(KEY_DISPLAY);
  return { ...DEFAULT_DISPLAY_SETTINGS, ...(x[KEY_DISPLAY] || {}) };
}

export async function saveDisplaySettings(settings) {
  const current = await readDisplaySettings();
  const merged = { ...current, ...settings };
  await chrome.storage.local.set({ [KEY_DISPLAY]: merged });
  return merged;
}

export async function readAffiliateTags() {
  const x = await chrome.storage.local.get(KEY_AFFILIATE_TAGS);
  return { ...DEFAULT_AFFILIATE_TAGS, ...(x[KEY_AFFILIATE_TAGS] || {}) };
}

export async function saveAffiliateTags(partialTags = {}) {
  const current = await readAffiliateTags();
  const next = { ...current };
  for (const code of Object.keys(DEFAULT_AFFILIATE_TAGS)) {
    if (Object.prototype.hasOwnProperty.call(partialTags, code)) {
      next[code] = String(partialTags[code] || '').trim();
    }
  }
  await chrome.storage.local.set({ [KEY_AFFILIATE_TAGS]: next });
  return next;
}
