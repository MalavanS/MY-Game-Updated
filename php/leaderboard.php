<?php
require __DIR__ . '/helpers.php';
$u = require_user();

$top = db()->query('SELECT username, best_score AS score, best_time AS timeMs FROM users
                    WHERE verified = 1 AND best_score > 0
                    ORDER BY best_score DESC, best_time ASC, id ASC LIMIT 10')->fetchAll();

$me = null;
if ((int)$u['best_score'] > 0) {
    $s = db()->prepare('SELECT COUNT(*) + 1 FROM users WHERE verified = 1 AND
                        (best_score > ? OR (best_score = ? AND (best_time < ? OR (best_time = ? AND id < ?))))');
    $s->execute([$u['best_score'], $u['best_score'], $u['best_time'], $u['best_time'], $u['id']]);
    $me = ['rank' => (int)$s->fetchColumn(), 'score' => (int)$u['best_score'], 'timeMs' => (int)$u['best_time']];
}
out(['ok' => true, 'top' => $top, 'me' => $me, 'you' => $u['username']]);
