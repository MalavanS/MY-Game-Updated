import * as auth from './auth.js';

console.log('start.js v3 loaded');

const $ = id => document.getElementById(id);

// ---------- Dog CEO API (self-contained) ----------
const DOG_API = 'https://dog.ceo/api/breeds/image/random';
const AVATAR_KEY = 'game_dog_avatar';

const isDogUrl = u => typeof u === 'string' && u.startsWith('https://images.dog.ceo/');

function breedFromUrl(url) {
    const m = /\/breeds\/([^/]+)\//.exec(url || '');
    if (!m) return '';
    return m[1].split('-').reverse()
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

async function fetchDog() {
    const res = await fetch(DOG_API);
    if (!res.ok) throw new Error('Dog API ' + res.status);
    const data = await res.json();
    if (data.status !== 'success' || !isDogUrl(data.message)) throw new Error('Bad Dog API reply');
    return data.message;
}

// await works whether requireLogin() is sync or async
const session = await auth.requireLogin();

if (session) {
    // ---------- Dog avatar ----------
    const avatarEl = $('avatar');
    const fallbackEl = $('avatarFallback');
    const breedEl = $('breed');
    const newDogBtn = $('newDogBtn');

    const say = text => { if (breedEl) breedEl.textContent = text; };

    function showAvatar(url) {
        avatarEl.onload = () => {
            avatarEl.hidden = false;
            if (fallbackEl) fallbackEl.hidden = true;
            say(breedFromUrl(url));
        };
        avatarEl.onerror = () => say('Photo failed to load. Try again.');
        avatarEl.src = url;
    }

    async function loadNewDog() {
        say('Fetching a dog...');
        try {
            const url = await fetchDog();
            localStorage.setItem(AVATAR_KEY, url);
            showAvatar(url);
        } catch (err) {
            console.error('Dog API failed:', err);
            say('Could not load a dog: ' + err.message);
        }
    }

    if (avatarEl) {
        const saved = localStorage.getItem(AVATAR_KEY);
        if (isDogUrl(saved)) showAvatar(saved);
        else loadNewDog();

        newDogBtn?.addEventListener('click', async () => {
            newDogBtn.disabled = true;
            await loadNewDog();
            newDogBtn.disabled = false;
        });
    } else {
        console.error('start.html has no element with id="avatar"');
    }

    // ---------- Player info ----------
    const name = session.username || session.contact || '';
    if ($('welcome')) $('welcome').textContent = 'Logged in as ' + name;
    if ($('best')) $('best').textContent = session.bestScore ?? 0;

    const livesEl = $('lives');
    if (livesEl) {
        livesEl.textContent = session.lives > 0
            ? '\u2764'.repeat(session.lives)
            : 'None';
        livesEl.setAttribute('aria-label', session.lives + ' lives left');
    }

    // ---------- Buttons ----------
    const playBtn = $('playBtn');
    if (playBtn) {
        if (session.lives <= 0) {
            if ($('msg')) $('msg').textContent =
                'No lives left. Solve banana puzzles to earn one.';
            playBtn.textContent = 'Earn a life';
        }
        playBtn.addEventListener('click', () => {
            window.location.href = session.lives <= 0 ? 'banana.html' : 'index.html';
        });
    }

    $('rankBtn')?.addEventListener('click', () => {
        window.location.href = 'rank.html';
    });

    $('logoutBtn')?.addEventListener('click', async () => {
        const out = auth.logout || auth.clearSession;
        if (out) await out();
        window.location.href = 'login.html';
    });
}