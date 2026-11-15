/**
 * Utility to verify WebGL capability on the current device and browser.
 * Ensures graceful fallback to 2D Leaflet mode on low-end or restricted devices.
 */
export function isWebGLSupported(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}
