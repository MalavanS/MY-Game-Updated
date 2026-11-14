import { requireLogin, api } from './auth.js';

const session = await requireLogin();

if (session) {
    document.getElementById('backBtn').addEventListener('click', () => {
        window.location.href = 'start.html';
    });

    const fmt = ms => (ms / 1000).toFixed(1) + 's';

    const r = await api('leaderboard.php');
    const rows = document.getElementById('rows');

    if (!r.ok) {
        document.getElementById('msg').textContent = r.error;
    } else {
        if (r.top.length === 0) {
            document.getElementById('msg').textContent = 'No scores yet. Be the first!';
        }
        r.top.forEach((p, i) => {
            const tr = document.createElement('tr');
            if (p.username === r.you) tr.className = 'me';
            [i + 1, p.username, p.score + ' / 20', fmt(p.timeMs)].forEach(v => {
                const td = document.createElement('td');
                td.textContent = v;   // textContent: usernames can't inject HTML
                tr.appendChild(td);
            });
            rows.appendChild(tr);
        });
        document.getElementById('yours').textContent = r.me
            ? 'Your rank: #' + r.me.rank + ' (' + r.me.score + ' / 20, ' + fmt(r.me.timeMs) + ')'
            : 'Play a round to get ranked.';
    }
}
