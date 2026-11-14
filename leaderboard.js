import { requireLogin } from './auth.js';
import { isSafeDogUrl, breedFromUrl } from './dogAPI.js';

const session = requireLogin();

// BACKEND: replace this with fetch('/api/leaderboard.php') returning
// [{ username, contact, bestScore, avatar }]. Rendering below stays the same.
function loadPlayers() {
    const players = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key.startsWith('player_')) continue;
        try { players.push(JSON.parse(localStorage.getItem(key))); } catch { /* skip */ }
    }
    return players;
}

if (session) {
    const list = document.getElementById('board');
    const players = loadPlayers()
        .filter(p => p && p.contact)
        .sort((a, b) => (b.bestScore || 0) - (a.bestScore || 0))
        .slice(0, 10);

    if (players.length === 0) {
        document.getElementById('empty').hidden = false;
    }

    players.forEach((p, i) => {
        const li = document.createElement('li');
        if (p.contact === session.contact) li.className = 'me';

        const rank = document.createElement('span');
        rank.className = 'rank';
        rank.textContent = i + 1;

        let pic;
        if (isSafeDogUrl(p.avatar)) {
            pic = document.createElement('img');
            pic.src = p.avatar;
            pic.alt = breedFromUrl(p.avatar) || 'Dog avatar';
            pic.loading = 'lazy';
        } else {
            pic = document.createElement('span');
            pic.textContent = '\u{1F436}';
        }
        pic.classList.add('avatar', 'avatar-sm');

        const name = document.createElement('span');
        name.className = 'name';
        name.textContent = p.username || p.contact;

        const score = document.createElement('strong');
        score.textContent = p.bestScore || 0;

        li.append(rank, pic, name, score);
        list.append(li);
    });
}
