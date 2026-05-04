<?php
// helpers.php - General utility functions

function send_json($data, $status_code = 200) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($status_code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function send_error($error_code, $message, $status_code = 400) {
    send_json([
        'ok' => false,
        'error' => $error_code,
        'message' => $message
    ], $status_code);
}

function get_json_input() {
    $input = file_get_contents('php://input');
    if (empty($input)) return null;
    return json_decode($input, true);
}

// Simple XOR or OpenSSL encryption using vault_key from config
function encrypt_vault_data($text, $key) {
    if (empty($text)) return null;
    if (empty($key)) return $text; // Fallback if key missing (not recommended)
    
    // Using simple AES-128-CBC for illustration, ensure $key is strong
    $iv = substr(hash('sha256', $key), 0, 16);
    return base64_encode(openssl_encrypt($text, 'AES-128-CBC', $key, 0, $iv));
}

function decrypt_vault_data($cipher, $key) {
    if (empty($cipher)) return null;
    if (empty($key)) return $cipher;
    
    $iv = substr(hash('sha256', $key), 0, 16);
    return openssl_decrypt(base64_decode($cipher), 'AES-128-CBC', $key, 0, $iv);
}

function cors() {
    $allowed_origins = [
        'https://veratax.com.vn',
        'https://www.veratax.com.vn',
        'https://ais-dev-hawtsdz7u4lhwvrvlwu5xw-184301342756.asia-southeast1.run.app',
        'https://ais-pre-hawtsdz7u4lhwvrvlwu5xw-184301342756.asia-southeast1.run.app'
    ];
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
    }
    
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    
    // Security Headers
    header("X-Content-Type-Options: nosniff");
    header("X-Frame-Options: SAMEORIGIN");
    header("Referrer-Policy: no-referrer");
    header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
    header("Pragma: no-cache");
    
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}
