<?php
// migration.php - Import Drive Snapshot JSON to MySQL
if (!defined('VERATAX_API_INTERNAL')) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'NOT_FOUND', 'message' => 'Endpoint not found.']);
    exit;
}

$currentUser = $GLOBALS['currentUser'] ?? null;
$db = get_db();
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') send_error('METHOD_NOT_ALLOWED', 'POST expected', 405);

$data = get_json_input();
if (!$data || !isset($data['snapshot'])) {
    send_error('INVALID_INPUT', 'Snapshot JSON rỗng hoặc không hợp lệ');
}

$snapshot = $data['snapshot'];

try {
    $db->beginTransaction();

    // 1. Identify modules
    $modules = isset($snapshot['modules']) ? $snapshot['modules'] : $snapshot;
    
    // 2. Clear current tables (Optional - but recommended for fresh migration)
    // Be careful with this in production!
    $db->exec("SET FOREIGN_KEY_CHECKS = 0");
    $db->exec("TRUNCATE TABLE client_vault_entries");
    $db->exec("TRUNCATE TABLE contracts");
    $db->exec("TRUNCATE TABLE clients");
    $db->exec("TRUNCATE TABLE employees");
    $db->exec("TRUNCATE TABLE activity_logs");
    $db->exec("SET FOREIGN_KEY_CHECKS = 1");

    // 3. Import Contracts
    $contracts = isset($modules['contracts']) ? $modules['contracts'] : [];
    $stmt = $db->prepare("INSERT INTO contracts (contract_code, title, start_date, end_date, value, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)");
    foreach ($contracts as $c) {
        $stmt->execute([
            $c['code'] ?? null,
            $c['name'] ?? null,
            $c['startDate'] ?? null,
            $c['endDate'] ?? null,
            $c['value'] ?? 0,
            $c['status'] ?? 'pending',
            $c['notes'] ?? null
        ]);
    }

    // 4. Import Client Vault & Clients
    $vault = isset($modules['clientVault']) ? $modules['clientVault'] : [];
    $stmtClient = $db->prepare("INSERT INTO clients (name, tax_code) VALUES (?, ?)");
    $stmtVault = $db->prepare("INSERT INTO client_vault_entries (client_id, service_name, website_url, username, password_encrypted, gmail, tax_login, phone, recovery_email, pin_encrypted, operation_note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    foreach ($vault as $clientGroup) {
        $clientName = $clientGroup['clientName'] ?? 'Unnamed Client';
        $taxCode = $clientGroup['taxCode'] ?? null;
        
        $stmtClient->execute([$clientName, $taxCode]);
        $clientId = $db->lastInsertId();
        
        $entries = $clientGroup['vaultEntries'] ?? [];
        foreach ($entries as $e) {
            $stmtVault->execute([
                $clientId,
                $e['serviceName'] ?? null,
                $e['websiteUrl'] ?? null,
                $e['username'] ?? null,
                $e['passwordEncrypted'] ?? null,
                $e['gmail'] ?? null,
                $e['taxLogin'] ?? null,
                $e['phone'] ?? null,
                $e['recoveryEmail'] ?? null,
                $e['pinEncrypted'] ?? null,
                $e['operationNote'] ?? null
            ]);
        }
    }

    // 5. Import Employees
    $hr = isset($modules['humanResources']) ? $modules['humanResources'] : [];
    $stmt = $db->prepare("INSERT INTO employees (employee_code, full_name, position, department, phone, email, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
    foreach ($hr as $emp) {
        $stmt->execute([
            $emp['code'] ?? null,
            $emp['name'] ?? null,
            $emp['position'] ?? null,
            $emp['department'] ?? null,
            $emp['phone'] ?? null,
            $emp['email'] ?? null,
            $emp['status'] ?? 'active'
        ]);
    }

    $db->commit();
    send_json(['ok' => true, 'message' => 'Migration successful']);

} catch (Exception $e) {
    if ($db->inTransaction()) $db->rollBack();
    send_error('MIGRATION_FAILED', $e->getMessage(), 500);
}
