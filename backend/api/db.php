<?php
// db.php - Database connection management for VERATAX ERP

function get_db_connection() {
    // Secure path outside public_html as requested
    $config_path = '/home/wvjm83sf4gob/secure_config/veratax_erp_config.php';
    
    if (!file_exists($config_path)) {
        header('Content-Type: application/json', true, 500);
        echo json_encode([
            'ok' => false, 
            'error' => 'SECURE_CONFIG_MISSING', 
            'message' => 'Hệ thống chưa được cấu hình. Vui lòng kiểm tra secure_config.'
        ]);
        exit;
    }

    $config = include $config_path;
    
    if (!is_array($config) || !isset($config['db_host'])) {
        header('Content-Type: application/json', true, 500);
        echo json_encode([
            'ok' => false, 
            'error' => 'INVALID_CONFIG_FORMAT', 
            'message' => 'Định dạng file cấu hình không hợp lệ.'
        ]);
        exit;
    }

    try {
        $dsn = "mysql:host={$config['db_host']};dbname={$config['db_name']};charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ];
        return new PDO($dsn, $config['db_user'], $config['db_pass'], $options);
    } catch (PDOException $e) {
        // We do NOT expose $e->getMessage() for security
        header('Content-Type: application/json', true, 500);
        echo json_encode([
            'ok' => false, 
            'error' => 'DATABASE_CONNECTION_ERROR', 
            'message' => 'Không thể kết nối đến cơ sở dữ liệu MySQL.'
        ]);
        exit;
    }
}

function get_db() {
    static $db = null;
    if ($db === null) {
        $db = get_db_connection();
    }
    return $db;
}

function get_app_config() {
    $config_path = '/home/wvjm83sf4gob/secure_config/veratax_erp_config.php';
    if (!file_exists($config_path)) return [];
    return include $config_path;
}
