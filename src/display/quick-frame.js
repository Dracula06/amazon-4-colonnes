(() => {
  'use strict';

  const COLLAPSE_STORAGE_KEY = 'al_quick_frame_collapsed';
  const POS_STORAGE_KEY = 'al_quick_frame_pos';
  const STACK_ID = 'al-floating-stack';
  const STYLE_ID = 'al-quick-frame-style';
  const FRAME_ID = 'al-quick-frame';

  const FRAME_CSS = `
#${STACK_ID} {
  position: fixed !important;
  top: 14px;
  right: 18px;
  bottom: auto !important;
  z-index: 9999999 !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-end !important;
  gap: 10px !important;
  pointer-events: none !important;
  max-width: 340px !important;
}
#${STACK_ID} > * {
  pointer-events: auto !important;
}
#${STACK_ID} #al-origin-banner {
  position: static !important;
  top: auto !important;
  right: auto !important;
  z-index: auto !important;
  width: 100% !important;
  max-width: 340px !important;
}
#${FRAME_ID} {
  width: 320px !important;
  max-width: calc(100vw - 32px) !important;
  background: #ffffff !important;
  border: 2px solid #0f172a !important;
  border-radius: 12px !important;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.2) !important;
  padding: 10px 12px !important;
  font: 12.5px/1.4 system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  color: #0f172a !important;
  box-sizing: border-box !important;
  text-align: left !important;
}
#${FRAME_ID}.al-collapsed {
  width: auto !important;
  padding: 7px 11px !important;
}
#${FRAME_ID} .al-qf-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 8px !important;
  cursor: grab !important;
  user-select: none !important;
  touch-action: none !important;
}
#${STACK_ID}.al-dragging #${FRAME_ID} .al-qf-header,
#${FRAME_ID}.al-dragging .al-qf-header {
  cursor: grabbing !important;
}
#${FRAME_ID} .al-qf-title-group {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  flex-wrap: wrap !important;
  min-width: 0 !important;
}
#${FRAME_ID} .al-qf-country {
  font-weight: 700 !important;
  font-size: 13px !important;
  color: #0f172a !important;
}
#${FRAME_ID} .al-qf-pill {
  display: inline-block !important;
  font-size: 10.5px !important;
  font-weight: 600 !important;
  padding: 1px 6px !important;
  border-radius: 999px !important;
  background: #fef3c7 !important;
  color: #92400e !important;
  border: 1px solid #f59e0b !important;
}
#${FRAME_ID} .al-qf-pill.al-pill-ok {
  background: #d1fae5 !important;
  color: #065f46 !important;
  border-color: #10b981 !important;
}
#${FRAME_ID} .al-qf-pill.al-pill-info {
  background: #e0f2fe !important;
  color: #0369a1 !important;
  border-color: #38bdf8 !important;
}
#${FRAME_ID} .al-qf-pill.al-pill-lock {
  background: #fef2f2 !important;
  color: #b91c1c !important;
  border-color: #fca5a5 !important;
}
#${FRAME_ID} .al-qf-controls {
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
  flex-shrink: 0 !important;
}
#${FRAME_ID} .al-qf-icon-btn {
  cursor: pointer !important;
  border: 1px solid #cbd5e1 !important;
  background: #f8fafc !important;
  color: #334155 !important;
  border-radius: 6px !important;
  font: 700 13px/1 system-ui, sans-serif !important;
  width: 22px !important;
  height: 22px !important;
  padding: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}
#${FRAME_ID} .al-qf-icon-btn:hover {
  background: #e2e8f0 !important;
  color: #0f172a !important;
}
#${FRAME_ID} .al-qf-body {
  margin-top: 8px !important;
  padding-top: 8px !important;
  border-top: 1px solid #e2e8f0 !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 7px !important;
}
#${FRAME_ID}.al-collapsed .al-qf-body {
  display: none !important;
}
#${FRAME_ID} .al-qf-meta {
  display: flex !important;
  align-items: center !important;
  flex-wrap: wrap !important;
  gap: 5px !important;
  font-size: 11.5px !important;
  color: #475569 !important;
}
#${FRAME_ID} .al-qf-row {
  display: flex !important;
  align-items: center !important;
  gap: 5px !important;
}
#${FRAME_ID} .al-qf-label {
  font-size: 11px !important;
  font-weight: 600 !important;
  color: #475569 !important;
  min-width: 32px !important;
}
#${FRAME_ID} .al-qf-input {
  flex: 1 !important;
  min-width: 0 !important;
  padding: 4px 7px !important;
  font: 12px/1.3 monospace !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 6px !important;
  background: #f8fafc !important;
  color: #0f172a !important;
  box-sizing: border-box !important;
}
#${FRAME_ID} .al-qf-input:focus {
  outline: 2px solid #0284c7 !important;
  background: #ffffff !important;
}
#${FRAME_ID} .al-qf-hint {
  font-size: 10.5px !important;
  color: #64748b !important;
}
#${FRAME_ID} .al-qf-actions {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 6px !important;
}
#${FRAME_ID} .al-qf-btn {
  flex: 1 1 auto !important;
  cursor: pointer !important;
  border: 1px solid #cbd5e1 !important;
  background: #ffffff !important;
  color: #0f172a !important;
  border-radius: 6px !important;
  padding: 5px 8px !important;
  font: 600 11.5px/1.3 system-ui, sans-serif !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 4px !important;
}
#${FRAME_ID} .al-qf-btn:hover {
  background: #f1f5f9 !important;
}
#${FRAME_ID} .al-qf-btn-primary {
  background: #0f172a !important;
  color: #ffffff !important;
  border-color: #0f172a !important;
}
#${FRAME_ID} .al-qf-btn-primary:hover {
  background: #1e293b !important;
}
#${FRAME_ID} .al-qf-btn-ss {
  background: #fffbeb !important;
  color: #92400e !important;
  border-color: #f59e0b !important;
}
#${FRAME_ID} .al-qf-btn-ss:hover {
  background: #fef3c7 !important;
}
#${FRAME_ID} .al-qf-btn-discord {
  background: #5865f2 !important;
  color: #ffffff !important;
  border-color: #4752c4 !important;
}
#${FRAME_ID} .al-qf-btn-discord:hover {
  background: #4752c4 !important;
}
#${FRAME_ID} .al-qf-status {
  font-size: 11px !important;
  min-height: 15px !important;
  color: #0369a1 !important;
  font-weight: 500 !important;
}
#${FRAME_ID} .al-qf-status.is-ok { color: #15803d !important; }
#${FRAME_ID} .al-qf-status.is-err { color: #b91c1c !important; }
`;

  function ensureFrameStyle(doc = document) {
    if (doc.getElementById(STYLE_ID)) return;
    const style = doc.createElement('style');
    style.id = STYLE_ID;
    style.textContent = FRAME_CSS;
    (doc.head || doc.documentElement).append(style);
  }

  function ensureFloatingStack(doc = document) {
    ensureFrameStyle(doc);
    let stack = doc.getElementById(STACK_ID);
    if (!stack && doc.body) {
      stack = doc.createElement('div');
      stack.id = STACK_ID;
      doc.body.append(stack);
    }
    return stack;
  }

  function readCollapsed() {
    try {
      return sessionStorage.getItem(COLLAPSE_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }

  function writeCollapsed(collapsed) {
    try {
      sessionStorage.setItem(COLLAPSE_STORAGE_KEY, collapsed ? '1' : '0');
    } catch {}
  }

  function isValidPos(pos) {
    return Boolean(pos && typeof pos.left === 'number' && Number.isFinite(pos.left) && typeof pos.top === 'number' && Number.isFinite(pos.top));
  }

  function readSessionPos() {
    try {
      const raw = sessionStorage.getItem(POS_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return isValidPos(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  function writeSessionPos(pos) {
    try {
      if (isValidPos(pos)) {
        sessionStorage.setItem(POS_STORAGE_KEY, JSON.stringify(pos));
      } else {
        sessionStorage.removeItem(POS_STORAGE_KEY);
      }
    } catch {}
  }

  function clampPosition(left, top, boxWidth, boxHeight, viewportWidth, viewportHeight, margin = 8) {
    const maxLeft = Math.max(margin, (viewportWidth || 0) - (boxWidth || 0) - margin);
    const maxTop = Math.max(margin, (viewportHeight || 0) - (boxHeight || 0) - margin);
    return {
      left: Math.round(Math.min(Math.max(margin, left), maxLeft)),
      top: Math.round(Math.min(Math.max(margin, top), maxTop))
    };
  }

  function applyStackPosition(stack, pos) {
    if (!stack || !stack.style) return;
    const setProp = (name, value) => {
      if (typeof stack.style.setProperty === 'function') {
        stack.style.setProperty(name, value, 'important');
      } else {
        stack.style[name] = value;
      }
    };
    const removeProp = name => {
      if (typeof stack.style.removeProperty === 'function') {
        stack.style.removeProperty(name);
      } else {
        stack.style[name] = '';
      }
    };

    if (!isValidPos(pos)) {
      removeProp('left');
      setProp('right', '18px');
      setProp('top', '14px');
      return;
    }
    const rect = typeof stack.getBoundingClientRect === 'function'
      ? stack.getBoundingClientRect()
      : { width: 320, height: 180 };
    const clamped = clampPosition(
      pos.left,
      pos.top,
      rect.width || 320,
      rect.height || 180,
      globalThis.innerWidth || 1280,
      globalThis.innerHeight || 800
    );
    setProp('right', 'auto');
    setProp('left', `${clamped.left}px`);
    setProp('top', `${clamped.top}px`);
  }

  let isDraggingStack = false;
  let activePosCommit = null;
  let resizeHooked = false;
  let lastSyncedRemotePosKey = '';

  function setupStackDragging(stack, handle, onCommit) {
    activePosCommit = onCommit;
    if (!stack || !handle || handle.dataset.alDragBound === '1') return;
    handle.dataset.alDragBound = '1';
    handle.title = 'Glisser pour déplacer · Double-clic pour réinitialiser la position';

    let startX = 0;
    let startY = 0;
    let origLeft = 0;
    let origTop = 0;
    let moved = false;

    const setInlinePos = (left, top) => {
      if (typeof stack.style.setProperty === 'function') {
        stack.style.setProperty('right', 'auto', 'important');
        stack.style.setProperty('left', `${left}px`, 'important');
        stack.style.setProperty('top', `${top}px`, 'important');
      } else {
        stack.style.right = 'auto';
        stack.style.left = `${left}px`;
        stack.style.top = `${top}px`;
      }
    };

    const onMove = ev => {
      if (!isDraggingStack) return;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!moved && Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
      moved = true;
      const rect = stack.getBoundingClientRect();
      const clamped = clampPosition(
        origLeft + dx,
        origTop + dy,
        rect.width || 320,
        rect.height || 180,
        globalThis.innerWidth || 1280,
        globalThis.innerHeight || 800
      );
      setInlinePos(clamped.left, clamped.top);
    };

    const onEnd = () => {
      if (!isDraggingStack) return;
      isDraggingStack = false;
      stack.classList.remove('al-dragging');
      globalThis.removeEventListener('pointermove', onMove, true);
      globalThis.removeEventListener('pointerup', onEnd, true);
      globalThis.removeEventListener('pointercancel', onEnd, true);
      if (moved) {
        const rect = stack.getBoundingClientRect();
        const finalPos = clampPosition(
          rect.left,
          rect.top,
          rect.width || 320,
          rect.height || 180,
          globalThis.innerWidth || 1280,
          globalThis.innerHeight || 800
        );
        setInlinePos(finalPos.left, finalPos.top);
        writeSessionPos(finalPos);
        lastSyncedRemotePosKey = JSON.stringify(finalPos);
        if (typeof activePosCommit === 'function') {
          activePosCommit(finalPos);
        }
      }
    };

    handle.addEventListener('pointerdown', ev => {
      if (ev.button !== 0) return;
      if (ev.target && typeof ev.target.closest === 'function' && ev.target.closest('button, input, a, select, textarea, label')) {
        return;
      }
      ev.preventDefault();
      const rect = stack.getBoundingClientRect();
      startX = ev.clientX;
      startY = ev.clientY;
      origLeft = rect.left;
      origTop = rect.top;
      moved = false;
      isDraggingStack = true;
      stack.classList.add('al-dragging');
      globalThis.addEventListener('pointermove', onMove, true);
      globalThis.addEventListener('pointerup', onEnd, true);
      globalThis.addEventListener('pointercancel', onEnd, true);
    });

    handle.addEventListener('dblclick', ev => {
      if (ev.target && typeof ev.target.closest === 'function' && ev.target.closest('button, input, a, select, textarea, label')) {
        return;
      }
      writeSessionPos(null);
      lastSyncedRemotePosKey = 'null';
      applyStackPosition(stack, null);
      if (typeof activePosCommit === 'function') {
        activePosCommit(null);
      }
    });

    if (!resizeHooked && typeof globalThis.addEventListener === 'function') {
      resizeHooked = true;
      globalThis.addEventListener('resize', () => {
        const currentStack = typeof document !== 'undefined' ? document.getElementById(STACK_ID) : null;
        const pos = readSessionPos();
        if (currentStack && isValidPos(pos)) {
          applyStackPosition(currentStack, pos);
        }
      });
    }
  }

  function findActivePopover(doc) {
    const popovers = [...doc.querySelectorAll('.a-popover')];
    return popovers.find(p => {
      if (p.getAttribute('aria-hidden') === 'true') return false;
      if (p.style?.display === 'none') return false;
      return Boolean(
        p.querySelector('#amzn-ss-popover-text-preload-content-container, #amzn-ss-copy-affiliate-link-btn, .amzn-ss-popover-third-party-message')
      );
    }) || null;
  }

  function isNodeShown(el) {
    if (!el) return false;
    if (el.classList?.contains('aok-hidden') || el.classList?.contains('amzn-ss-hidden-content')) return false;
    if (el.style?.display === 'none' || el.style?.visibility === 'hidden') return false;
    return true;
  }

  /**
   * Déclenche le flux SiteStripe natif d'Amazon pour obtenir et copier un lien court (`amzn.to`).
   * Limite : dépend du JS Amazon en cours d'exécution et des restrictions navigateur sur le presse-papiers.
   * @param {Document} [doc]
   * @returns {Promise<{ ok: boolean, message: string }>}
   */
  async function triggerSiteStripeShortLink(doc = document) {
    const getLinkBtn = doc.querySelector('#amzn-ss-get-link-button') || doc.querySelector('#amzn-ss-text-link');
    if (!getLinkBtn) {
      return { ok: false, message: 'Barre Amazon Partenaires (SiteStripe) absente sur cette page.' };
    }

    getLinkBtn.click();

    const deadline = Date.now() + 2600;
    let scope = null;

    while (Date.now() < deadline) {
      const pop = findActivePopover(doc);
      const container = pop?.querySelector('#amzn-ss-popover-text-preload-content-container')
        || doc.querySelector('#amzn-ss-popover-text-preload-content-container');
      const excluded = (pop || doc).querySelector('.amzn-ss-popover-third-party-message');

      if (excluded && isNodeShown(excluded) && !excluded.closest('.a-popover-preload')) {
        return { ok: false, message: 'Produit exclu du programme Amazon Partenaires.' };
      }

      if (pop && container && isNodeShown(container)) {
        scope = pop;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 120));
    }

    if (!scope) {
      return { ok: false, message: 'Fenêtre SiteStripe non prête : cliquez manuellement sur « Get Link ».' };
    }

    const shortRadio = scope.querySelector('#amzn-ss-short-link-radio-button input[type="radio"]');
    const shortLabel = scope.querySelector('#amzn-ss-short-link-radio-button label') || shortRadio;
    if (shortRadio && !shortRadio.checked && shortLabel) {
      shortLabel.click();
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    const copyBtn = scope.querySelector('#amzn-ss-copy-affiliate-link-btn-announce')
      || scope.querySelector('#amzn-ss-copy-affiliate-link-btn button')
      || scope.querySelector('[data-action="amzn-ss-copy-affiliate-link"]');

    if (!copyBtn) {
      return { ok: false, message: 'Fenêtre SiteStripe ouverte : cliquez sur « Copy affiliate link ».' };
    }

    copyBtn.click();

    const toastDeadline = Date.now() + 1400;
    while (Date.now() < toastDeadline) {
      const toastOk = scope.querySelector('#amzn-ss-copy-toast') || doc.querySelector('#amzn-ss-copy-toast');
      const toastErr = scope.querySelector('#amzn-ss-copy-toast-error') || doc.querySelector('#amzn-ss-copy-toast-error');
      if (toastOk && toastOk.style?.display !== 'none') {
        return { ok: true, message: 'Lien court SiteStripe copié dans le presse-papiers.' };
      }
      if (toastErr && toastErr.style?.display !== 'none') {
        return { ok: false, message: 'SiteStripe a refusé la génération : utilisez « Copier lien » ou réessayez.' };
      }
      await new Promise(resolve => setTimeout(resolve, 120));
    }

    return { ok: false, message: 'SiteStripe ouvert : vérifiez le toast ou cliquez « Copy affiliate link ».' };
  }

  let dismissedOnPage = false;
  let customTagDraft = null;
  let statusTimeout = null;

  function renderQuickFrame(ctx) {
    const {
      doc = document,
      country,
      siteStripe,
      savedTag = '',
      isProductPage = false,
      logistics = null,
      shippingRestriction = null,
      product = null,
      visible = true,
      position = null,
      onSaveTag,
      onSavePosition,
      onShareDiscord
    } = ctx || {};

    const existing = doc.getElementById(FRAME_ID);
    if (!visible || !country || dismissedOnPage) {
      existing?.remove();
      return null;
    }

    const stack = ensureFloatingStack(doc);
    if (!stack) return null;

    function syncStackPosition() {
      if (isDraggingStack) return;
      const remoteKey = isValidPos(position) ? JSON.stringify(position) : '';
      if (remoteKey && remoteKey !== lastSyncedRemotePosKey) {
        lastSyncedRemotePosKey = remoteKey;
        writeSessionPos(position);
        applyStackPosition(stack, position);
        return;
      }
      if (position === null && lastSyncedRemotePosKey && lastSyncedRemotePosKey !== 'null') {
        lastSyncedRemotePosKey = 'null';
        writeSessionPos(null);
        applyStackPosition(stack, null);
        return;
      }
      const sessionPos = readSessionPos();
      if (sessionPos) {
        applyStackPosition(stack, sessionPos);
      } else if (!stack.style.left) {
        applyStackPosition(stack, null);
      }
    }
    syncStackPosition();

    const affiliate = globalThis.ALAffiliate;
    const detectedTag = siteStripe?.trackingId || '';
    const activeTag = customTagDraft !== null
      ? customTagDraft
      : (detectedTag || affiliate?.cleanTrackingId?.(savedTag) || '');

    const tagSource = customTagDraft !== null
      ? 'Saisie manuelle'
      : (detectedTag
          ? 'Détecté via SiteStripe'
          : (savedTag ? `Enregistré (${country.code})` : `Aucun tag pour ${country.code}`));

    const linkResult = affiliate
      ? affiliate.buildQuickAffiliateLink(doc.location?.href || '', {
          trackingId: activeTag,
          asin: product?.asin || ''
        })
      : { ok: false, url: doc.location?.href || '' };

    const generatedUrl = linkResult.url || doc.location?.href || '';

    let frame = existing;
    if (!frame) {
      frame = doc.createElement('section');
      frame.id = FRAME_ID;
      frame.setAttribute('aria-label', 'Cadre Amazon Partenaires & Lien rapide');
      stack.append(frame);
    } else if (frame.parentElement !== stack) {
      stack.append(frame);
    }

    const collapsed = readCollapsed();
    frame.classList.toggle('al-collapsed', collapsed);

    // Éviter de reconstruire le DOM si l'utilisateur est en train de taper dans le champ Tag
    const activeEl = doc.activeElement;
    const tagInputFocused = activeEl && activeEl.id === 'al-qf-tag-input';

    const signature = JSON.stringify({
      code: country.code,
      collapsed,
      ssPresent: Boolean(siteStripe?.present),
      ssCat: siteStripe?.category || '',
      ssRate: siteStripe?.commissionRate || '',
      ssExcluded: Boolean(siteStripe?.excludedProduct),
      isProductPage,
      asin: product?.asin || '',
      price: product?.price || '',
      logCode: logistics?.code || '',
      logKind: logistics?.kind || '',
      locked: Boolean(shippingRestriction?.blocked),
      activeTag,
      tagSource,
      savedTag,
      generatedUrl
    });

    if (frame.dataset.signature === signature || tagInputFocused) {
      const urlInput = frame.querySelector('#al-qf-url-input');
      if (urlInput && urlInput.value !== generatedUrl) {
        urlInput.value = generatedUrl;
      }
      return frame;
    }

    frame.dataset.signature = signature;
    frame.replaceChildren();

    // Header
    const header = doc.createElement('div');
    header.className = 'al-qf-header';

    const titleGroup = doc.createElement('div');
    titleGroup.className = 'al-qf-title-group';

    const countrySpan = doc.createElement('span');
    countrySpan.className = 'al-qf-country';
    countrySpan.textContent = `${country.flag} Amazon ${country.code}`;
    titleGroup.append(countrySpan);

    if (siteStripe?.present) {
      const ssPill = doc.createElement('span');
      ssPill.className = 'al-qf-pill';
      const parts = ['Partenaires'];
      if (siteStripe.commissionRate) parts.push(siteStripe.commissionRate);
      ssPill.textContent = parts.join(' · ');
      if (siteStripe.category) ssPill.title = `Catégorie SiteStripe : ${siteStripe.category}`;
      titleGroup.append(ssPill);
    }

    if (shippingRestriction?.blocked) {
      const lockPill = doc.createElement('span');
      lockPill.className = 'al-qf-pill al-pill-lock';
      lockPill.textContent = '🔒 LOCK pays';
      titleGroup.append(lockPill);
    } else if (isProductPage && logistics?.code) {
      const logPill = doc.createElement('span');
      logPill.className = `al-qf-pill ${logistics.kind === 'amazon' ? 'al-pill-ok' : (logistics.kind === 'fba' ? 'al-pill-info' : '')}`;
      logPill.textContent = logistics.code;
      titleGroup.append(logPill);
    }

    const controls = doc.createElement('div');
    controls.className = 'al-qf-controls';

    const toggleBtn = doc.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'al-qf-icon-btn';
    toggleBtn.title = collapsed ? 'Déplier le cadre' : 'Réduire le cadre';
    toggleBtn.setAttribute('aria-label', toggleBtn.title);
    toggleBtn.textContent = collapsed ? '+' : '−';
    toggleBtn.onclick = () => {
      writeCollapsed(!collapsed);
      frame.dataset.signature = '';
      renderQuickFrame(ctx);
    };

    const closeBtn = doc.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'al-qf-icon-btn';
    closeBtn.title = 'Masquer sur cette page';
    closeBtn.setAttribute('aria-label', 'Masquer sur cette page');
    closeBtn.textContent = '✕';
    closeBtn.onclick = () => {
      dismissedOnPage = true;
      frame.remove();
    };

    controls.append(toggleBtn, closeBtn);
    header.append(titleGroup, controls);
    frame.append(header);

    // Body
    const body = doc.createElement('div');
    body.className = 'al-qf-body';

    if (isProductPage && (product?.asin || product?.price || siteStripe?.category)) {
      const meta = doc.createElement('div');
      meta.className = 'al-qf-meta';
      const chunks = [];
      if (product?.asin) chunks.push(`ASIN: ${product.asin}`);
      if (product?.price) chunks.push(`Prix: ${product.price}`);
      if (siteStripe?.category) chunks.push(`Cat.: ${siteStripe.category}`);
      meta.textContent = chunks.join(' · ');
      body.append(meta);
    }

    const statusLine = doc.createElement('div');
    statusLine.className = 'al-qf-status';

    function setFrameStatus(msg, kind = '') {
      clearTimeout(statusTimeout);
      statusLine.textContent = msg;
      statusLine.className = `al-qf-status${kind ? ' ' + kind : ''}`;
      statusTimeout = setTimeout(() => {
        statusLine.textContent = '';
        statusLine.className = 'al-qf-status';
      }, 4000);
    }

    // Tag Row
    const tagRow = doc.createElement('div');
    tagRow.className = 'al-qf-row';

    const tagLabel = doc.createElement('label');
    tagLabel.className = 'al-qf-label';
    tagLabel.setAttribute('for', 'al-qf-tag-input');
    tagLabel.textContent = 'Tag';

    const tagInput = doc.createElement('input');
    tagInput.id = 'al-qf-tag-input';
    tagInput.className = 'al-qf-input';
    tagInput.type = 'text';
    tagInput.placeholder = 'ex: monid-21';
    tagInput.value = activeTag;

    const urlInput = doc.createElement('input');
    urlInput.id = 'al-qf-url-input';
    urlInput.className = 'al-qf-input';
    urlInput.type = 'text';
    urlInput.readOnly = true;
    urlInput.value = generatedUrl;
    urlInput.onclick = () => urlInput.select();

    tagInput.addEventListener('input', () => {
      customTagDraft = tagInput.value.trim();
      const updated = affiliate
        ? affiliate.buildQuickAffiliateLink(doc.location?.href || '', {
            trackingId: customTagDraft,
            asin: product?.asin || ''
          })
        : { url: doc.location?.href || '' };
      urlInput.value = updated.url || '';
    });

    const saveTagBtn = doc.createElement('button');
    saveTagBtn.type = 'button';
    saveTagBtn.className = 'al-qf-icon-btn';
    saveTagBtn.title = `Mémoriser ce tag pour ${country.code}`;
    saveTagBtn.setAttribute('aria-label', saveTagBtn.title);
    saveTagBtn.textContent = '💾';
    saveTagBtn.onclick = async () => {
      const candidate = affiliate ? affiliate.cleanTrackingId(tagInput.value) : tagInput.value.trim();
      if (!candidate) {
        setFrameStatus('Saisissez un tag valide avant de mémoriser.', 'is-err');
        return;
      }
      if (typeof onSaveTag === 'function') {
        const res = await onSaveTag(country.code, candidate);
        if (res?.ok !== false) {
          customTagDraft = null;
          setFrameStatus(`Tag mémorisé pour ${country.code}.`, 'is-ok');
        } else {
          setFrameStatus(res?.error || 'Échec de sauvegarde du tag.', 'is-err');
        }
      }
    };

    tagRow.append(tagLabel, tagInput, saveTagBtn);
    body.append(tagRow);

    const hint = doc.createElement('div');
    hint.className = 'al-qf-hint';
    hint.textContent = `Source du tag : ${tagSource}`;
    body.append(hint);

    // Link Preview Row
    const linkRow = doc.createElement('div');
    linkRow.className = 'al-qf-row';

    const linkLabel = doc.createElement('label');
    linkLabel.className = 'al-qf-label';
    linkLabel.setAttribute('for', 'al-qf-url-input');
    linkLabel.textContent = 'Lien';

    linkRow.append(linkLabel, urlInput);
    body.append(linkRow);

    // Action buttons
    const actions = doc.createElement('div');
    actions.className = 'al-qf-actions';

    const copyBtn = doc.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'al-qf-btn al-qf-btn-primary';
    copyBtn.textContent = '📋 Copier lien rapide';
    copyBtn.onclick = async () => {
      const targetUrl = urlInput.value || generatedUrl;
      try {
        await navigator.clipboard.writeText(targetUrl);
        setFrameStatus(
          (affiliate?.cleanTrackingId?.(tagInput.value) || activeTag)
            ? '✅ Lien affilié rapide copié !'
            : '✅ Lien propre copié (sans tag).',
          'is-ok'
        );
      } catch {
        urlInput.select();
        setFrameStatus('Sélectionné : Ctrl+C pour copier.', 'is-err');
      }
    };
    actions.append(copyBtn);

    if (siteStripe?.present && siteStripe.canTriggerGetLink) {
      const ssBtn = doc.createElement('button');
      ssBtn.type = 'button';
      ssBtn.className = 'al-qf-btn al-qf-btn-ss';
      ssBtn.textContent = '⚡ SiteStripe court';
      ssBtn.title = 'Ouvrir SiteStripe et générer le lien court amzn.to';
      ssBtn.onclick = async () => {
        setFrameStatus('Ouverture SiteStripe…');
        const res = await triggerSiteStripeShortLink(doc);
        setFrameStatus(res.message, res.ok ? 'is-ok' : 'is-err');
      };
      actions.append(ssBtn);
    }

    if (isProductPage && typeof onShareDiscord === 'function') {
      const discordBtn = doc.createElement('button');
      discordBtn.type = 'button';
      discordBtn.className = 'al-qf-btn al-qf-btn-discord';
      discordBtn.textContent = '📢 Discord';
      discordBtn.onclick = async () => {
        setFrameStatus('Envoi vers Discord…');
        const res = await onShareDiscord(urlInput.value || generatedUrl);
        setFrameStatus(
          res?.ok ? '✅ Partagé sur Discord !' : `❌ ${res?.error || 'Échec Discord'}`,
          res?.ok ? 'is-ok' : 'is-err'
        );
      };
      actions.append(discordBtn);
    }

    body.append(actions, statusLine);
    frame.append(body);
    setupStackDragging(stack, header, onSavePosition);
    syncStackPosition();
    return frame;
  }

  globalThis.ALQuickFrame = Object.freeze({
    STACK_ID,
    FRAME_ID,
    clampPosition,
    ensureFloatingStack,
    triggerSiteStripeShortLink,
    renderQuickFrame
  });
})();
