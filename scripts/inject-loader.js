/**
 * Location Gear - Content Script Loader
 * Runs at document_start. Bridges stored settings from chrome.storage.local
 * and injects inject-main.js into the main execution context.
 */

(function () {
  'use strict';

  const storage = (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local)
    ? chrome.storage.local
    : (typeof browser !== 'undefined' && browser.storage && browser.storage.local)
      ? browser.storage.local
      : null;

  if (!storage) return;

  storage.get(['activeLocation', 'locationEnabled', 'languageLock'], function (res) {
    const loc = res.activeLocation || {
      code: 'US',
      name: 'United States',
      lat: 37.09024,
      lng: -95.712891,
      canonicalName: 'United States',
      timezone: 'America/New_York'
    };
    const enabled = res.locationEnabled !== undefined ? res.locationEnabled : true;
    const isLangLock = res.languageLock !== false;

    // Set dataset on root element immediately so inject-main.js reads it instantly
    if (document.documentElement) {
      document.documentElement.setAttribute('data-location-gear', JSON.stringify({
        code: loc.code || 'US',
        lat: loc.lat,
        lng: loc.lng,
        timezone: loc.timezone || 'UTC',
        enabled: enabled,
        languageLock: isLangLock
      }));
    }

    // Inject inject-main.js script into the MAIN page DOM
    try {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('scripts/inject-main.js');
      script.async = false;
      (document.head || document.documentElement).appendChild(script);
      script.onload = function () {
        script.remove();
      };
    } catch (e) {
      console.error('[Location Gear] Failed to inject main-world script:', e);
    }
  });
})();
