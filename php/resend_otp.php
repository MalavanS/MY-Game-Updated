<?php
require __DIR__ . '/helpers.php';
$uid = $_SESSION['pending_uid'] ?? null;
if (!$uid) fail('Start again: sign in or create an account.', 401);

$s = db()->prepare('SELECT id, email FROM users WHERE id = ?');
$s->execute([$uid]);
$user = $s->fetch();

if (!$user) fail('User not found. Start again.', 401);

out(['ok' => true] + send_otp($user));