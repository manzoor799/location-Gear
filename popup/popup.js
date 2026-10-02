/**
 * Location Gear - Popup Script
 */

document.addEventListener('DOMContentLoaded', function () {
  const data = window.LocationGearData || {};
  const COUNTRIES = data.COUNTRIES || [];
  const LANGUAGE_MARKETS = data.LANGUAGE_MARKETS || {};
  const findCountry = data.findCountry || function () { return null; };

  let activeLocation = null;
  let locationEnabled = true;
  let favoriteCodes = ['US', 'GB', 'CA', 'AU', 'DE'];
  let isLangLock = true;
  let activeTierFilter = 'all';
  let activeLanguageFilter = 'all';
  let searchQuery = '';

  const activeFlag = document.getElementById('active-flag');
  const activeName = document.getElementById('active-name');
  const activeCoords = document.getElementById('active-coords');
  const activeTier = document.getElementById('active-tier');
  const activeCard = document.getElementById('active-card');
  const statusLabel = document.getElementById('status-label');
  const spoofToggle = document.getElementById('spoof-toggle');
  const masterResetBtn = document.getElementById('master-reset-btn');
  const masterBtnText = document.getElementById('master-btn-text');
  const favoriteChipsEl = document.getElementById('favorite-chips');
  const languageChipsEl = document.getElementById('language-chips');
  const langActiveIndicator = document.getElementById('lang-active-indicator');
  const searchInput = document.getElementById('popup-search');
  const listEl = document.getElementById('popup-country-list');
  const openGoogleBtn = document.getElementById('open-google-btn');
  const toggleLangLock = document.getElementById('toggle-langlock');

  // Purge legacy top100 setting to ensure no Google 403 Forbidden blocks
  chrome.storage.local.remove('top100');

  // Load storage state
  chrome.storage.local.get(['activeLocation', 'locationEnabled', 'favoriteCodes', 'languageLock', 'activeLanguageFilter'], function (res) {
    if (res.activeLocation && res.activeLocation.code) {
      activeLocation = res.activeLocation;
    } else {
      activeLocation = findCountry('US') || COUNTRIES[0];
      chrome.storage.local.set({ activeLocation: activeLocation });
    }

    if (res.locationEnabled !== undefined) {
      locationEnabled = Boolean(res.locationEnabled);
    }
    spoofToggle.checked = locationEnabled;

    if (Array.isArray(res.favoriteCodes) && res.favoriteCodes.length > 0) {
      favoriteCodes = res.favoriteCodes;
    }

    if (res.languageLock !== undefined) {
      isLangLock = Boolean(res.languageLock);
    }
    if (toggleLangLock) toggleLangLock.checked = isLangLock;

    if (res.activeLanguageFilter && (res.activeLanguageFilter === 'all' || LANGUAGE_MARKETS[res.activeLanguageFilter])) {
      activeLanguageFilter = res.activeLanguageFilter;
    }

    updateLanguageFilterUI();
    updateUI();
    renderFavoriteChips();
    renderList();
  });

  function updateUI() {
    // 1. Status label & Card
    if (locationEnabled) {
      statusLabel.textContent = 'ACTIVE';
      statusLabel.className = 'status-label';
      activeCard.classList.remove('disabled');
      spoofToggle.checked = true;

      masterResetBtn.className = 'btn-master-reset-compact';
      masterBtnText.textContent = 'Turn Off';
      masterResetBtn.title = 'Turn off spoofing and restore real physical location';
    } else {
      statusLabel.textContent = 'DISABLED';
      statusLabel.className = 'status-label disabled';
      activeCard.classList.add('disabled');
      spoofToggle.checked = false;

      masterResetBtn.className = 'btn-master-reset-compact inactive';
      masterBtnText.textContent = 'Turn On';
      masterResetBtn.title = 'Turn on location spoofing';
    }

    // 2. Active Card Info
    if (activeLocation) {
      activeFlag.textContent = activeLocation.flag || '🌐';
      activeName.textContent = `${activeLocation.name} (${activeLocation.code})`;
      activeCoords.textContent = `${activeLocation.lat.toFixed(4)}°, ${activeLocation.lng.toFixed(4)}°`;
      activeTier.textContent = `Tier ${activeLocation.tier}`;
      activeTier.className = `tier-pill t${activeLocation.tier}`;
    }

    renderFavoriteChips();
  }

  function renderFavoriteChips() {
    if (!favoriteChipsEl) return;
    let html = '';
    favoriteCodes.forEach(function (code) {
      const c = findCountry(code);
      if (c) {
        const isSelected = locationEnabled && activeLocation && activeLocation.code === c.code;
        html += `
          <button type="button" class="fav-chip ${isSelected ? 'active' : ''}" data-code="${c.code}" title="${c.name}">
            <span>${c.flag}</span>
            <span>${c.code}</span>
          </button>
        `;
      }
    });
    favoriteChipsEl.innerHTML = html;
  }

  function updateLanguageFilterUI() {
    if (languageChipsEl) {
      languageChipsEl.querySelectorAll('.lang-chip').forEach(function (chip) {
        const lang = chip.getAttribute('data-lang');
        if (lang === activeLanguageFilter) {
          chip.classList.add('active');
        } else {
          chip.classList.remove('active');
        }
      });
    }
    if (langActiveIndicator) {
      if (activeLanguageFilter === 'all' || !LANGUAGE_MARKETS[activeLanguageFilter]) {
        langActiveIndicator.textContent = 'All Languages';
      } else {
        const m = LANGUAGE_MARKETS[activeLanguageFilter];
        langActiveIndicator.textContent = `${m.flag} ${m.name} (${m.codes.length})`;
      }
    }
  }

  function renderList() {
    const query = searchQuery.trim().toLowerCase();

    // 1. Determine base countries according to active language filter (preserving exact market order)
    let baseCountries = COUNTRIES;
    if (activeLanguageFilter !== 'all' && LANGUAGE_MARKETS[activeLanguageFilter]) {
      const targetCodes = LANGUAGE_MARKETS[activeLanguageFilter].codes || [];
      baseCountries = targetCodes.map(function (code) {
        return findCountry(code);
      }).filter(Boolean);
    }

    // 2. Update Tier Tab Counts dynamically based on baseCountries
    const t1Count = baseCountries.filter(function (c) { return c.tier === 1; }).length;
    const t2Count = baseCountries.filter(function (c) { return c.tier === 2; }).length;
    const t3Count = baseCountries.filter(function (c) { return c.tier === 3; }).length;
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
      const tier = btn.getAttribute('data-tier');
      if (tier === 'all') btn.textContent = `All (${baseCountries.length})`;
      else if (tier === '1') btn.textContent = `Tier 1 (${t1Count})`;
      else if (tier === '2') btn.textContent = `Tier 2 (${t2Count})`;
      else if (tier === '3') btn.textContent = `Tier 3 (${t3Count})`;
    });

    // 3. Filter by Tier and Search Query
    const filtered = baseCountries.filter(function (c) {
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

    if (filtered.length === 0) {
      listEl.innerHTML = `<li style="padding: 12px; text-align: center; color: #70757a; font-size: 11px;">No countries found</li>`;
      return;
    }

    let html = '';
    filtered.forEach(function (c) {
      const isSelected = locationEnabled && activeLocation && activeLocation.code === c.code;
      let langTagHtml = '';
      if (activeLanguageFilter !== 'all' && LANGUAGE_MARKETS[activeLanguageFilter]) {
        const m = LANGUAGE_MARKETS[activeLanguageFilter];
        langTagHtml = `<span class="lang-tag">${m.flag} ${m.name}</span>`;
      }
      html += `
        <li class="popup-country-item ${isSelected ? 'selected' : ''}" data-code="${c.code}">
          <div class="item-left">
            <span class="item-flag">${c.flag}</span>
            <span class="item-name">${c.name} <span class="item-code">(${c.code})</span>${langTagHtml}</span>
          </div>
          <span class="tier-pill t${c.tier}">T${c.tier}</span>
        </li>
      `;
    });
    listEl.innerHTML = html;
  }

  // Master Reset / Toggle button click
  masterResetBtn.addEventListener('click', function () {
    locationEnabled = !locationEnabled;
    chrome.storage.local.set({ locationEnabled: locationEnabled }, function () {
      updateUI();
    });
  });

  // Switch toggle
  spoofToggle.addEventListener('change', function () {
    locationEnabled = spoofToggle.checked;
    chrome.storage.local.set({ locationEnabled: locationEnabled }, function () {
      updateUI();
    });
  });

  // Language Lock toggle
  if (toggleLangLock) {
    toggleLangLock.addEventListener('change', function () {
      isLangLock = toggleLangLock.checked;
      chrome.storage.local.set({ languageLock: isLangLock });
    });
  }

  // Language Market chip click
  if (languageChipsEl) {
    languageChipsEl.addEventListener('click', function (e) {
      const chip = e.target.closest('.lang-chip');
      if (!chip) return;
      const lang = chip.getAttribute('data-lang') || 'all';
      activeLanguageFilter = lang;

      // Reset tier filter to 'all' when switching language so all countries in that language appear
      activeTierFilter = 'all';
      document.querySelectorAll('.tab-btn').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-tier') === 'all');
      });

      chrome.storage.local.set({ activeLanguageFilter: activeLanguageFilter });
      updateLanguageFilterUI();
      renderList();
      if (listEl && listEl.parentElement) {
        listEl.parentElement.scrollTop = 0;
      }
    });
  }

  // Favorite chip click
  if (favoriteChipsEl) {
    favoriteChipsEl.addEventListener('click', function (e) {
      const chip = e.target.closest('.fav-chip');
      if (!chip) return;
      const code = chip.getAttribute('data-code');
      const country = findCountry(code);
      if (!country) return;

      activeLocation = country;
      locationEnabled = true;
      chrome.storage.local.set({
        activeLocation: country,
        locationEnabled: true
      }, function () {
        updateUI();
        renderList();
      });
    });
  }

  // Search filter
  searchInput.addEventListener('input', function (e) {
    searchQuery = e.target.value;
    renderList();
  });

  // Tier tab buttons
  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeTierFilter = btn.getAttribute('data-tier');
      renderList();
      if (listEl && listEl.parentElement) {
        listEl.parentElement.scrollTop = 0;
      }
    });
  });

  // Country item click
  listEl.addEventListener('click', function (e) {
    const item = e.target.closest('.popup-country-item');
    if (!item) return;

    const code = item.getAttribute('data-code');
    const country = findCountry(code);
    if (!country) return;

    activeLocation = country;
    locationEnabled = true;
    chrome.storage.local.set({
      activeLocation: country,
      locationEnabled: true
    }, function () {
      updateUI();
      renderList();
    });
  });

  // "Open Google with this Region"
  openGoogleBtn.addEventListener('click', function () {
    if (!activeLocation) return;
    const glParam = locationEnabled ? `&gl=${activeLocation.code.toLowerCase()}` : '';
    const hlParam = isLangLock ? '&hl=en' : '';
    const url = `https://www.google.com/search?q=${glParam}${hlParam}`;
    chrome.tabs.create({ url: url });
  });
});
