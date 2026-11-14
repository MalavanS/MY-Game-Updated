<?php
// These files must only ever send JSON. WAMP/XAMPP print PHP warnings and notices
// into the page by default, which corrupts the JSON and the page shows "Server error".
// Send them to the PHP error log instead, and throw away anything printed by accident.
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ob_start();

require __DIR__ . '/config.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

set_exception_handler(function ($e) {
    error_log($e);
    while (ob_get_level()) ob_end_clean();
    http_response_code(500);
    $msg = 'Server error.';
    if ($e instanceof PDOException) {
        $msg = 'Database error: ' . $e->getMessage() . ' (is MySQL running and was schema.sql imported?)';
    }
    echo json_encode(['ok' => false, 'error' => $msg]);
});

function db(): PDO {
    static $pdo;
    if (!$pdo) {
        $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }
    return $pdo;
}

function out(array $d, int $code = 200): void {
    while (ob_get_level()) ob_end_clean();   // drop any stray warning text
    http_response_code($code);
    echo json_encode($d);
    exit;
}
function fail(string $m, int $code = 400): void { out(['ok' => false, 'error' => $m], $code); }
function input(): array { $d = json_decode(file_get_contents('php://input'), true); return is_array($d) ? $d : []; }

function user_json(array $u): array {
    return [
        'id' => (int)$u['id'], 'username' => $u['username'], 'email' => $u['email'],
        'lives' => (int)$u['lives'], 'bestScore' => (int)$u['best_score'],
    ];
}

function current_user(): ?array {
    if (empty($_SESSION['uid'])) return null;
    $s = db()->prepare('SELECT * FROM users WHERE id = ? AND verified = 1');
    $s->execute([$_SESSION['uid']]);
    return $s->fetch() ?: null;
}

function require_user(): array {
    $u = current_user();
    if (!$u) fail('Not logged in.', 401);
    return $u;
}

function login_user(int $id): void {
    session_regenerate_id(true);
    unset($_SESSION['pending_uid']);
    $_SESSION['uid'] = $id;
}

// Creates a 6-digit OTP, stores only its hash, emails it.
function send_otp(array $user): array {
    $pdo = db();
    $s = $pdo->prepare('SELECT 1 FROM otp_codes WHERE user_id = ? AND created_at > (NOW() - INTERVAL 30 SECOND)');
    $s->execute([$user['id']]);
    if ($s->fetch()) fail('Wait 30 seconds before requesting another code.', 429);

    $code = (string)random_int(100000, 999999);
    $pdo->prepare('DELETE FROM otp_codes WHERE user_id = ?')->execute([$user['id']]);
    $pdo->prepare('INSERT INTO otp_codes (user_id, code_hash, expires_at) VALUES (?, ?, NOW() + INTERVAL 5 MINUTE)')
        ->execute([$user['id'], hash('sha256', $code)]);

    @mail($user['email'], 'Your game verification code',
        "Your code is $code\nIt expires in 5 minutes.", 'From: ' . MAIL_FROM);

    return DEV_MODE ? ['devCode' => $code] : [];
}
