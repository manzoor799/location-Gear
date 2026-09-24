/**
 * Location Gear - Background Service Worker
 * 
 * Guarantees 100% STICKY search location across:
 * - Every New Tab
 * - Chrome Address Bar (Omnibox) searches
 * - Right-click context menu searches
 * - All Google domains and tabs
 * 
 * Permanent Fix for Google 403 Forbidden:
 * 1. ZERO Botguard Tampering: No DOM attribute injection or native JS API overrides.
 * 2. Purges scraper tokens (uule and pws=0) and restrictive cr parameters.
 * 3. Sanitizes context-menu telemetry (source=chrome.ctxt) to prevent request rejection.
 * 4. Zero cold-start race conditions: Directly reads persistent storage on every navigation.
 */

importScripts('data/countries.js');

// Updates the extension icon badge in Chrome toolbar
function updateBadge(enabled, location) {
  try {
    if (enabled === false) {
      chrome.action.setBadgeText({ text: 'OFF' });
      chrome.action.setBadgeBackgroundColor({ color: '#80868b' });
    } else if (location && location.code) {
      chrome.action.setBadgeText({ text: location.code.toUpperCase() });
      chrome.action.setBadgeBackgroundColor({ color: '#188038' }); // Google Green
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  } catch (e) {
    // Ignore context errors
  }
}

// Helper to sanitize and localize a Google Search URL
function getLocalizedUrl(rawUrl, settings) {
  try {
    const url = new URL(rawUrl);
    if (url.pathname !== '/search' || !url.searchParams.has('q')) {
      return null;
    }

    // If disabled, strip our custom gl/num if present and return clean URL
    if (settings.locationEnabled === false) {
      let modified = false;
      if (url.searchParams.has('gl')) {
        url.searchParams.delete('gl');
        modified = true;
      }
      if (url.searchParams.get('num') === '100' && settings.top100 === false) {
        url.searchParams.delete('num');
        modified = true;
      }
      return modified ? url.toString() : null;
    }

    const targetLoc = settings.activeLocation;
    if (!targetLoc || !targetLoc.code) return null;

    const targetCode = targetLoc.code.toLowerCase();
    const currentGl = url.searchParams.get('gl');
    const currentHl = url.searchParams.get('hl');
    const isLangLock = settings.languageLock !== false;
    const isTop100 = settings.top100 === true;

    // Check if the URL is already clean and correctly localized
    const hasUule = url.searchParams.has('uule');
    const hasPws = url.searchParams.has('pws');
    const hasCr = url.searchParams.has('cr');
    const hasContextSource = url.searchParams.get('source') === 'chrome.ctxt';
    const hasDoubleAmp = rawUrl.includes('&&') || rawUrl.includes('?&') || rawUrl.endsWith('&');

    const glMatches = currentGl && currentGl.toLowerCase() === targetCode;
    const hlMatches = !isLangLock || currentHl === 'en';
    const numMatches = !isTop100 || url.searchParams.get('num') === '100';

    if (glMatches && hlMatches && numMatches && !hasUule && !hasPws && !hasCr && !hasContextSource && !hasDoubleAmp) {
      return null; // Already correctly localized and sanitized
    }

    // 1. Regional Index (gl)
    url.searchParams.set('gl', targetCode);

    // 2. Language Lock (hl=en)
    if (isLangLock) {
      url.searchParams.set('hl', 'en');
    }

    // 3. Top 100 results (num=100)
    if (isTop100) {
      url.searchParams.set('num', '100');
    }

    // 4. PURGE all anti-bot / scraper / restrictive flags that cause Google 403 Forbidden:
    url.searchParams.delete('uule');
    url.searchParams.delete('pws');
    url.searchParams.delete('cr');

    // 5. Strip internal context tracking that triggers 403 when query is modified
    if (url.searchParams.get('source') === 'chrome.ctxt') {
      url.searchParams.delete('source');
      url.searchParams.delete('sourceid');
    }

    // 6. Clean up delimiters
    let cleanHref = url.toString()
      .replace(/&&+/g, '&')
      .replace(/\?&/g, '?')
      .replace(/&$/g, '');

    return cleanHref !== rawUrl ? cleanHref : null;
  } catch (e) {
    return null;
  }
}

/**
 * Intercept all Google Search navigations across the entire browser:
 * - New Tabs
 * - Address Bar (Omnibox)
 * - Context menu right-click searches
 * - Bookmarks and links
 */
chrome.webNavigation.onBeforeNavigate.addListener(async function (details) {
  // Only process the top-level main frame (never iframes or background widgets)
  if (details.frameId !== 0) return;

  const rawUrl = details.url;
  if (!rawUrl || !rawUrl.includes('google.') || !rawUrl.includes('/search')) return;

  try {
    const settings = await chrome.storage.local.get(['activeLocation', 'locationEnabled', 'languageLock', 'top100']);
    const cleanHref = getLocalizedUrl(rawUrl, settings);
    if (cleanHref && cleanHref !== rawUrl) {
      chrome.tabs.update(details.tabId, { url: cleanHref });
    }
  } catch (err) {
    console.error('[Location Gear] onBeforeNavigate error:', err);
  }
});

// Update badge whenever storage changes
chrome.storage.onChanged.addListener(function (changes, area) {
  if (area === 'local' && (changes.activeLocation || changes.locationEnabled)) {
    chrome.storage.local.get(['activeLocation', 'locationEnabled'], function (res) {
      updateBadge(res.locationEnabled !== false, res.activeLocation);
    });
  }
});

// Message listener for popup or content script communications
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'GET_LOCATION') {
    chrome.storage.local.get(['activeLocation', 'locationEnabled', 'languageLock', 'top100', 'favoriteCodes'], function (res) {
      sendResponse(res);
    });
    return true;
  }

  if (request.action === 'SET_LOCATION') {
    chrome.storage.local.set({
      activeLocation: request.location,
      locationEnabled: request.enabled !== undefined ? request.enabled : true
    }, function () {
      updateBadge(request.enabled !== false, request.location);
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'RESET_TO_HOME') {
    chrome.storage.local.set({ locationEnabled: false }, function () {
      updateBadge(false, null);
      sendResponse({ success: true });
    });
    return true;
  }
});

// Set default location and badge on installation or startup
function initDefaults() {
  chrome.storage.local.get(['activeLocation', 'locationEnabled', 'favoriteCodes', 'top100', 'languageLock'], function (res) {
    const updates = {};
    let loc = res.activeLocation;
    let enabled = res.locationEnabled !== false;

    if (!loc) {
      loc = LocationGearData.findCountry('US') || {
        code: 'US',
        name: 'United States',
        tier: 1,
        flag: '🇺🇸',
        canonicalName: 'United States',
        lat: 37.09024,
        lng: -95.712891,
        timezone: 'America/New_York'
      };
      updates.activeLocation = loc;
      updates.locationEnabled = true;
      enabled = true;
    }

    if (!Array.isArray(res.favoriteCodes) || res.favoriteCodes.length === 0) {
      updates.favoriteCodes = ['US', 'GB', 'CA', 'AU', 'DE'];
    }

    if (res.languageLock === undefined) {
      updates.languageLock = true;
    }

    if (res.top100 === undefined) {
      updates.top100 = false;
    }

    if (Object.keys(updates).length > 0) {
      chrome.storage.local.set(updates, function () {
        updateBadge(enabled, loc);
      });
    } else {
      updateBadge(enabled, loc);
    }
  });
}

chrome.runtime.onInstalled.addListener(initDefaults);
chrome.runtime.onStartup.addListener(initDefaults);
initDefaults();
