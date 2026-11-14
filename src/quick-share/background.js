import { marketplaceOf } from '../library/marketplaces.js';
import {
  readDisplaySettings,
  saveDisplaySettings,
  readDiscordConfig,
  readAffiliateTags,
  saveAffiliateTags
} from './config.js';
import { sendDiscordWebhook, buildDiscordEmbed } from '../library/discord.js';

const busy = new Set();

async function notifyAmazonTabs(payload) {
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id && marketplaceOf(tab.url || '')) {
        chrome.tabs.sendMessage(tab.id, payload).catch(() => {});
      }
    }
  } catch {}
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getDisplaySettings') {
    readDisplaySettings().then(sendResponse);
    return true;
  }

  if (message.action === 'saveDisplaySettings') {
    saveDisplaySettings(message.settings).then(saved => {
      notifyAmazonTabs({ action: 'displaySettingsChanged', settings: saved });
      sendResponse({ ok: true, settings: saved });
    }).catch(err => sendResponse({ ok: false, error: err.message }));
    return true;
  }

  if (message.action === 'getAffiliateTags') {
    readAffiliateTags().then(sendResponse);
    return true;
  }

  if (message.action === 'saveAffiliateTags') {
    saveAffiliateTags(message.tags).then(saved => {
      notifyAmazonTabs({ action: 'affiliateTagsChanged', tags: saved });
      sendResponse({ ok: true, tags: saved });
    }).catch(err => sendResponse({ ok: false, error: err.message }));
    return true;
  }

  if (message.action === 'getDiscordStatus') {
    readDiscordConfig().then(cfg => {
      sendResponse({ configured: !!cfg?.webhookUrl });
    });
    return true;
  }

  if (message.action === 'sendDiscord') {
    (async () => {
      const cfg = await readDiscordConfig();
      if (!cfg?.webhookUrl) throw new Error('Webhook Discord non configuré dans les options');
      const embedPayload = buildDiscordEmbed(message.data);
      return sendDiscordWebhook(cfg.webhookUrl, embedPayload);
    })().then(result => sendResponse({ ok: true, result }))
      .catch(err => sendResponse({ ok: false, error: err.message }));
    return true;
  }

  if (message.action === 'triggerQuickShare') {
    const tabId = message.tabId || sender.tab?.id;
    if (!tabId) {
      sendResponse({ ok: false, error: 'Onglet non spécifié' });
      return;
    }
    if (busy.has(tabId)) {
      sendResponse({ ok: false, error: 'Partage déjà en cours' });
      return;
    }
    busy.add(tabId);
    (async () => {
      await chrome.action.setBadgeText({ text: '…', tabId });
      await chrome.tabs.create({ url: chrome.runtime.getURL('quick-share.html') + '?tab=' + tabId, active: false });
    })().then(() => sendResponse({ ok: true }))
      .catch(err => sendResponse({ ok: false, error: err.message }))
      .finally(() => setTimeout(() => busy.delete(tabId), 3000));
    return true;
  }
});
