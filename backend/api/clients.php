<?php
// clients.php - CRUD for Clients
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
            $stmt = $db->prepare("SELECT * FROM clients WHERE id = ?");
            $stmt->execute([$id]);
            $item = $stmt->fetch();
            if ($item) send_json(['ok' => true, 'data' => $item]);
            else send_error('NOT_FOUND', 'Client not found', 404);
        } else {
            $stmt = $db->query("SELECT * FROM clients ORDER BY name ASC");
            send_json(['ok' => true, 'data' => $stmt->fetchAll()]);
        }
        break;

    case 'POST':
        $data = get_json_input();
        $stmt = $db->prepare("INSERT INTO clients (tax_code, name, address, contact_person, phone, email) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['tax_code'] ?? null,
            $data['name'] ?? 'Unnamed',
            $data['address'] ?? null,
            $data['contact_person'] ?? null,
            $data['phone'] ?? null,
            $data['email'] ?? null
        ]);
        send_json(['ok' => true, 'id' => $db->lastInsertId()]);
        break;

    case 'PUT':
        if (!$id) send_error('MISSING_ID', 'Client ID required');
        $data = get_json_input();
        $stmt = $db->prepare("UPDATE clients SET tax_code=?, name=?, address=?, contact_person=?, phone=?, email=? WHERE id=?");
        $stmt->execute([
            $data['tax_code'],
            $data['name'],
            $data['address'],
            $data['contact_person'],
            $data['phone'],
            $data['email'],
            $id
        ]);
        send_json(['ok' => true]);
        break;

    case 'DELETE':
        if (!$id) send_error('MISSING_ID', 'Client ID required');
        $stmt = $db->prepare("DELETE FROM clients WHERE id = ?");
        $stmt->execute([$id]);
        send_json(['ok' => true]);
        break;
}
