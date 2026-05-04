<?php
/**
 * VERATAX ERP API - Front Controller
 * Handles routing, authentication, and security for all endpoints.
 */

define('VERATAX_API_INTERNAL', true);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/auth.php';

// Handle CORS
cors();

// Parse route from .htaccess RewriteRule or direct query param
$route = trim($_GET['route'] ?? '', '/');

// 1. PUBLIC Endpoints
if ($route === '' || $route === 'health') {
    send_json([
        'ok' => true,
        'message' => 'VERATAX ERP API is ready',
        'route' => 'health',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit;
}

// 2. AUTHENTICATION - All other routes REQUIRE a valid Firebase ID Token
try {
    if (preg_match('/^(backup|migration)/', $route)) {
        $GLOBALS['currentUser'] = require_admin();
    } else {
        $GLOBALS['currentUser'] = require_auth();
    }
} catch (Exception $e) {
    // Exception handled inside require_auth/require_admin send_error
    exit;
}

$currentUser = $GLOBALS['currentUser'];

// 3. ROUTING
switch ($route) {
    case 'bootstrap':
        require __DIR__ . '/bootstrap.php';
        break;
        
    case 'contracts':
        require __DIR__ . '/contracts.php';
        break;
        
    case 'clients':
        require __DIR__ . '/clients.php';
        break;
        
    case 'client-vault':
    case 'client-vault/entries':
        require __DIR__ . '/client_vault.php';
        break;
        
    case 'employees':
        require __DIR__ . '/employees.php';
        break;
        
    case 'activity-logs':
        require __DIR__ . '/activity_logs.php';
        break;
        
    case 'migration/import-drive-snapshot':
        require __DIR__ . '/migration.php';
        break;
        
    case 'backup/snapshot':
        require __DIR__ . '/backup.php';
        break;

    default:
        // Handle nested paths if necessary
        if (strpos($route, 'client-vault/entries/') === 0) {
            require __DIR__ . '/client_vault.php';
        } else {
            send_error('NOT_FOUND', "Endpoint '$route' not found.", 404);
        }
        break;
}
