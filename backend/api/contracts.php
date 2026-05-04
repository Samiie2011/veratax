<?php
// contracts.php - CRUD for Contracts
if (!defined('VERATAX_API_INTERNAL')) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'NOT_FOUND', 'message' => 'Endpoint not found.']);
    exit;
}

$currentUser = $GLOBALS['currentUser'] ?? null;
$db = get_db();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? (isset($parts[1]) ? $parts[1] : null);

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $db->prepare("SELECT * FROM contracts WHERE id = ?");
            $stmt->execute([$id]);
            $item = $stmt->fetch();
            if ($item) send_json(['ok' => true, 'data' => $item]);
            else send_error('NOT_FOUND', 'Contract not found', 404);
        } else {
            $stmt = $db->query("SELECT * FROM contracts ORDER BY created_at DESC");
            send_json(['ok' => true, 'data' => $stmt->fetchAll()]);
        }
        break;

    case 'POST':
        $data = get_json_input();
        $stmt = $db->prepare("INSERT INTO contracts (contract_code, title, start_date, end_date, value, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['contract_code'] ?? null,
            $data['title'] ?? null,
            $data['start_date'] ?? null,
            $data['end_date'] ?? null,
            $data['value'] ?? 0,
            $data['status'] ?? 'pending',
            $data['notes'] ?? null
        ]);
        send_json(['ok' => true, 'id' => $db->lastInsertId()]);
        break;

    case 'PUT':
        if (!$id) send_error('MISSING_ID', 'Contract ID required');
        $data = get_json_input();
        $stmt = $db->prepare("UPDATE contracts SET contract_code=?, title=?, start_date=?, end_date=?, value=?, status=?, notes=? WHERE id=?");
        $stmt->execute([
            $data['contract_code'],
            $data['title'],
            $data['start_date'],
            $data['end_date'],
            $data['value'],
            $data['status'],
            $data['notes'],
            $id
        ]);
        send_json(['ok' => true]);
        break;

    case 'DELETE':
        if (!$id) send_error('MISSING_ID', 'Contract ID required');
        $stmt = $db->prepare("DELETE FROM contracts WHERE id = ?");
        $stmt->execute([$id]);
        send_json(['ok' => true]);
        break;
}
