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
  max-width: 270px !important;
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
  max-width: 270px !important;
}
#${FRAME_ID} {
  width: 260px !important;
  max-width: calc(100vw - 32px) !important;
  background: #ffffff !important;
  border: 2px solid #0f172a !important;
  border-radius: 12px !important;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.2) !important;
  padding: 8px 10px !important;
  font: 11.5px/1.35 system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  color: #0f172a !important;
  box-sizing: border-box !important;
  text-align: left !important;
  transition: width 0.22s cubic-bezier(0.16, 1, 0.3, 1), padding 0.22s ease, border-radius 0.22s ease, box-shadow 0.22s ease !important;
}
#${FRAME_ID}.al-collapsed {
  width: 40px !important;
  height: 40px !important;
  min-width: 0 !important;
  border-radius: 50% !important;
  padding: 0 !important;
  background: #ffffff !important;
  border: 2px solid #0284c7 !important;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.18) !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  overflow: hidden !important;
  transition: width 0.22s cubic-bezier(0.16, 1, 0.3, 1), height 0.22s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.22s ease, padding 0.22s ease, box-shadow 0.22s ease !important;
}
#${FRAME_ID}.al-collapsed:not(:hover):not(:focus-within) {
  width: 40px !important;
  height: 40px !important;
  border-radius: 50% !important;
  padding: 0 !important;
  overflow: hidden !important;
}
#${FRAME_ID}.al-collapsed:not(:hover):not(:focus-within) .al-qf-header {
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  justify-content: center !important;
  align-items: center !important;
}
#${FRAME_ID}.al-collapsed:not(:hover):not(:focus-within) .al-qf-title-group {
  width: 100% !important;
  height: 100% !important;
  justify-content: center !important;
  align-items: center !important;
}
#${FRAME_ID}.al-collapsed:not(:hover):not(:focus-within) .al-qf-country {
  font-size: 20px !important;
  line-height: 1 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
#${FRAME_ID}.al-collapsed:not(:hover):not(:focus-within) .al-qf-body,
#${FRAME_ID}.al-collapsed:not(:hover):not(:focus-within) .al-qf-controls,
#${FRAME_ID}.al-collapsed:not(:hover):not(:focus-within) .al-qf-pill,
#${FRAME_ID}.al-collapsed:not(:hover):not(:focus-within) .al-qf-name-full,
#${FRAME_ID}.al-collapsed:not(:hover):not(:focus-within) .al-qf-name-short,
#${FRAME_ID}.al-collapsed:not(:hover):not(:focus-within) .al-qf-mini-hint {
  display: none !important;
}
#${FRAME_ID}.al-collapsed:hover,
#${FRAME_ID}.al-collapsed:focus-within {
  width: 260px !important;
  height: auto !important;
  padding: 8px 10px !important;
  border-radius: 12px !important;
  border: 2px solid #0f172a !important;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.25) !important;
  cursor: default !important;
  display: block !important;
  overflow: visible !important;
}
#${FRAME_ID}.al-collapsed:hover .al-qf-header,
#${FRAME_ID}.al-collapsed:focus-within .al-qf-header {
  width: auto !important;
  height: auto !important;
  justify-content: space-between !important;
}
#${FRAME_ID}.al-collapsed:hover .al-qf-title-group,
#${FRAME_ID}.al-collapsed:focus-within .al-qf-title-group {
  width: auto !important;
  height: auto !important;
  justify-content: flex-start !important;
}
#${FRAME_ID}.al-collapsed:hover .al-qf-country,
#${FRAME_ID}.al-collapsed:focus-within .al-qf-country {
  font-size: 13px !important;
}
#${FRAME_ID}.al-collapsed:hover .al-qf-name-full,
#${FRAME_ID}.al-collapsed:focus-within .al-qf-name-full {
  display: inline !important;
}
#${FRAME_ID}.al-collapsed:hover .al-qf-body,
#${FRAME_ID}.al-collapsed:focus-within .al-qf-body {
  display: flex !important;
  animation: alFadeIn 0.2s ease-out !important;
}
#${FRAME_ID}.al-collapsed:hover .al-qf-controls,
#${FRAME_ID}.al-collapsed:focus-within .al-qf-controls {
  display: flex !important;
}
#${FRAME_ID}.al-collapsed:hover .al-qf-pill,
#${FRAME_ID}.al-collapsed:focus-within .al-qf-pill {
  display: inline-block !important;
}
@keyframes alFadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
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
  margin-top: 6px !important;
  padding-top: 6px !important;
  border-top: 1px solid #e2e8f0 !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 5px !important;
}
#${FRAME_ID}.al-collapsed .al-qf-body {
  display: none !important;
}
#${FRAME_ID} .al-qf-meta {
  display: flex !important;
  align-items: center !important;
  flex-wrap: wrap !important;
  gap: 4px !important;
  font-size: 11px !important;
  color: #475569 !important;
}
#${FRAME_ID} .al-qf-row {
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
}
#${FRAME_ID} .al-qf-label {
  font-size: 10.5px !important;
  font-weight: 600 !important;
  color: #475569 !important;
  min-width: 26px !important;
}
#${FRAME_ID} .al-qf-input {
  flex: 1 !important;
  min-width: 0 !important;
  padding: 3px 6px !important;
  font: 11px/1.25 monospace !important;
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
  font-size: 10px !important;
  color: #64748b !important;
}
#${FRAME_ID} .al-qf-actions {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 4px !important;
}
#${FRAME_ID} .al-qf-btn {
  flex: 1 1 auto !important;
  cursor: pointer !important;
  border: 1px solid #cbd5e1 !important;
  background: #ffffff !important;
  color: #0f172a !important;
  border-radius: 6px !important;
  padding: 4px 6px !important;
  font: 600 11px/1.25 system-ui, sans-serif !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 3px !important;
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
#${FRAME_ID} .al-qf-btn-telegram {
  background: #229ED9 !important;
  color: #ffffff !important;
  border-color: #1c8ec4 !important;
}
#${FRAME_ID} .al-qf-btn-telegram:hover {
  background: #1c8ec4 !important;
}
#${FRAME_ID} .al-qf-btn-github {
  background: #24292f !important;
  color: #ffffff !important;
  border-color: #1b1f24 !important;
}
#${FRAME_ID} .al-qf-btn-github:hover {
  background: #1b1f24 !important;
}
#${FRAME_ID} .al-qf-btn-keepa {
  background: #0284c7 !important;
  color: #ffffff !important;
  border-color: #0369a1 !important;
}
#${FRAME_ID} .al-qf-btn-keepa:hover {
  background: #0369a1 !important;
}
#${FRAME_ID} .al-qf-keepa-chart {
  margin-top: 5px !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 6px !important;
  overflow: hidden !important;
  background: #ffffff !important;
}
#${FRAME_ID} .al-qf-keepa-chart img {
  width: 100% !important;
  height: auto !important;
  display: block !important;
  cursor: pointer !important;
}
#${FRAME_ID} .al-qf-btn-collector {
  flex: 1 1 100% !important;
  background: #f8fafc !important;
  color: #334155 !important;
  border-color: #cbd5e1 !important;
  margin-top: 2px !important;
}
#${FRAME_ID} .al-qf-btn-collector:hover {
  background: #f1f5f9 !important;
  border-color: #94a3b8 !important;
}
#${FRAME_ID} .al-qf-seller-box {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 8px !important;
  padding: 5px 7px !important;
  font-size: 11px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 2px !important;
}
#${FRAME_ID} .al-qf-seller-header {
  display: flex !important;
  align-items: center !important;
  gap: 5px !important;
  font-weight: 600 !important;
  color: #1e293b !important;
  font-size: 11px !important;
}
#${FRAME_ID} .al-qf-badge-kind {
  display: inline-block !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  padding: 1px 6px !important;
  border-radius: 4px !important;
}
#${FRAME_ID} .al-badge-amazon { background: #d1fae5 !important; color: #065f46 !important; border: 1px solid #10b981 !important; }
#${FRAME_ID} .al-badge-fba { background: #e0f2fe !important; color: #0369a1 !important; border: 1px solid #0ea5e9 !important; }
#${FRAME_ID} .al-badge-fbm { background: #fef3c7 !important; color: #92400e !important; border: 1px solid #f59e0b !important; }
#${FRAME_ID} .al-badge-unknown { background: #f1f5f9 !important; color: #475569 !important; border: 1px solid #94a3b8 !important; }
#${FRAME_ID} .al-qf-seller-row {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 4px 8px !important;
  color: #334155 !important;
  font-size: 11.5px !important;
}
#${FRAME_ID} .al-qf-lock-alert {
  padding: 6px 8px !important;
  background: #fef2f2 !important;
  border: 1px solid #fca5a5 !important;
  border-radius: 6px !important;
  color: #991b1b !important;
  font-size: 11px !important;
  line-height: 1.35 !important;
}
#${FRAME_ID} .al-qf-lock-alert strong {
  color: #b91c1c !important;
  display: block !important;
  margin-bottom: 2px !important;
}
#${FRAME_ID} .al-qf-lock-alert .al-lock-quote {
  font-style: italic !important;
  color: #b91c1c !important;
  margin-top: 2px !important;
  display: block !important;
}
#${FRAME_ID} .al-qf-origin-alert {
  padding: 5px 8px !important;
  background: #e0f2fe !important;
  border: 1px solid #7dd3fc !important;
  border-radius: 6px !important;
  font-size: 11px !important;
  color: #0369a1 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}
#${FRAME_ID} .al-qf-origin-alert a {
  color: #0284c7 !important;
  font-weight: 600 !important;
  text-decoration: underline !important;
}
#${FRAME_ID} .al-qf-status {
  font-size: 11px !important;
  min-height: 15px !important;
  color: #0369a1 !important;
  font-weight: 500 !important;
}
#${FRAME_ID} .al-qf-status.is-ok { color: #15803d !important; }
#${FRAME_ID} .al-qf-status.is-err { color: #b91c1c !important; }

#al-keepa-overlay {
  position: fixed !important;
  inset: 0 !important;
  background: rgba(15, 23, 42, 0.72) !important;
  backdrop-filter: blur(4px) !important;
  -webkit-backdrop-filter: blur(4px) !important;
  z-index: 2147483647 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 16px !important;
  box-sizing: border-box !important;
  opacity: 1 !important;
  animation: alFadeIn 0.18s ease-out !important;
}
@keyframes alFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
#al-keepa-modal {
  background: #ffffff !important;
  border-radius: 12px !important;
  width: 95vw !important;
  max-width: 1400px !important;
  height: 92vh !important;
  max-height: 94vh !important;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.5) !important;
  border: 1px solid rgba(226, 232, 240, 0.8) !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
  color: #0f172a !important;
  box-sizing: border-box !important;
  text-align: left !important;
}
.al-km-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 8px 16px !important;
  background: #f8fafc !important;
  border-bottom: 1px solid #e2e8f0 !important;
  flex-shrink: 0 !important;
}
.al-km-title-row {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  flex-wrap: wrap !important;
}
.al-km-header-right {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
}
.al-km-zoom-group {
  display: flex !important;
  align-items: center !important;
  background: #e2e8f0 !important;
  border-radius: 6px !important;
  padding: 1px !important;
  gap: 2px !important;
}
.al-km-btn-zoom {
  background: transparent !important;
  border: none !important;
  width: 22px !important;
  height: 22px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  color: #334155 !important;
  border-radius: 4px !important;
  line-height: 1 !important;
  padding: 0 !important;
}
.al-km-btn-zoom:hover {
  background: #cbd5e1 !important;
  color: #0f172a !important;
}
.al-km-zoom-label {
  font-size: 11px !important;
  font-weight: 600 !important;
  color: #1e293b !important;
  padding: 0 4px !important;
  min-width: 32px !important;
  text-align: center !important;
  cursor: pointer !important;
  user-select: none !important;
}
.al-km-title {
  font-size: 14px !important;
  font-weight: 700 !important;
  color: #0f172a !important;
}
.al-km-badge {
  font-size: 11px !important;
  padding: 2px 8px !important;
  border-radius: 999px !important;
  background: #e2e8f0 !important;
  color: #334155 !important;
  font-weight: 600 !important;
}
.al-km-badge-country {
  background: #dbeafe !important;
  color: #1d4ed8 !important;
}
.al-km-close {
  background: #e2e8f0 !important;
  border: none !important;
  color: #475569 !important;
  width: 28px !important;
  height: 28px !important;
  border-radius: 6px !important;
  cursor: pointer !important;
  font-size: 16px !important;
  line-height: 1 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: background 0.15s ease, color 0.15s ease !important;
}
.al-km-close:hover {
  background: #fee2e2 !important;
  color: #b91c1c !important;
}
.al-km-body {
  padding: 0 !important;
  margin: 0 !important;
  background: #ffffff !important;
  display: flex !important;
  flex: 1 1 auto !important;
  width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
  position: relative !important;
  overflow: hidden !important;
}
.al-km-iframe {
  width: 100% !important;
  height: 100% !important;
  border: none !important;
  display: block !important;
  flex: 1 1 auto !important;
  background: #ffffff !important;
}
.al-km-loading-spinner {
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  background: rgba(15, 23, 42, 0.8) !important;
  color: #ffffff !important;
  padding: 8px 16px !important;
  border-radius: 8px !important;
  font-size: 12px !important;
  pointer-events: none !important;
  display: none !important;
  z-index: 10 !important;
}
.al-km-footer {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 6px 16px !important;
  background: #f8fafc !important;
  border-top: 1px solid #e2e8f0 !important;
  font-size: 11.5px !important;
  color: #64748b !important;
  flex-shrink: 0 !important;
}
.al-km-footer-actions {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}
.al-km-btn-ext {
  padding: 4px 10px !important;
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 6px !important;
  color: #334155 !important;
  font-size: 11.5px !important;
  cursor: pointer !important;
  text-decoration: none !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
}
.al-km-btn-ext:hover {
  background: #f1f5f9 !important;
  border-color: #94a3b8 !important;
}
.al-km-btn-dismiss {
  padding: 4px 12px !important;
  background: #0f172a !important;
  color: #ffffff !important;
  border: 1px solid #0f172a !important;
  border-radius: 6px !important;
  font-size: 11.5px !important;
  cursor: pointer !important;
  font-weight: 500 !important;
}
.al-km-btn-dismiss:hover {
  background: #1e293b !important;
}
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
      const v = sessionStorage.getItem(COLLAPSE_STORAGE_KEY);
      if (v === null) return true;
      return v === '1';
    } catch {
      return true;
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
      : { width: 260, height: 180 };
    const clamped = clampPosition(
      pos.left,
      pos.top,
      rect.width || 260,
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
      originRedirect = null,
      product = null,
      visible = true,
      position = null,
      onSaveTag,
      onSavePosition,
      onShareDiscord,
      onShareTelegram,
      onShareGitHub,
      onOpenCollector
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
      price: product?.formattedPrice || product?.price || '',
      discountRate: product?.discountRate || '',
      referencePrice: product?.referencePrice || '',
      newPrice: product?.newPrice || '',
      ean: product?.ean || '',
      logCode: logistics?.code || '',
      logKind: logistics?.kind || '',
      seller: logistics?.seller || '',
      ship: logistics?.ship || '',
      locked: Boolean(shippingRestriction?.blocked),
      origin: originRedirect?.cleanUrl || '',
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
    countrySpan.innerHTML = `<span>${country.flag}</span> <span class="al-qf-name-short">${country.code}</span><span class="al-qf-name-full">Amazon ${country.code}</span>`;
    titleGroup.append(countrySpan);

    const miniHint = doc.createElement('span');
    miniHint.className = 'al-qf-mini-hint';
    miniHint.textContent = '⚡';
    miniHint.title = 'Survolez pour afficher les outils et liens';
    titleGroup.append(miniHint);

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
    toggleBtn.title = collapsed ? 'Épingler le cadre ouvert' : 'Réduire en mode discret (dépliage au survol)';
    toggleBtn.setAttribute('aria-label', toggleBtn.title);
    toggleBtn.textContent = collapsed ? '📌' : '−';
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

    // 1. Redirection d'origine (si présente)
    if (originRedirect) {
      const originBox = doc.createElement('div');
      originBox.className = 'al-qf-origin-alert';
      originBox.innerHTML = `
        <span>${originRedirect.flag} <strong>Lien initial Amazon ${originRedirect.name}</strong></span>
        <a href="${originRedirect.cleanUrl}" target="_blank" rel="noopener noreferrer">↗ Ouvrir</a>
      `;
      body.append(originBox);
    }

    // 2. LOCK pays (si bloqué)
    if (shippingRestriction?.blocked) {
      const lockBox = doc.createElement('div');
      lockBox.className = 'al-qf-lock-alert';
      lockBox.innerHTML = `
        <strong>🔒 ${shippingRestriction.title || 'LOCK pays'}</strong>
        <span>${shippingRestriction.explanation || 'Livraison restreinte sur cette adresse.'}</span>
        ${shippingRestriction.detectedMessage ? `<span class="al-lock-quote">« ${shippingRestriction.detectedMessage} »</span>` : ''}
      `;
      body.append(lockBox);
    }

    // 3. Fiche & Vendeur
    if (isProductPage && logistics) {
      const sellerBox = doc.createElement('div');
      sellerBox.className = 'al-qf-seller-box';

      const sellerHeader = doc.createElement('div');
      sellerHeader.className = 'al-qf-seller-header';
      const kindClass = `al-badge-${logistics.kind || 'unknown'}`;
      sellerHeader.innerHTML = `
        <span class="al-qf-badge-kind ${kindClass}">[${logistics.code || 'À VÉRIFIER'}]</span>
        <strong>${logistics.label || 'Vendeur / expéditeur'}</strong>
      `;

      const sellerDetails = doc.createElement('div');
      sellerDetails.className = 'al-qf-seller-row';
      sellerDetails.innerHTML = `
        <span><strong>Vendeur :</strong> ${logistics.seller || 'Non identifié'}</span>
        <span style="color:#cbd5e1;">·</span>
        <span><strong>Expéditeur :</strong> ${logistics.ship || 'Non identifié'}</span>
      `;

      sellerBox.append(sellerHeader, sellerDetails);
      body.append(sellerBox);
    }

    if (isProductPage && (product?.asin || product?.price || siteStripe?.category || product?.ean)) {
      const meta = doc.createElement('div');
      meta.className = 'al-qf-meta';

      let hasPrev = false;
      const addSep = () => {
        if (hasPrev) meta.append(doc.createTextNode(' · '));
        hasPrev = true;
      };

      if (product?.asin) {
        addSep();
        const s = doc.createElement('span');
        s.textContent = `ASIN: ${product.asin}`;
        meta.append(s);
      }
      if (product?.ean) {
        addSep();
        const a = doc.createElement('a');
        a.href = `https://www.barcodelookup.com/${product.ean}`;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = `EAN: ${product.ean} ↗`;
        a.title = 'Rechercher les informations du produit sur BarcodeLookup';
        a.style.color = '#0284c7';
        a.style.textDecoration = 'underline';
        meta.append(a);
      }
      const displayPrice = product?.formattedPrice || (globalThis.ALPricing?.formatEnrichedPrice ? globalThis.ALPricing.formatEnrichedPrice(product) : product?.price);
      if (displayPrice) {
        addSep();
        const s = doc.createElement('span');
        s.textContent = `Prix: ${displayPrice}`;
        meta.append(s);
      }
      if (siteStripe?.category) {
        addSep();
        const s = doc.createElement('span');
        s.textContent = `Cat.: ${siteStripe.category}`;
        meta.append(s);
      }
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

    if (isProductPage && typeof onShareTelegram === 'function') {
      const telegramBtn = doc.createElement('button');
      telegramBtn.type = 'button';
      telegramBtn.className = 'al-qf-btn al-qf-btn-telegram';
      telegramBtn.textContent = '✈️ Telegram';
      telegramBtn.title = 'Partager cette offre sur votre canal Telegram';
      telegramBtn.onclick = async () => {
        setFrameStatus('Envoi vers Telegram…');
        const res = await onShareTelegram(urlInput.value || generatedUrl);
        setFrameStatus(
          res?.ok ? '✅ Partagé sur Telegram !' : `❌ ${res?.error || 'Échec Telegram'}`,
          res?.ok ? 'is-ok' : 'is-err'
        );
      };
      actions.append(telegramBtn);
    }

    if (isProductPage && typeof onShareGitHub === 'function') {
      const githubBtn = doc.createElement('button');
      githubBtn.type = 'button';
      githubBtn.className = 'al-qf-btn al-qf-btn-github';
      githubBtn.textContent = '🐙 GitHub';
      githubBtn.title = 'Sauvegarder la capture sur GitHub';
      githubBtn.onclick = async () => {
        setFrameStatus('Lancement du partage GitHub…');
        const res = await onShareGitHub();
        setFrameStatus(
          res?.ok ? '✅ Capture envoyée vers GitHub !' : `❌ ${res?.error || 'Erreur GitHub'}`,
          res?.ok ? 'is-ok' : 'is-err'
        );
      };
      actions.append(githubBtn);
    }

    if (isProductPage && product?.asin) {
      const keepaBtn = doc.createElement('button');
      keepaBtn.type = 'button';
      keepaBtn.className = 'al-qf-btn al-qf-btn-keepa';
      keepaBtn.textContent = '📊 Keepa (Surimpression)';
      keepaBtn.title = 'Afficher l\'historique et les statistiques Keepa en surimpression sans quitter Amazon';
      keepaBtn.onclick = () => {
        openKeepaOverlay(doc, { asin: product.asin, country, product });
      };
      actions.append(keepaBtn);
    }

    if (typeof onOpenCollector === 'function') {
      const collectorBtn = doc.createElement('button');
      collectorBtn.type = 'button';
      collectorBtn.className = 'al-qf-btn al-qf-btn-collector';
      collectorBtn.textContent = '📚 Collecteur complet';
      collectorBtn.title = 'Ouvrir la bibliothèque et le collecteur avancé';
      collectorBtn.onclick = () => {
        onOpenCollector();
      };
      actions.append(collectorBtn);
    }

    if (isProductPage && product?.asin) {
      const chartDomain = (country?.tld || '').replace(/^\./, '').toLowerCase() || 'fr';
      const chartUrl = `https://graph.keepa.com/pricehistory.png?asin=${product.asin}&domain=${chartDomain}&amazon=1&new=1&used=1&range=90`;

      const chartToggleBtn = doc.createElement('button');
      chartToggleBtn.type = 'button';
      chartToggleBtn.className = 'al-qf-btn';
      chartToggleBtn.style.cssText = 'font-size:11px!important;padding:4px 8px!important;margin-top:4px!important;background:#f8fafc!important;width:100%!important;';
      chartToggleBtn.textContent = '📈 Afficher aperçu rapide (90j)';

      const chartBox = doc.createElement('div');
      chartBox.className = 'al-qf-keepa-chart';
      chartBox.style.display = 'none';

      chartToggleBtn.onclick = () => {
        if (chartBox.style.display === 'none') {
          chartBox.style.display = 'block';
          if (!chartBox.hasChildNodes()) {
            const img = doc.createElement('img');
            img.src = chartUrl;
            img.alt = 'Historique des prix Keepa (Amazon, Neuf, Occasion)';
            img.title = 'Cliquez pour ouvrir la vue surimpression agrandie';
            img.onclick = () => {
              openKeepaOverlay(doc, { asin: product.asin, country, product });
            };
            chartBox.append(img);
          }
          chartToggleBtn.textContent = '📉 Masquer aperçu rapide';
        } else {
          chartBox.style.display = 'none';
          chartToggleBtn.textContent = '📈 Afficher aperçu rapide (90j)';
        }
      };
      body.append(actions, chartToggleBtn, chartBox, statusLine);
    } else {
      body.append(actions, statusLine);
    }
    frame.append(body);
    setupStackDragging(stack, header, onSavePosition);
    syncStackPosition();
    return frame;
  }

  function openKeepaOverlay(doc = document, { asin, country, product } = {}) {
    if (!doc || !asin) return;

    const existing = doc.getElementById('al-keepa-overlay');
    if (existing) {
      existing.remove();
    }

    const keepaDomains = { 'com': 1, 'co.uk': 2, 'de': 3, 'fr': 4, 'co.jp': 5, 'ca': 6, 'it': 8, 'es': 9 };
    const domainKey = (country?.tld || '').replace(/^\./, '').toLowerCase() || 'fr';
    const domainId = keepaDomains[domainKey] || 4;
    const keepaInteractiveUrl = `https://keepa.com/#!product/${domainId}-${asin}`;

    const overlay = doc.createElement('div');
    overlay.id = 'al-keepa-overlay';
    overlay.className = 'notranslate';
    overlay.setAttribute('translate', 'no');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    const modal = doc.createElement('div');
    modal.id = 'al-keepa-modal';
    modal.className = 'notranslate';
    modal.setAttribute('translate', 'no');

    const header = doc.createElement('div');
    header.className = 'al-km-header notranslate';
    header.setAttribute('translate', 'no');

    const titleRow = doc.createElement('div');
    titleRow.className = 'al-km-title-row';

    const title = doc.createElement('span');
    title.className = 'al-km-title';
    title.textContent = 'Keepa';

    const badgeAsin = doc.createElement('span');
    badgeAsin.className = 'al-km-badge';
    badgeAsin.textContent = `ASIN: ${asin}`;

    const badgeCountry = doc.createElement('span');
    badgeCountry.className = 'al-km-badge al-km-badge-country';
    badgeCountry.textContent = country?.name || domainKey.toUpperCase();

    const initialEan = product?.ean || window._lastDetectedKeepaEan || '';
    const badgeEan = doc.createElement('span');
    badgeEan.className = 'al-km-badge al-km-badge-ean';
    badgeEan.textContent = initialEan ? `EAN: ${initialEan}` : '';
    badgeEan.style.display = initialEan ? 'inline-block' : 'none';

    titleRow.append(title, badgeAsin, badgeCountry, badgeEan);

    const headerRight = doc.createElement('div');
    headerRight.className = 'al-km-header-right';

    let currentZoom = 0.9;

    const zoomGroup = doc.createElement('div');
    zoomGroup.className = 'al-km-zoom-group';

    const zoomOutBtn = doc.createElement('button');
    zoomOutBtn.type = 'button';
    zoomOutBtn.className = 'al-km-btn-zoom';
    zoomOutBtn.textContent = '−';
    zoomOutBtn.title = 'Dézoomer (réduire la taille)';

    const zoomLabel = doc.createElement('span');
    zoomLabel.className = 'al-km-zoom-label';
    zoomLabel.textContent = '90%';
    zoomLabel.title = 'Zoom actuel (clic pour réinitialiser à 90%)';

    const zoomInBtn = doc.createElement('button');
    zoomInBtn.type = 'button';
    zoomInBtn.className = 'al-km-btn-zoom';
    zoomInBtn.textContent = '+';
    zoomInBtn.title = 'Zoomer (agrandir la taille)';

    function setZoom(val) {
      currentZoom = Math.round(Math.max(0.5, Math.min(1.5, val)) * 100) / 100;
      zoomLabel.textContent = `${Math.round(currentZoom * 100)}%`;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'KEEPA_SET_ZOOM', zoom: currentZoom }, '*');
      }
    }

    zoomOutBtn.onclick = () => setZoom(currentZoom - 0.05);
    zoomInBtn.onclick = () => setZoom(currentZoom + 0.05);
    zoomLabel.onclick = () => setZoom(0.9);

    zoomGroup.append(zoomOutBtn, zoomLabel, zoomInBtn);

    const extLink = doc.createElement('a');
    extLink.className = 'al-km-btn-ext';
    extLink.href = keepaInteractiveUrl;
    extLink.target = '_blank';
    extLink.rel = 'noopener noreferrer';
    extLink.textContent = 'Ouvrir sur Keepa.com ↗';
    extLink.title = 'Consulter dans un onglet séparé si besoin';

    const closeBtn = doc.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'al-km-close';
    closeBtn.textContent = '✕';
    closeBtn.title = 'Fermer (Échap)';

    headerRight.append(zoomGroup, extLink, closeBtn);
    header.append(titleRow, headerRight);

    const body = doc.createElement('div');
    body.className = 'al-km-body notranslate';
    body.setAttribute('translate', 'no');

    const iframe = doc.createElement('iframe');
    iframe.className = 'al-km-iframe notranslate';
    iframe.setAttribute('translate', 'no');
    iframe.src = keepaInteractiveUrl;
    iframe.setAttribute('allow', 'clipboard-read; clipboard-write');

    const spinner = doc.createElement('div');
    spinner.className = 'al-km-loading-spinner';
    spinner.textContent = 'Chargement de Keepa...';
    spinner.style.display = 'block';

    body.append(iframe, spinner);

    iframe.onload = () => {
      spinner.style.display = 'none';
    };

    const footer = doc.createElement('div');
    footer.className = 'al-km-footer notranslate';
    footer.setAttribute('translate', 'no');

    const footerHint = doc.createElement('span');
    footerHint.textContent = 'Navigation Keepa interactive en direct — vous ne quittez pas votre page Amazon';

    const footerActions = doc.createElement('div');
    footerActions.className = 'al-km-footer-actions';

    const dismissBtn = doc.createElement('button');
    dismissBtn.type = 'button';
    dismissBtn.className = 'al-km-btn-dismiss';
    dismissBtn.textContent = 'Fermer';

    footerActions.append(dismissBtn);
    footer.append(footerHint, footerActions);

    modal.append(header, body, footer);
    overlay.append(modal);

    function onKeepaMessage(e) {
      if (e?.data && e.data.type === 'KEEPA_DETECTED_EAN' && e.data.ean) {
        badgeEan.textContent = `EAN: ${e.data.ean}`;
        badgeEan.style.display = 'inline-block';
        if (product) product.ean = e.data.ean;
      }
    }
    if (typeof window.addEventListener === 'function') {
      window.addEventListener('message', onKeepaMessage);
    }

    function closeModal() {
      if (typeof window.removeEventListener === 'function') {
        window.removeEventListener('message', onKeepaMessage);
      }
      if (typeof doc.removeEventListener === 'function') {
        doc.removeEventListener('keydown', onKeyDown);
      }
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 160);
    }

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        closeModal();
      }
    }

    closeBtn.onclick = closeModal;
    dismissBtn.onclick = closeModal;
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    };
    if (typeof doc.addEventListener === 'function') {
      doc.addEventListener('keydown', onKeyDown);
    }

    (doc.body || doc.documentElement).append(overlay);
  }

  globalThis.ALQuickFrame = Object.freeze({
    STACK_ID,
    FRAME_ID,
    clampPosition,
    ensureFloatingStack,
    triggerSiteStripeShortLink,
    openKeepaOverlay,
    renderQuickFrame
  });
})();
