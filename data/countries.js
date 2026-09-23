/**
 * Location Gear - Comprehensive Worldwide Country & Region Database
 * Categorized into Tier 1, Tier 2, and Tier 3 countries.
 * Includes ISO codes, coordinates, canonical location names for Google UULE, and major cities.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LocationGearData = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  // Google UULE Secret Length Key Table
  const UULE_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

  /**
   * Generates a 100% accurate Google UULE parameter from a canonical location string.
   * Format: w+CAIQICI + SecretKeyChar + Base64(canonicalName)
   * 
   * @param {string} canonicalName e.g. "Toronto,Ontario,Canada" or "United States"
   * @returns {string} The encoded uule parameter string
   */
  function generateUule(canonicalName) {
    if (!canonicalName) return '';
    const cleanName = canonicalName.trim();
    const len = cleanName.length;
    if (len >= UULE_TABLE.length) {
      // If length exceeds 63, use standard base64 without key or truncate
      return '';
    }
    const keyChar = UULE_TABLE[len];
    let b64 = '';
    if (typeof btoa !== 'undefined') {
      b64 = btoa(unescape(encodeURIComponent(cleanName)));
    } else if (typeof Buffer !== 'undefined') {
      b64 = Buffer.from(cleanName, 'utf-8').toString('base64');
    }
    return `w+CAIQICI${keyChar}${b64}`;
  }

  // Database of Countries & Regions
  const COUNTRIES = [
    // ==========================================
    // TIER 1 COUNTRIES (Top Digital & Economic Markets)
    // ==========================================
    {
      code: 'US',
      name: 'United States',
      tier: 1,
      flag: '🇺🇸',
      canonicalName: 'United States',
      lat: 37.09024,
      lng: -95.712891,
      cities: [
        { name: 'New York, NY', canonical: 'New York,New York,United States', lat: 40.712776, lng: -74.005974 },
        { name: 'Los Angeles, CA', canonical: 'Los Angeles,California,United States', lat: 34.052235, lng: -118.243683 },
        { name: 'Chicago, IL', canonical: 'Chicago,Illinois,United States', lat: 41.878113, lng: -87.629799 },
        { name: 'Miami, FL', canonical: 'Miami,Florida,United States', lat: 25.761681, lng: -80.191788 },
        { name: 'Dallas, TX', canonical: 'Dallas,Texas,United States', lat: 32.776665, lng: -96.796989 },
        { name: 'San Francisco, CA', canonical: 'San Francisco,California,United States', lat: 37.774929, lng: -122.419418 },
        { name: 'Seattle, WA', canonical: 'Seattle,Washington,United States', lat: 47.606209, lng: -122.332069 }
      ]
    },
    {
      code: 'CA',
      name: 'Canada',
      tier: 1,
      flag: '🇨🇦',
      canonicalName: 'Canada',
      lat: 56.130366,
      lng: -106.346771,
      cities: [
        { name: 'Toronto, ON', canonical: 'Toronto,Ontario,Canada', lat: 43.653225, lng: -79.383186 },
        { name: 'Vancouver, BC', canonical: 'Vancouver,British Columbia,Canada', lat: 49.282730, lng: -123.120735 },
        { name: 'Montreal, QC', canonical: 'Montreal,Quebec,Canada', lat: 45.501690, lng: -73.567253 },
        { name: 'Calgary, AB', canonical: 'Calgary,Alberta,Canada', lat: 51.044733, lng: -114.071883 },
        { name: 'Ottawa, ON', canonical: 'Ottawa,Ontario,Canada', lat: 45.421532, lng: -75.697189 }
      ]
    },
    {
      code: 'GB',
      name: 'United Kingdom',
      tier: 1,
      flag: '🇬🇧',
      canonicalName: 'United Kingdom',
      lat: 55.378051,
      lng: -3.435973,
      cities: [
        { name: 'London', canonical: 'London,England,United Kingdom', lat: 51.507351, lng: -0.127758 },
        { name: 'Manchester', canonical: 'Manchester,England,United Kingdom', lat: 53.480759, lng: -2.242631 },
        { name: 'Birmingham', canonical: 'Birmingham,England,United Kingdom', lat: 52.486244, lng: -1.890401 },
        { name: 'Edinburgh', canonical: 'Edinburgh,Scotland,United Kingdom', lat: 55.953251, lng: -3.188267 },
        { name: 'Glasgow', canonical: 'Glasgow,Scotland,United Kingdom', lat: 55.864239, lng: -4.251806 }
      ]
    },
    {
      code: 'AU',
      name: 'Australia',
      tier: 1,
      flag: '🇦🇺',
      canonicalName: 'Australia',
      lat: -25.274398,
      lng: 133.775136,
      cities: [
        { name: 'Sydney, NSW', canonical: 'Sydney,New South Wales,Australia', lat: -33.868820, lng: 151.209296 },
        { name: 'Melbourne, VIC', canonical: 'Melbourne,Victoria,Australia', lat: -37.813629, lng: 144.963058 },
        { name: 'Brisbane, QLD', canonical: 'Brisbane,Queensland,Australia', lat: -27.469771, lng: 153.025131 },
        { name: 'Perth, WA', canonical: 'Perth,Western Australia,Australia', lat: -31.950527, lng: 115.860458 }
      ]
    },
    {
      code: 'DE',
      name: 'Germany',
      tier: 1,
      flag: '🇩🇪',
      canonicalName: 'Germany',
      lat: 51.165691,
      lng: 10.451526,
      cities: [
        { name: 'Berlin', canonical: 'Berlin,Berlin,Germany', lat: 52.520008, lng: 13.404954 },
        { name: 'Munich', canonical: 'Munich,Bavaria,Germany', lat: 48.135124, lng: 11.581981 },
        { name: 'Frankfurt', canonical: 'Frankfurt,Hesse,Germany', lat: 50.110924, lng: 8.682127 },
        { name: 'Hamburg', canonical: 'Hamburg,Hamburg,Germany', lat: 53.551086, lng: 9.993682 }
      ]
    },
    {
      code: 'FR',
      name: 'France',
      tier: 1,
      flag: '🇫🇷',
      canonicalName: 'France',
      lat: 46.227638,
      lng: 2.213749,
      cities: [
        { name: 'Paris', canonical: 'Paris,Ile-de-France,France', lat: 48.856613, lng: 2.352222 },
        { name: 'Lyon', canonical: 'Lyon,Auvergne-Rhone-Alpes,France', lat: 45.764042, lng: 4.835659 },
        { name: 'Marseille', canonical: 'Marseille,Provence-Alpes-Cote d\'Azur,France', lat: 43.296482, lng: 5.369780 }
      ]
    },
    {
      code: 'JP',
      name: 'Japan',
      tier: 1,
      flag: '🇯🇵',
      canonicalName: 'Japan',
      lat: 36.204824,
      lng: 138.25293,
      cities: [
        { name: 'Tokyo', canonical: 'Tokyo,Tokyo,Japan', lat: 35.676192, lng: 139.650311 },
        { name: 'Osaka', canonical: 'Osaka,Osaka,Japan', lat: 34.693737, lng: 135.502165 },
        { name: 'Kyoto', canonical: 'Kyoto,Kyoto,Japan', lat: 35.011636, lng: 135.768029 }
      ]
    },
    {
      code: 'NL',
      name: 'Netherlands',
      tier: 1,
      flag: '🇳🇱',
      canonicalName: 'Netherlands',
      lat: 52.132633,
      lng: 5.291266,
      cities: [
        { name: 'Amsterdam', canonical: 'Amsterdam,North Holland,Netherlands', lat: 52.367573, lng: 4.904139 },
        { name: 'Rotterdam', canonical: 'Rotterdam,South Holland,Netherlands', lat: 51.924420, lng: 4.477733 }
      ]
    },
    {
      code: 'CH',
      name: 'Switzerland',
      tier: 1,
      flag: '🇨🇭',
      canonicalName: 'Switzerland',
      lat: 46.818188,
      lng: 8.227512,
      cities: [
        { name: 'Zurich', canonical: 'Zurich,Zurich,Switzerland', lat: 47.376887, lng: 8.541694 },
        { name: 'Geneva', canonical: 'Geneva,Geneva,Switzerland', lat: 46.204391, lng: 6.143158 }
      ]
    },
    {
      code: 'SE',
      name: 'Sweden',
      tier: 1,
      flag: '🇸🇪',
      canonicalName: 'Sweden',
      lat: 60.128161,
      lng: 18.643501,
      cities: [
        { name: 'Stockholm', canonical: 'Stockholm,Stockholm County,Sweden', lat: 59.329323, lng: 18.068581 },
        { name: 'Gothenburg', canonical: 'Gothenburg,Vastra Gotaland County,Sweden', lat: 57.708870, lng: 11.974560 }
      ]
    },
    {
      code: 'NO',
      name: 'Norway',
      tier: 1,
      flag: '🇳🇴',
      canonicalName: 'Norway',
      lat: 60.472024,
      lng: 8.468946,
      cities: [
        { name: 'Oslo', canonical: 'Oslo,Oslo,Norway', lat: 59.913868, lng: 10.752245 },
        { name: 'Bergen', canonical: 'Bergen,Vestland,Norway', lat: 60.391263, lng: 5.322054 }
      ]
    },
    {
      code: 'DK',
      name: 'Denmark',
      tier: 1,
      flag: '🇩🇰',
      canonicalName: 'Denmark',
      lat: 56.26392,
      lng: 9.501785,
      cities: [
        { name: 'Copenhagen', canonical: 'Copenhagen,Capital Region of Denmark,Denmark', lat: 55.676098, lng: 12.568337 }
      ]
    },
    {
      code: 'FI',
      name: 'Finland',
      tier: 1,
      flag: '🇫🇮',
      canonicalName: 'Finland',
      lat: 61.92411,
      lng: 25.748151,
      cities: [
        { name: 'Helsinki', canonical: 'Helsinki,Uusimaa,Finland', lat: 60.169856, lng: 24.938379 }
      ]
    },
    {
      code: 'SG',
      name: 'Singapore',
      tier: 1,
      flag: '🇸🇬',
      canonicalName: 'Singapore',
      lat: 1.352083,
      lng: 103.819836,
      cities: [
        { name: 'Singapore', canonical: 'Singapore,Singapore', lat: 1.352083, lng: 103.819836 }
      ]
    },
    {
      code: 'NZ',
      name: 'New Zealand',
      tier: 1,
      flag: '🇳🇿',
      canonicalName: 'New Zealand',
      lat: -40.900557,
      lng: 174.885971,
      cities: [
        { name: 'Auckland', canonical: 'Auckland,Auckland,New Zealand', lat: -36.848461, lng: 174.763336 },
        { name: 'Wellington', canonical: 'Wellington,Wellington,New Zealand', lat: -41.286461, lng: 174.776236 }
      ]
    },
    {
      code: 'IE',
      name: 'Ireland',
      tier: 1,
      flag: '🇮🇪',
      canonicalName: 'Ireland',
      lat: 53.41291,
      lng: -8.24389,
      cities: [
        { name: 'Dublin', canonical: 'Dublin,County Dublin,Ireland', lat: 53.349805, lng: -6.260310 }
      ]
    },
    {
      code: 'BE',
      name: 'Belgium',
      tier: 1,
      flag: '🇧🇪',
      canonicalName: 'Belgium',
      lat: 50.503887,
      lng: 4.469936,
      cities: [
        { name: 'Brussels', canonical: 'Brussels,Brussels,Belgium', lat: 50.850346, lng: 4.351721 }
      ]
    },
    {
      code: 'AT',
      name: 'Austria',
      tier: 1,
      flag: '🇦🇹',
      canonicalName: 'Austria',
      lat: 47.516231,
      lng: 14.550072,
      cities: [
        { name: 'Vienna', canonical: 'Vienna,Vienna,Austria', lat: 48.208174, lng: 16.373819 }
      ]
    },
    {
      code: 'IT',
      name: 'Italy',
      tier: 1,
      flag: '🇮🇹',
      canonicalName: 'Italy',
      lat: 41.87194,
      lng: 12.56738,
      cities: [
        { name: 'Rome', canonical: 'Rome,Lazio,Italy', lat: 41.902783, lng: 12.496366 },
        { name: 'Milan', canonical: 'Milan,Lombardy,Italy', lat: 45.464204, lng: 9.189982 }
      ]
    },
    {
      code: 'ES',
      name: 'Spain',
      tier: 1,
      flag: '🇪🇸',
      canonicalName: 'Spain',
      lat: 40.463667,
      lng: -3.74922,
      cities: [
        { name: 'Madrid', canonical: 'Madrid,Community of Madrid,Spain', lat: 40.416775, lng: -3.703790 },
        { name: 'Barcelona', canonical: 'Barcelona,Catalonia,Spain', lat: 41.387917, lng: 2.169919 }
      ]
    },
    {
      code: 'KR',
      name: 'South Korea',
      tier: 1,
      flag: '🇰🇷',
      canonicalName: 'South Korea',
      lat: 35.907757,
      lng: 127.766922,
      cities: [
        { name: 'Seoul', canonical: 'Seoul,Seoul,South Korea', lat: 37.566535, lng: 126.977969 },
        { name: 'Busan', canonical: 'Busan,Busan,South Korea', lat: 35.179554, lng: 129.075642 }
      ]
    },
    {
      code: 'IL',
      name: 'Israel',
      tier: 1,
      flag: '🇮🇱',
      canonicalName: 'Israel',
      lat: 31.046051,
      lng: 34.851612,
      cities: [
        { name: 'Tel Aviv', canonical: 'Tel Aviv,Tel Aviv District,Israel', lat: 32.0853, lng: 34.781768 },
        { name: 'Jerusalem', canonical: 'Jerusalem,Jerusalem District,Israel', lat: 31.768319, lng: 35.21371 }
      ]
    },
    {
      code: 'LU',
      name: 'Luxembourg',
      tier: 1,
      flag: '🇱🇺',
      canonicalName: 'Luxembourg',
      lat: 49.815273,
      lng: 6.129583,
      cities: [
        { name: 'Luxembourg City', canonical: 'Luxembourg,Luxembourg', lat: 49.611621, lng: 6.131935 }
      ]
    },
    {
      code: 'IS',
      name: 'Iceland',
      tier: 1,
      flag: '🇮🇸',
      canonicalName: 'Iceland',
      lat: 64.963051,
      lng: -19.020835,
      cities: [
        { name: 'Reykjavik', canonical: 'Reykjavik,Capital Region,Iceland', lat: 64.146582, lng: -21.942635 }
      ]
    },

    // ==========================================
    // TIER 2 COUNTRIES (Developed & Emerging High-Growth Markets)
    // ==========================================
    {
      code: 'AE',
      name: 'United Arab Emirates',
      tier: 2,
      flag: '🇦🇪',
      canonicalName: 'United Arab Emirates',
      lat: 23.424076,
      lng: 53.847818,
      cities: [
        { name: 'Dubai', canonical: 'Dubai,Dubai,United Arab Emirates', lat: 25.204849, lng: 55.270783 },
        { name: 'Abu Dhabi', canonical: 'Abu Dhabi,Abu Dhabi,United Arab Emirates', lat: 24.453884, lng: 54.377344 }
      ]
    },
    {
      code: 'SA',
      name: 'Saudi Arabia',
      tier: 2,
      flag: '🇸🇦',
      canonicalName: 'Saudi Arabia',
      lat: 23.885942,
      lng: 45.079162,
      cities: [
        { name: 'Riyadh', canonical: 'Riyadh,Riyadh Province,Saudi Arabia', lat: 24.713552, lng: 46.675296 },
        { name: 'Jeddah', canonical: 'Jeddah,Makkah Province,Saudi Arabia', lat: 21.485811, lng: 39.192505 }
      ]
    },
    {
      code: 'BR',
      name: 'Brazil',
      tier: 2,
      flag: '🇧🇷',
      canonicalName: 'Brazil',
      lat: -14.235004,
      lng: -51.92528,
      cities: [
        { name: 'Sao Paulo', canonical: 'Sao Paulo,State of Sao Paulo,Brazil', lat: -23.55052, lng: -46.633309 },
        { name: 'Rio de Janeiro', canonical: 'Rio de Janeiro,State of Rio de Janeiro,Brazil', lat: -22.906847, lng: -43.172896 }
      ]
    },
    {
      code: 'MX',
      name: 'Mexico',
      tier: 2,
      flag: '🇲🇽',
      canonicalName: 'Mexico',
      lat: 23.634501,
      lng: -102.552784,
      cities: [
        { name: 'Mexico City', canonical: 'Mexico City,Mexico City,Mexico', lat: 19.432608, lng: -99.133208 },
        { name: 'Guadalajara', canonical: 'Guadalajara,Jalisco,Mexico', lat: 20.659698, lng: -103.349609 }
      ]
    },
    {
      code: 'PL',
      name: 'Poland',
      tier: 2,
      flag: '🇵🇱',
      canonicalName: 'Poland',
      lat: 51.919438,
      lng: 19.145136,
      cities: [
        { name: 'Warsaw', canonical: 'Warsaw,Masovian Voivodeship,Poland', lat: 52.229676, lng: 21.012229 },
        { name: 'Krakow', canonical: 'Krakow,Lesser Poland Voivodeship,Poland', lat: 50.06465, lng: 19.94498 }
      ]
    },
    {
      code: 'PT',
      name: 'Portugal',
      tier: 2,
      flag: '🇵🇹',
      canonicalName: 'Portugal',
      lat: 39.399872,
      lng: -8.224454,
      cities: [
        { name: 'Lisbon', canonical: 'Lisbon,Lisbon,Portugal', lat: 38.722252, lng: -9.139337 },
        { name: 'Porto', canonical: 'Porto,Porto,Portugal', lat: 41.157944, lng: -8.629105 }
      ]
    },
    {
      code: 'TR',
      name: 'Turkey',
      tier: 2,
      flag: '🇹🇷',
      canonicalName: 'Turkey',
      lat: 38.963745,
      lng: 35.243322,
      cities: [
        { name: 'Istanbul', canonical: 'Istanbul,Istanbul,Turkey', lat: 41.008238, lng: 28.978359 },
        { name: 'Ankara', canonical: 'Ankara,Ankara,Turkey', lat: 39.933363, lng: 32.859742 }
      ]
    },
    {
      code: 'ZA',
      name: 'South Africa',
      tier: 2,
      flag: '🇿🇦',
      canonicalName: 'South Africa',
      lat: -30.559482,
      lng: 22.937506,
      cities: [
        { name: 'Johannesburg', canonical: 'Johannesburg,Gauteng,South Africa', lat: -26.204103, lng: 28.047305 },
        { name: 'Cape Town', canonical: 'Cape Town,Western Cape,South Africa', lat: -33.924869, lng: 18.424055 }
      ]
    },
    {
      code: 'MY',
      name: 'Malaysia',
      tier: 2,
      flag: '🇲🇾',
      canonicalName: 'Malaysia',
      lat: 4.210484,
      lng: 101.975766,
      cities: [
        { name: 'Kuala Lumpur', canonical: 'Kuala Lumpur,Federal Territory of Kuala Lumpur,Malaysia', lat: 3.139003, lng: 101.686855 }
      ]
    },
    {
      code: 'TH',
      name: 'Thailand',
      tier: 2,
      flag: '🇹🇭',
      canonicalName: 'Thailand',
      lat: 15.870032,
      lng: 100.992541,
      cities: [
        { name: 'Bangkok', canonical: 'Bangkok,Bangkok,Thailand', lat: 13.756331, lng: 100.501765 }
      ]
    },
    {
      code: 'TW',
      name: 'Taiwan',
      tier: 2,
      flag: '🇹🇼',
      canonicalName: 'Taiwan',
      lat: 23.69781,
      lng: 120.960515,
      cities: [
        { name: 'Taipei', canonical: 'Taipei,Taipei City,Taiwan', lat: 25.032969, lng: 121.565418 }
      ]
    },
    {
      code: 'HK',
      name: 'Hong Kong',
      tier: 2,
      flag: '🇭🇰',
      canonicalName: 'Hong Kong',
      lat: 22.319304,
      lng: 114.169361,
      cities: [
        { name: 'Hong Kong', canonical: 'Hong Kong,Hong Kong', lat: 22.319304, lng: 114.169361 }
      ]
    },
    {
      code: 'CZ',
      name: 'Czech Republic',
      tier: 2,
      flag: '🇨🇿',
      canonicalName: 'Czech Republic',
      lat: 49.817492,
      lng: 15.472962,
      cities: [
        { name: 'Prague', canonical: 'Prague,Prague,Czech Republic', lat: 50.075538, lng: 14.4378 }
      ]
    },
    {
      code: 'GR',
      name: 'Greece',
      tier: 2,
      flag: '🇬🇷',
      canonicalName: 'Greece',
      lat: 39.074208,
      lng: 21.824312,
      cities: [
        { name: 'Athens', canonical: 'Athens,Decentralized Administration of Attica,Greece', lat: 37.98381, lng: 23.727539 }
      ]
    },
    {
      code: 'RO',
      name: 'Romania',
      tier: 2,
      flag: '🇷🇴',
      canonicalName: 'Romania',
      lat: 45.943161,
      lng: 24.96676,
      cities: [
        { name: 'Bucharest', canonical: 'Bucharest,Bucharest,Romania', lat: 44.426767, lng: 26.102538 }
      ]
    },
    {
      code: 'HU',
      name: 'Hungary',
      tier: 2,
      flag: '🇭🇺',
      canonicalName: 'Hungary',
      lat: 47.162494,
      lng: 19.503304,
      cities: [
        { name: 'Budapest', canonical: 'Budapest,Budapest,Hungary', lat: 47.497912, lng: 19.040235 }
      ]
    },
    {
      code: 'AR',
      name: 'Argentina',
      tier: 2,
      flag: '🇦🇷',
      canonicalName: 'Argentina',
      lat: -38.416097,
      lng: -63.616672,
      cities: [
        { name: 'Buenos Aires', canonical: 'Buenos Aires,Buenos Aires,Argentina', lat: -34.603684, lng: -58.381559 }
      ]
    },
    {
      code: 'CL',
      name: 'Chile',
      tier: 2,
      flag: '🇨🇱',
      canonicalName: 'Chile',
      lat: -35.675147,
      lng: -71.542969,
      cities: [
        { name: 'Santiago', canonical: 'Santiago,Santiago Metropolitan Region,Chile', lat: -33.44889, lng: -70.669265 }
      ]
    },
    {
      code: 'CO',
      name: 'Colombia',
      tier: 2,
      flag: '🇨🇴',
      canonicalName: 'Colombia',
      lat: 4.570868,
      lng: -74.297333,
      cities: [
        { name: 'Bogota', canonical: 'Bogota,Bogota,Colombia', lat: 4.710989, lng: -74.072092 }
      ]
    },
    {
      code: 'QA',
      name: 'Qatar',
      tier: 2,
      flag: '🇶🇦',
      canonicalName: 'Qatar',
      lat: 25.354826,
      lng: 51.183884,
      cities: [
        { name: 'Doha', canonical: 'Doha,Ad-Dawhah,Qatar', lat: 25.285447, lng: 51.53104 }
      ]
    },
    {
      code: 'KW',
      name: 'Kuwait',
      tier: 2,
      flag: '🇰🇼',
      canonicalName: 'Kuwait',
      lat: 29.31166,
      lng: 47.481766,
      cities: [
        { name: 'Kuwait City', canonical: 'Kuwait City,Al Asimah Governate,Kuwait', lat: 29.375859, lng: 47.977405 }
      ]
    },
    {
      code: 'OM',
      name: 'Oman',
      tier: 2,
      flag: '🇴🇲',
      canonicalName: 'Oman',
      lat: 21.473533,
      lng: 55.975414,
      cities: [
        { name: 'Muscat', canonical: 'Muscat,Muscat Governorate,Oman', lat: 23.58589, lng: 58.405923 }
      ]
    },
    {
      code: 'BH',
      name: 'Bahrain',
      tier: 2,
      flag: '🇧🇭',
      canonicalName: 'Bahrain',
      lat: 26.0667,
      lng: 50.5577,
      cities: [
        { name: 'Manama', canonical: 'Manama,Capital Governorate,Bahrain', lat: 26.2277, lng: 50.5857 }
      ]
    },
    {
      code: 'HR',
      name: 'Croatia',
      tier: 2,
      flag: '🇭🇷',
      canonicalName: 'Croatia',
      lat: 45.1,
      lng: 15.2,
      cities: [
        { name: 'Zagreb', canonical: 'Zagreb,City of Zagreb,Croatia', lat: 45.815, lng: 15.9819 }
      ]
    },
    {
      code: 'SK',
      name: 'Slovakia',
      tier: 2,
      flag: '🇸🇰',
      canonicalName: 'Slovakia',
      lat: 48.669,
      lng: 19.699,
      cities: [
        { name: 'Bratislava', canonical: 'Bratislava,Bratislava Region,Slovakia', lat: 48.1486, lng: 17.1077 }
      ]
    },
    {
      code: 'BG',
      name: 'Bulgaria',
      tier: 2,
      flag: '🇧🇬',
      canonicalName: 'Bulgaria',
      lat: 42.7339,
      lng: 25.4858,
      cities: [
        { name: 'Sofia', canonical: 'Sofia,Sofia City Province,Bulgaria', lat: 42.6977, lng: 23.3219 }
      ]
    },
    {
      code: 'EE',
      name: 'Estonia',
      tier: 2,
      flag: '🇪🇪',
      canonicalName: 'Estonia',
      lat: 58.5953,
      lng: 25.0136,
      cities: [
        { name: 'Tallinn', canonical: 'Tallinn,Harju County,Estonia', lat: 59.437, lng: 24.7536 }
      ]
    },
    {
      code: 'LV',
      name: 'Latvia',
      tier: 2,
      flag: '🇱🇻',
      canonicalName: 'Latvia',
      lat: 56.8796,
      lng: 24.6032,
      cities: [
        { name: 'Riga', canonical: 'Riga,Riga,Latvia', lat: 56.9496, lng: 24.1052 }
      ]
    },
    {
      code: 'LT',
      name: 'Lithuania',
      tier: 2,
      flag: '🇱🇹',
      canonicalName: 'Lithuania',
      lat: 55.1694,
      lng: 23.8813,
      cities: [
        { name: 'Vilnius', canonical: 'Vilnius,Vilnius County,Lithuania', lat: 54.6872, lng: 25.2797 }
      ]
    },
    {
      code: 'SI',
      name: 'Slovenia',
      tier: 2,
      flag: '🇸🇮',
      canonicalName: 'Slovenia',
      lat: 46.1512,
      lng: 14.9955,
      cities: [
        { name: 'Ljubljana', canonical: 'Ljubljana,Ljubljana,Slovenia', lat: 46.0569, lng: 14.5058 }
      ]
    },
    {
      code: 'CY',
      name: 'Cyprus',
      tier: 2,
      flag: '🇨🇾',
      canonicalName: 'Cyprus',
      lat: 35.1264,
      lng: 33.4299,
      cities: [
        { name: 'Nicosia', canonical: 'Nicosia,Nicosia,Cyprus', lat: 35.1856, lng: 33.3823 }
      ]
    },
    {
      code: 'MT',
      name: 'Malta',
      tier: 2,
      flag: '🇲🇹',
      canonicalName: 'Malta',
      lat: 35.9375,
      lng: 14.3754,
      cities: [
        { name: 'Valletta', canonical: 'Valletta,South Eastern Region,Malta', lat: 35.8989, lng: 14.5146 }
      ]
    },
    {
      code: 'CR',
      name: 'Costa Rica',
      tier: 2,
      flag: '🇨🇷',
      canonicalName: 'Costa Rica',
      lat: 9.7489,
      lng: -83.7534,
      cities: [
        { name: 'San Jose', canonical: 'San Jose,San Jose Province,Costa Rica', lat: 9.9281, lng: -84.0907 }
      ]
    },
    {
      code: 'PA',
      name: 'Panama',
      tier: 2,
      flag: '🇵🇦',
      canonicalName: 'Panama',
      lat: 8.5379,
      lng: -80.7821,
      cities: [
        { name: 'Panama City', canonical: 'Panama City,Panama Province,Panama', lat: 8.9824, lng: -79.5199 }
      ]
    },
    {
      code: 'UY',
      name: 'Uruguay',
      tier: 2,
      flag: '🇺🇾',
      canonicalName: 'Uruguay',
      lat: -32.5228,
      lng: -55.7658,
      cities: [
        { name: 'Montevideo', canonical: 'Montevideo,Montevideo Department,Uruguay', lat: -34.9011, lng: -56.1645 }
      ]
    },
    {
      code: 'RS',
      name: 'Serbia',
      tier: 2,
      flag: '🇷🇸',
      canonicalName: 'Serbia',
      lat: 44.0165,
      lng: 21.0059,
      cities: [
        { name: 'Belgrade', canonical: 'Belgrade,Belgrade,Serbia', lat: 44.7866, lng: 20.4489 }
      ]
    },

    // ==========================================
    // TIER 3 COUNTRIES (Emerging Economies & Worldwide Coverage)
    // ==========================================
    {
      code: 'IN',
      name: 'India',
      tier: 3,
      flag: '🇮🇳',
      canonicalName: 'India',
      lat: 20.593684,
      lng: 78.96288,
      cities: [
        { name: 'New Delhi', canonical: 'New Delhi,Delhi,India', lat: 28.613939, lng: 77.209021 },
        { name: 'Mumbai', canonical: 'Mumbai,Maharashtra,India', lat: 19.075984, lng: 72.877656 },
        { name: 'Bangalore', canonical: 'Bengaluru,Karnataka,India', lat: 12.971598, lng: 77.594563 }
      ]
    },
    {
      code: 'PK',
      name: 'Pakistan',
      tier: 3,
      flag: '🇵🇰',
      canonicalName: 'Pakistan',
      lat: 30.375321,
      lng: 69.345116,
      cities: [
        { name: 'Islamabad', canonical: 'Islamabad,Islamabad Capital Territory,Pakistan', lat: 33.6844, lng: 73.0479 },
        { name: 'Karachi', canonical: 'Karachi,Sindh,Pakistan', lat: 24.8607, lng: 67.0011 },
        { name: 'Lahore', canonical: 'Lahore,Punjab,Pakistan', lat: 31.5204, lng: 74.3587 }
      ]
    },
    {
      code: 'ID',
      name: 'Indonesia',
      tier: 3,
      flag: '🇮🇩',
      canonicalName: 'Indonesia',
      lat: -0.789275,
      lng: 113.921327,
      cities: [
        { name: 'Jakarta', canonical: 'Jakarta,Special Capital Region of Jakarta,Indonesia', lat: -6.208763, lng: 106.845599 }
      ]
    },
    {
      code: 'PH',
      name: 'Philippines',
      tier: 3,
      flag: '🇵🇭',
      canonicalName: 'Philippines',
      lat: 12.879721,
      lng: 121.774017,
      cities: [
        { name: 'Manila', canonical: 'Manila,Metro Manila,Philippines', lat: 14.599512, lng: 120.984219 }
      ]
    },
    {
      code: 'VN',
      name: 'Vietnam',
      tier: 3,
      flag: '🇻🇳',
      canonicalName: 'Vietnam',
      lat: 14.058324,
      lng: 108.277199,
      cities: [
        { name: 'Ho Chi Minh City', canonical: 'Ho Chi Minh City,Ho Chi Minh,Vietnam', lat: 10.823099, lng: 106.629664 },
        { name: 'Hanoi', canonical: 'Hanoi,Hanoi,Vietnam', lat: 21.028511, lng: 105.854167 }
      ]
    },
    {
      code: 'BD',
      name: 'Bangladesh',
      tier: 3,
      flag: '🇧🇩',
      canonicalName: 'Bangladesh',
      lat: 23.684994,
      lng: 90.356331,
      cities: [
        { name: 'Dhaka', canonical: 'Dhaka,Dhaka Division,Bangladesh', lat: 23.810332, lng: 90.412518 }
      ]
    },
    {
      code: 'EG',
      name: 'Egypt',
      tier: 3,
      flag: '🇪🇬',
      canonicalName: 'Egypt',
      lat: 26.820553,
      lng: 30.802498,
      cities: [
        { name: 'Cairo', canonical: 'Cairo,Cairo Governorate,Egypt', lat: 30.04442, lng: 31.235712 }
      ]
    },
    {
      code: 'NG',
      name: 'Nigeria',
      tier: 3,
      flag: '🇳🇬',
      canonicalName: 'Nigeria',
      lat: 9.081999,
      lng: 8.675277,
      cities: [
        { name: 'Lagos', canonical: 'Lagos,Lagos,Nigeria', lat: 6.524379, lng: 3.379206 },
        { name: 'Abuja', canonical: 'Abuja,Federal Capital Territory,Nigeria', lat: 9.076479, lng: 7.398574 }
      ]
    },
    {
      code: 'KE',
      name: 'Kenya',
      tier: 3,
      flag: '🇰🇪',
      canonicalName: 'Kenya',
      lat: -0.023559,
      lng: 37.906193,
      cities: [
        { name: 'Nairobi', canonical: 'Nairobi,Nairobi County,Kenya', lat: -1.292066, lng: 36.821946 }
      ]
    },
    {
      code: 'MA',
      name: 'Morocco',
      tier: 3,
      flag: '🇲🇦',
      canonicalName: 'Morocco',
      lat: 31.791702,
      lng: -7.09262,
      cities: [
        { name: 'Casablanca', canonical: 'Casablanca,Casablanca-Settat,Morocco', lat: 33.57311, lng: -7.589843 }
      ]
    },
    {
      code: 'UA',
      name: 'Ukraine',
      tier: 3,
      flag: '🇺🇦',
      canonicalName: 'Ukraine',
      lat: 48.379433,
      lng: 31.16558,
      cities: [
        { name: 'Kyiv', canonical: 'Kyiv,Kyiv,Ukraine', lat: 50.4501, lng: 30.5234 }
      ]
    },
    {
      code: 'KZ',
      name: 'Kazakhstan',
      tier: 3,
      flag: '🇰🇿',
      canonicalName: 'Kazakhstan',
      lat: 48.019573,
      lng: 66.923684,
      cities: [
        { name: 'Almaty', canonical: 'Almaty,Almaty,Kazakhstan', lat: 43.2220, lng: 76.8512 }
      ]
    },
    {
      code: 'PE',
      name: 'Peru',
      tier: 3,
      flag: '🇵🇪',
      canonicalName: 'Peru',
      lat: -9.189967,
      lng: -75.015152,
      cities: [
        { name: 'Lima', canonical: 'Lima,Lima Province,Peru', lat: -12.046374, lng: -77.042793 }
      ]
    },
    {
      code: 'DZ',
      name: 'Algeria',
      tier: 3,
      flag: '🇩🇿',
      canonicalName: 'Algeria',
      lat: 28.0339,
      lng: 1.6596,
      cities: [{ name: 'Algiers', canonical: 'Algiers,Algiers Province,Algeria', lat: 36.7538, lng: 3.0588 }]
    },
    {
      code: 'TN',
      name: 'Tunisia',
      tier: 3,
      flag: '🇹🇳',
      canonicalName: 'Tunisia',
      lat: 33.8869,
      lng: 9.5375,
      cities: [{ name: 'Tunis', canonical: 'Tunis,Tunis Governorate,Tunisia', lat: 36.8065, lng: 10.1815 }]
    },
    {
      code: 'GH',
      name: 'Ghana',
      tier: 3,
      flag: '🇬🇭',
      canonicalName: 'Ghana',
      lat: 7.9465,
      lng: -1.0232,
      cities: [{ name: 'Accra', canonical: 'Accra,Greater Accra Region,Ghana', lat: 5.6037, lng: -0.1870 }]
    },
    {
      code: 'ET',
      name: 'Ethiopia',
      tier: 3,
      flag: '🇪🇹',
      canonicalName: 'Ethiopia',
      lat: 9.145,
      lng: 40.4897,
      cities: [{ name: 'Addis Ababa', canonical: 'Addis Ababa,Addis Ababa,Ethiopia', lat: 9.032, lng: 38.7469 }]
    },
    {
      code: 'TZ',
      name: 'Tanzania',
      tier: 3,
      flag: '🇹🇿',
      canonicalName: 'Tanzania',
      lat: -6.369,
      lng: 34.8888,
      cities: [{ name: 'Dar es Salaam', canonical: 'Dar es Salaam,Dar es Salaam Region,Tanzania', lat: -6.7924, lng: 39.2083 }]
    },
    {
      code: 'LK',
      name: 'Sri Lanka',
      tier: 3,
      flag: '🇱🇰',
      canonicalName: 'Sri Lanka',
      lat: 7.8731,
      lng: 80.7718,
      cities: [{ name: 'Colombo', canonical: 'Colombo,Western Province,Sri Lanka', lat: 6.9271, lng: 79.8612 }]
    },
    {
      code: 'NP',
      name: 'Nepal',
      tier: 3,
      flag: '🇳🇵',
      canonicalName: 'Nepal',
      lat: 28.3949,
      lng: 84.124,
      cities: [{ name: 'Kathmandu', canonical: 'Kathmandu,Bagmati Province,Nepal', lat: 27.7172, lng: 85.324 }]
    },
    {
      code: 'UZ',
      name: 'Uzbekistan',
      tier: 3,
      flag: '🇺🇿',
      canonicalName: 'Uzbekistan',
      lat: 41.3775,
      lng: 64.5853,
      cities: [{ name: 'Tashkent', canonical: 'Tashkent,Tashkent,Uzbekistan', lat: 41.2995, lng: 69.2401 }]
    },
    {
      code: 'AZ',
      name: 'Azerbaijan',
      tier: 3,
      flag: '🇦🇿',
      canonicalName: 'Azerbaijan',
      lat: 40.1431,
      lng: 47.5769,
      cities: [{ name: 'Baku', canonical: 'Baku,Baku,Azerbaijan', lat: 40.4093, lng: 49.8671 }]
    },
    {
      code: 'GE',
      name: 'Georgia',
      tier: 3,
      flag: '🇬🇪',
      canonicalName: 'Georgia',
      lat: 42.3154,
      lng: 43.3569,
      cities: [{ name: 'Tbilisi', canonical: 'Tbilisi,Tbilisi,Georgia', lat: 41.7151, lng: 44.8271 }]
    },
    {
      code: 'EC',
      name: 'Ecuador',
      tier: 3,
      flag: '🇪🇨',
      canonicalName: 'Ecuador',
      lat: -1.8312,
      lng: -78.1834,
      cities: [{ name: 'Quito', canonical: 'Quito,Pichincha,Ecuador', lat: -0.1807, lng: -78.4678 }]
    },
    {
      code: 'GT',
      name: 'Guatemala',
      tier: 3,
      flag: '🇬🇹',
      canonicalName: 'Guatemala',
      lat: 15.7835,
      lng: -90.2308,
      cities: [{ name: 'Guatemala City', canonical: 'Guatemala City,Guatemala Department,Guatemala', lat: 14.6349, lng: -90.5069 }]
    },
    {
      code: 'DO',
      name: 'Dominican Republic',
      tier: 3,
      flag: '🇩🇴',
      canonicalName: 'Dominican Republic',
      lat: 18.7357,
      lng: -70.1627,
      cities: [{ name: 'Santo Domingo', canonical: 'Santo Domingo,Distrito Nacional,Dominican Republic', lat: 18.4861, lng: -69.9312 }]
    },
    {
      code: 'BO',
      name: 'Bolivia',
      tier: 3,
      flag: '🇧🇴',
      canonicalName: 'Bolivia',
      lat: -16.2902,
      lng: -63.5887,
      cities: [{ name: 'La Paz', canonical: 'La Paz,La Paz Department,Bolivia', lat: -16.4897, lng: -68.1193 }]
    },
    {
      code: 'PY',
      name: 'Paraguay',
      tier: 3,
      flag: '🇵🇾',
      canonicalName: 'Paraguay',
      lat: -23.4425,
      lng: -58.4438,
      cities: [{ name: 'Asuncion', canonical: 'Asuncion,Capital District,Paraguay', lat: -25.2637, lng: -57.5759 }]
    },
    {
      code: 'JO',
      name: 'Jordan',
      tier: 3,
      flag: '🇯🇴',
      canonicalName: 'Jordan',
      lat: 30.5852,
      lng: 36.2384,
      cities: [{ name: 'Amman', canonical: 'Amman,Amman Governorate,Jordan', lat: 31.9454, lng: 35.9284 }]
    },
    {
      code: 'LB',
      name: 'Lebanon',
      tier: 3,
      flag: '🇱🇧',
      canonicalName: 'Lebanon',
      lat: 33.8547,
      lng: 35.8623,
      cities: [{ name: 'Beirut', canonical: 'Beirut,Beirut Governorate,Lebanon', lat: 33.8938, lng: 35.5018 }]
    },
    {
      code: 'IQ',
      name: 'Iraq',
      tier: 3,
      flag: '🇮🇶',
      canonicalName: 'Iraq',
      lat: 33.2232,
      lng: 43.6793,
      cities: [{ name: 'Baghdad', canonical: 'Baghdad,Baghdad Governorate,Iraq', lat: 33.3152, lng: 44.3661 }]
    },
    {
      code: 'UG',
      name: 'Uganda',
      tier: 3,
      flag: '🇺🇬',
      canonicalName: 'Uganda',
      lat: 1.3733,
      lng: 32.2903,
      cities: [{ name: 'Kampala', canonical: 'Kampala,Central Region,Uganda', lat: 0.3476, lng: 32.5825 }]
    },
    {
      code: 'CI',
      name: 'Ivory Coast',
      tier: 3,
      flag: '🇨🇮',
      canonicalName: 'Ivory Coast',
      lat: 7.54,
      lng: -5.5471,
      cities: [{ name: 'Abidjan', canonical: 'Abidjan,Lagunes District,Ivory Coast', lat: 5.36, lng: -4.0083 }]
    },
    {
      code: 'CM',
      name: 'Cameroon',
      tier: 3,
      flag: '🇨🇲',
      canonicalName: 'Cameroon',
      lat: 7.3697,
      lng: 12.3547,
      cities: [{ name: 'Douala', canonical: 'Douala,Littoral Region,Cameroon', lat: 4.0511, lng: 9.7679 }]
    },
    {
      code: 'SN',
      name: 'Senegal',
      tier: 3,
      flag: '🇸🇳',
      canonicalName: 'Senegal',
      lat: 14.4974,
      lng: -14.4524,
      cities: [{ name: 'Dakar', canonical: 'Dakar,Dakar Region,Senegal', lat: 14.7167, lng: -17.4677 }]
    },
    {
      code: 'ZW',
      name: 'Zimbabwe',
      tier: 3,
      flag: '🇿🇼',
      canonicalName: 'Zimbabwe',
      lat: -19.0154,
      lng: 29.1549,
      cities: [{ name: 'Harare', canonical: 'Harare,Harare Province,Zimbabwe', lat: -17.8252, lng: 31.0335 }]
    },
    {
      code: 'AO',
      name: 'Angola',
      tier: 3,
      flag: '🇦🇴',
      canonicalName: 'Angola',
      lat: -11.2027,
      lng: 17.8739,
      cities: [{ name: 'Luanda', canonical: 'Luanda,Luanda Province,Angola', lat: -8.839, lng: 13.2894 }]
    },
    {
      code: 'KH',
      name: 'Cambodia',
      tier: 3,
      flag: '🇰🇭',
      canonicalName: 'Cambodia',
      lat: 12.5657,
      lng: 104.991,
      cities: [{ name: 'Phnom Penh', canonical: 'Phnom Penh,Phnom Penh,Cambodia', lat: 11.5564, lng: 104.9282 }]
    },
    {
      code: 'MM',
      name: 'Myanmar',
      tier: 3,
      flag: '🇲🇲',
      canonicalName: 'Myanmar',
      lat: 21.9162,
      lng: 95.956,
      cities: [{ name: 'Yangon', canonical: 'Yangon,Yangon Region,Myanmar', lat: 16.8661, lng: 96.1951 }]
    },
    {
      code: 'SV',
      name: 'El Salvador',
      tier: 3,
      flag: '🇸🇻',
      canonicalName: 'El Salvador',
      lat: 13.7942,
      lng: -88.8965,
      cities: [{ name: 'San Salvador', canonical: 'San Salvador,San Salvador Department,El Salvador', lat: 13.6929, lng: -89.2182 }]
    },
    {
      code: 'HN',
      name: 'Honduras',
      tier: 3,
      flag: '🇭🇳',
      canonicalName: 'Honduras',
      lat: 15.2,
      lng: -86.2419,
      cities: [{ name: 'Tegucigalpa', canonical: 'Tegucigalpa,Francisco Morazan Department,Honduras', lat: 14.0723, lng: -87.1921 }]
    },
    {
      code: 'NI',
      name: 'Nicaragua',
      tier: 3,
      flag: '🇳🇮',
      canonicalName: 'Nicaragua',
      lat: 12.8654,
      lng: -85.2072,
      cities: [{ name: 'Managua', canonical: 'Managua,Managua Department,Nicaragua', lat: 12.115, lng: -86.2362 }]
    },
    {
      code: 'JM',
      name: 'Jamaica',
      tier: 3,
      flag: '🇯🇲',
      canonicalName: 'Jamaica',
      lat: 18.1096,
      lng: -77.2975,
      cities: [{ name: 'Kingston', canonical: 'Kingston,Kingston Parish,Jamaica', lat: 17.9712, lng: -76.7928 }]
    },
    {
      code: 'TT',
      name: 'Trinidad and Tobago',
      tier: 3,
      flag: '🇹🇹',
      canonicalName: 'Trinidad and Tobago',
      lat: 10.6918,
      lng: -61.2225,
      cities: [{ name: 'Port of Spain', canonical: 'Port of Spain,City of Port of Spain,Trinidad and Tobago', lat: 10.6549, lng: -61.5019 }]
    },
    {
      code: 'PR',
      name: 'Puerto Rico',
      tier: 3,
      flag: '🇵🇷',
      canonicalName: 'Puerto Rico',
      lat: 18.2208,
      lng: -66.5901,
      cities: [{ name: 'San Juan', canonical: 'San Juan,San Juan,Puerto Rico', lat: 18.4655, lng: -66.1057 }]
    },
    
    {
      code: 'AM',
      name: 'Armenia',
      tier: 3,
      flag: '🇦🇲',
      canonicalName: 'Armenia',
      lat: 40.0691,
      lng: 45.0382,
      cities: [{ name: 'Yerevan', canonical: 'Yerevan,Yerevan,Armenia', lat: 40.1792, lng: 44.4991 }]
    },
    {
      code: 'MD',
      name: 'Moldova',
      tier: 3,
      flag: '🇲🇩',
      canonicalName: 'Moldova',
      lat: 47.4116,
      lng: 28.3699,
      cities: [{ name: 'Chisinau', canonical: 'Chisinau,Chisinau Municipality,Moldova', lat: 47.0105, lng: 28.8638 }]
    },
    {
      code: 'AL',
      name: 'Albania',
      tier: 3,
      flag: '🇦🇱',
      canonicalName: 'Albania',
      lat: 41.1533,
      lng: 20.1683,
      cities: [{ name: 'Tirana', canonical: 'Tirana,Tirana County,Albania', lat: 41.3275, lng: 19.8187 }]
    },
    {
      code: 'BA',
      name: 'Bosnia and Herzegovina',
      tier: 3,
      flag: '🇧🇦',
      canonicalName: 'Bosnia and Herzegovina',
      lat: 43.9159,
      lng: 17.6791,
      cities: [{ name: 'Sarajevo', canonical: 'Sarajevo,Sarajevo Canton,Bosnia and Herzegovina', lat: 43.8563, lng: 18.4131 }]
    },
    {
      code: 'MK',
      name: 'North Macedonia',
      tier: 3,
      flag: '🇲🇰',
      canonicalName: 'North Macedonia',
      lat: 41.6086,
      lng: 21.7453,
      cities: [{ name: 'Skopje', canonical: 'Skopje,Skopje Region,North Macedonia', lat: 41.9981, lng: 21.4254 }]
    },
    {
      code: 'ME',
      name: 'Montenegro',
      tier: 3,
      flag: '🇲🇪',
      canonicalName: 'Montenegro',
      lat: 42.7087,
      lng: 19.3744,
      cities: [{ name: 'Podgorica', canonical: 'Podgorica,Podgorica Municipality,Montenegro', lat: 42.4304, lng: 19.2594 }]
    },
    {
      code: 'MN',
      name: 'Mongolia',
      tier: 3,
      flag: '🇲🇳',
      canonicalName: 'Mongolia',
      lat: 46.8625,
      lng: 103.8467,
      cities: [{ name: 'Ulaanbaatar', canonical: 'Ulaanbaatar,Ulaanbaatar,Mongolia', lat: 47.8864, lng: 106.9057 }]
    },
    {
      code: 'LA',
      name: 'Laos',
      tier: 3,
      flag: '🇱🇦',
      canonicalName: 'Laos',
      lat: 19.8563,
      lng: 102.4955,
      cities: [{ name: 'Vientiane', canonical: 'Vientiane,Vientiane Prefecture,Laos', lat: 17.9757, lng: 102.6331 }]
    },
    {
      code: 'MU',
      name: 'Mauritius',
      tier: 3,
      flag: '🇲🇺',
      canonicalName: 'Mauritius',
      lat: -20.3484,
      lng: 57.5522,
      cities: [{ name: 'Port Louis', canonical: 'Port Louis,Port Louis District,Mauritius', lat: -20.1609, lng: 57.5012 }]
    },
    {
      code: 'AF',
      name: 'Afghanistan',
      tier: 3,
      flag: '🇦🇫',
      canonicalName: 'Afghanistan',
      lat: 33.9391,
      lng: 67.7100,
      cities: [{ name: 'Kabul', canonical: 'Kabul,Kabul,Afghanistan', lat: 34.5553, lng: 69.2075 }]
    },
    {
      code: 'AD',
      name: 'Andorra',
      tier: 3,
      flag: '🇦🇩',
      canonicalName: 'Andorra',
      lat: 42.5063,
      lng: 1.5218,
      cities: [{ name: 'Andorra la Vella', canonical: 'Andorra la Vella,Andorra', lat: 42.5063, lng: 1.5218 }]
    },
    {
      code: 'AG',
      name: 'Antigua and Barbuda',
      tier: 3,
      flag: '🇦🇬',
      canonicalName: 'Antigua and Barbuda',
      lat: 17.0608,
      lng: -61.7964,
      cities: [{ name: 'Saint John\'s', canonical: 'Saint John\'s,Antigua and Barbuda', lat: 17.1274, lng: -61.8468 }]
    },
    {
      code: 'BS',
      name: 'Bahamas',
      tier: 3,
      flag: '🇧🇸',
      canonicalName: 'Bahamas',
      lat: 25.0343,
      lng: -77.3963,
      cities: [{ name: 'Nassau', canonical: 'Nassau,New Providence,Bahamas', lat: 25.0480, lng: -77.3554 }]
    },
    {
      code: 'BB',
      name: 'Barbados',
      tier: 3,
      flag: '🇧🇧',
      canonicalName: 'Barbados',
      lat: 13.1939,
      lng: -59.5432,
      cities: [{ name: 'Bridgetown', canonical: 'Bridgetown,Barbados', lat: 13.0969, lng: -59.6145 }]
    },
    {
      code: 'BZ',
      name: 'Belize',
      tier: 3,
      flag: '🇧🇿',
      canonicalName: 'Belize',
      lat: 17.1899,
      lng: -88.4976,
      cities: [{ name: 'Belmopan', canonical: 'Belmopan,Belize', lat: 17.2510, lng: -88.7590 }]
    },
    {
      code: 'BJ',
      name: 'Benin',
      tier: 3,
      flag: '🇧🇯',
      canonicalName: 'Benin',
      lat: 9.3077,
      lng: 2.3158,
      cities: [{ name: 'Porto-Novo', canonical: 'Porto-Novo,Benin', lat: 6.4969, lng: 2.6289 }]
    },
    {
      code: 'BT',
      name: 'Bhutan',
      tier: 3,
      flag: '🇧🇹',
      canonicalName: 'Bhutan',
      lat: 27.5142,
      lng: 90.4336,
      cities: [{ name: 'Thimphu', canonical: 'Thimphu,Bhutan', lat: 27.4728, lng: 89.6393 }]
    },
    {
      code: 'BW',
      name: 'Botswana',
      tier: 3,
      flag: '🇧🇼',
      canonicalName: 'Botswana',
      lat: -22.3285,
      lng: 24.6849,
      cities: [{ name: 'Gaborone', canonical: 'Gaborone,Botswana', lat: -24.6282, lng: 25.9231 }]
    },
    {
      code: 'BN',
      name: 'Brunei',
      tier: 3,
      flag: '🇧🇳',
      canonicalName: 'Brunei',
      lat: 4.5353,
      lng: 114.7277,
      cities: [{ name: 'Bandar Seri Begawan', canonical: 'Bandar Seri Begawan,Brunei', lat: 4.9031, lng: 114.9398 }]
    },
    {
      code: 'BF',
      name: 'Burkina Faso',
      tier: 3,
      flag: '🇧🇫',
      canonicalName: 'Burkina Faso',
      lat: 12.2383,
      lng: -1.5616,
      cities: [{ name: 'Ouagadougou', canonical: 'Ouagadougou,Burkina Faso', lat: 12.3714, lng: -1.5197 }]
    },
    {
      code: 'BI',
      name: 'Burundi',
      tier: 3,
      flag: '🇧🇮',
      canonicalName: 'Burundi',
      lat: -3.3731,
      lng: 29.9189,
      cities: [{ name: 'Gitega', canonical: 'Gitega,Burundi', lat: -3.4271, lng: 29.9246 }]
    },
    {
      code: 'CV',
      name: 'Cape Verde',
      tier: 3,
      flag: '🇨🇻',
      canonicalName: 'Cape Verde',
      lat: 16.5388,
      lng: -23.0418,
      cities: [{ name: 'Praia', canonical: 'Praia,Cape Verde', lat: 14.9330, lng: -23.5133 }]
    },
    {
      code: 'CF',
      name: 'Central African Republic',
      tier: 3,
      flag: '🇨🇫',
      canonicalName: 'Central African Republic',
      lat: 6.6111,
      lng: 20.9394,
      cities: [{ name: 'Bangui', canonical: 'Bangui,Central African Republic', lat: 4.3947, lng: 18.5582 }]
    },
    {
      code: 'TD',
      name: 'Chad',
      tier: 3,
      flag: '🇹🇩',
      canonicalName: 'Chad',
      lat: 15.4542,
      lng: 18.7322,
      cities: [{ name: 'N\'Djamena', canonical: 'N\'Djamena,Chad', lat: 12.1348, lng: 15.0557 }]
    },
    {
      code: 'KM',
      name: 'Comoros',
      tier: 3,
      flag: '🇰🇲',
      canonicalName: 'Comoros',
      lat: -11.8753,
      lng: 43.8722,
      cities: [{ name: 'Moroni', canonical: 'Moroni,Comoros', lat: -11.7172, lng: 43.2473 }]
    },
    {
      code: 'CG',
      name: 'Congo',
      tier: 3,
      flag: '🇨🇬',
      canonicalName: 'Republic of the Congo',
      lat: -0.2280,
      lng: 15.8277,
      cities: [{ name: 'Brazzaville', canonical: 'Brazzaville,Republic of the Congo', lat: -4.2634, lng: 15.2429 }]
    },
    {
      code: 'CD',
      name: 'DR Congo',
      tier: 3,
      flag: '🇨🇩',
      canonicalName: 'Democratic Republic of the Congo',
      lat: -4.0383,
      lng: 21.7587,
      cities: [{ name: 'Kinshasa', canonical: 'Kinshasa,Democratic Republic of the Congo', lat: -4.4419, lng: 15.2663 }]
    },
    {
      code: 'CU',
      name: 'Cuba',
      tier: 3,
      flag: '🇨🇺',
      canonicalName: 'Cuba',
      lat: 21.5218,
      lng: -77.7812,
      cities: [{ name: 'Havana', canonical: 'Havana,Cuba', lat: 23.1136, lng: -82.3666 }]
    },
    {
      code: 'DJ',
      name: 'Djibouti',
      tier: 3,
      flag: '🇩🇯',
      canonicalName: 'Djibouti',
      lat: 11.8251,
      lng: 42.5903,
      cities: [{ name: 'Djibouti City', canonical: 'Djibouti,Djibouti', lat: 11.5721, lng: 43.1456 }]
    },
    {
      code: 'DM',
      name: 'Dominica',
      tier: 3,
      flag: '🇩🇲',
      canonicalName: 'Dominica',
      lat: 15.4150,
      lng: -61.3710,
      cities: [{ name: 'Roseau', canonical: 'Roseau,Dominica', lat: 15.3092, lng: -61.3794 }]
    },
    {
      code: 'GQ',
      name: 'Equatorial Guinea',
      tier: 3,
      flag: '🇬🇶',
      canonicalName: 'Equatorial Guinea',
      lat: 1.6508,
      lng: 10.2679,
      cities: [{ name: 'Malabo', canonical: 'Malabo,Equatorial Guinea', lat: 3.7504, lng: 8.7371 }]
    },
    {
      code: 'ER',
      name: 'Eritrea',
      tier: 3,
      flag: '🇪🇷',
      canonicalName: 'Eritrea',
      lat: 15.1794,
      lng: 39.7823,
      cities: [{ name: 'Asmara', canonical: 'Asmara,Eritrea', lat: 15.3229, lng: 38.9251 }]
    },
    {
      code: 'SZ',
      name: 'Eswatini',
      tier: 3,
      flag: '🇸🇿',
      canonicalName: 'Eswatini',
      lat: -26.5225,
      lng: 31.4659,
      cities: [{ name: 'Mbabane', canonical: 'Mbabane,Eswatini', lat: -26.3054, lng: 31.1367 }]
    },
    {
      code: 'FJ',
      name: 'Fiji',
      tier: 3,
      flag: '🇫🇯',
      canonicalName: 'Fiji',
      lat: -17.7134,
      lng: 178.0650,
      cities: [{ name: 'Suva', canonical: 'Suva,Fiji', lat: -18.1248, lng: 178.4501 }]
    },
    {
      code: 'GA',
      name: 'Gabon',
      tier: 3,
      flag: '🇬🇦',
      canonicalName: 'Gabon',
      lat: -0.8037,
      lng: 11.6094,
      cities: [{ name: 'Libreville', canonical: 'Libreville,Gabon', lat: 0.4162, lng: 9.4673 }]
    },
    {
      code: 'GM',
      name: 'Gambia',
      tier: 3,
      flag: '🇬🇲',
      canonicalName: 'Gambia',
      lat: 13.4432,
      lng: -15.3101,
      cities: [{ name: 'Banjul', canonical: 'Banjul,Gambia', lat: 13.4549, lng: -16.5790 }]
    },
    {
      code: 'GD',
      name: 'Grenada',
      tier: 3,
      flag: '🇬🇩',
      canonicalName: 'Grenada',
      lat: 12.1165,
      lng: -61.6790,
      cities: [{ name: 'St. George\'s', canonical: 'St. George\'s,Grenada', lat: 12.0561, lng: -61.7488 }]
    },
    {
      code: 'GN',
      name: 'Guinea',
      tier: 3,
      flag: '🇬🇳',
      canonicalName: 'Guinea',
      lat: 9.9456,
      lng: -9.6966,
      cities: [{ name: 'Conakry', canonical: 'Conakry,Guinea', lat: 9.6412, lng: -13.5784 }]
    },
    {
      code: 'GW',
      name: 'Guinea-Bissau',
      tier: 3,
      flag: '🇬🇼',
      canonicalName: 'Guinea-Bissau',
      lat: 11.8037,
      lng: -15.1804,
      cities: [{ name: 'Bissau', canonical: 'Bissau,Guinea-Bissau', lat: 11.8816, lng: -15.6178 }]
    },
    {
      code: 'GY',
      name: 'Guyana',
      tier: 3,
      flag: '🇬🇾',
      canonicalName: 'Guyana',
      lat: 4.8604,
      lng: -58.9302,
      cities: [{ name: 'Georgetown', canonical: 'Georgetown,Guyana', lat: 6.8013, lng: -58.1551 }]
    },
    {
      code: 'HT',
      name: 'Haiti',
      tier: 3,
      flag: '🇭🇹',
      canonicalName: 'Haiti',
      lat: 18.9712,
      lng: -72.2852,
      cities: [{ name: 'Port-au-Prince', canonical: 'Port-au-Prince,Haiti', lat: 18.5944, lng: -72.3074 }]
    },
    {
      code: 'KI',
      name: 'Kiribati',
      tier: 3,
      flag: '🇰🇮',
      canonicalName: 'Kiribati',
      lat: -3.3704,
      lng: -168.7340,
      cities: [{ name: 'Tarawa', canonical: 'Tarawa,Kiribati', lat: 1.3291, lng: 172.9790 }]
    },
    {
      code: 'KG',
      name: 'Kyrgyzstan',
      tier: 3,
      flag: '🇰🇬',
      canonicalName: 'Kyrgyzstan',
      lat: 41.2044,
      lng: 74.7661,
      cities: [{ name: 'Bishkek', canonical: 'Bishkek,Kyrgyzstan', lat: 42.8746, lng: 74.5698 }]
    },
    {
      code: 'LS',
      name: 'Lesotho',
      tier: 3,
      flag: '🇱🇸',
      canonicalName: 'Lesotho',
      lat: -29.6100,
      lng: 28.2336,
      cities: [{ name: 'Maseru', canonical: 'Maseru,Lesotho', lat: -29.3151, lng: 27.4869 }]
    },
    {
      code: 'LR',
      name: 'Liberia',
      tier: 3,
      flag: '🇱🇷',
      canonicalName: 'Liberia',
      lat: 6.4281,
      lng: -9.4295,
      cities: [{ name: 'Monrovia', canonical: 'Monrovia,Liberia', lat: 6.3005, lng: -10.7969 }]
    },
    {
      code: 'LY',
      name: 'Libya',
      tier: 3,
      flag: '🇱🇾',
      canonicalName: 'Libya',
      lat: 26.3351,
      lng: 17.2283,
      cities: [{ name: 'Tripoli', canonical: 'Tripoli,Libya', lat: 32.8872, lng: 13.1913 }]
    },
    {
      code: 'LI',
      name: 'Liechtenstein',
      tier: 3,
      flag: '🇱🇮',
      canonicalName: 'Liechtenstein',
      lat: 47.1660,
      lng: 9.5554,
      cities: [{ name: 'Vaduz', canonical: 'Vaduz,Liechtenstein', lat: 47.1410, lng: 9.5209 }]
    },
    {
      code: 'MG',
      name: 'Madagascar',
      tier: 3,
      flag: '🇲🇬',
      canonicalName: 'Madagascar',
      lat: -18.7669,
      lng: 46.8691,
      cities: [{ name: 'Antananarivo', canonical: 'Antananarivo,Madagascar', lat: -18.8792, lng: 47.5079 }]
    },
    {
      code: 'MW',
      name: 'Malawi',
      tier: 3,
      flag: '🇲🇼',
      canonicalName: 'Malawi',
      lat: -13.2543,
      lng: 34.3015,
      cities: [{ name: 'Lilongwe', canonical: 'Lilongwe,Malawi', lat: -13.9626, lng: 33.7741 }]
    },
    {
      code: 'MV',
      name: 'Maldives',
      tier: 3,
      flag: '🇲🇻',
      canonicalName: 'Maldives',
      lat: 3.2028,
      lng: 73.2207,
      cities: [{ name: 'Male', canonical: 'Male,Maldives', lat: 4.1755, lng: 73.5093 }]
    },
    {
      code: 'ML',
      name: 'Mali',
      tier: 3,
      flag: '🇲🇱',
      canonicalName: 'Mali',
      lat: 17.5707,
      lng: -3.9962,
      cities: [{ name: 'Bamako', canonical: 'Bamako,Mali', lat: 12.6392, lng: -8.0029 }]
    },
    {
      code: 'MH',
      name: 'Marshall Islands',
      tier: 3,
      flag: '🇲🇭',
      canonicalName: 'Marshall Islands',
      lat: 7.1315,
      lng: 171.1845,
      cities: [{ name: 'Majuro', canonical: 'Majuro,Marshall Islands', lat: 7.1167, lng: 171.3833 }]
    },
    {
      code: 'MR',
      name: 'Mauritania',
      tier: 3,
      flag: '🇲🇷',
      canonicalName: 'Mauritania',
      lat: 21.0079,
      lng: -10.9408,
      cities: [{ name: 'Nouakchott', canonical: 'Nouakchott,Mauritania', lat: 18.0735, lng: -15.9582 }]
    },
    {
      code: 'FM',
      name: 'Micronesia',
      tier: 3,
      flag: '🇫🇲',
      canonicalName: 'Micronesia',
      lat: 7.4256,
      lng: 150.5508,
      cities: [{ name: 'Palikir', canonical: 'Palikir,Micronesia', lat: 6.9177, lng: 158.1850 }]
    },
    {
      code: 'MC',
      name: 'Monaco',
      tier: 3,
      flag: '🇲🇨',
      canonicalName: 'Monaco',
      lat: 43.7384,
      lng: 7.4246,
      cities: [{ name: 'Monaco', canonical: 'Monaco,Monaco', lat: 43.7384, lng: 7.4246 }]
    },
    {
      code: 'MZ',
      name: 'Mozambique',
      tier: 3,
      flag: '🇲🇿',
      canonicalName: 'Mozambique',
      lat: -18.6657,
      lng: 35.5296,
      cities: [{ name: 'Maputo', canonical: 'Maputo,Mozambique', lat: -25.9692, lng: 32.5732 }]
    },
    {
      code: 'NA',
      name: 'Namibia',
      tier: 3,
      flag: '🇳🇦',
      canonicalName: 'Namibia',
      lat: -22.9576,
      lng: 18.4904,
      cities: [{ name: 'Windhoek', canonical: 'Windhoek,Namibia', lat: -22.5609, lng: 17.0658 }]
    },
    {
      code: 'NR',
      name: 'Nauru',
      tier: 3,
      flag: '🇳🇷',
      canonicalName: 'Nauru',
      lat: -0.5228,
      lng: 166.9315,
      cities: [{ name: 'Yaren', canonical: 'Yaren,Nauru', lat: -0.5477, lng: 166.9189 }]
    },
    {
      code: 'NE',
      name: 'Niger',
      tier: 3,
      flag: '🇳🇪',
      canonicalName: 'Niger',
      lat: 17.6078,
      lng: 8.0817,
      cities: [{ name: 'Niamey', canonical: 'Niamey,Niger', lat: 13.5116, lng: 2.1254 }]
    },
    {
      code: 'PW',
      name: 'Palau',
      tier: 3,
      flag: '🇵🇼',
      canonicalName: 'Palau',
      lat: 7.5150,
      lng: 134.5825,
      cities: [{ name: 'Ngerulmud', canonical: 'Ngerulmud,Palau', lat: 7.5004, lng: 134.6242 }]
    },
    {
      code: 'PS',
      name: 'Palestine',
      tier: 3,
      flag: '🇵🇸',
      canonicalName: 'Palestine',
      lat: 31.9522,
      lng: 35.2332,
      cities: [{ name: 'Ramallah', canonical: 'Ramallah,Palestine', lat: 31.9038, lng: 35.2034 }]
    },
    {
      code: 'PG',
      name: 'Papua New Guinea',
      tier: 3,
      flag: '🇵🇬',
      canonicalName: 'Papua New Guinea',
      lat: -6.3150,
      lng: 143.9555,
      cities: [{ name: 'Port Moresby', canonical: 'Port Moresby,Papua New Guinea', lat: -9.4438, lng: 147.1803 }]
    },
    {
      code: 'RW',
      name: 'Rwanda',
      tier: 3,
      flag: '🇷🇼',
      canonicalName: 'Rwanda',
      lat: -1.9403,
      lng: 29.8739,
      cities: [{ name: 'Kigali', canonical: 'Kigali,Rwanda', lat: -1.9706, lng: 30.1044 }]
    },
    {
      code: 'KN',
      name: 'Saint Kitts and Nevis',
      tier: 3,
      flag: '🇰🇳',
      canonicalName: 'Saint Kitts and Nevis',
      lat: 17.3578,
      lng: -62.7830,
      cities: [{ name: 'Basseterre', canonical: 'Basseterre,Saint Kitts and Nevis', lat: 17.3026, lng: -62.7177 }]
    },
    {
      code: 'LC',
      name: 'Saint Lucia',
      tier: 3,
      flag: '🇱🇨',
      canonicalName: 'Saint Lucia',
      lat: 13.9094,
      lng: -60.9789,
      cities: [{ name: 'Castries', canonical: 'Castries,Saint Lucia', lat: 14.0101, lng: -60.9875 }]
    },
    {
      code: 'VC',
      name: 'Saint Vincent and the Grenadines',
      tier: 3,
      flag: '🇻🇨',
      canonicalName: 'Saint Vincent and the Grenadines',
      lat: 12.9843,
      lng: -61.2872,
      cities: [{ name: 'Kingstown', canonical: 'Kingstown,Saint Vincent and the Grenadines', lat: 13.1600, lng: -61.2248 }]
    },
    {
      code: 'WS',
      name: 'Samoa',
      tier: 3,
      flag: '🇼🇸',
      canonicalName: 'Samoa',
      lat: -13.7590,
      lng: -172.1046,
      cities: [{ name: 'Apia', canonical: 'Apia,Samoa', lat: -13.8333, lng: -171.7667 }]
    },
    {
      code: 'SM',
      name: 'San Marino',
      tier: 3,
      flag: '🇸🇲',
      canonicalName: 'San Marino',
      lat: 43.9424,
      lng: 12.4578,
      cities: [{ name: 'City of San Marino', canonical: 'San Marino,San Marino', lat: 43.9333, lng: 12.4500 }]
    },
    {
      code: 'ST',
      name: 'Sao Tome and Principe',
      tier: 3,
      flag: '🇸🇹',
      canonicalName: 'Sao Tome and Principe',
      lat: 0.1864,
      lng: 6.6131,
      cities: [{ name: 'Sao Tome', canonical: 'Sao Tome,Sao Tome and Principe', lat: 0.3365, lng: 6.7273 }]
    },
    {
      code: 'SC',
      name: 'Seychelles',
      tier: 3,
      flag: '🇸🇨',
      canonicalName: 'Seychelles',
      lat: -4.6796,
      lng: 55.4920,
      cities: [{ name: 'Victoria', canonical: 'Victoria,Seychelles', lat: -4.6191, lng: 55.4513 }]
    },
    {
      code: 'SL',
      name: 'Sierra Leone',
      tier: 3,
      flag: '🇸🇱',
      canonicalName: 'Sierra Leone',
      lat: 8.4606,
      lng: -11.7799,
      cities: [{ name: 'Freetown', canonical: 'Freetown,Sierra Leone', lat: 8.4840, lng: -13.2299 }]
    },
    {
      code: 'SB',
      name: 'Solomon Islands',
      tier: 3,
      flag: '🇸🇧',
      canonicalName: 'Solomon Islands',
      lat: -9.6457,
      lng: 160.1562,
      cities: [{ name: 'Honiara', canonical: 'Honiara,Solomon Islands', lat: -9.4456, lng: 159.9729 }]
    },
    {
      code: 'SO',
      name: 'Somalia',
      tier: 3,
      flag: '🇸🇴',
      canonicalName: 'Somalia',
      lat: 5.1521,
      lng: 46.1996,
      cities: [{ name: 'Mogadishu', canonical: 'Mogadishu,Somalia', lat: 2.0469, lng: 45.3182 }]
    },
    {
      code: 'SS',
      name: 'South Sudan',
      tier: 3,
      flag: '🇸🇸',
      canonicalName: 'South Sudan',
      lat: 6.8770,
      lng: 31.3070,
      cities: [{ name: 'Juba', canonical: 'Juba,South Sudan', lat: 4.8594, lng: 31.5713 }]
    },
    {
      code: 'SD',
      name: 'Sudan',
      tier: 3,
      flag: '🇸🇩',
      canonicalName: 'Sudan',
      lat: 12.8628,
      lng: 30.2176,
      cities: [{ name: 'Khartoum', canonical: 'Khartoum,Sudan', lat: 15.5007, lng: 32.5599 }]
    },
    {
      code: 'SR',
      name: 'Suriname',
      tier: 3,
      flag: '🇸🇷',
      canonicalName: 'Suriname',
      lat: 3.9193,
      lng: -56.0278,
      cities: [{ name: 'Paramaribo', canonical: 'Paramaribo,Suriname', lat: 5.8520, lng: -55.2038 }]
    },
    {
      code: 'SY',
      name: 'Syria',
      tier: 3,
      flag: '🇸🇾',
      canonicalName: 'Syria',
      lat: 34.8021,
      lng: 38.9968,
      cities: [{ name: 'Damascus', canonical: 'Damascus,Syria', lat: 33.5138, lng: 36.2765 }]
    },
    {
      code: 'TJ',
      name: 'Tajikistan',
      tier: 3,
      flag: '🇹🇯',
      canonicalName: 'Tajikistan',
      lat: 38.8610,
      lng: 71.2761,
      cities: [{ name: 'Dushanbe', canonical: 'Dushanbe,Tajikistan', lat: 38.5598, lng: 68.7870 }]
    },
    {
      code: 'TL',
      name: 'Timor-Leste',
      tier: 3,
      flag: '🇹🇱',
      canonicalName: 'Timor-Leste',
      lat: -8.8742,
      lng: 125.7275,
      cities: [{ name: 'Dili', canonical: 'Dili,Timor-Leste', lat: -8.5569, lng: 125.5603 }]
    },
    {
      code: 'TG',
      name: 'Togo',
      tier: 3,
      flag: '🇹🇬',
      canonicalName: 'Togo',
      lat: 8.6195,
      lng: 0.8248,
      cities: [{ name: 'Lome', canonical: 'Lome,Togo', lat: 6.1375, lng: 1.2123 }]
    },
    {
      code: 'TO',
      name: 'Tonga',
      tier: 3,
      flag: '🇹🇴',
      canonicalName: 'Tonga',
      lat: -21.1790,
      lng: -175.1982,
      cities: [{ name: 'Nuku\'alofa', canonical: 'Nuku\'alofa,Tonga', lat: -21.1393, lng: -175.2018 }]
    },
    {
      code: 'TM',
      name: 'Turkmenistan',
      tier: 3,
      flag: '🇹🇲',
      canonicalName: 'Turkmenistan',
      lat: 38.9697,
      lng: 59.5563,
      cities: [{ name: 'Ashgabat', canonical: 'Ashgabat,Turkmenistan', lat: 37.9601, lng: 58.3261 }]
    },
    {
      code: 'TV',
      name: 'Tuvalu',
      tier: 3,
      flag: '🇹🇻',
      canonicalName: 'Tuvalu',
      lat: -7.1095,
      lng: 177.6493,
      cities: [{ name: 'Funafuti', canonical: 'Funafuti,Tuvalu', lat: -8.5243, lng: 179.1942 }]
    },
    {
      code: 'VU',
      name: 'Vanuatu',
      tier: 3,
      flag: '🇻🇺',
      canonicalName: 'Vanuatu',
      lat: -15.3767,
      lng: 166.9592,
      cities: [{ name: 'Port Vila', canonical: 'Port Vila,Vanuatu', lat: -17.7333, lng: 168.3273 }]
    },
    {
      code: 'VA',
      name: 'Vatican City',
      tier: 3,
      flag: '🇻🇦',
      canonicalName: 'Vatican City',
      lat: 41.9029,
      lng: 12.4534,
      cities: [{ name: 'Vatican City', canonical: 'Vatican City', lat: 41.9029, lng: 12.4534 }]
    },
    {
      code: 'YE',
      name: 'Yemen',
      tier: 3,
      flag: '🇾🇪',
      canonicalName: 'Yemen',
      lat: 15.5527,
      lng: 48.5164,
      cities: [{ name: 'Sanaa', canonical: 'Sanaa,Yemen', lat: 15.3694, lng: 44.1910 }]
    },
    {
      code: 'ZM',
      name: 'Zambia',
      tier: 3,
      flag: '🇿🇲',
      canonicalName: 'Zambia',
      lat: -13.1339,
      lng: 27.8493,
      cities: [{ name: 'Lusaka', canonical: 'Lusaka,Zambia', lat: -15.3875, lng: 28.3228 }]
    },
    {
      code: 'BM',
      name: 'Bermuda',
      tier: 3,
      flag: '🇧🇲',
      canonicalName: 'Bermuda',
      lat: 32.3078,
      lng: -64.7505,
      cities: [{ name: 'Hamilton', canonical: 'Hamilton,Bermuda', lat: 32.2949, lng: -64.7830 }]
    },
    {
      code: 'KY',
      name: 'Cayman Islands',
      tier: 3,
      flag: '🇰🇾',
      canonicalName: 'Cayman Islands',
      lat: 19.3133,
      lng: -81.2546,
      cities: [{ name: 'George Town', canonical: 'George Town,Cayman Islands', lat: 19.2866, lng: -81.3744 }]
    },
    {
      code: 'GL',
      name: 'Greenland',
      tier: 3,
      flag: '🇬🇱',
      canonicalName: 'Greenland',
      lat: 71.7069,
      lng: -42.6043,
      cities: [{ name: 'Nuuk', canonical: 'Nuuk,Greenland', lat: 64.1814, lng: -51.6941 }]
    },
    {
      code: 'GI',
      name: 'Gibraltar',
      tier: 3,
      flag: '🇬🇮',
      canonicalName: 'Gibraltar',
      lat: 36.1408,
      lng: -5.3536,
      cities: [{ name: 'Gibraltar', canonical: 'Gibraltar,Gibraltar', lat: 36.1408, lng: -5.3536 }]
    },
  ];

  // Helper search function
  function findCountry(codeOrName) {
    if (!codeOrName) return null;
    const query = codeOrName.trim().toUpperCase();
    return COUNTRIES.find(c => c.code === query || c.name.toUpperCase() === query);
  }

  // Quick favorite / top countries for instant switcher bar pills
  const DEFAULT_QUICK_PILLS = ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'BR', 'IN'];


  // Timezone and Native Language mappings for spoofing and language control
  const COUNTRY_TIMEZONES = {
    US: 'America/New_York', CA: 'America/Toronto', GB: 'Europe/London', AU: 'Australia/Sydney',
    DE: 'Europe/Berlin', FR: 'Europe/Paris', JP: 'Asia/Tokyo', NL: 'Europe/Amsterdam',
    CH: 'Europe/Zurich', SE: 'Europe/Stockholm', NO: 'Europe/Oslo', DK: 'Europe/Copenhagen',
    FI: 'Europe/Helsinki', SG: 'Asia/Singapore', NZ: 'Pacific/Auckland', IE: 'Europe/Dublin',
    BE: 'Europe/Brussels', AT: 'Europe/Vienna', IT: 'Europe/Rome', ES: 'Europe/Madrid',
    KR: 'Asia/Seoul', IL: 'Asia/Jerusalem', AE: 'Asia/Dubai', SA: 'Asia/Riyadh',
    BR: 'America/Sao_Paulo', MX: 'America/Mexico_City', PL: 'Europe/Warsaw', PT: 'Europe/Lisbon',
    TR: 'Europe/Istanbul', ZA: 'Africa/Johannesburg', MY: 'Asia/Kuala_Lumpur', TH: 'Asia/Bangkok',
    TW: 'Asia/Taipei', HK: 'Asia/Hong_Kong', CZ: 'Europe/Prague', GR: 'Europe/Athens',
    RO: 'Europe/Bucharest', HU: 'Europe/Budapest', AR: 'America/Argentina/Buenos_Aires',
    CL: 'America/Santiago', CO: 'America/Bogota', QA: 'Asia/Qatar', KW: 'Asia/Kuwait',
    IN: 'Asia/Kolkata', PK: 'Asia/Karachi', ID: 'Asia/Jakarta', PH: 'Asia/Manila',
    VN: 'Asia/Ho_Chi_Minh', BD: 'Asia/Dhaka', EG: 'Africa/Cairo', NG: 'Africa/Lagos',
    KE: 'Africa/Nairobi', MA: 'Africa/Casablanca', UA: 'Europe/Kyiv', KZ: 'Asia/Almaty'
  };

  const COUNTRY_LANGUAGES = {
    US: 'en', CA: 'en', GB: 'en', AU: 'en', NZ: 'en', IE: 'en',
    DE: 'de', AT: 'de', CH: 'de', FR: 'fr', BE: 'fr', LU: 'fr',
    JP: 'ja', KR: 'ko', CN: 'zh-CN', TW: 'zh-TW', HK: 'zh-HK',
    ES: 'es', MX: 'es', AR: 'es', CL: 'es', CO: 'es', PE: 'es',
    PT: 'pt', BR: 'pt', IT: 'it', NL: 'nl', PL: 'pl', TR: 'tr',
    RU: 'ru', UA: 'uk', SA: 'ar', AE: 'ar', QA: 'ar', KW: 'ar',
    EG: 'ar', MA: 'ar', DZ: 'ar', TN: 'ar', IQ: 'ar', JO: 'ar',
    IN: 'hi', PK: 'ur', ID: 'id', TH: 'th', VN: 'vi', GR: 'el',
    SE: 'sv', NO: 'no', DK: 'da', FI: 'fi', CZ: 'cs', HU: 'hu',
    RO: 'ro', BG: 'bg', SK: 'sk', HR: 'hr', RS: 'sr', IL: 'he'
  };

  function getTimezone(code) {
    if (!code) return 'UTC';
    return COUNTRY_TIMEZONES[code.toUpperCase()] || 'UTC';
  }

  function getNativeLanguage(code) {
    if (!code) return 'en';
    return COUNTRY_LANGUAGES[code.toUpperCase()] || 'en';
  }

  return {
    COUNTRIES,
    UULE_TABLE,
    generateUule,
    findCountry,
    DEFAULT_QUICK_PILLS,
    COUNTRY_TIMEZONES,
    COUNTRY_LANGUAGES,
    getTimezone,
    getNativeLanguage
  };
}));
