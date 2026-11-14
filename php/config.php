<?php
const DB_HOST = '127.0.0.1';   // not 'localhost': on Windows/XAMPP that can add ~1s to every DB connection
const DB_NAME = 'game_db';
const DB_USER = 'root';
const DB_PASS = '';

// true  = OTP is returned in the response and shown on the page (testing, no mail server needed)
// false = OTP is only sent by email (production)
const DEV_MODE = true;
const MAIL_FROM = 'no-reply@yourdomain.com';
const OTP_ON_LOGIN = true;   // ask for an OTP on every login too
const WIN_SCORE = 20;        // must match main.js

if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax']);
    session_start();
}
