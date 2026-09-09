export const getWebXRSupport = async () => {
  const base = {
    secureContext: window.isSecureContext,
    hasNavigatorXR: Boolean(navigator.xr),
    isMobile: /Android|iPhone|iPad|iPod/i.test(navigator.userAgent),
    cameraPermission: 'unknown',
    ar: false,
    vr: false,
  };

  if (navigator.permissions?.query) {
    try {
      const camera = await navigator.permissions.query({ name: 'camera' });
      base.cameraPermission = camera.state;
    } catch {
      base.cameraPermission = 'unknown';
    }
  }

  if (!base.secureContext || !base.hasNavigatorXR) {
    return base;
  }

  const [ar, vr] = await Promise.all([
    navigator.xr.isSessionSupported('immersive-ar').catch(() => false),
    navigator.xr.isSessionSupported('immersive-vr').catch(() => false),
  ]);

  return { ...base, ar, vr };
};

export const supportMessageForMode = (support, mode) => {
  if (!support.secureContext) return 'WebXR needs HTTPS or localhost.';
  if (!support.hasNavigatorXR) return 'This browser does not expose WebXR.';
  if (mode === 'vr' && !support.vr) return 'VR headset support was not detected.';
  if ((mode === 'ar' || mode === 'mr') && !support.ar) return 'AR/MR session support was not detected.';
  return 'Ready when a compatible device is connected.';
};
