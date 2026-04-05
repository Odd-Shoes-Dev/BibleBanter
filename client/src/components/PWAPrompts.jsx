import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Handles two PWA UX flows:
 * 1. "New version available" — prompt to reload when SW updates
 * 2. "Install app" — beforeinstallprompt banner for Add-to-Home-Screen
 */
export default function PWAPrompts() {
  // ── SW update prompt ────────────────────────────────────────────────────────
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      // Check for updates every 60 minutes
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
  return (
    <>
      {/* Update available toast */}
      {needRefresh && (
        <div className="fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-md rounded-xl bg-navy/95 backdrop-blur-sm border border-gold/30 p-4 shadow-2xl flex items-center gap-3">
          <div className="flex-1 text-sm text-white/90 font-body">
            A new version is available!
          </div>
          <button
            onClick={() => updateServiceWorker(true)}
            className="px-4 py-1.5 rounded-lg bg-gold text-navy font-bold text-sm hover:bg-gold-light transition-colors"
          >
            Update
          </button>
          <button
            onClick={() => setNeedRefresh(false)}
            className="text-white/50 hover:text-white text-lg leading-none"
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      )}

      {/* Install app banner */}
      {showInstallBanner && (
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
      )}
    </>
  );
}
