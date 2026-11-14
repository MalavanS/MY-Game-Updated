import { requireLogin, api } from './auth.js';

const session = await requireLogin();
if (!session) {
    // requireLogin() handles redirect
} else {
    initBananaPage();
}

function initBananaPage() {
    const MAX_LIVES = 2;
    const img = document.getElementById('puzzleImg');
    const answerInput = document.getElementById('answer');
    const msg = document.getElementById('msg');
    const progress = document.getElementById('progress');
    const submitBtn = document.getElementById('submitBtn');
    const skipBtn = document.getElementById('skipBtn');
    const backBtn = document.getElementById('backBtn');

    backBtn.addEventListener('click', () => {
        window.location.href = 'start.html';
    });

    function setMessage(text, good = false) {
        msg.textContent = text;
        msg.classList.toggle('ok', good);
    }

    async function loadPuzzle() {
        answerInput.value = '';
        submitBtn.disabled = true;
        img.removeAttribute('src');
        progress.textContent = 'Solved 0 / 1';

        const r = await api('puzzle.php');
        if (!r.ok) {
            setMessage(r.error || 'Could not load a puzzle. Check your connection.');
            submitBtn.disabled = false;
            return;
        }

        img.src = r.question;
        img.style.display = 'block';
        submitBtn.disabled = false;
        answerInput.focus();
    }

    submitBtn.addEventListener('click', async () => {
        const answer = answerInput.value.trim();
        if (answer === '') {
            setMessage('Type your answer first.');
            return;
        }

        submitBtn.disabled = true;
        const r = await api('answer.php', { answer });
        submitBtn.disabled = false;

        if (!r.ok) {
            setMessage(r.error);
            return;
        }

        if (r.correct) {
            progress.textContent = 'Solved 1 / 1';
            setMessage('Correct! You earned a life! Heading back...', true);
            submitBtn.disabled = true;
            skipBtn.disabled = true;
            setTimeout(() => {
                window.location.href = 'start.html';
            }, 1200);
        } else {
            setMessage('Not quite. Here is a new puzzle, no penalty.');
            loadPuzzle();
        }
    });

    skipBtn.addEventListener('click', () => {
        setMessage('');
        loadPuzzle();
    });

    answerInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') submitBtn.click();
    });

    if ((session.lives || 0) >= MAX_LIVES) {
        setMessage('You already have full lives.', true);
        submitBtn.disabled = true;
        skipBtn.disabled = true;
        img.style.display = 'none';
    } else {
        loadPuzzle();
    }
}
