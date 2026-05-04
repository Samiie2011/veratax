<?php
// backup.php - Build ERP Snapshot from Database
if (!defined('VERATAX_API_INTERNAL')) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'NOT_FOUND', 'message' => 'Endpoint not found.']);
    exit;
}

$currentUser = $GLOBALS['currentUser'] ?? null;
$db = get_db();
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') send_error('METHOD_NOT_ALLOWED', 'POST expected to trigger backup', 405);

try {
    // Collect all data
    $contracts = $db->query("SELECT * FROM contracts")->fetchAll();
    $clients = $db->query("SELECT * FROM clients")->fetchAll();
    $vault_entries = $db->query("SELECT * FROM client_vault_entries")->fetchAll();
    $hr = $db->query("SELECT * FROM employees")->fetchAll();
    
    // Group clientVault entries into the structure the frontend expects
    $clientVaultGroups = [];
    foreach ($clients as $client) {
        $clientId = $client['id'];
        $entries = array_filter($vault_entries, function($e) use ($clientId) {
            return $e['client_id'] == $clientId;
        });
        
        $clientVaultGroups[] = [
            'clientId' => $clientId,
            'clientName' => $client['name'],
            'taxCode' => $client['tax_code'],
            'vaultEntries' => array_values($entries)
        ];
    }

    $snapshot = [
        'schemaVersion' => '1.2.0',
        'appName' => 'VERATAX ERP',
        'sourceOfTruth' => 'mysql_database',
        'savedAt' => date('c'),
        'modules' => [
            'contracts' => $contracts,
            'clientVault' => $clientVaultGroups,
            'humanResources' => $hr,
            'activityLogs' => $db->query("SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 500")->fetchAll(),
            'systemSettings' => [] // Add settings logic if needed
        ]
    ];

    // Log the backup action
    $stmt = $db->prepare("INSERT INTO backup_snapshots (revision, snapshot_data, created_by) VALUES (?, ?, ?)");
    $stmt->execute([0, json_encode($snapshot), 'System_Auto']);

    send_json([
        'ok' => true,
        'snapshot' => $snapshot
    ]);

} catch (Exception $e) {
    send_error('BACKUP_FAILED', $e->getMessage(), 500);
}
