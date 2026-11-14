// Dog CEO API helpers (https://dog.ceo/dog-api/) - free, no API key.
// Standalone: does not import auth.js.

const API = 'https://dog.ceo/api/breeds/image/random';
const ALLOWED_HOST = 'https://images.dog.ceo/';
const AVATAR_KEY = 'game_dog_avatar';

// Fetch 1..50 random dog image URLs. Returns [] if the API is down/slow,
// so callers can always fall back to an emoji.
export async function fetchDogs(count = 1, timeoutMs = 10000) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const res = await fetch(count > 1 ? `${API}/${count}` : API, { signal: ctrl.signal });
        if (!res.ok) throw new Error('Dog API ' + res.status);
        const data = await res.json();
        if (data.status !== 'success') throw new Error('Dog API error');
        return [].concat(data.message).filter(isSafeDogUrl);
    } catch (err) {
        console.error('Dog API failed:', err);
        return [];
    } finally {
        clearTimeout(timer);
    }
}

export async function fetchDog() {
    const [url] = await fetchDogs(1);
    return url || null;
}

// Only ever put dog.ceo images into <img src>
export function isSafeDogUrl(url) {
    return typeof url === 'string' && url.startsWith(ALLOWED_HOST);
}

// ".../breeds/hound-afghan/xxx.jpg" -> "Afghan Hound"
export function breedFromUrl(url) {
    const m = /\/breeds\/([^/]+)\//.exec(url || '');
    if (!m) return '';
    return m[1].split('-').reverse()
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

// Resolves true when the image has loaded, false on error/timeout
export function preloadImage(url, timeoutMs = 3000) {
    return new Promise(resolve => {
        const img = new Image();
        const timer = setTimeout(() => resolve(false), timeoutMs);
        img.onload = () => { clearTimeout(timer); resolve(true); };
        img.onerror = () => { clearTimeout(timer); resolve(false); };
        img.src = url;
    });
}

// ---------- Player avatar (kept in localStorage on this device) ----------
export function getSavedAvatar() {
    const url = localStorage.getItem(AVATAR_KEY);
    return isSafeDogUrl(url) ? url : null;
}

export async function ensureAvatar() {
    const saved = getSavedAvatar();
    if (saved) return saved;
    const url = await fetchDog();
    if (url) localStorage.setItem(AVATAR_KEY, url);
    return url;
}

export async function rerollAvatar() {
    const url = await fetchDog();
    if (url) localStorage.setItem(AVATAR_KEY, url);
    return url;
}