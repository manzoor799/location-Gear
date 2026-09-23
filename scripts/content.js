/**
 * Location Gear - SERP Content Script (Enhanced Edition)
 * Positions badge directly beneath Google's Camera (Lens) icon.
 * Features:
 * - Language Lock (Keep English UI hl=en vs Native language)
 * - Strict Country Filter (cr=countryXX)
 * - Custom ZIP / Postal Code & City Hyper-Local Mode
 * - Recent Locations History
 * - Keyboard Shortcut: Alt + L (or Option + L on Mac)
 * - Full Arrow Key & Enter Navigation
 */

(function () {
  'use strict';

  if (window.__LOCATION_GEAR_CONTENT_LOADED__) return;
  window.__LOCATION_GEAR_CONTENT_LOADED__ = true;

  const data = window.LocationGearData || {};
  const COUNTRIES = data.COUNTRIES || [];
  const generateUule = data.generateUule || function () { return ''; };
  const findCountry = data.findCountry || function () { return null; };
  const getTimezone = data.getTimezone || function () { return 'UTC'; };
  const getNativeLanguage = data.getNativeLanguage || function () { return 'en'; };
  const DEFAULT_QUICK_PILLS = data.DEFAULT_QUICK_PILLS || ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'SA', 'AE', 'JP', 'BR', 'IN'];

  let activeLocation = null;
  let activeTierFilter = 'all';
  let searchQuery = '';
  let isDropdownOpen = false;
  let selectedIndex = -1; // for arrow key navigation

  // User Settings
  let languageLock = true;        // Default: Keep English UI (hl=en)
  let strictLocalFilter = false;  // Default: Off (cr=countryXX)
  let recentCodes = ['US', 'CA', 'GB', 'FR'];

  function init() {
    loadSettings(function () {
      injectBadgeUnderCamera();
      hookSearchForms();
      setupMutationObserver();
      setupKeyboardShortcuts();
      window.addEventListener('resize', alignWithCamera);
    });
  }

  // Load active location and settings from storage (Never overwrite with page defaults!)
  function loadSettings(callback) {
    const url = new URL(window.location.href);

    chrome.storage.local.get(['activeLocation', 'locationEnabled', 'languageLock', 'strictLocalFilter', 'recentCodes'], function (res) {
      if (res.languageLock !== undefined) languageLock = res.languageLock;
      if (res.strictLocalFilter !== undefined) strictLocalFilter = res.strictLocalFilter;
      if (Array.isArray(res.recentCodes) && res.recentCodes.length > 0) {
        recentCodes = res.recentCodes;
      }

      // User's saved active location is the single source of truth!
      if (res.activeLocation && res.activeLocation.code) {
        activeLocation = res.activeLocation;
      } else {
        activeLocation = findCountry('US') || COUNTRIES[0];
        chrome.storage.local.set({ activeLocation: activeLocation });
      }

      // Auto-enforce active location on search pages if missing, mismatched, or corrupted with uule/pws
      if (res.locationEnabled !== false && url.pathname === '/search' && url.searchParams.has('q')) {
        const currentGl = url.searchParams.get('gl');
        const currentHl = url.searchParams.get('hl');
        const targetCode = activeLocation.code.toLowerCase();
        const hasUule = url.searchParams.has('uule');
        const hasPws = url.searchParams.has('pws');
        const hasDoubleAmp = window.location.href.includes('&&') || window.location.href.includes('?&');

        const glMismatched = !currentGl || currentGl.toLowerCase() !== targetCode;
        const hlMismatched = languageLock && currentHl !== 'en';

        if (glMismatched || hlMismatched || hasUule || hasPws || hasDoubleAmp) {
          applyLocation(activeLocation);
          return;
        }
      }

      if (callback) callback();
    });
  }

  // Find Google Search Pill Box (div.RNNXgb) or Search Form
  function findSearchBox() {
    return document.querySelector('div.RNNXgb') 
        || document.querySelector('div.A8SBwf') 
        || document.getElementById('searchform') 
        || document.querySelector('form[role="search"]');
  }

  // Find the Camera (Lens) icon inside the search bar
  function findCameraIcon() {
    return document.querySelector('div[aria-label*="image" i]')
        || document.querySelector('div[aria-label*="Lens" i]')
        || document.querySelector('div.nDcEnd')
        || document.querySelector('[data-ved*="camera" i]')
        || document.querySelector('div.dRYYxd > div:nth-child(2)')
        || document.querySelector('div.dRYYxd');
  }

  // Inject the badge wrapper directly anchored to the search box
  function injectBadgeUnderCamera() {
    if (document.getElementById('location-gear-wrapper')) {
      alignWithCamera();
      return;
    }

    const searchBox = findSearchBox();
    if (!searchBox) return;

    const computedStyle = window.getComputedStyle(searchBox);
    if (computedStyle.position === 'static') {
      searchBox.style.position = 'relative';
    }

    const wrapper = document.createElement('div');
    wrapper.id = 'location-gear-wrapper';

    renderBadgeHTML(wrapper);
    searchBox.appendChild(wrapper);

    setupEventListeners(wrapper);
    alignWithCamera();
  }

  // Dynamically align the badge horizontally with the Camera icon
  function alignWithCamera() {
    const wrapper = document.getElementById('location-gear-wrapper');
    const searchBox = findSearchBox();
    if (!wrapper || !searchBox) return;

    const camera = findCameraIcon();
    if (camera) {
      const camRect = camera.getBoundingClientRect();
      const boxRect = searchBox.getBoundingClientRect();
      const camCenterFromBoxRight = boxRect.right - (camRect.left + camRect.width / 2);
      const badgeWidth = wrapper.offsetWidth || 56;
      const rightPx = Math.max(8, Math.round(camCenterFromBoxRight - (badgeWidth / 2)));
      wrapper.style.right = rightPx + 'px';
    } else {
      wrapper.style.right = '32px';
    }
  }

  // Render Badge and Enhanced Dropdown HTML
  function renderBadgeHTML(wrapper) {
    const loc = activeLocation || { code: 'US', name: 'United States', flag: '🇺🇸', tier: 1 };

    // Quick pills inside dropdown
    let quickPillsHtml = '';
    DEFAULT_QUICK_PILLS.forEach(function (code) {
      const c = findCountry(code);
      if (c) {
        const isActive = c.code === loc.code;
        quickPillsHtml += `
          <button type="button" class="lg-quick-btn ${isActive ? 'active' : ''}" data-code="${c.code}">
            <span>${c.flag}</span>
            <span>${c.code}</span>
          </button>
        `;
      }
    });

    // Recent locations chips
    let recentsHtml = '';
    recentCodes.forEach(function (code) {
      const c = findCountry(code);
      if (c) {
        recentsHtml += `
          <button type="button" class="lg-recent-chip" data-code="${c.code}">
            <span>${c.flag}</span>
            <span>${c.code}</span>
          </button>
        `;
      }
    });

    wrapper.innerHTML = `
      <!-- Sleek Compact Badge (Right below Camera) -->
      <button type="button" id="location-gear-badge" title="SERP Location: ${loc.name} (${loc.code}) - Press Alt+L to change">
        <span class="lg-badge-flag">${loc.flag || '🌐'}</span>
        <span class="lg-badge-code">${loc.code}</span>
        <span class="lg-badge-arrow">▾</span>
      </button>

      <!-- Enhanced Dropdown Menu (Anchored to right of badge) -->
      <div id="location-gear-dropdown">
        <div class="lg-dropdown-header">
          <input type="text" class="lg-search-box" id="lg-search-input" placeholder="🔍 Search country, code, city, or ZIP..." autocomplete="off">
        </div>

        <!-- Settings Bar (Language Lock & Strict Local) -->
        <div class="lg-settings-bar">
          <label class="lg-toggle-item" title="Forces Google's navigation interface to stay in English (hl=en) while search results stay geographically localized">
            <input type="checkbox" class="lg-mini-checkbox" id="lg-toggle-lang" ${languageLock ? 'checked' : ''}>
            <span>Keep English UI</span>
          </label>
          <label class="lg-toggle-item" title="Appends cr=countryXX to strictly filter out foreign sites and show only local registered domains">
            <input type="checkbox" class="lg-mini-checkbox" id="lg-toggle-strict" ${strictLocalFilter ? 'checked' : ''}>
            <span>Strict Local (cr)</span>
          </label>
        </div>

        <!-- Recents Bar -->
        ${recentCodes.length > 0 ? `
          <div class="lg-recents-section">
            <span class="lg-recents-label">🕒 Recents:</span>
            ${recentsHtml}
          </div>
        ` : ''}

        <!-- Quick Top Markets -->
        <div class="lg-quick-section">
          ${quickPillsHtml}
        </div>

        <!-- Tier Tabs -->
        <div class="lg-tier-tabs">
          <button type="button" class="lg-tier-tab ${activeTierFilter === 'all' ? 'active' : ''}" data-tier="all">All (196)</button>
          <button type="button" class="lg-tier-tab ${activeTierFilter === '1' ? 'active' : ''}" data-tier="1">Tier 1 (24)</button>
          <button type="button" class="lg-tier-tab ${activeTierFilter === '2' ? 'active' : ''}" data-tier="2">Tier 2 (36)</button>
          <button type="button" class="lg-tier-tab ${activeTierFilter === '3' ? 'active' : ''}" data-tier="3">Tier 3 (136)</button>
        </div>

        <!-- Scrollable List of Countries & Cities -->
        <ul class="lg-country-list" id="lg-country-list">
          <!-- Rendered dynamically -->
        </ul>

        <div class="lg-dropdown-footer">
          <span><span class="lg-status-dot"></span>GPS, UULE & TZ Synced</span>
          <span class="lg-shortcut-hint">Alt+L • ESC to close</span>
        </div>
      </div>
    `;

    renderCountryList();
  }

  // Filter and render countries, custom zip/city, and cities in dropdown
  function renderCountryList() {
    const listEl = document.getElementById('lg-country-list');
    if (!listEl) return;

    const query = searchQuery.trim().toLowerCase();
    const filtered = COUNTRIES.filter(function (c) {
      if (activeTierFilter !== 'all' && String(c.tier) !== activeTierFilter) {
        return false;
      }
      if (!query) return true;
      const matchesName = c.name.toLowerCase().includes(query);
      const matchesCode = c.code.toLowerCase().includes(query);
      const matchesCity = c.cities && c.cities.some(function (city) {
        return city.name.toLowerCase().includes(query);
      });
      return matchesName || matchesCode || matchesCity;
    });

    let html = '';

    // Custom ZIP / City option if user typed something not matching an exact single country
    if (query.length >= 2) {
      html += `
        <li class="lg-custom-location-item" data-custom-location="${escapeHtml(searchQuery.trim())}">
          <span>📍</span>
          <span>Set Custom City/ZIP: <strong>"${escapeHtml(searchQuery.trim())}"</strong></span>
        </li>
      `;
    }

    if (filtered.length === 0 && query.length < 2) {
      listEl.innerHTML = `<li style="padding: 12px; text-align: center; color: #70757a; font-size: 12px;">No countries found</li>`;
      return;
    }

    filtered.forEach(function (c) {
      const isSelected = activeLocation && activeLocation.code === c.code;
      const hasCities = c.cities && c.cities.length > 0;

      html += `
        <li class="lg-country-item ${isSelected ? 'selected' : ''}" data-code="${c.code}">
          <div class="lg-item-left">
            <span class="lg-item-flag">${c.flag}</span>
            <span class="lg-item-name">${c.name} <span class="lg-item-code">(${c.code})</span></span>
          </div>
          <div class="lg-item-right">
            ${hasCities ? `<button type="button" class="lg-city-btn" data-cities-toggle="${c.code}">Cities (${c.cities.length})</button>` : ''}
            <span class="lg-tier-badge t${c.tier}">T${c.tier}</span>
          </div>
        </li>
      `;

      if (hasCities) {
        html += `<div class="lg-cities-sublist" id="lg-cities-${c.code}" style="display: none;">`;
        c.cities.forEach(function (city) {
          html += `
            <span class="lg-city-chip" data-country-code="${c.code}" data-canonical="${city.canonical}" data-lat="${city.lat}" data-lng="${city.lng}">
              📍 ${city.name}
            </span>
          `;
        });
        html += `</div>`;
      }
    });

    listEl.innerHTML = html;
    selectedIndex = -1;
  }

  // Setup click, toggle, and keyboard event listeners
  function setupEventListeners(wrapper) {
    const badge = wrapper.querySelector('#location-gear-badge');
    const dropdown = wrapper.querySelector('#location-gear-dropdown');
    const searchInput = wrapper.querySelector('#lg-search-input');
    const toggleLang = wrapper.querySelector('#lg-toggle-lang');
    const toggleStrict = wrapper.querySelector('#lg-toggle-strict');

    // Toggle Dropdown
    badge.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleDropdown();
    });

    // Language Lock Toggle
    if (toggleLang) {
      toggleLang.addEventListener('change', function () {
        languageLock = toggleLang.checked;
        chrome.storage.local.set({ languageLock: languageLock });
      });
    }

    // Strict Local Filter Toggle
    if (toggleStrict) {
      toggleStrict.addEventListener('change', function () {
        strictLocalFilter = toggleStrict.checked;
        chrome.storage.local.set({ strictLocalFilter: strictLocalFilter });
      });
    }

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (isDropdownOpen && !wrapper.contains(e.target)) {
        closeDropdown();
      }
    });

    // Live search input
    if (searchInput) {
      searchInput.addEventListener('input', function (e) {
        searchQuery = e.target.value;
        renderCountryList();
      });

      // Arrow Key & Enter Navigation
      searchInput.addEventListener('keydown', function (e) {
        const items = wrapper.querySelectorAll('.lg-country-item, .lg-custom-location-item');
        if (!items || items.length === 0) return;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          selectedIndex = (selectedIndex + 1) % items.length;
          highlightItem(items);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          selectedIndex = (selectedIndex - 1 + items.length) % items.length;
          highlightItem(items);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < items.length) {
            items[selectedIndex].click();
          } else if (items.length > 0) {
            items[0].click(); // select first matching item
          }
        }
      });
    }

    // Tier Tabs
    wrapper.querySelectorAll('.lg-tier-tab').forEach(function (tab) {
      tab.addEventListener('click', function (e) {
        e.stopPropagation();
        wrapper.querySelectorAll('.lg-tier-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        activeTierFilter = tab.getAttribute('data-tier');
        renderCountryList();
      });
    });

    // Quick Pills & Recent Chips
    wrapper.addEventListener('click', function (e) {
      const pill = e.target.closest('.lg-quick-btn, .lg-recent-chip');
      if (pill) {
        e.stopPropagation();
        const code = pill.getAttribute('data-code');
        const country = findCountry(code);
        if (country) applyLocation(country);
      }
    });

    // Country List delegation
    const listEl = wrapper.querySelector('#lg-country-list');
    if (listEl) {
      listEl.addEventListener('click', function (e) {
        e.stopPropagation();

        // Custom ZIP / City selected
        const customItem = e.target.closest('.lg-custom-location-item');
        if (customItem) {
          const customLoc = customItem.getAttribute('data-custom-location');
          applyCustomLocation(customLoc);
          return;
        }

        // Cities toggle
        const cityBtn = e.target.closest('.lg-city-btn');
        if (cityBtn) {
          const code = cityBtn.getAttribute('data-cities-toggle');
          const sublist = document.getElementById('lg-cities-' + code);
          if (sublist) {
            const isVisible = sublist.style.display !== 'none';
            sublist.style.display = isVisible ? 'none' : 'flex';
            cityBtn.textContent = isVisible ? 'Cities' : 'Hide';
          }
          return;
        }

        // City chip clicked
        const cityChip = e.target.closest('.lg-city-chip');
        if (cityChip) {
          const cCode = cityChip.getAttribute('data-country-code');
          const canonical = cityChip.getAttribute('data-canonical');
          const lat = parseFloat(cityChip.getAttribute('data-lat'));
          const lng = parseFloat(cityChip.getAttribute('data-lng'));
          const parentCountry = findCountry(cCode);

          applyLocation({
            code: cCode,
            name: (parentCountry ? parentCountry.name : cCode) + ' (' + cityChip.textContent.trim().replace('📍 ', '') + ')',
            flag: parentCountry ? parentCountry.flag : '🌐',
            canonicalName: canonical,
            lat: lat,
            lng: lng,
            timezone: parentCountry ? getTimezone(parentCountry.code) : 'UTC',
            tier: parentCountry ? parentCountry.tier : 1
          });
          return;
        }

        // Country row clicked
        const item = e.target.closest('.lg-country-item');
        if (item) {
          const code = item.getAttribute('data-code');
          const country = findCountry(code);
          if (country) applyLocation(country);
        }
      });
    }
  }

  function highlightItem(items) {
    items.forEach(function (it, idx) {
      it.classList.toggle('highlighted', idx === selectedIndex);
      if (idx === selectedIndex) {
        it.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  function toggleDropdown() {
    isDropdownOpen = !isDropdownOpen;
    const wrapper = document.getElementById('location-gear-wrapper');
    if (!wrapper) return;
    const dropdown = wrapper.querySelector('#location-gear-dropdown');
    const badge = wrapper.querySelector('#location-gear-badge');
    const searchInput = wrapper.querySelector('#lg-search-input');

    dropdown.classList.toggle('visible', isDropdownOpen);
    badge.classList.toggle('open', isDropdownOpen);

    if (isDropdownOpen && searchInput) {
      setTimeout(function () {
        searchInput.focus();
        searchInput.select();
      }, 40);
    }
  }

  function closeDropdown() {
    isDropdownOpen = false;
    const wrapper = document.getElementById('location-gear-wrapper');
    if (!wrapper) return;
    const dropdown = wrapper.querySelector('#location-gear-dropdown');
    const badge = wrapper.querySelector('#location-gear-badge');
    if (dropdown) dropdown.classList.remove('visible');
    if (badge) badge.classList.remove('open');
  }

  // Keyboard shortcut: Alt + L (or Option + L on Mac)
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
      if (e.altKey && (e.key === 'l' || e.key === 'L' || e.code === 'KeyL')) {
        e.preventDefault();
        toggleDropdown();
      } else if (e.key === 'Escape' && isDropdownOpen) {
        closeDropdown();
      }
    });
  }

  // Remember recently chosen countries
  function saveToRecents(code) {
    if (!code) return;
    const upper = code.toUpperCase();
    recentCodes = [upper].concat(recentCodes.filter(c => c !== upper)).slice(0, 5);
    chrome.storage.local.set({ recentCodes: recentCodes });
  }

  // Apply custom ZIP / City location
  function applyCustomLocation(customQuery) {
    if (!customQuery) return;
    const currentCode = activeLocation ? activeLocation.code : 'US';
    const parentCountry = findCountry(currentCode) || { name: 'United States', lat: 37.0902, lng: -95.7128 };
    const canonical = `${customQuery},${parentCountry.name}`;

    applyLocation({
      code: currentCode,
      name: `${customQuery} (${currentCode})`,
      flag: parentCountry.flag || '📍',
      canonicalName: canonical,
      lat: parentCountry.lat,
      lng: parentCountry.lng,
      timezone: getTimezone(currentCode),
      tier: parentCountry.tier || 1,
      isCustom: true
    });
  }

  // Pre-seed any Google search form with hidden gl and hl inputs so user submissions
  // are natively localized immediately without requiring any post-load redirect
  function hookSearchForms() {
    if (!activeLocation) return;
    const targetCode = activeLocation.code.toLowerCase();

    const forms = document.querySelectorAll('form[action*="/search"], form[role="search"], form#tsf');
    forms.forEach(function (form) {
      // gl hidden input
      let glInput = form.querySelector('input[name="gl"]');
      if (!glInput) {
        glInput = document.createElement('input');
        glInput.type = 'hidden';
        glInput.name = 'gl';
        form.appendChild(glInput);
      }
      glInput.value = targetCode;

      // hl hidden input
      if (languageLock) {
        let hlInput = form.querySelector('input[name="hl"]');
        if (!hlInput) {
          hlInput = document.createElement('input');
          hlInput.type = 'hidden';
          hlInput.name = 'hl';
          form.appendChild(hlInput);
        }
        hlInput.value = 'en';
      }

      // Purge any uule or pws inputs from form to avoid triggering 403
      const badInputs = form.querySelectorAll('input[name="uule"], input[name="pws"]');
      badInputs.forEach(function (el) { el.remove(); });
    });
  }

  // Intercept form submissions immediately at capture phase
  document.addEventListener('submit', function (e) {
    hookSearchForms();
  }, true);

  /**
   * Apply Location 100% Accurately:
   * 1. Updates chrome.storage.local
   * 2. Fires custom event with coordinates & timezone for inject-main.js
   * 3. Applies regional index (gl)
   * 4. Applies Language Lock (hl=en vs native)
   * 5. Applies Strict Local Filter (cr=countryXX)
   * 6. PERMANENTLY REMOVES uule and pws=0 from standard searches to eliminate Google 403 Forbidden!
   * 7. Navigates cleanly to localized SERP
   */
  function applyLocation(locationObj) {
    if (!locationObj) return;

    activeLocation = locationObj;
    saveToRecents(locationObj.code);

    const tz = locationObj.timezone || getTimezone(locationObj.code);

    chrome.storage.local.set({
      activeLocation: locationObj,
      locationEnabled: true
    }, function () {
      // Notify injected main-world script of coordinates, timezone, and language
      window.dispatchEvent(new CustomEvent('__LOCATION_GEAR_SET_LOCATION__', {
        detail: {
          code: locationObj.code,
          lat: locationObj.lat,
          lng: locationObj.lng,
          timezone: tz,
          enabled: true,
          languageLock: languageLock
        }
      }));

      const currentUrl = new URL(window.location.href);

      // Check if on Google Maps
      if (currentUrl.hostname.includes('maps.google') || currentUrl.pathname.startsWith('/maps')) {
        const canonical = locationObj.canonicalName || locationObj.name;
        const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(canonical)}&ll=${locationObj.lat},${locationObj.lng}`;
        window.location.href = mapsUrl;
        return;
      }

      // 1. Regional Index (gl)
      currentUrl.searchParams.set('gl', locationObj.code.toLowerCase());

      // 2. Language Lock (hl)
      if (languageLock) {
        currentUrl.searchParams.set('hl', 'en');
      } else {
        const nativeLang = getNativeLanguage(locationObj.code);
        currentUrl.searchParams.set('hl', nativeLang);
      }

      // 3. Strict Country Filter (cr)
      if (strictLocalFilter) {
        currentUrl.searchParams.set('cr', 'country' + locationObj.code.toUpperCase());
      } else {
        currentUrl.searchParams.delete('cr');
      }

      // 4. PURGE anti-bot / scraper flags (uule & pws) that trigger Google 403 Forbidden!
      if (locationObj.isCustom) {
        const canonical = locationObj.canonicalName || locationObj.name;
        const uuleToken = generateUule(canonical);
        if (uuleToken) currentUrl.searchParams.set('uule', uuleToken);
      } else {
        currentUrl.searchParams.delete('uule');
      }
      currentUrl.searchParams.delete('pws');

      // Sanitize URL: clean any double ampersands (&&) or malformed delimiters
      const cleanHref = currentUrl.toString()
        .replace(/&&+/g, '&')
        .replace(/\?&/g, '?')
        .replace(/&$/g, '');

      if (cleanHref !== window.location.href) {
        window.location.href = cleanHref;
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // MutationObserver for Google dynamic transitions
  function setupMutationObserver() {
    let lastUrl = window.location.href;
    const observer = new MutationObserver(function () {
      if (!document.getElementById('location-gear-wrapper')) {
        injectBadgeUnderCamera();
      } else {
        alignWithCamera();
      }

      hookSearchForms();

      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        loadSettings(function () {
          const wrapper = document.getElementById('location-gear-wrapper');
          if (wrapper) renderBadgeHTML(wrapper);
          alignWithCamera();
          hookSearchForms();
        });
      }
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
