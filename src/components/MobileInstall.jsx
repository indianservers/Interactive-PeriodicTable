import { useEffect, useState } from 'react';
import { Download, Share, Smartphone, X, ChevronDown } from 'lucide-react';
import './mobileInstall.css';

const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true;
const isAppleMobile = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const dismissalKey = 'cu-mobile-install-dismissed';

export default function MobileInstall({ canInstall, onInstall }) {
  const [installed, setInstalled] = useState(isStandalone);
  const [dismissed, setDismissed] = useState(() => {
    try { return Date.now() - Number(localStorage.getItem(dismissalKey) || 0) < 7 * 86400000; } catch { return false; }
  });
  const [instructions, setInstructions] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const apple = isAppleMobile();
  useEffect(() => {
    const display = window.matchMedia('(display-mode: standalone)');
    const sync = () => setInstalled(isStandalone());
    const complete = () => setInstalled(true);
    display.addEventListener('change', sync);
    window.addEventListener('appinstalled', complete);
    return () => { display.removeEventListener('change', sync); window.removeEventListener('appinstalled', complete); };
  }, []);
  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(dismissalKey, String(Date.now())); } catch { /* Private browsing can disable storage. */ }
  };
  const install = async () => {
    if (!canInstall || !onInstall) { setInstructions(value => !value); return; }
    setBusy(true);
    setMessage('');
    try { await onInstall(); }
    catch { setInstructions(true); setMessage('Use your browser menu to add a home-screen shortcut.'); }
    finally { setBusy(false); }
  };
  if (installed) return null;
  return <aside className={`mobile-install ${dismissed ? 'mobile-install-compact' : ''}`} aria-label="Install Chemistry Universe on your mobile">
    {dismissed ? <button className="mobile-install-reopen" onClick={() => {setDismissed(false);setInstructions(true);}}><Smartphone size={16}/> Add a home-screen shortcut <ChevronDown size={14}/></button> : <>
      <div className="mobile-install-main"><img src="/icons/chemistry-192.png" alt="" width="48" height="48"/><div><span>CHEMISTRY, ONE TAP AWAY</span><h2>Keep discovery in your pocket.</h2><p>Add Chemistry Universe to your home screen for quick launch.</p></div><button className="mobile-install-dismiss" aria-label="Dismiss install suggestion for seven days" onClick={dismiss}><X size={17}/></button></div>
      <div className="mobile-install-actions"><button onClick={install} disabled={busy} aria-expanded={!canInstall ? instructions : undefined} aria-controls={!canInstall ? 'mobile-install-steps' : undefined}><Download size={16}/>{busy ? 'Opening installer…' : canInstall ? 'Install on mobile' : 'Add to Home Screen'}</button><span>No app store needed</span></div>
      {instructions && <div className="mobile-install-steps" id="mobile-install-steps"><h3>{apple ? 'Add to your iPhone or iPad' : 'Create your quick-launch shortcut'}</h3>{apple ? <ol><li>Open this website in Safari.</li><li>Tap <Share size={13}/> <b>Share</b> in the browser menu.</li><li>Choose <b>Add to Home Screen</b>, then tap <b>Add</b>.</li></ol> : <ol><li>Open this website in your mobile browser.</li><li>Open the browser menu <b>⋮</b> or <b>☰</b>.</li><li>Choose <b>Install app</b> or <b>Add to Home screen</b>, then confirm.</li></ol>}<p>Your chemistry shortcut will appear alongside your other apps.</p></div>}
      {message && <p className="mobile-install-message" role="status">{message}</p>}
    </>}
  </aside>;
}
