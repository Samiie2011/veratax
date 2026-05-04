<?php
// employees.php - CRUD for Employees (HR)
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
            $stmt = $db->prepare("SELECT * FROM employees WHERE id = ?");
            $stmt->execute([$id]);
            $item = $stmt->fetch();
            if ($item) send_json(['ok' => true, 'data' => $item]);
            else send_error('NOT_FOUND', 'Employee not found', 404);
        } else {
            $stmt = $db->query("SELECT * FROM employees ORDER BY full_name ASC");
            send_json(['ok' => true, 'data' => $stmt->fetchAll()]);
        }
        break;

    case 'POST':
        $data = get_json_input();
        $stmt = $db->prepare("INSERT INTO employees (employee_code, full_name, position, department, phone, email, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['employee_code'] ?? null,
            $data['full_name'] ?? 'New Employee',
            $data['position'] ?? null,
            $data['department'] ?? null,
            $data['phone'] ?? null,
            $data['email'] ?? null,
            $data['status'] ?? 'active'
        ]);
        send_json(['ok' => true, 'id' => $db->lastInsertId()]);
        break;

    case 'PUT':
        if (!$id) send_error('MISSING_ID', 'Employee ID required');
        $data = get_json_input();
        $stmt = $db->prepare("UPDATE employees SET employee_code=?, full_name=?, position=?, department=?, phone=?, email=?, status=? WHERE id=?");
        $stmt->execute([
            $data['employee_code'],
            $data['full_name'],
            $data['position'],
            $data['department'],
            $data['phone'],
            $data['email'],
            $data['status'],
            $id
        ]);
        send_json(['ok' => true]);
        break;

    case 'DELETE':
        if (!$id) send_error('MISSING_ID', 'Employee ID required');
        $stmt = $db->prepare("DELETE FROM employees WHERE id = ?");
        $stmt->execute([$id]);
        send_json(['ok' => true]);
        break;
}
