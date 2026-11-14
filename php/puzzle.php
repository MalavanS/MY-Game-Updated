<?php
require __DIR__ . '/helpers.php';
$u = require_user();
if ((int)$u['lives'] >= 2) fail('You already have full lives.');

$ch = curl_init('https://marcconrad.com/uob/banana/api.php?out=json');
curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8, CURLOPT_SSL_VERIFYPEER => false]);
$body = curl_exec($ch);
curl_close($ch);
$data = json_decode($body ?: '', true);
if (!isset($data['question'], $data['solution'])) fail('Could not load a puzzle.', 502);

$_SESSION['banana'] = (int)$data['solution'];
out(['ok' => true, 'question' => $data['question']]);
