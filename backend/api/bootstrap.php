<?php
// bootstrap.php - Load initial state for the ERP frontend

if (!defined('VERATAX_API_INTERNAL')) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'NOT_FOUND', 'message' => 'Endpoint not found.']);
    exit;
}

$currentUser = $GLOBALS['currentUser'] ?? null;
if (!$currentUser) {
    send_error('UNAUTHORIZED', 'Bạn cần đăng nhập để sử dụng API.', 401);
}

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'GET') send_error('METHOD_NOT_ALLOWED', 'Only GET allowed for bootstrap', 405);

function mask_sensitive($value) {
    if (empty($value)) return "";
    $len = mb_strlen($value);
    if ($len <= 4) return "****";
    return mb_substr($value, 0, 2) . str_repeat("*", $len - 4) . mb_substr($value, -2);
}

$db = get_db();

try {
    // 1. Contracts
    $stmt = $db->query("SELECT * FROM contracts ORDER BY updated_at DESC");
    $contracts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Clients
    $stmt = $db->query("SELECT * FROM clients ORDER BY name ASC");
    $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Client Vault Entries - STRICTURE MASKING
    $stmt = $db->query("SELECT * FROM client_vault_entries ORDER BY sort_order ASC, service_name ASC");
    $vault_entries_raw = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $vault_entries = [];
    foreach ($vault_entries_raw as $entry) {
        $clean_entry = [
            'id' => $entry['id'],
            'client_id' => $entry['client_id'],
            'service_name' => $entry['service_name'],
            'website_url' => $entry['website_url'],
            'username_masked' => mask_sensitive($entry['username'] ?? ''),
            'gmail_masked' => mask_sensitive($entry['gmail'] ?? ''),
            'tax_login_masked' => mask_sensitive($entry['tax_login'] ?? ''),
            'phone_masked' => mask_sensitive($entry['phone'] ?? ''),
            'has_password' => !empty($entry['password']) || !empty($entry['password_encrypted']),
            'has_pin' => !empty($entry['pin']) || !empty($entry['pin_encrypted']),
            'operation_note' => $entry['operation_note'],
            'sort_order' => $entry['sort_order'],
            'updated_at' => $entry['updated_at']
        ];
        $vault_entries[] = $clean_entry;
    }

    // 4. Employees
    $stmt = $db->query("SELECT * FROM employees ORDER BY full_name ASC");
    $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 5. Activity Logs (Last 200)
    $stmt = $db->query("SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 200");
    $activity_logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    send_json([
        'ok' => true,
        'contracts' => $contracts,
        'clients' => $clients,
        'clientVault' => $vault_entries,
        'employees' => $employees,
        'activityLogs' => $activity_logs,
        'user' => [
            'id' => $currentUser['id'],
            'email' => $currentUser['email'],
            'role' => $currentUser['role']
        ]
    ]);

} catch (Exception $e) {
    send_error('DATABASE_ERROR', $e->getMessage());
}
