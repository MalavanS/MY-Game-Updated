// Talks to the PHP backend (php/*.php). Session lives in a PHP cookie session.
const API = 'php/';

export function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function isPhone(v) {
    return /^\+?\d{9,15}$/.test(v.replace(/[\s-]/g, ''));
}

export async function api(file, data = {}) {
    let text = '';
    let status = 0;
    try {
        const res = await fetch(API + file, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(data)
        });
        status = res.status;
        text = await res.text();
        try {
            return JSON.parse(text);
        } catch {
            // PHP printed a warning/notice before the JSON: use the JSON part anyway
            const start = text.indexOf('{"ok"');
            if (start >= 0) {
                console.warn('PHP printed extra text before the JSON in', file, ':\n', text.slice(0, start));
                return JSON.parse(text.slice(start));
            }
            throw new Error('Not JSON');
        }
    } catch (err) {
        console.error('API error:', file, err, '\nServer replied:', text);
        // 405/404, or PHP source code coming back, means PHP is not running for this page
        // (e.g. it was opened with VS Code Live Server on port 5500 instead of XAMPP).
        if (status === 405 || status === 404 || text.startsWith('<?php')) {
            return { ok: false, error: 'PHP is not running here. Open the game through XAMPP: http://localhost/<project folder>/login.html (not Live Server :5500).' };
        }
        // Show what PHP actually said (without HTML tags) so the real problem is visible
        const said = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
        return { ok: false, error: 'Server error' + (said ? ': ' + said : '. Check the console (F12).') };
    }
}

// Returns the logged-in user or null
export async function getSession() {
    const r = await api('me.php');
    return r.ok ? r.user : null;
}

// Call at the top of any page that needs a logged-in player:  const session = await requireLogin();
export async function requireLogin() {
    const s = await getSession();
    if (!s) {
        window.location.replace('login.html');
        return null;
    }
    return s;
}

export async function clearSession() {
    await api('logout.php');
}

export const loseLife = () => api('lose_life.php');
export const submitScore = (score, timeMs) => api('submit_score.php', { score, timeMs });