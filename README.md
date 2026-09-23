# Location Gear 🌍⚙️

> **Universal Cross-Browser Extension for 100% Accurate Google SERP & Maps Region Spoofing**  
> Works natively on **Google Chrome**, **Comet Browser**, **Mozilla Firefox**, **Apple Safari**, **Brave**, **Microsoft Edge**, and **Opera**.

---

## 🎯 Key Features

1. **In-Page Location Bar Directly Below the Search Bar:**
   - Injected natively below Google's search box without covering autocomplete suggestions.
   - Shows the active country flag and name (e.g., `[ 🇨🇦 Canada (CA) ▼ ]`).
   - Quick-switch pill buttons for instant 1-click switching between top markets (`US`, `CA`, `UK`, `AU`, `DE`, `FR`, `JP`, etc.).

2. **100% Reliable Location Accuracy (SERP Web + Map Pack + Google Maps):**
   - **Google `gl` regional parameter:** Forces Google's backend search index to match the chosen country.
   - **Google `uule` Canonical Location Token:** Dynamically encodes canonical location names into Google's proprietary Base64 format (`w+CAIQICI...`), changing the bottom location badge and SERP local 3-pack.
   - **HTML5 Geolocation API Override:** Injects into the main world execution context at `document_start` to intercept `navigator.geolocation.getCurrentPosition` and `watchPosition`, returning the exact physical coordinates (latitude/longitude) of the target country or city.
   - **Google Maps Integration:** Direct support for `maps.google.com` positioning.

3. **Worldwide Coverage (Tier 1, Tier 2, Tier 3):**
   - **Tier 1 (24 countries):** United States, United Kingdom, Canada, Australia, Germany, France, Japan, Singapore, South Korea, Switzerland, Netherlands, etc.
   - **Tier 2 (36 countries):** Brazil, Mexico, UAE, Saudi Arabia, Poland, Spain, Italy, Turkey, South Africa, Malaysia, Thailand, etc.
   - **Tier 3 (136 countries & territories):** India, Pakistan, Nigeria, Egypt, Indonesia, Vietnam, Philippines, and all remaining sovereign nations.
   - Live search box with instant filtering by country name, ISO code, or major metropolitan city (e.g. *Toronto, Vancouver, New York, London, Tokyo, Sydney*).

---

## 🚀 Installation Guide (Every Browser)

### 1. Google Chrome & Comet Browser (and Brave, Edge, Opera, Vivaldi)
1. Open your browser and navigate to the extensions page:
   - **Chrome / Comet / Brave:** `chrome://extensions/`
   - **Edge:** `edge://extensions/`
   - **Opera:** `opera://extensions/`
2. Enable **Developer Mode** (toggle in the top-right corner).
3. Click the **"Load unpacked"** button.
4. Select this directory: `/Volumes/Manzoor/Location Gear`
5. The **Location Gear** extension is now installed and active!

---

### 2. Mozilla Firefox
1. Open Firefox and go to `about:debugging#/runtime/this-firefox`.
2. Click **"Load Temporary Add-on..."**.
3. Select the `manifest.json` file inside `/Volumes/Manzoor/Location Gear/manifest.json`.
4. The extension will immediately load with full functionality.

---

### 3. Apple Safari (macOS & iOS)
Safari uses the standard Apple WebExtension converter:
1. Open the macOS Terminal.
2. Run the built-in Safari Web Extension converter command:
   ```bash
   xcrun safari-web-extension-converter "/Volumes/Manzoor/Location Gear"
   ```
3. Xcode will create a native Safari extension app project.
4. Open the project in Xcode, click **Run (⌘R)**, and enable the extension in **Safari > Settings > Extensions**.

---

## 🖥️ How It Works in Google Search

1. Go to [google.com](https://www.google.com) and search for anything (e.g., `digital marketing agency` or `best restaurants`).
2. Directly below the search bar, look for the **`🌐 SERP Region:`** bar.
3. Click on the active country button or any of the quick-switch pills (`US`, `CA`, `GB`, `AU`, `DE`...).
4. To search any of the 196 countries or cities:
   - Click the country button to open the dropdown menu.
   - Use the **[Tier 1]**, **[Tier 2]**, or **[Tier 3]** tabs, or type into the search box.
   - Click **Cities** on countries like Canada or the USA to select a specific metro area (e.g. *Toronto, ON*).
5. The page reloads seamlessly with the new localized index, SERP results, ad copy, and map pack!

---

## 📂 File Structure

```
Location Gear/
├── manifest.json            # Manifest V3 configuration (Universal cross-browser)
├── background.js           # Background service worker (state persistence)
├── README.md               # Documentation and installation instructions
├── data/
│   └── countries.js        # 196 countries dataset with Tiers, coords & UULE generator
├── scripts/
│   ├── inject-loader.js    # Content script running at document_start
│   ├── inject-main.js      # Main-world script mocking navigator.geolocation
│   └── content.js          # In-page UI below search bar & SERP redirection engine
├── styles/
│   └── content.css         # Google-native styling (Light & Dark theme support)
├── popup/
│   ├── popup.html          # Toolbar menu interface
│   ├── popup.css           # Toolbar menu styles
│   └── popup.js            # Toolbar menu logic
└── icons/
    ├── icon.svg            # Scalable SVG master asset
    ├── icon16.png          # 16x16 icon
    ├── icon48.png          # 48x48 icon
    └── icon128.png         # 128x128 icon
```
