/**
 * JUAN PROJECT WORKSPACE — pwa.js
 * ------------------------------------------------------------------
 * PURPOSE: Progressive Web App bootstrap. Registers the service worker after the page loads.
 * LOAD ORDER: 4 of 4 local modules (the OCR library may load between modules).
 *
 * MAINTENANCE TIP:
 * - Search for `function <name>` or `app.<action>` to find a feature.
 * - Make one logical change at a time and commit it with Git.
 * - Do not rename stored LocalStorage keys unless you also write a migration.
 */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(err => console.warn('Service worker registration failed:', err));
  });
}
