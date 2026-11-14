import { isEmail, isPhone, getSession, api } from './auth.js';

const cleanPhone = v => v.replace(/[\s-]/g, '');

// ---------- Elements ----------
const signupForm = document.getElementById('signupForm');
const signinForm = document.getElementById('signinForm');
const otpForm = document.getElementById('otpForm');
const tabSignup = document.getElementById('tabSignup');
const tabSignin = document.getElementById('tabSignin');
const signupError = document.getElementById('signupError');
const signinError = document.getElementById('signinError');
const otpError = document.getElementById('otpError');
const otpInfo = document.getElementById('otpInfo');

// ---------- Switch between sign in / create account / otp ----------
function show(view) {
    signupForm.classList.toggle('hidden', view !== 'signup');
    signinForm.classList.toggle('hidden', view !== 'signin');
    otpForm.classList.toggle('hidden', view !== 'otp');
    tabSignup.classList.toggle('active', view === 'signup');
    tabSignin.classList.toggle('active', view === 'signin');
    signupError.textContent = '';
    signinError.textContent = '';
    otpError.textContent = '';
}

tabSignup.addEventListener('click', () => show('signup'));
tabSignin.addEventListener('click', () => show('signin'));
document.querySelectorAll('[data-go]').forEach(btn =>
    btn.addEventListener('click', () => show(btn.dataset.go))
);
document.getElementById('otpBack').addEventListener('click', () => show('signin'));

// ---------- Show / hide password ----------
document.querySelectorAll('[data-eye]').forEach(btn => {
    btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.eye);
        const showing = input.type === 'text';
        input.type = showing ? 'password' : 'text';
        btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
    });
});

// ---------- OTP step ----------
function showOtp(r) {
    show('otp');
    otpInfo.textContent = 'We sent a 6-digit code to your email.' +
        (r.devCode ? ' (TEST MODE code: ' + r.devCode + ')' : '');
    document.getElementById('otpCode').value = '';
    document.getElementById('otpCode').focus();
}

otpForm.addEventListener('submit', async e => {
    e.preventDefault();
    otpError.textContent = '';
    const r = await api('verify_otp.php', { code: document.getElementById('otpCode').value.trim() });
    if (!r.ok) { otpError.textContent = r.error; return; }
    window.location.href = 'start.html';
});

document.getElementById('resendBtn').addEventListener('click', async () => {
    otpError.textContent = '';
    const r = await api('resend_otp.php');
    if (!r.ok) { otpError.textContent = r.error; return; }
    showOtp(r);
});

// ---------- Create account ----------
signupForm.addEventListener('submit', async e => {
    e.preventDefault();
    signupError.textContent = '';

    const data = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        username: document.getElementById('username').value.trim().toLowerCase(),
        email: document.getElementById('email').value.trim().toLowerCase(),
        phone: cleanPhone(document.getElementById('phone').value),
        password: document.getElementById('password').value
    };

    if (!data.firstName || !data.lastName || !data.username) { signupError.textContent = 'Fill in your name and a username.'; return; }
    if (!isEmail(data.email)) { signupError.textContent = 'Enter a valid email address.'; return; }
    if (!isPhone(data.phone)) { signupError.textContent = 'Enter a valid phone number.'; return; }
    if (data.password.length < 6) { signupError.textContent = 'Password must be at least 6 characters.'; return; }

    const r = await api('register.php', data);
    if (!r.ok) { signupError.textContent = r.error; return; }
    showOtp(r);
});

// ---------- Sign in ----------
signinForm.addEventListener('submit', async e => {
    e.preventDefault();
    signinError.textContent = '';

    const id = document.getElementById('loginId').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!id || !password) { signinError.textContent = 'Enter your email, phone or username and password.'; return; }

    const btn = signinForm.querySelector('button[type=submit]');
    if (btn.disabled) return;          // ignore double clicks while waiting
    btn.disabled = true;
    const r = await api('login.php', { id, password });
    btn.disabled = false;
    if (!r.ok) { signinError.textContent = r.error; return; }
    if (r.needOtp) { showOtp(r); return; }
    window.location.href = 'start.html';
});

// ---------- Hero image fallback ----------
const heroImg = document.getElementById('heroImg');
if (heroImg) heroImg.addEventListener('error', () => { heroImg.style.display = 'none'; });

// ---------- Already logged in? Skip to the start page. ----------
// This runs LAST, after every form handler above is attached. It used to be a
// top-level `await` at the top of the file, which meant the forms had no submit
// handler until me.php answered. On XAMPP that can take a second or more, and a
// LOGIN click in that window did a normal HTML form submit = page refresh.
getSession().then(user => { if (user) window.location.replace('start.html'); });
