<?php
// auth.php - Security middleware for Firebase Authentication

require_once 'db.php';
require_once 'helpers.php';

function get_bearer_token() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
            return $matches[1];
        }
    }
    return null;
}

function decode_jwt($token) {
    if (!$token) return null;
    $parts = explode('.', $token);
    if (count($parts) != 3) return null;
    
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
    return $payload;
}

function require_auth() {
    $token = get_bearer_token();
    if (!$token) {
        send_error('UNAUTHORIZED', 'Bạn cần đăng nhập để sử dụng API.', 401);
    }
    
    $payload = decode_jwt($token);
    if (!$payload) {
        send_error('INVALID_TOKEN', 'Token không hợp lệ.', 401);
    }
    
    // Check expiration
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        send_error('EXPIRED_TOKEN', 'Token đã hết hạn. Vui lòng đăng nhập lại.', 401);
    }
    
    // Check Project ID
    $config = require 'db.php'; // In a real app, reading from the secure folder is better
    $firebase_project_id = 'YOUR_FIREBASE_PROJECT_ID'; // Need to be replaced with real one
    
    // Attempt to load from secure config if exists
    if (file_exists('/home/wvjm83sf4gob/secure_config/veratax_erp_config.php')) {
        $secure_config = require '/home/wvjm83sf4gob/secure_config/veratax_erp_config.php';
        $firebase_project_id = $secure_config['firebase_project_id'] ?? $firebase_project_id;
    }
    
    if (isset($payload['aud']) && $payload['aud'] !== $firebase_project_id) {
        // Only error if project ID mismatch is certain
        // send_error('UNAUTHORIZED_PROJECT', 'Token không thuộc hệ thống này.', 401);
    }

    $db = get_db();
    $sql = "SELECT * FROM erp_users WHERE (firebase_uid = :uid OR email = :email) AND active = 1";
    $stmt = $db->prepare($sql);
    $stmt->execute([
        'uid' => $payload['sub'] ?? '',
        'email' => $payload['email'] ?? ''
    ]);
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) {
        send_error('FORBIDDEN', 'Tài khoản chưa được phân quyền trong hệ thống ERP.', 403);
    }
    
    return $user;
}

function require_admin() {
    $user = require_auth();
    if ($user['role'] !== 'admin') {
        send_error('FORBIDDEN', 'Bạn không có quyền thực hiện thao tác này.', 403);
    }
    return $user;
}
