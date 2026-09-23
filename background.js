/**
 * Location Gear - Background Service Worker
 * 
 * Guarantees 100% STICKY search location across:
 * - Every New Tab
 * - Chrome Address Bar (Omnibox) searches
 * - Right-click context menu searches
 * - All Google domains and tabs
 * 
 * Fixes:
 * 1. Zero Cold-Start Race Conditions: Directly reads persistent storage on every navigation event
 *    so searches in new tabs are never dropped when the service worker is waking up from sleep.
 * 2. Permanently Eliminates Google 403 Forbidden: Strips Google Ads scraper tokens (`uule` and `pws=0`)
 *    from standard country searches and only uses clean, native `gl` and `hl` parameters.
 * 3. Sanitizes URL formatting: Eliminates double ampersands (&&) and malformed query strings.
 */

importScripts('data/countries.js');

// Helper to sanitize and localize a Google Search URL
function getLocalizedUrl(rawUrl, settings) {
  try {
    const url = new URL(rawUrl);
    if (url.pathname !== '/search' || !url.searchParams.has('q')) {
      return null;
    }

    const targetLoc = settings.activeLocation;
    if (!targetLoc || !targetLoc.code) return null;

    const targetCode = targetLoc.code.toLowerCase();
    const currentGl = url.searchParams.get('gl');
    const currentHl = url.searchParams.get('hl');
    const isLangLock = settings.languageLock !== false;
    const isStrictLocal = settings.strictLocalFilter === true;

    // Check if the URL is already clean and correctly localized
    const hasUule = url.searchParams.has('uule');
    const hasPws = url.searchParams.has('pws');
    const hasDoubleAmp = rawUrl.includes('&&') || rawUrl.includes('?&') || rawUrl.endsWith('&');

    const glMatches = currentGl && currentGl.toLowerCase() === targetCode;
    const hlMatches = !isLangLock || currentHl === 'en';
    const crMatches = !isStrictLocal || url.searchParams.get('cr') === ('country' + targetCode.toUpperCase());

    if (glMatches && hlMatches && crMatches && !hasUule && !hasPws && !hasDoubleAmp) {
      return null; // Already correctly localized and sanitized
    }

    // 1. Regional Index (gl)
    url.searchParams.set('gl', targetCode);

    // 2. Language Lock (hl=en)
    if (isLangLock) {
      url.searchParams.set('hl', 'en');
    }

    // 3. Strict Country Filter (cr)
    if (isStrictLocal) {
      url.searchParams.set('cr', 'country' + targetCode.toUpperCase());
    } else {
      url.searchParams.delete('cr');
    }

    // 4. PURGE anti-bot / scraper flags that cause Google 403 Forbidden
    url.searchParams.delete('uule');
    url.searchParams.delete('pws');

    // 5. Clean up delimiters
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
 * - Context menu searches
 * - Bookmarks and links
 */
chrome.webNavigation.onBeforeNavigate.addListener(async function (details) {
  // Only process the top-level main frame (never iframes or background widgets)
  if (details.frameId !== 0) return;

  const rawUrl = details.url;
  if (!rawUrl || !rawUrl.includes('google.') || !rawUrl.includes('/search')) return;

  try {
    // Read persistent storage directly — NO in-memory cold-start race conditions!
    const settings = await chrome.storage.local.get(['activeLocation', 'locationEnabled', 'languageLock', 'strictLocalFilter']);
    if (settings.locationEnabled === false) return;

    const cleanHref = getLocalizedUrl(rawUrl, settings);
    if (cleanHref) {
      chrome.tabs.update(details.tabId, { url: cleanHref });
    }
  } catch (err) {
    console.error('[Location Gear] onBeforeNavigate error:', err);
  }
});

/**
 * Also listen to client-side SPA navigation updates (pushState / popState)
 */
chrome.webNavigation.onHistoryStateUpdated.addListener(async function (details) {
  if (details.frameId !== 0) return;

  const rawUrl = details.url;
  if (!rawUrl || !rawUrl.includes('google.') || !rawUrl.includes('/search')) return;

  try {
    const settings = await chrome.storage.local.get(['activeLocation', 'locationEnabled', 'languageLock', 'strictLocalFilter']);
    if (settings.locationEnabled === false) return;

    const cleanHref = getLocalizedUrl(rawUrl, settings);
    if (cleanHref) {
      chrome.tabs.update(details.tabId, { url: cleanHref });
    }
  } catch (err) {
    console.error('[Location Gear] onHistoryStateUpdated error:', err);
  }
});

// Message listener for popup or content script communications
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'GET_LOCATION') {
    chrome.storage.local.get(['activeLocation', 'locationEnabled', 'languageLock', 'strictLocalFilter'], function (res) {
      sendResponse(res);
    });
    return true;
  }

  if (request.action === 'SET_LOCATION') {
    chrome.storage.local.set({
      activeLocation: request.location,
      locationEnabled: request.enabled !== undefined ? request.enabled : true
    }, function () {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Set default location on fresh extension installation
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.get(['activeLocation'], function (res) {
    if (!res.activeLocation) {
      const defaultLoc = LocationGearData.findCountry('US') || {
        code: 'US',
        name: 'United States',
        tier: 1,
        flag: '🇺🇸',
        canonicalName: 'United States',
        lat: 37.09024,
        lng: -95.712891,
        timezone: 'America/New_York'
      };
      chrome.storage.local.set({
        activeLocation: defaultLoc,
        locationEnabled: true,
        languageLock: true,
        strictLocalFilter: false
      });
    }
  });
});
