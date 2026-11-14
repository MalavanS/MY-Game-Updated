<?php
require __DIR__ . '/helpers.php';
$d = input();
$first = trim($d['firstName'] ?? ''); $last = trim($d['lastName'] ?? '');
$username = strtolower(trim($d['username'] ?? ''));
$email = strtolower(trim($d['email'] ?? ''));
$phone = preg_replace('/[\s-]/', '', $d['phone'] ?? '');
$password = $d['password'] ?? '';

if ($first === '' || $last === '' || !preg_match('/^[a-z0-9_]{3,30}$/', $username)) fail('Fill in your name and a username (3-30 letters, numbers or _).');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail('Enter a valid email address.');
if (!preg_match('/^\+?\d{9,15}$/', $phone)) fail('Enter a valid phone number.');
if (strlen($password) < 6) fail('Password must be at least 6 characters.');

$s = db()->prepare('SELECT email, username, phone FROM users WHERE email = ? OR username = ? OR phone = ?');
$s->execute([$email, $username, $phone]);
if ($row = $s->fetch()) {
    if ($row['email'] === $email) fail('That email is already registered. Log in instead.');
    if ($row['username'] === $username) fail('That username is taken.');
    fail('That phone number is already registered.');
}

db()->prepare('INSERT INTO users (first_name,last_name,username,email,phone,password_hash) VALUES (?,?,?,?,?,?)')
    ->execute([$first, $last, $username, $email, $phone, password_hash($password, PASSWORD_DEFAULT)]);
$id = (int)db()->lastInsertId();

$_SESSION['pending_uid'] = $id;
out(['ok' => true, 'needOtp' => true] + send_otp(['id' => $id, 'email' => $email]));
