<?php
use PHPMailer\PHPMailer\PHPMailer;

// Option A (Composer):  cd php  &&  composer require phpmailer/phpmailer
// Option B (no Composer): download PHPMailer from GitHub and copy its src/ folder to php/phpmailer/src/
if (is_file(__DIR__ . '/vendor/autoload.php')) {
    require __DIR__ . '/vendor/autoload.php';
} else {
    foreach (['Exception', 'PHPMailer', 'SMTP'] as $f) require __DIR__ . "/phpmailer/src/$f.php";
}

// Returns null when the mail was handed to the SMTP server, or an error string.
function send_mail(string $to, string $subject, string $text, string $html = ''): ?string {
    try {
        $m = new PHPMailer(true);
        $m->isSMTP();
        $m->Host       = SMTP_HOST;
        $m->Port       = SMTP_PORT;
        $m->SMTPAuth   = true;
        $m->Username   = SMTP_USER;
        $m->Password   = SMTP_PASS;
        $m->SMTPSecure = SMTP_PORT === 465 ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
        $m->Timeout    = 10;
        $m->CharSet    = 'UTF-8';
        $m->setFrom(MAIL_FROM, MAIL_FROM_NAME);
        $m->addAddress($to);
        $m->Subject = $subject;
        if ($html !== '') {
            $m->isHTML(true);
            $m->Body    = $html;
            $m->AltBody = $text;
        } else {
            $m->Body = $text;
        }
        $m->send();
        return null;
    } catch (Throwable $e) {
        error_log('send_mail failed: ' . $e->getMessage());
        return $e->getMessage();
    }
}