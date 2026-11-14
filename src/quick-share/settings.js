import {
  readConfig, saveConfig, clearConfig,
  readDiscordConfig, saveDiscordConfig, clearDiscordConfig,
  readDisplaySettings, saveDisplaySettings,
  readAffiliateTags, saveAffiliateTags
} from './config.js';
import { allowGitHub } from '../library/github.js';
import { isValidDiscordWebhook, sendDiscordWebhook, buildDiscordEmbed } from '../library/discord.js';
import { MARKETPLACES } from '../library/marketplaces.js';

const $ = id => document.getElementById(id);
const COUNTRY_CODES = Object.values(MARKETPLACES);

async function refreshAll() {
  // 1. GitHub
  const cfg = await readConfig();
  const last = (await chrome.storage.local.get('quickShareLastResult')).quickShareLastResult;
  $('status').textContent = (cfg?.consent && cfg.token
    ? 'GitHub configuré (dépôt : ' + cfg.destination + ').'
    : 'GitHub non configuré.') + (last ? '\nDernier envoi : ' + last.path : '');

  // 2. Discord
  const dCfg = await readDiscordConfig();
  if (dCfg?.webhookUrl) {
    $('discordWebhook').value = dCfg.webhookUrl;
    $('discordStatus').textContent = '✅ Webhook Discord configuré et actif.';
    $('discordStatus').style.color = '#16a34a';
  } else {
    $('discordWebhook').value = '';
    $('discordStatus').textContent = 'Aucun webhook Discord configuré.';
    $('discordStatus').style.color = '#64748b';
  }

  // 3. Display
  const disp = await readDisplaySettings();
  $('minWidth').value = disp.minWidth || 1200;

  // 4. Affiliate tags
  const tags = await readAffiliateTags();
  for (const code of COUNTRY_CODES) {
    const input = $('tag' + code);
    if (input) input.value = tags[code] || '';
  }
}

// Actions GitHub
$('save').onclick = async () => {
  try {
    if (!$('consent').checked) throw new Error('Cochez le consentement au partage rapide.');
    const token = $('token').value.trim();
    if (!token) throw new Error('Saisissez un jeton GitHub.');
    if (!await allowGitHub()) throw new Error('Permission API GitHub refusée par le navigateur.');
    await saveConfig(token);
    $('token').value = '';
    await refreshAll();
  } catch (e) {
    $('status').textContent = 'Erreur : ' + e.message;
  }
};

$('forget').onclick = async () => {
  await clearConfig();
  $('token').value = '';
  $('consent').checked = false;
  await refreshAll();
};

// Actions Discord
$('saveDiscord').onclick = async () => {
  const url = $('discordWebhook').value.trim();
  if (!isValidDiscordWebhook(url)) {
    $('discordStatus').textContent = '❌ URL de Webhook Discord invalide (doit commencer par https://discord.com/api/webhooks/...)';
    $('discordStatus').style.color = '#dc2626';
    return;
  }
  await saveDiscordConfig(url);
  $('discordStatus').textContent = '✅ Webhook enregistré avec succès !';
  $('discordStatus').style.color = '#16a34a';
};

$('testDiscord').onclick = async () => {
  const url = $('discordWebhook').value.trim();
  if (!isValidDiscordWebhook(url)) {
    $('discordStatus').textContent = '❌ Enregistrez d’abord une URL de webhook valide.';
    $('discordStatus').style.color = '#dc2626';
    return;
  }
  $('discordStatus').textContent = 'Envoi d’un message test vers Discord…';
  try {
    const testPayload = buildDiscordEmbed({
      asin: 'TEST123456',
      title: 'Test de connexion Amazon 4 Colonnes',
      marketplace: 'FR',
      price: '19,99',
      kind: 'amazon',
      code: 'AMAZON',
      label: 'Test de Webhook réussi !',
      seller: 'Amazon',
      ship: 'Amazon'
    });
    await sendDiscordWebhook(url, testPayload);
    $('discordStatus').textContent = '✅ Message test reçu sur votre salon Discord !';
    $('discordStatus').style.color = '#16a34a';
  } catch (err) {
    $('discordStatus').textContent = '❌ Échec : ' + err.message;
    $('discordStatus').style.color = '#dc2626';
  }
};

$('clearDiscord').onclick = async () => {
  await clearDiscordConfig();
  $('discordWebhook').value = '';
  $('discordStatus').textContent = 'Webhook effacé.';
  $('discordStatus').style.color = '#64748b';
};

// Actions Display
$('saveDisplay').onclick = async () => {
  const minWidth = parseInt($('minWidth').value, 10) || 1200;
  await saveDisplaySettings({ minWidth });
  alert('Seuil de largeur mis à jour (' + minWidth + ' px) !');
};

// Actions Affiliate Tags
$('saveAffiliateTags').onclick = async () => {
  const next = {};
  for (const code of COUNTRY_CODES) {
    next[code] = ($('tag' + code)?.value || '').trim();
  }
  await saveAffiliateTags(next);
  chrome.runtime.sendMessage({ action: 'saveAffiliateTags', tags: next }).catch(() => {});
  $('affiliateStatus').textContent = '✅ Tags Partenaires enregistrés localement.';
  $('affiliateStatus').style.color = '#16a34a';
};

$('clearAffiliateTags').onclick = async () => {
  const empty = Object.fromEntries(COUNTRY_CODES.map(code => [code, '']));
  await saveAffiliateTags(empty);
  chrome.runtime.sendMessage({ action: 'saveAffiliateTags', tags: empty }).catch(() => {});
  for (const code of COUNTRY_CODES) {
    if ($('tag' + code)) $('tag' + code).value = '';
  }
  $('affiliateStatus').textContent = 'Tags Partenaires effacés.';
  $('affiliateStatus').style.color = '#64748b';
};

refreshAll();
