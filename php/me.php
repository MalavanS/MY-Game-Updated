<?php
require __DIR__ . '/helpers.php';
$u = current_user();
$u ? out(['ok' => true, 'user' => user_json($u)]) : fail('Not logged in.', 401);
