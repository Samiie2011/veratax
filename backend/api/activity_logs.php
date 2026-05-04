<?php
// activity_logs.php - ERP Audit Logs
if (!defined('VERATAX_API_INTERNAL')) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'NOT_FOUND', 'message' => 'Endpoint not found.']);
    exit;
}

$currentUser = $GLOBALS['currentUser'] ?? null;
$db = get_db();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? (isset($parts[1]) ? $parts[1] : null);

if ($method === 'GET') {
    $stmt = $db->query("SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 200");
    send_json(['ok' => true, 'data' => $stmt->fetchAll()]);
} elseif ($method === 'POST') {
    $data = get_json_input();
    $stmt = $db->prepare("INSERT INTO activity_logs (user_id, user_name, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['user_id'] ?? 'system',
        $data['user_name'] ?? 'System',
        $data['action'] ?? 'Unknown',
        $data['target_type'] ?? null,
        $data['target_id'] ?? null,
        $data['details'] ?? null
    ]);
    send_json(['ok' => true]);
} else {
    send_error('METHOD_NOT_ALLOWED', 'Only GET/POST allowed');
}
