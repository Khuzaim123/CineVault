/**
 * useDevProtection.js
 * Disables right-click and common DevTools keyboard shortcuts globally.
 * Attach once at the app root via the useDevProtection() hook.
 *
 * NOTE: This is a UX-layer deterrent, not a security mechanism.
 * Determined users can always bypass client-side protections.
 */
import { useEffect } from 'react';

export const useDevProtection = () => {
  useEffect(() => {
    // ── Guard: skip entirely when running inside an iframe ───────────────────
    // The mobile preview uses an iframe — outerWidth/innerWidth differ greatly
    // from the iframe's own viewport, causing false DevTools detection.
    if (window.self !== window.top) return;

    const noContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', noContextMenu);

    // ── 2. Block common DevTools keyboard shortcuts ─────────────────────────
    const noDevKeys = (e) => {
      // F12
      if (e.key === 'F12') { e.preventDefault(); return; }

      const ctrl  = e.ctrlKey  || e.metaKey;
      const shift = e.shiftKey;

      // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (inspect / console / elements)
      if (ctrl && shift && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) {
        e.preventDefault();
        return;
      }
      // Ctrl+U (view source)
      if (ctrl && ['U', 'u'].includes(e.key)) { e.preventDefault(); return; }
      // Ctrl+S (save page)
      if (ctrl && ['S', 's'].includes(e.key)) { e.preventDefault(); return; }
    };
    document.addEventListener('keydown', noDevKeys);

    // ── 3. Disable text selection on non-input elements (optional UX guard) ─
    const noSelect = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      // Only block if it's a triple-click or drag-select that looks like source inspection
    };

    // ── 4. Detect DevTools open via window size change (best-effort) ─────────
    // Shows a warning overlay when DevTools is likely open
    let devToolsOpen = false;
    const THRESHOLD = 160;

    const checkDevTools = () => {
      const widthDiff  = window.outerWidth  - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      const isOpen = widthDiff > THRESHOLD || heightDiff > THRESHOLD;

      if (isOpen && !devToolsOpen) {
        devToolsOpen = true;
        // Show warning overlay
        const overlay = document.createElement('div');
        overlay.id = '__devtools-warning__';
        overlay.style.cssText = `
          position:fixed;inset:0;z-index:99999;
          background:rgba(7,8,15,0.97);
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          backdrop-filter:blur(20px);
        `;
        overlay.innerHTML = `
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style="margin-bottom:20px">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              stroke="#E8B84B" stroke-width="2" stroke-linejoin="round"/>
            <path d="M12 9v4M12 17h.01" stroke="#E8B84B" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <h2 style="font-family:sans-serif;color:#F0EDE8;font-size:22px;font-weight:700;margin:0 0 8px">
            Developer Tools Detected
          </h2>
          <p style="font-family:sans-serif;color:#6B6875;font-size:14px;text-align:center;max-width:320px;margin:0">
            Please close DevTools to continue using CineVault.
          </p>
        `;
        document.body.appendChild(overlay);
      } else if (!isOpen && devToolsOpen) {
        devToolsOpen = false;
        const overlay = document.getElementById('__devtools-warning__');
        if (overlay) overlay.remove();
      }
    };

    const resizeObserver = new ResizeObserver(checkDevTools);
    resizeObserver.observe(document.documentElement);
    window.addEventListener('resize', checkDevTools);
    checkDevTools();

    return () => {
      document.removeEventListener('contextmenu', noContextMenu);
      document.removeEventListener('keydown', noDevKeys);
      window.removeEventListener('resize', checkDevTools);
      resizeObserver.disconnect();
    };
  }, []);
};
