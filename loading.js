import { fetchDog, preloadImage, breedFromUrl } from './dogAPI.js';

// Shows a random dog while the game gets ready. Never blocks for long:
// if the Dog API is slow or offline, it just hides after the timeout.
export async function showLoadingScreen(minMs = 1500) {
    const overlay = document.getElementById('loading');
    if (!overlay) return;

    const img = document.getElementById('loadingDog');
    const caption = document.getElementById('loadingBreed');
    const started = Date.now();

    const url = await fetchDog();
    if (url && await preloadImage(url)) {
        img.src = url;
        img.hidden = false;
        caption.textContent = breedFromUrl(url);
    }

    const wait = minMs - (Date.now() - started);
    if (wait > 0) await new Promise(r => setTimeout(r, wait));

    overlay.classList.add('done');
    setTimeout(() => overlay.remove(), 400);
}
