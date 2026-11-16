/**
 * API and Backend Configuration Helper
 * Safely distinguishes static hosting (e.g. GitHub Pages) from live backend environments
 * to prevent repeated 404 errors on static environments.
 */

// Optional custom backend API URL (e.g. https://api.mycampus.edu)
export const BACKEND_API_URL = (import.meta.env.VITE_BACKEND_API_URL || '').trim().replace(/\/+$/, '');

/**
 * Returns true if the app is running in a static hosting environment
 * such as GitHub Pages where no server-side /api routes exist.
 */
export function isStaticHosting(): boolean {
  if (typeof window === 'undefined') return true;
  const host = window.location.hostname;
  return (
    host.endsWith('github.io') ||
    host.includes('pages.dev') ||
    host.includes('vercel.app') ||
    host.includes('netlify.app') ||
    (import.meta.env.PROD && !BACKEND_API_URL)
  );
}

/**
 * Returns true if local Vite dev server or a configured custom backend
 * can be queried for /api endpoints.
 */
export function shouldAttemptApiSync(): boolean {
  if (BACKEND_API_URL) return true;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // Vite dev server runs on localhost / 127.0.0.1 or LAN IP
    const isLocalDev =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.');
    return isLocalDev && !isStaticHosting();
  }
  return false;
}

/**
 * Builds the full endpoint URL for an API path.
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (BACKEND_API_URL) {
    return `${BACKEND_API_URL}${cleanPath}`;
  }
  return cleanPath;
}
