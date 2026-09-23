/**
 * Location Gear - In-Page Main World Script
 * Injected directly into the website's execution context (MAIN world).
 * Overrides navigator.geolocation to mock physical GPS coordinates 100% reliably.
 * Also synchronizes JavaScript Intl timezone to prevent anti-spoofing detection.
 */

(function () {
  'use strict';

  // Prevent double injection
  if (window.__LOCATION_GEAR_INJECTED__) return;
  window.__LOCATION_GEAR_INJECTED__ = true;

  // Default coordinates (updated dynamically)
  let currentCoords = {
    latitude: 37.09024,
    longitude: -95.712891,
    accuracy: 25,
    altitude: 15,
    altitudeAccuracy: 5,
    heading: null,
    speed: null
  };

  let currentTimezone = 'America/New_York';
  let currentCountryCode = 'US';
  let isLanguageLocked = true;
  let isEnabled = true;

  // Read initial configuration passed from the loader
  function readConfig() {
    try {
      const raw = document.documentElement.getAttribute('data-location-gear');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.lat !== undefined && parsed.lng !== undefined) {
          currentCoords.latitude = parseFloat(parsed.lat);
          currentCoords.longitude = parseFloat(parsed.lng);
        }
        if (parsed.timezone) {
          currentTimezone = parsed.timezone;
        }
        if (parsed.code) {
          currentCountryCode = parsed.code.toLowerCase();
        }
        if (parsed.languageLock !== undefined) {
          isLanguageLocked = Boolean(parsed.languageLock);
        }
        if (parsed.enabled !== undefined) {
          isEnabled = Boolean(parsed.enabled);
        }
      }
    } catch (e) {
      // ignore
    }
  }
  readConfig();

  // Listen for dynamic updates from content script
  window.addEventListener('__LOCATION_GEAR_SET_LOCATION__', function (event) {
    if (event.detail) {
      if (event.detail.lat !== undefined && event.detail.lng !== undefined) {
        currentCoords.latitude = parseFloat(event.detail.lat);
        currentCoords.longitude = parseFloat(event.detail.lng);
      }
      if (event.detail.timezone) {
        currentTimezone = event.detail.timezone;
      }
      if (event.detail.code) {
        currentCountryCode = event.detail.code.toLowerCase();
      }
      if (event.detail.languageLock !== undefined) {
        isLanguageLocked = Boolean(event.detail.languageLock);
      }
      if (event.detail.enabled !== undefined) {
        isEnabled = Boolean(event.detail.enabled);
      }
    }
  });

  // Preserve native geolocation methods
  const nativeGetCurrentPosition = navigator.geolocation ? navigator.geolocation.getCurrentPosition.bind(navigator.geolocation) : null;
  const nativeWatchPosition = navigator.geolocation ? navigator.geolocation.watchPosition.bind(navigator.geolocation) : null;

  function createMockPosition() {
    return {
      coords: {
        latitude: currentCoords.latitude,
        longitude: currentCoords.longitude,
        accuracy: currentCoords.accuracy || 20,
        altitude: currentCoords.altitude,
        altitudeAccuracy: currentCoords.altitudeAccuracy,
        heading: currentCoords.heading,
        speed: currentCoords.speed
      },
      timestamp: Date.now()
    };
  }

  // Override getCurrentPosition
  function mockGetCurrentPosition(successCallback, errorCallback, options) {
    if (!isEnabled && nativeGetCurrentPosition) {
      return nativeGetCurrentPosition(successCallback, errorCallback, options);
    }

    if (typeof successCallback === 'function') {
      const pos = createMockPosition();
      setTimeout(function () {
        try {
          successCallback(pos);
        } catch (err) {
          console.error('[Location Gear] Error in geolocation success callback:', err);
        }
      }, 25);
    }
  }

  // Active watch IDs
  let watchIdCounter = 1000;
  const activeWatches = new Map();

  // Override watchPosition
  function mockWatchPosition(successCallback, errorCallback, options) {
    if (!isEnabled && nativeWatchPosition) {
      return nativeWatchPosition(successCallback, errorCallback, options);
    }

    const id = ++watchIdCounter;
    if (typeof successCallback === 'function') {
      const runWatch = function () {
        if (!activeWatches.has(id)) return;
        const pos = createMockPosition();
        try {
          successCallback(pos);
        } catch (err) {
          console.error('[Location Gear] Error in watch callback:', err);
        }
      };

      setTimeout(runWatch, 25);
      const intervalId = setInterval(runWatch, 10000);
      activeWatches.set(id, intervalId);
    }
    return id;
  }

  // Override clearWatch
  function mockClearWatch(id) {
    if (activeWatches.has(id)) {
      clearInterval(activeWatches.get(id));
      activeWatches.delete(id);
    } else if (navigator.geolocation && navigator.geolocation.clearWatch) {
      navigator.geolocation.clearWatch(id);
    }
  }

  // Apply geolocation overrides
  if (navigator.geolocation) {
    try {
      navigator.geolocation.getCurrentPosition = mockGetCurrentPosition;
      navigator.geolocation.watchPosition = mockWatchPosition;
      navigator.geolocation.clearWatch = mockClearWatch;
    } catch (e) {
      try {
        const proto = Object.getPrototypeOf(navigator.geolocation);
        proto.getCurrentPosition = mockGetCurrentPosition;
        proto.watchPosition = mockWatchPosition;
        proto.clearWatch = mockClearWatch;
      } catch (err) {
        try {
          Object.defineProperty(navigator, 'geolocation', {
            value: {
              getCurrentPosition: mockGetCurrentPosition,
              watchPosition: mockWatchPosition,
              clearWatch: mockClearWatch
            },
            configurable: true
          });
        } catch (finalErr) {
          // ignore
        }
      }
    }
  }

  // Override Permissions API for 'geolocation' query so Google sees 'granted'
  if (navigator.permissions && navigator.permissions.query) {
    const nativeQuery = navigator.permissions.query.bind(navigator.permissions);
    navigator.permissions.query = function (queryDesc) {
      if (isEnabled && queryDesc && queryDesc.name === 'geolocation') {
        return Promise.resolve({
          state: 'granted',
          name: 'geolocation',
          onchange: null,
          addEventListener: function () {},
          removeEventListener: function () {},
          dispatchEvent: function () { return false; }
        });
      }
      return nativeQuery(queryDesc);
    };
  }

  // Synchronize Intl TimeZone to match destination country
  if (window.Intl && Intl.DateTimeFormat && Intl.DateTimeFormat.prototype.resolvedOptions) {
    const nativeResolvedOptions = Intl.DateTimeFormat.prototype.resolvedOptions;
    Intl.DateTimeFormat.prototype.resolvedOptions = function () {
      const options = nativeResolvedOptions.call(this);
      if (isEnabled && currentTimezone) {
        options.timeZone = currentTimezone;
      }
      return options;
    };
  }

  // Intercept history.pushState and replaceState to keep regional gl & hl sticky on Google SPA transitions
  function sanitizeGoogleUrl(rawUrl) {
    if (!rawUrl || !isEnabled || !currentCountryCode) return rawUrl;
    try {
      const u = new URL(rawUrl, window.location.href);
      if (u.pathname === '/search' && u.searchParams.has('q')) {
        u.searchParams.set('gl', currentCountryCode.toLowerCase());
        if (isLanguageLocked) {
          u.searchParams.set('hl', 'en');
        }
        u.searchParams.delete('uule');
        u.searchParams.delete('pws');
        return u.pathname + u.search + u.hash;
      }
    } catch (e) {}
    return rawUrl;
  }

  const nativePush = history.pushState ? history.pushState.bind(history) : null;
  if (nativePush) {
    history.pushState = function (state, unused, url) {
      return nativePush(state, unused, sanitizeGoogleUrl(url));
    };
  }

  const nativeReplace = history.replaceState ? history.replaceState.bind(history) : null;
  if (nativeReplace) {
    history.replaceState = function (state, unused, url) {
      return nativeReplace(state, unused, sanitizeGoogleUrl(url));
    };
  }
})();
