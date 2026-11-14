<?php
require __DIR__ . '/helpers.php';
$u = require_user();
db()->prepare('UPDATE users SET lives = GREATEST(lives - 1, 0) WHERE id = ?')->execute([$u['id']]);
out(['ok' => true, 'lives' => max(0, (int)$u['lives'] - 1)]);
