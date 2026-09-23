/**
 * Location Gear - Popup Script
 */

document.addEventListener('DOMContentLoaded', function () {
  const data = window.LocationGearData || {};
  const COUNTRIES = data.COUNTRIES || [];
  const generateUule = data.generateUule || function () { return ''; };
  const findCountry = data.findCountry || function () { return null; };

  let activeLocation = null;
  let activeTierFilter = 'all';
  let searchQuery = '';

  const activeFlag = document.getElementById('active-flag');
  const activeName = document.getElementById('active-name');
  const activeCoords = document.getElementById('active-coords');
  const activeTier = document.getElementById('active-tier');
  const spoofToggle = document.getElementById('spoof-toggle');
  const searchInput = document.getElementById('popup-search');
  const listEl = document.getElementById('popup-country-list');
  const openGoogleBtn = document.getElementById('open-google-btn');

  // Load storage state
  chrome.storage.local.get(['activeLocation', 'locationEnabled'], function (res) {
    if (res.activeLocation) {
      activeLocation = res.activeLocation;
    } else {
      activeLocation = findCountry('US') || COUNTRIES[0];
      chrome.storage.local.set({ activeLocation: activeLocation });
    }

    if (res.locationEnabled !== undefined) {
      spoofToggle.checked = Boolean(res.locationEnabled);
    }

    updateActiveCard();
    renderList();
  });

  function updateActiveCard() {
    if (!activeLocation) return;
    activeFlag.textContent = activeLocation.flag || '🌐';
    activeName.textContent = `${activeLocation.name} (${activeLocation.code})`;
    activeCoords.textContent = `${activeLocation.lat.toFixed(4)}°, ${activeLocation.lng.toFixed(4)}°`;
    activeTier.textContent = `Tier ${activeLocation.tier}`;
    activeTier.className = `tier-pill t${activeLocation.tier}`;
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
      listEl.innerHTML = `<li style="padding: 14px; text-align: center; color: #70757a; font-size: 12px;">No countries found</li>`;
      return;
    }

    let html = '';
    filtered.forEach(function (c) {
      const isSelected = activeLocation && activeLocation.code === c.code;
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

  // Toggle switch
  spoofToggle.addEventListener('change', function () {
    chrome.storage.local.set({ locationEnabled: spoofToggle.checked });
  });

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
    chrome.storage.local.set({
      activeLocation: country,
      locationEnabled: true
    }, function () {
      spoofToggle.checked = true;
      updateActiveCard();
      renderList();
    });
  });

  // "Open Google with this Region"
  openGoogleBtn.addEventListener('click', function () {
    if (!activeLocation) return;
    const url = `https://www.google.com/search?q=&gl=${activeLocation.code.toLowerCase()}&hl=en`;
    chrome.tabs.create({ url: url });
  });
});
