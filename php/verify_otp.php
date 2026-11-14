<?php
require __DIR__ . '/helpers.php';
$uid = $_SESSION['pending_uid'] ?? null;
if (!$uid) fail('Start again: sign in or create an account.', 401);
$code = trim(input()['code'] ?? '');
if (!preg_match('/^\d{6}$/', $code)) fail('Enter the 6-digit code.');

$s = db()->prepare('SELECT *, expires_at < NOW() AS expired FROM otp_codes WHERE user_id = ?');
$s->execute([$uid]);
$otp = $s->fetch();

if (!$otp) fail('Request a new code first.');
if ($otp['expired']) fail('Code expired. Request a new one.');
if ($otp['attempts'] >= 5) fail('Too many wrong tries. Request a new code.', 429);

// Increment attempt counter first
db()->prepare('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?')->execute([$otp['id']]);

if (!hash_equals($otp['code_hash'], hash('sha256', $code))) {
    fail('Wrong code. Try again.');
}

db()->prepare('DELETE FROM otp_codes WHERE user_id = ?')->execute([$uid]);
db()->prepare('UPDATE users SET verified = 1 WHERE id = ?')->execute([$uid]);
login_user((int)$uid);
out(['ok' => true, 'user' => user_json(current_user())]);