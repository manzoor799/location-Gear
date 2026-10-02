# Location Gear 🌍⚙️ (v1.2.0)

> **The Modern, Zero-Lag SERP & Maps Region Switcher with In-SERP Productivity Tools**  
> 100% Free, Unlimited Searches, Zero CAPTCHAs, and Zero 403 Errors.  
> Works natively on **Google Chrome**, **Brave**, **Microsoft Edge**, **Opera**, and **Firefox**.

---

## 🎯 Key Features (v1.2.0)

1. **Native In-SERP Control Dock (Live Google Search):**
   - Injected cleanly beneath the camera / lens icon in Google's search box.
   - Displays active country badge: `[ 🇵🇪 PE ▾ ]` with instant dropdown switcher.
   - Quick-switch favorite chips: `[ 🇺🇸 US ] [ 🇬🇧 GB ] [ 🇨🇦 CA ] [ 🇦🇺 AU ] [ 🇩🇪 DE ]` for 1-tap switching.
   - **`[ ↺ Reset ]`**: Clean, neutral 1-click button to restore your real physical location without alarming alert styles.

2. **⭐ Customizable Favorites Pinning:**
   - Star/unstar any of the 196 countries in the popup list with a single click.
   - Pinned favorites immediately populate the Quick Select bar in both the popup and In-SERP dock.
   - Stars stay hidden until hover to maintain a calm, unpolluted view.

3. **🕒 Live Target Market Local Time Clock:**
   - Displays real-time local time and timezone (e.g. `10:42 PM GMT-5`) for the target country.
   - Real-time client-side calculation using native `Intl.DateTimeFormat` and IANA timezone data.

4. **🌐 High-Value Language Market Filters:**
   - Instant filtering for major global language clusters: Spanish (6), German (3), French (6), Portuguese (4), Italian (2).
   - Preserves exact market economic priority order.

5. **1-Click SERP Extractor & Dual-SERP Comparison:**
   - Instant harvester modal extracting Rank, Title, Domain, and URL to CSV or Clipboard.
   - Side-by-side 50/50 dual view comparing rankings between two countries simultaneously with synced scrolling.

6. **Bulletproof Zero-Lag Engine (0 CAPTCHAs, 0 403 Forbidden):**
   - Uses Google's official, sanctioned `gl` regional parameter and `hl=en` English lock.
   - Purges scraper tokens (`uule`, `pws`, `cr`, `num`) that trigger Google Botguard security checkpoints.
   - 100% local client-side execution with zero external network requests or tracking.

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
│   └── content.js          # In-page UI dock & SERP redirection engine
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
