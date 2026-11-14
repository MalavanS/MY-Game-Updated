<?php
require __DIR__ . '/helpers.php';
$d = input();
$id = strtolower(trim($d['id'] ?? ''));
$password = $d['password'] ?? '';
$phone = preg_replace('/[\s-]/', '', $id);

if ($id === '' || $password === '') fail('Enter your email, phone or username and password.', 400);

$s = db()->prepare('SELECT * FROM users WHERE email = ? OR username = ? OR phone = ?');
$s->execute([$id, $id, $phone]);
$u = $s->fetch();

if (!$u || !password_verify($password, $u['password_hash'])) fail('Wrong details. Check them and try again.', 401);

if (OTP_ON_LOGIN || !$u['verified']) {
    $_SESSION['pending_uid'] = (int)$u['id'];
    out(['ok' => true, 'needOtp' => true] + send_otp($u));
}
login_user((int)$u['id']);
out(['ok' => true, 'user' => user_json($u)]);
