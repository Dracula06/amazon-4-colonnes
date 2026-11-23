import { marketplaceOf } from '../library/marketplaces.js';
import {
  readDisplaySettings,
  saveDisplaySettings,
  readDiscordConfig,
  readTelegramConfig,
  readAffiliateTags,
  saveAffiliateTags
} from './config.js';
import { sendDiscordWebhook, buildDiscordEmbed } from '../library/discord.js';
import { sendTelegramMessage, buildTelegramMessage } from '../library/telegram.js';

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

  if (message.action === 'getTelegramStatus') {
    readTelegramConfig().then(cfg => {
      const configured = Boolean((cfg?.botToken && cfg?.chatId) || cfg?.webhookUrl);
      sendResponse({ configured });
    });
    return true;
  }

  if (message.action === 'sendTelegram') {
    (async () => {
      const cfg = await readTelegramConfig();
      if (!cfg || (!cfg.botToken && !cfg.webhookUrl)) {
        throw new Error('Telegram non configuré dans les options');
      }
      const text = buildTelegramMessage(message.data);
      return sendTelegramMessage({
        token: cfg.botToken,
        chatId: cfg.chatId,
        webhookUrl: cfg.webhookUrl,
        text
      });
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

  if (message.action === 'openCollector') {
    const tabId = message.tabId || sender.tab?.id;
    const url = tabId ? `collector.html?tab=${tabId}` : 'collector.html';
    chrome.tabs.create({ url: chrome.runtime.getURL(url) });
    sendResponse({ ok: true });
    return true;
  }
});

if (typeof chrome !== 'undefined' && chrome.declarativeNetRequest && typeof chrome.declarativeNetRequest.updateDynamicRules === 'function') {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: [
      {
        id: 1,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          responseHeaders: [
            { header: 'content-security-policy', operation: 'remove' },
            { header: 'x-frame-options', operation: 'remove' }
          ]
        },
        condition: {
          urlFilter: '||keepa.com',
          resourceTypes: ['sub_frame']
        }
      }
    ]
  }).catch(() => {});
}
