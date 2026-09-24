/**
 * Location Gear - Popup Script
 */

document.addEventListener('DOMContentLoaded', function () {
  const data = window.LocationGearData || {};
  const COUNTRIES = data.COUNTRIES || [];
  const findCountry = data.findCountry || function () { return null; };

  let activeLocation = null;
  let locationEnabled = true;
  let favoriteCodes = ['US', 'GB', 'CA', 'AU', 'DE'];
  let isLangLock = true;
  let activeTierFilter = 'all';
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
  const searchInput = document.getElementById('popup-search');
  const listEl = document.getElementById('popup-country-list');
  const openGoogleBtn = document.getElementById('open-google-btn');
  const toggleLangLock = document.getElementById('toggle-langlock');

  // Purge legacy top100 setting to ensure no Google 403 Forbidden blocks
  chrome.storage.local.remove('top100');

  // Load storage state
  chrome.storage.local.get(['activeLocation', 'locationEnabled', 'favoriteCodes', 'languageLock'], function (res) {
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

      masterResetBtn.className = 'btn-master-reset';
      masterBtnText.textContent = 'Turn Off / Back to Real Location';
    } else {
      statusLabel.textContent = 'DISABLED';
      statusLabel.className = 'status-label disabled';
      activeCard.classList.add('disabled');
      spoofToggle.checked = false;

      masterResetBtn.className = 'btn-master-reset inactive';
      masterBtnText.textContent = '✓ Turn On Location Spoofing';
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

  function renderList() {
    const query = searchQuery.trim().toLowerCase();
    const filtered = COUNTRIES.filter(function (c) {
      if (activeTierFilter !== 'all' && String(c.tier) !== activeTierFilter) {
        return false;
      }
      if (!query) return true;
      return c.name.toLowerCase().includes(query) || c.code.toLowerCase().includes(query);
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `<li style="padding: 12px; text-align: center; color: #70757a; font-size: 11px;">No countries found</li>`;
      return;
    }

    let html = '';
    filtered.forEach(function (c) {
      const isSelected = locationEnabled && activeLocation && activeLocation.code === c.code;
      html += `
        <li class="popup-country-item ${isSelected ? 'selected' : ''}" data-code="${c.code}">
          <div class="item-left">
            <span class="item-flag">${c.flag}</span>
            <span class="item-name">${c.name} <span class="item-code">(${c.code})</span></span>
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
