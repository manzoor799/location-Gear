# Location Gear 🌍⚙️ (v1.1.0)

> **The Modern, Zero-Lag SERP & Maps Region Switcher with In-SERP Productivity Tools**  
> 100% Free, Unlimited Searches, Zero CAPTCHAs, and Zero 403 Errors.  
> Works natively on **Google Chrome**, **Brave**, **Microsoft Edge**, **Opera**, and **Firefox**.

---

## 🎯 Key Features (v1.1.0)

1. **Native In-SERP Control Dock (Live Google Search):**
   - Injected cleanly right below Google's category tabs (`All`, `Images`, `News`).
   - Displays active country: `[ 🇺🇸 United States ▾ ]` with instant country picker.
   - Quick-switch favorite chips: `[ 🇬🇧 UK ] [ 🇨🇦 CA ] [ 🇦🇺 AU ]` for 1-tap switching.
   - **`[ 🔄 Reset to Home ]`**: 1-click button to instantly disable spoofing and restore your real physical location.
   - **`[ ⚡ Top 100 ]`**: 1-tap switch to display 100 results per page (`num=100`) without opening Google Search settings.

2. **Organic Ranking Badges (`#1`, `#2`, `#3...`):**
   - Automatically tags every organic search result with its exact position number right beside the title.
   - Saves time counting links during SEO audits.

3. **1-Click SERP Extractor (CSV & Clipboard):**
   - Instant harvester modal extracting Rank, Page Title, Domain, and Target URL.
   - `[ 📋 Copy All URLs to Clipboard ]` for pasting directly into spreadsheets.
   - `[ 📥 Download Full CSV ]` for client deliverables.

4. **Dual-SERP Split Comparison Mode (50/50 View):**
   - Side-by-side view comparing two countries simultaneously (e.g. US vs UK).
   - Synced scrolling between both panes to easily spot ranking differences.

5. **Toolbar Status Badge & Master Reset Switch:**
   - Chrome toolbar icon displays the live country code (`US`, `UK`) in green, or `OFF` in grey.
   - Prominent **"Turn Off / Back to Real Location"** button in popup for effortless switching.

6. **Bulletproof Zero-Lag Engine (0 CAPTCHAs, 0 403 Forbidden):**
   - Uses Google's official, sanctioned `gl` regional parameter.
   - Purges scraper tokens (`uule`, `pws`, `cr`) that trigger Google Botguard security checkpoints.
   - Keeps Google navigation in English (`hl=en`) to avoid foreign language confusion.

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
