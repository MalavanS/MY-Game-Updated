<?php
require __DIR__ . '/helpers.php';
$u = require_user();
if (!isset($_SESSION['banana'])) fail('Load a puzzle first.');
$answer = input()['answer'] ?? '';
$solution = $_SESSION['banana'];
unset($_SESSION['banana']);   // one try per puzzle

if (!is_numeric($answer) || (int)$answer !== $solution) out(['ok' => true, 'correct' => false]);

db()->prepare('UPDATE users SET lives = LEAST(lives + 1, 2) WHERE id = ?')->execute([$u['id']]);
out(['ok' => true, 'correct' => true, 'lives' => min(2, (int)$u['lives'] + 1)]);
