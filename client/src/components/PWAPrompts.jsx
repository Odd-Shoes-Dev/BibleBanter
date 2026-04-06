import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Handles PWA install banner (Add-to-Home-Screen).
 * SW updates are handled silently via autoUpdate.
 */
export default function PWAPrompts() {
  // ── Silent SW auto-update ──────────────────────────────────────────────────
  useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      if (registration) {
        setInterval(() => registration.update(), 60 * 60 * 1000);
      }
    },
  });

  // ── Install prompt ──────────────────────────────────────────────────────────
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setInstallPrompt(null);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (!showInstallBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-md rounded-xl bg-navy/95 backdrop-blur-sm border border-gold/30 p-4 shadow-2xl flex items-center gap-3">
      <div className="flex-1">
        <p className="text-sm font-bold text-white font-body">Install Bible Banter</p>
        <p className="text-xs text-white/60 font-body">Add to your home screen for the best experience</p>
      </div>
      <button
        onClick={handleInstall}
        className="px-4 py-1.5 rounded-lg bg-gold text-navy font-bold text-sm hover:bg-gold-light transition-colors"
      >
        Install
      </button>
      <button
        onClick={() => setShowInstallBanner(false)}
        className="text-white/50 hover:text-white text-lg leading-none"
        aria-label="Dismiss"
      >
        &times;
      </button>
    </div>
  );
}
