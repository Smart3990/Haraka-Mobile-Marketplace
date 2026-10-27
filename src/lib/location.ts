/**
 * Finds where the person is in Ghana: the phone's GPS, then the street address from a map
 * service. When the map services cannot be reached, the nearest regional capital is worked out
 * from the GPS position itself; with no GPS at all, the internet connection's location is used.
 */

export const GHANA_REGION_CAPITALS: { region: string; capital: string; lat: number; lon: number }[] = [
  { region: 'Greater Accra', capital: 'Accra', lat: 5.6037, lon: -0.187 },
  { region: 'Ashanti', capital: 'Kumasi', lat: 6.6885, lon: -1.6244 },
  { region: 'Western', capital: 'Sekondi-Takoradi', lat: 4.934, lon: -1.7137 },
  { region: 'Western North', capital: 'Sefwi Wiawso', lat: 6.2058, lon: -2.4894 },
  { region: 'Central', capital: 'Cape Coast', lat: 5.1053, lon: -1.2466 },
  { region: 'Eastern', capital: 'Koforidua', lat: 6.0941, lon: -0.2591 },
  { region: 'Volta', capital: 'Ho', lat: 6.6008, lon: 0.4713 },
  { region: 'Oti', capital: 'Dambai', lat: 8.0667, lon: 0.1792 },
  { region: 'Northern', capital: 'Tamale', lat: 9.4008, lon: -0.8393 },
  { region: 'Savannah', capital: 'Damongo', lat: 9.0833, lon: -1.8167 },
  { region: 'North East', capital: 'Nalerigu', lat: 10.5273, lon: -0.3698 },
  { region: 'Upper East', capital: 'Bolgatanga', lat: 10.7856, lon: -0.8514 },
  { region: 'Upper West', capital: 'Wa', lat: 10.0601, lon: -2.5099 },
  { region: 'Bono', capital: 'Sunyani', lat: 7.3349, lon: -2.3123 },
  { region: 'Bono East', capital: 'Techiman', lat: 7.5861, lon: -1.9396 },
  { region: 'Ahafo', capital: 'Goaso', lat: 6.8036, lon: -2.5172 },
];

export interface FoundLocation {
  /** e.g. "Spintex Road" (may be empty) */
  street: string;
  /** e.g. "Baatsona, Accra" */
  town: string;
  /** One of Ghana's 16 regions */
  region: string;
  /** True when it came from the phone's GPS (not the internet connection) */
  fromGps: boolean;
}

/** The Ghana region a place name refers to ("Greater Accra Region" → "Greater Accra"); the longest match wins. */
export function matchGhanaRegion(text: string): string {
  const t = (text || '').toLowerCase();
  if (!t) return '';
  const hits = GHANA_REGION_CAPITALS.filter((r) => t.includes(r.region.toLowerCase())).sort((a, b) => b.region.length - a.region.length);
  return hits[0]?.region || '';
}

function nearestCapital(lat: number, lon: number) {
  return [...GHANA_REGION_CAPITALS].sort(
    (a, b) => (a.lat - lat) ** 2 + (a.lon - lon) ** 2 - ((b.lat - lat) ** 2 + (b.lon - lon) ** 2)
  )[0];
}

const inGhana = (lat: number, lon: number) => lat >= 4.5 && lat <= 11.3 && lon >= -3.4 && lon <= 1.3;

function devicePosition(highAccuracy: boolean, timeoutMs: number): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return reject(new Error('no-geolocation'));
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: highAccuracy, timeout: timeoutMs, maximumAge: 30_000 });
  });
}

async function fetchJson(url: string, timeoutMs = 7000): Promise<any> {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = setTimeout(() => controller?.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller?.signal, headers: { Accept: 'application/json' } });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Street, town and region from GPS coordinates. */
async function describePosition(lat: number, lon: number): Promise<Omit<FoundLocation, 'fromGps'>> {
  const fallback = nearestCapital(lat, lon);
  const nominatim = await fetchJson(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=en`
  );
  if (nominatim?.address) {
    const a = nominatim.address;
    const area = a.suburb || a.neighbourhood || a.quarter || a.residential || a.village || '';
    const city = a.city || a.town || a.municipality || a.county || '';
    return {
      street: a.road || '',
      town: [area, city].filter((v, i, all) => v && all.indexOf(v) === i).join(', ') || fallback.capital,
      region: matchGhanaRegion(a.state || a.region || '') || fallback.region,
    };
  }
  const photon = await fetchJson(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}&lang=en`);
  const p = photon?.features?.[0]?.properties;
  if (p) {
    const area = p.district || p.locality || '';
    const city = p.city || p.county || '';
    return {
      street: p.street || '',
      town: [area, city].filter((v, i, all) => v && all.indexOf(v) === i).join(', ') || p.name || fallback.capital,
      region: matchGhanaRegion(p.state || '') || fallback.region,
    };
  }
  return { street: '', town: fallback.capital, region: fallback.region };
}

/**
 * Where the person is now. Throws an Error with a message to show when it cannot tell
 * (location turned off or refused, and no Ghana internet location either).
 */
export async function locateMe(): Promise<FoundLocation> {
  let position: GeolocationPosition | null = null;
  let refused = false;
  try {
    position = await devicePosition(true, 10_000);
  } catch (err) {
    refused = (err as GeolocationPositionError)?.code === 1;
    if (!refused) position = await devicePosition(false, 8_000).catch(() => null);
  }
  if (position) {
    const { latitude, longitude } = position.coords;
    if (inGhana(latitude, longitude)) return { ...(await describePosition(latitude, longitude)), fromGps: true };
  }
  // No GPS: the internet connection's location, only when it is in Ghana
  const ip = (await fetchJson('https://ipwho.is/')) || {};
  if (ip.success && ip.country_code === 'GH') {
    const region = matchGhanaRegion(ip.region || '') || 'Greater Accra';
    return { street: '', town: ip.city || GHANA_REGION_CAPITALS.find((r) => r.region === region)!.capital, region, fromGps: false };
  }
  throw new Error(
    refused
      ? 'Location is switched off for Haraka. Allow location in your phone settings, or choose your region.'
      : "Couldn't find your location. Please choose your region."
  );
}
