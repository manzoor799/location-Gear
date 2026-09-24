/**
 * Location Gear - SERP Content Script (Clean & Minimal Edition)
 * 
 * Features:
 * 1. Compact Badge anchored directly below Google's Camera icon
 * 2. 1-Click "Back to Real Location" Reset Button
 * 3. 1-Click SERP Data Extractor Modal (CSV & Clipboard)
 * 4. Dual-SERP Split Comparison Mode (50/50 US vs UK View)
 * 5. 1-Tap Quick Select Favorite Chips (US, UK, CA, AU, DE)
 * 6. Top 100 Results Toggle (num=100)
 * 7. Safe Language Lock (Keep English UI hl=en)
 * 8. Automatic Google Dark Mode & Light Mode adaptation
 * 9. ZERO interference with Google page layout (No sidebars or intrusive popups)
 */

(function () {
  'use strict';

  if (window.__LOCATION_GEAR_CONTENT_LOADED__) return;
  window.__LOCATION_GEAR_CONTENT_LOADED__ = true;

  const data = window.LocationGearData || {};
  const COUNTRIES = data.COUNTRIES || [];
  const findCountry = data.findCountry || function () { return null; };
  const getTimezone = data.getTimezone || function () { return 'UTC'; };
  const getNativeLanguage = data.getNativeLanguage || function () { return 'en'; };
  const DEFAULT_QUICK_PILLS = data.DEFAULT_QUICK_PILLS || ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'SA', 'AE', 'JP', 'BR', 'IN'];

  let activeLocation = null;
  let locationEnabled = true;
  let isTop100 = false;
  let languageLock = true;
  let favoriteCodes = ['US', 'GB', 'CA', 'AU', 'DE'];
  let recentCodes = ['US', 'CA', 'GB', 'FR'];
  let activeTierFilter = 'all';
  let searchQuery = '';
  let isDropdownOpen = false;
  let selectedIndex = -1;

  function init() {
    loadSettings(function () {
      injectBadgeUnderCamera();
      hookSearchForms();
      setupMutationObserver();
      setupKeyboardShortcuts();
      window.addEventListener('resize', alignWithCamera);
    });
  }

  // Load active location and settings from storage
  function loadSettings(callback) {
    const url = new URL(window.location.href);

    chrome.storage.local.remove('strictLocalFilter');

    chrome.storage.local.get([
      'activeLocation',
      'locationEnabled',
      'languageLock',
      'recentCodes',
      'favoriteCodes',
      'top100'
    ], function (res) {
      if (res.languageLock !== undefined) languageLock = res.languageLock;
      if (res.locationEnabled !== undefined) locationEnabled = res.locationEnabled;
      if (res.top100 !== undefined) isTop100 = res.top100;
      if (Array.isArray(res.recentCodes) && res.recentCodes.length > 0) recentCodes = res.recentCodes;
      if (Array.isArray(res.favoriteCodes) && res.favoriteCodes.length > 0) favoriteCodes = res.favoriteCodes;

      if (res.activeLocation && res.activeLocation.code) {
        activeLocation = res.activeLocation;
      } else {
        activeLocation = findCountry('US') || COUNTRIES[0];
        chrome.storage.local.set({ activeLocation: activeLocation });
      }

      // Auto-enforce active location on search pages if enabled
      if (locationEnabled && url.pathname === '/search' && url.searchParams.has('q')) {
        const currentGl = url.searchParams.get('gl');
        const currentHl = url.searchParams.get('hl');
        const currentNum = url.searchParams.get('num');
        const targetCode = activeLocation.code.toLowerCase();

        const hasUule = url.searchParams.has('uule');
        const hasPws = url.searchParams.has('pws');
        const hasCr = url.searchParams.has('cr');
        const hasContextSource = url.searchParams.get('source') === 'chrome.ctxt';
        const hasDoubleAmp = window.location.href.includes('&&') || window.location.href.includes('?&');

        const glMismatched = !currentGl || currentGl.toLowerCase() !== targetCode;
        const hlMismatched = languageLock && currentHl !== 'en';
        const numMismatched = isTop100 && currentNum !== '100';

        if (glMismatched || hlMismatched || numMismatched || hasUule || hasPws || hasCr || hasContextSource || hasDoubleAmp) {
          applyLocation(activeLocation);
          return;
        }
      }

      if (callback) callback();
    });
  }

  // Find Google Search Box
  function findSearchBox() {
    return document.querySelector('div.RNNXgb') 
        || document.querySelector('div.A8SBwf') 
        || document.getElementById('searchform') 
        || document.querySelector('form[role="search"]');
  }

  // Find Camera / Lens icon
  function findCameraIcon() {
    return document.querySelector('div[aria-label*="image" i]')
        || document.querySelector('div[aria-label*="Lens" i]')
        || document.querySelector('div.nDcEnd')
        || document.querySelector('[data-ved*="camera" i]')
        || document.querySelector('div.dRYYxd > div:nth-child(2)')
        || document.querySelector('div.dRYYxd');
  }

  // Inject Badge Under Camera
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

  function renderBadgeHTML(wrapper) {
    const loc = activeLocation || { code: 'US', name: 'United States', flag: '🇺🇸', tier: 1 };
    const isDark = isGoogleDarkMode();
    if (isDark) {
      wrapper.classList.add('lg-dark');
    } else {
      wrapper.classList.remove('lg-dark');
    }

    let quickPillsHtml = '';
    DEFAULT_QUICK_PILLS.forEach(function (code) {
      const c = findCountry(code);
      if (c) {
        const isActive = locationEnabled && c.code === loc.code;
        quickPillsHtml += `
          <button type="button" class="lg-quick-btn ${isActive ? 'active' : ''}" data-code="${c.code}">
            <span>${c.flag}</span>
            <span>${c.code}</span>
          </button>
        `;
      }
    });

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
      <!-- Compact Badge directly under Camera Icon -->
      <button type="button" id="location-gear-badge" title="SERP Location: ${locationEnabled ? loc.name : 'Real Location (OFF)'} - Click to switch or press Alt+L">
        <span class="lg-badge-flag">${locationEnabled ? (loc.flag || '🌐') : '⚪'}</span>
        <span class="lg-badge-code">${locationEnabled ? loc.code : 'OFF'}</span>
        <span class="lg-badge-arrow">▾</span>
      </button>

      <!-- Dropdown Menu -->
      <div id="location-gear-dropdown" class="${isDark ? 'lg-dark' : ''}">
        <div class="lg-dropdown-header">
          <input type="text" class="lg-search-box" id="lg-search-input" placeholder="🔍 Search country, code, city, or ZIP..." autocomplete="off">
        </div>

        <!-- Master Actions Bar -->
        <div class="lg-actions-bar">
          <button type="button" class="lg-btn-reset ${!locationEnabled ? 'inactive' : ''}" id="lg-btn-reset-home" title="Turn off spoofing and restore your real physical location">
            <span>${locationEnabled ? '⏻ Reset to Real Location' : '✓ Turn On Spoofing'}</span>
          </button>
          <button type="button" class="lg-action-chip ${isTop100 ? 'active' : ''}" id="lg-btn-toggle-top100" title="Toggle 100 Search Results per Page">
            <span>⚡ 100 Results</span>
          </button>
          <button type="button" class="lg-action-chip" id="lg-btn-open-extractor" title="Extract all organic ranking URLs to CSV or Clipboard">
            <span>📥 Export CSV</span>
          </button>
          <button type="button" class="lg-action-chip" id="lg-btn-open-compare" title="Compare side-by-side with another country">
            <span>📊 Compare</span>
          </button>
        </div>

        <!-- Settings Bar -->
        <div class="lg-settings-bar">
          <label class="lg-toggle-item" title="Forces Google UI to stay in English (hl=en)">
            <input type="checkbox" class="lg-mini-checkbox" id="lg-toggle-lang" ${languageLock ? 'checked' : ''}>
            <span>Keep English UI</span>
          </label>
          <span class="lg-badge-guarantee">🛡️ Zero CAPTCHAs</span>
        </div>

        ${recentCodes.length > 0 ? `
          <div class="lg-recents-section">
            <span class="lg-recents-label">🕒 Recents:</span>
            ${recentsHtml}
          </div>
        ` : ''}

        <div class="lg-quick-section">
          ${quickPillsHtml}
        </div>

        <div class="lg-tier-tabs">
          <button type="button" class="lg-tier-tab ${activeTierFilter === 'all' ? 'active' : ''}" data-tier="all">All (196)</button>
          <button type="button" class="lg-tier-tab ${activeTierFilter === '1' ? 'active' : ''}" data-tier="1">Tier 1 (24)</button>
          <button type="button" class="lg-tier-tab ${activeTierFilter === '2' ? 'active' : ''}" data-tier="2">Tier 2 (36)</button>
          <button type="button" class="lg-tier-tab ${activeTierFilter === '3' ? 'active' : ''}" data-tier="3">Tier 3 (136)</button>
        </div>

        <ul class="lg-country-list" id="lg-country-list">
        </ul>

        <div class="lg-dropdown-footer">
          <span><span class="lg-status-dot"></span>Zero-Lag gl Engine</span>
          <span class="lg-shortcut-hint">Alt+L • ESC to close</span>
        </div>
      </div>
    `;

    renderCountryList();
  }

  function isGoogleDarkMode() {
    const bg = window.getComputedStyle(document.body).backgroundColor;
    if (bg && (bg.includes('32, 33, 36') || bg.includes('31, 31, 31') || bg.includes('48, 49, 52'))) return true;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

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
      const isSelected = locationEnabled && activeLocation && activeLocation.code === c.code;
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

  function setupEventListeners(wrapper) {
    const badge = wrapper.querySelector('#location-gear-badge');
    const searchInput = wrapper.querySelector('#lg-search-input');
    const toggleLang = wrapper.querySelector('#lg-toggle-lang');

    // Badge click
    badge.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleDropdown();
    });

    // Reset to Real Location button (Courtland Gaba review fix)
    const resetBtn = wrapper.querySelector('#lg-btn-reset-home');
    if (resetBtn) {
      resetBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        locationEnabled = !locationEnabled;
        chrome.storage.local.set({ locationEnabled: locationEnabled }, function () {
          if (!locationEnabled) {
            chrome.runtime.sendMessage({ action: 'RESET_TO_HOME' });
            const url = new URL(window.location.href);
            url.searchParams.delete('gl');
            url.searchParams.delete('uule');
            url.searchParams.delete('cr');
            url.searchParams.delete('pws');
            if (url.searchParams.get('num') === '100') url.searchParams.delete('num');
            window.location.href = url.toString();
          } else {
            applyLocation(activeLocation);
          }
        });
      });
    }

    // Toggle 100 Results button
    const top100Btn = wrapper.querySelector('#lg-btn-toggle-top100');
    if (top100Btn) {
      top100Btn.addEventListener('click', function (e) {
        e.stopPropagation();
        isTop100 = !isTop100;
        chrome.storage.local.set({ top100: isTop100 }, function () {
          const url = new URL(window.location.href);
          if (isTop100) {
            url.searchParams.set('num', '100');
          } else {
            url.searchParams.delete('num');
          }
          window.location.href = url.toString();
        });
      });
    }

    // Open Extractor Modal
    const extractorBtn = wrapper.querySelector('#lg-btn-open-extractor');
    if (extractorBtn) {
      extractorBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        closeDropdown();
        openExtractorModal();
      });
    }

    // Open Compare Modal
    const compareBtn = wrapper.querySelector('#lg-btn-open-compare');
    if (compareBtn) {
      compareBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        closeDropdown();
        openDualCompareModal();
      });
    }

    // Language Lock toggle
    if (toggleLang) {
      toggleLang.addEventListener('change', function () {
        languageLock = toggleLang.checked;
        chrome.storage.local.set({ languageLock: languageLock });
      });
    }

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (isDropdownOpen && !wrapper.contains(e.target)) {
        closeDropdown();
      }
    });

    if (searchInput) {
      searchInput.addEventListener('input', function (e) {
        searchQuery = e.target.value;
        renderCountryList();
      });

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
            items[0].click();
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

    // Country List selection
    const listEl = wrapper.querySelector('#lg-country-list');
    if (listEl) {
      listEl.addEventListener('click', function (e) {
        e.stopPropagation();

        const customItem = e.target.closest('.lg-custom-location-item');
        if (customItem) {
          const customLoc = customItem.getAttribute('data-custom-location');
          applyCustomLocation(customLoc);
          return;
        }

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

  function saveToRecents(code) {
    if (!code) return;
    const upper = code.toUpperCase();
    recentCodes = [upper].concat(recentCodes.filter(c => c !== upper)).slice(0, 5);
    chrome.storage.local.set({ recentCodes: recentCodes });
  }

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

  function hookSearchForms() {
    if (!activeLocation) return;
    const targetCode = activeLocation.code.toLowerCase();

    const forms = document.querySelectorAll('form[action*="/search"], form[role="search"], form#tsf');
    forms.forEach(function (form) {
      if (locationEnabled) {
        let glInput = form.querySelector('input[name="gl"]');
        if (!glInput) {
          glInput = document.createElement('input');
          glInput.type = 'hidden';
          glInput.name = 'gl';
          form.appendChild(glInput);
        }
        glInput.value = targetCode;

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

        if (isTop100) {
          let numInput = form.querySelector('input[name="num"]');
          if (!numInput) {
            numInput = document.createElement('input');
            numInput.type = 'hidden';
            numInput.name = 'num';
            form.appendChild(numInput);
          }
          numInput.value = '100';
        }
      } else {
        const gl = form.querySelector('input[name="gl"]');
        if (gl) gl.remove();
        const num = form.querySelector('input[name="num"]');
        if (num) num.remove();
      }

      const badInputs = form.querySelectorAll('input[name="uule"], input[name="pws"], input[name="cr"]');
      badInputs.forEach(function (el) { el.remove(); });
    });
  }

  document.addEventListener('submit', function () {
    hookSearchForms();
  }, true);

  function applyLocation(locationObj) {
    if (!locationObj) return;

    activeLocation = locationObj;
    saveToRecents(locationObj.code);

    chrome.storage.local.set({
      activeLocation: locationObj,
      locationEnabled: true
    }, function () {
      const currentUrl = new URL(window.location.href);

      if (currentUrl.hostname.includes('maps.google') || currentUrl.pathname.startsWith('/maps')) {
        const canonical = locationObj.canonicalName || locationObj.name;
        const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(canonical)}&ll=${locationObj.lat},${locationObj.lng}`;
        window.location.href = mapsUrl;
        return;
      }

      currentUrl.searchParams.set('gl', locationObj.code.toLowerCase());

      if (languageLock) {
        currentUrl.searchParams.set('hl', 'en');
      } else {
        const nativeLang = getNativeLanguage(locationObj.code);
        currentUrl.searchParams.set('hl', nativeLang);
      }

      if (isTop100) {
        currentUrl.searchParams.set('num', '100');
      }

      currentUrl.searchParams.delete('cr');
      currentUrl.searchParams.delete('uule');
      currentUrl.searchParams.delete('pws');

      if (currentUrl.searchParams.get('source') === 'chrome.ctxt') {
        currentUrl.searchParams.delete('source');
        currentUrl.searchParams.delete('sourceid');
      }

      const cleanHref = currentUrl.toString()
        .replace(/&&+/g, '&')
        .replace(/\?&/g, '?')
        .replace(/&$/g, '');

      if (cleanHref !== window.location.href) {
        window.location.href = cleanHref;
      }
    });
  }

  // ========================================================
  // 1-Click SERP Extractor Modal
  // ========================================================
  function extractSerpData() {
    const results = [];
    const rso = document.getElementById('rso');
    let rank = 1;

    if (rso) {
      const organicBlocks = rso.querySelectorAll('div.MjjYud, div.g');
      organicBlocks.forEach(function (block) {
        if (block.closest('[data-text-ad], .uEierd, .related-question-pair, [data-initq], .g-blk')) return;

        const h3 = block.querySelector('h3');
        const link = block.querySelector('a[href^="http"]');
        if (h3 && link) {
          let domain = '';
          try {
            domain = new URL(link.href).hostname.replace(/^www\./, '');
          } catch (e) {
            domain = link.href;
          }

          results.push({
            rank: rank++,
            title: h3.textContent.trim(),
            domain: domain,
            url: link.href
          });
        }
      });
    }

    const adsCount = document.querySelectorAll('[data-text-ad], .uEierd').length;
    const hasLocal = document.querySelector('[data-local-pack], div.rllt__link, .VkpGBb') ? 1 : 0;

    return { results: results, adsCount: adsCount, hasLocal: hasLocal };
  }

  function openExtractorModal() {
    const existing = document.getElementById('location-gear-extractor-modal');
    if (existing) existing.remove();

    const data = extractSerpData();
    const loc = activeLocation || { name: 'United States', flag: '🇺🇸', code: 'US' };
    const isDark = isGoogleDarkMode();

    const modal = document.createElement('div');
    modal.id = 'location-gear-extractor-modal';
    modal.className = 'lg-modal-backdrop';

    let tableRows = '';
    data.results.forEach(function (row) {
      tableRows += `
        <tr>
          <td class="lg-rank-col">#${row.rank}</td>
          <td class="lg-title-col" title="${escapeHtml(row.title)}">${escapeHtml(row.title)}</td>
          <td class="lg-domain-col">${escapeHtml(row.domain)}</td>
          <td class="lg-url-col"><a href="${escapeHtml(row.url)}" target="_blank" rel="noopener">${escapeHtml(row.url)}</a></td>
        </tr>
      `;
    });

    modal.innerHTML = `
      <div class="lg-extractor-card ${isDark ? 'lg-dark' : ''}">
        <div class="lg-extractor-header">
          <div class="lg-extractor-title">
            <span>📊</span>
            <span>SERP Data Extractor • ${data.results.length} Results (${loc.flag} ${loc.name})</span>
          </div>
          <button type="button" class="lg-extractor-close" id="lg-modal-close-btn">✕</button>
        </div>

        <div class="lg-extractor-summary">
          <span><strong>${data.results.length}</strong> Organic Positions</span>
          <span>•</span>
          <span><strong>${data.adsCount}</strong> Ads</span>
          <span>•</span>
          <span><strong>${data.hasLocal}</strong> Local Pack</span>
        </div>

        <div class="lg-extractor-actions">
          <button type="button" class="lg-btn-action-primary" id="lg-btn-copy-urls">
            <span>📋 Copy All URLs</span>
          </button>
          <button type="button" class="lg-btn-action-secondary" id="lg-btn-download-csv">
            <span>📥 Download CSV</span>
          </button>
        </div>

        <div class="lg-extractor-table-wrap">
          <table class="lg-extractor-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Page Title</th>
                <th>Domain</th>
                <th>Target URL</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows || '<tr><td colspan="4" style="text-align:center; padding: 20px; color:#70757a;">No organic rankings found</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#lg-modal-close-btn').addEventListener('click', function () {
      modal.remove();
    });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.remove();
    });

    modal.querySelector('#lg-btn-copy-urls').addEventListener('click', function () {
      const urls = data.results.map(r => r.url).join('\n');
      navigator.clipboard.writeText(urls).then(function () {
        const btn = modal.querySelector('#lg-btn-copy-urls');
        btn.innerHTML = '<span>✓ Copied ' + data.results.length + ' URLs!</span>';
        setTimeout(function () {
          btn.innerHTML = '<span>📋 Copy All URLs</span>';
        }, 2000);
      });
    });

    modal.querySelector('#lg-btn-download-csv').addEventListener('click', function () {
      const query = new URL(window.location.href).searchParams.get('q') || 'search';
      let csv = 'Rank,Title,Domain,URL\n';
      data.results.forEach(function (r) {
        const cleanTitle = `"${r.title.replace(/"/g, '""')}"`;
        const cleanUrl = `"${r.url.replace(/"/g, '""')}"`;
        csv += `${r.rank},${cleanTitle},${r.domain},${cleanUrl}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `location-gear-${loc.code}-${query.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // ========================================================
  // Dual-SERP Split Comparison Overlay (Interactive 196 Countries)
  // ========================================================
  function openDualCompareModal() {
    const existing = document.getElementById('location-gear-compare-modal');
    if (existing) existing.remove();

    let currentLoc = activeLocation || { code: 'US', name: 'United States', flag: '🇺🇸' };
    let defaultRightCode = currentLoc.code === 'US' ? 'GB' : 'US';

    chrome.storage.local.get(['lastCompareCode'], function (res) {
      if (res.lastCompareCode && res.lastCompareCode !== currentLoc.code) {
        defaultRightCode = res.lastCompareCode;
      }

      let rightLoc = findCountry(defaultRightCode) || findCountry('US') || { code: 'US', name: 'United States', flag: '🇺🇸' };
      const query = new URL(window.location.href).searchParams.get('q') || '';

      const overlay = document.createElement('div');
      overlay.id = 'location-gear-compare-modal';
      overlay.className = 'lg-compare-overlay';

      // Build country options for select dropdowns
      let leftOptions = '';
      let rightOptions = '';
      COUNTRIES.forEach(function (c) {
        const leftSelected = c.code === currentLoc.code ? 'selected' : '';
        const rightSelected = c.code === rightLoc.code ? 'selected' : '';
        leftOptions += `<option value="${c.code}" ${leftSelected}>${c.flag} ${c.name} (${c.code})</option>`;
        rightOptions += `<option value="${c.code}" ${rightSelected}>${c.flag} ${c.name} (${c.code})</option>`;
      });

      const leftUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&gl=${currentLoc.code.toLowerCase()}&hl=en`;
      const rightUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&gl=${rightLoc.code.toLowerCase()}&hl=en`;

      overlay.innerHTML = `
        <div class="lg-compare-header">
          <div class="lg-compare-header-left">
            <span style="font-size: 18px;">🌍</span>
            <span class="lg-compare-title">Dual SERP Split View: "${escapeHtml(query)}"</span>
          </div>

          <div class="lg-compare-header-actions">
            <button type="button" class="lg-compare-btn" id="lg-compare-swap-btn" title="Swap left and right country views">
              <span>🔄 Swap Countries</span>
            </button>
            <button type="button" class="lg-compare-btn primary" id="lg-compare-close-btn">
              <span>✕ Close Split View</span>
            </button>
          </div>
        </div>

        <div class="lg-compare-hint-bar">
          <span>💡 <strong>Real-Time Cross-Border SERP</strong>: Pick any 2 countries to compare how Google ranks local competitors, Reddit discussions, and ads.</span>
        </div>

        <div class="lg-compare-split-body">
          <!-- Left Pane -->
          <div class="lg-compare-pane left">
            <div class="lg-compare-pane-header">
              <div class="lg-pane-header-title">
                <span class="lg-pane-label">Country 1:</span>
                <select class="lg-compare-select" id="lg-select-left">
                  ${leftOptions}
                </select>
              </div>
              <span class="lg-param-pill" id="lg-pill-left">gl=${currentLoc.code.toLowerCase()}</span>
            </div>
            <iframe class="lg-compare-frame" id="lg-frame-left" src="${leftUrl}"></iframe>
          </div>

          <div class="lg-compare-divider-badge" title="Side-by-side synchronized view">⇄</div>

          <!-- Right Pane -->
          <div class="lg-compare-pane right">
            <div class="lg-compare-pane-header">
              <div class="lg-pane-header-title">
                <span class="lg-pane-label">Country 2:</span>
                <select class="lg-compare-select" id="lg-select-right">
                  ${rightOptions}
                </select>
              </div>
              <span class="lg-param-pill" id="lg-pill-right">gl=${rightLoc.code.toLowerCase()}</span>
            </div>
            <iframe class="lg-compare-frame" id="lg-frame-right" src="${rightUrl}"></iframe>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      const leftSelect = overlay.querySelector('#lg-select-left');
      const rightSelect = overlay.querySelector('#lg-select-right');
      const leftFrame = overlay.querySelector('#lg-frame-left');
      const rightFrame = overlay.querySelector('#lg-frame-right');
      const pillLeft = overlay.querySelector('#lg-pill-left');
      const pillRight = overlay.querySelector('#lg-pill-right');

      // Change Left Country
      leftSelect.addEventListener('change', function () {
        const code = leftSelect.value;
        pillLeft.textContent = `gl=${code.toLowerCase()}`;
        leftFrame.src = `https://www.google.com/search?q=${encodeURIComponent(query)}&gl=${code.toLowerCase()}&hl=en`;
      });

      // Change Right Country
      rightSelect.addEventListener('change', function () {
        const code = rightSelect.value;
        pillRight.textContent = `gl=${code.toLowerCase()}`;
        rightFrame.src = `https://www.google.com/search?q=${encodeURIComponent(query)}&gl=${code.toLowerCase()}&hl=en`;
        chrome.storage.local.set({ lastCompareCode: code });
      });

      // Swap Countries
      overlay.querySelector('#lg-compare-swap-btn').addEventListener('click', function () {
        const leftVal = leftSelect.value;
        const rightVal = rightSelect.value;

        leftSelect.value = rightVal;
        rightSelect.value = leftVal;

        pillLeft.textContent = `gl=${rightVal.toLowerCase()}`;
        pillRight.textContent = `gl=${leftVal.toLowerCase()}`;

        const tempSrc = leftFrame.src;
        leftFrame.src = rightFrame.src;
        rightFrame.src = tempSrc;

        chrome.storage.local.set({ lastCompareCode: leftVal });
      });

      // Close Split View
      overlay.querySelector('#lg-compare-close-btn').addEventListener('click', function () {
        overlay.remove();
      });

      // Close on Escape
      const escHandler = function (e) {
        if (e.key === 'Escape') {
          overlay.remove();
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

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
