<?php
// client_vault.php - ERP Client Vault Entries
if (!defined('VERATAX_API_INTERNAL')) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'NOT_FOUND', 'message' => 'Endpoint not found.']);
    exit;
}

$currentUser = $GLOBALS['currentUser'] ?? null;
$db = get_db();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? (isset($parts[1]) ? $parts[1] : null);

$config = get_app_config();
$vault_key = $config['vault_key'] ?? '';

switch ($method) {
    case 'GET':
        // If $id is provided, it acts as clientId to filter
        if ($id) {
            $stmt = $db->prepare("SELECT * FROM client_vault_entries WHERE client_id = ? ORDER BY sort_order ASC");
            $stmt->execute([$id]);
            send_json(['ok' => true, 'data' => $stmt->fetchAll()]);
        } else {
            $stmt = $db->query("SELECT * FROM client_vault_entries ORDER BY sort_order ASC");
            send_json(['ok' => true, 'data' => $stmt->fetchAll()]);
        }
        break;

    case 'POST':
        $data = get_json_input();
        
        // Handle Reveal Action
        if (isset($parts[1]) && $parts[1] === 'entries' && isset($parts[3]) && $parts[3] === 'reveal') {
            $entryId = $parts[2];
            
            // Authorization already checked in index.php for read, but we might want admin-only for reveal
            // if ($currentUser['role'] !== 'admin') send_error('FORBIDDEN', 'Bạn không có quyền xem mật khẩu.');

            $stmt = $db->prepare("SELECT password_encrypted, pin_encrypted FROM client_vault_entries WHERE id = ?");
            $stmt->execute([$entryId]);
            $entry = $stmt->fetch();
            
            if (!$entry) send_error('NOT_FOUND', 'Không tìm thấy tài khoản.');

            $password = decrypt_vault_data($entry['password_encrypted'], $vault_key);
            $pin = decrypt_vault_data($entry['pin_encrypted'], $vault_key);

            // AUDIT LOG for Reveal
            $logStmt = $db->prepare("INSERT INTO activity_logs (user_id, user_name, module, action, details) VALUES (?, ?, ?, ?, ?)");
            $logStmt->execute([
                $currentUser['id'],
                $currentUser['user_name'] ?? $currentUser['email'],
                'ClientVault',
                'REVEAL_SECRET',
                "User revealed secret for entry ID: $entryId"
            ]);

            send_json([
                'ok' => true,
                'data' => [
                    'password' => $password,
                    'pin' => $pin
                ]
            ]);
            exit;
        }

        if (!isset($data['client_id'])) send_error('MISSING_CLIENT_ID', 'client_id is required');
        
        $pw = encrypt_vault_data($data['password'] ?? '', $vault_key);
        $pin = encrypt_vault_data($data['pin'] ?? '', $vault_key);

        $stmt = $db->prepare("INSERT INTO client_vault_entries (client_id, service_name, website_url, username, password_encrypted, gmail, tax_login, phone, recovery_email, pin_encrypted, operation_note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['client_id'],
            $data['service_name'] ?? null,
            $data['website_url'] ?? null,
            $data['username'] ?? null,
            $pw,
            $data['gmail'] ?? null,
            $data['tax_login'] ?? null,
            $data['phone'] ?? null,
            $data['recovery_email'] ?? null,
            $pin,
            $data['operation_note'] ?? null
        ]);
        send_json(['ok' => true, 'id' => $db->lastInsertId()]);
        break;

    case 'PUT':
        if (!$id) send_error('MISSING_ID', 'Entry ID required');
        $data = get_json_input();
        
        $pw = encrypt_vault_data($data['password'] ?? '', $vault_key);
        $pin = encrypt_vault_data($data['pin'] ?? '', $vault_key);
        
        $stmt = $db->prepare("UPDATE client_vault_entries SET service_name=?, website_url=?, username=?, password_encrypted=?, gmail=?, tax_login=?, phone=?, recovery_email=?, pin_encrypted=?, operation_note=? WHERE id=?");
        $stmt->execute([
            $data['service_name'],
            $data['website_url'],
            $data['username'],
            $pw,
            $data['gmail'],
            $data['tax_login'],
            $data['phone'],
            $data['recovery_email'],
            $pin,
            $data['operation_note'],
            $id
        ]);
        send_json(['ok' => true]);
        break;

    case 'DELETE':
        if (!$id) send_error('MISSING_ID', 'Entry ID required');
        $stmt = $db->prepare("DELETE FROM client_vault_entries WHERE id = ?");
        $stmt->execute([$id]);
        send_json(['ok' => true]);
        break;
}
