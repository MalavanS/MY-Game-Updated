<?php
require __DIR__ . '/helpers.php';
$u = require_user();
$d = input();
$score = (int)($d['score'] ?? -1);
$time = (int)($d['timeMs'] ?? 0);

if ($score < 0 || $score > WIN_SCORE) fail('Invalid score.');
if ($score > 0 && $time < $score * 800) fail('Invalid score.');   // enemies spawn >= 900ms apart
if ($score === 0) out(['ok' => true]);

$s = db()->prepare('UPDATE users SET best_score = :s1, best_time = :t1
                    WHERE id = :id AND (:s2 > best_score OR (:s3 = best_score AND :t2 < best_time))');
$s->execute([':s1' => $score, ':t1' => $time, ':s2' => $score, ':s3' => $score, ':t2' => $time, ':id' => $u['id']]);
out(['ok' => true, 'newBest' => $s->rowCount() > 0]);
