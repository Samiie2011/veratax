/**
 * Google Drive Backup Service for VERATAX
 * Uses Google Apps Script as an intermediary to store ERP snapshots
 */

const DRIVE_CONFIG = {
  API_URL: '', // Removed from frontend for security
  TOKEN: '',   // Removed from frontend for security
  FOLDER_ID: '' // Removed from frontend for security
};

const CACHE_KEYS = {
  SNAPSHOT: 'veratax_erp_snapshot_cache',
  PENDING_QUEUE: 'veratax_pending_sync_queue',
  DEVICE_ID: 'veratax_device_id',
  LAST_SYNC: 'veratax_last_drive_sync_at',
  LAST_GOOD: 'veratax_last_good_snapshot'
};

/**
 * Helper to wrap a promise with a timeout
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, errorCode: string = 'TIMEOUT'): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(errorCode)), ms);
    })
  ]);
}

export const CRITICAL_BACKUP_ACTIONS = new Set([
  "IMPORT_EXCEL",
  "DELETE_CONTRACT",
  "DELETE_CLIENT",
  "DELETE_VAULT_ENTRY",
  "DELETE_EMPLOYEE",
  "RESTORE_BACKUP",
  "MANUAL_BACKUP",
  "DAILY_BACKUP",
  "SESSION_END",
  "LOGOUT",
  "LOGOUT_SYNC"
]);

export interface ERPSnapshot {
  schemaVersion: string;
  appName: string;
  sourceOfTruth: string;
  driveFolderId: string;
  revision: number;
  savedAt: string;
  savedBy: string;
  deviceId: string;
  contracts?: any[]; // Legacy support
  activityLogs?: any[]; // Legacy support
  serviceCatalog?: any[]; // Legacy support
  systemSettings?: any; // Legacy support
  modules: {
    contracts: any[];
    clientVault: any[];
    humanResources: any[];
    activityLogs: any[];
    serviceCatalog: any[];
    systemSettings: any;
    permissions: any[];
    erpUsers: any[];
  };
  metadata: {
    totalContracts: number;
    totalClients: number;
    totalEmployees: number;
    totalActivityLogs: number;
    lastModule: string;
    lastAction: string;
  };
}

export const DriveBackupService = {
  getOrCreateDeviceId: (): string => {
    return 'device_web_client'; // Avoid tracking uniqueness in localStorage if not needed
  },

  saveToLocalCache: (snapshot: ERPSnapshot) => {
    // Disabled for security
  },

  loadFromLocalCache: (): ERPSnapshot | null => {
    return null;
  },

  // Robust call - Disabled on frontend for security. Drive access must be proxied through backend.
  robustCall: async (payload: any, retries = 2): Promise<any> => {
    throw new Error('DIRECT_DRIVE_ACCESS_FORBIDDEN');
  },

  // Normalize snapshot to ensure it has all required module arrays regardless of source schema
  normalizeErpSnapshot: (raw: any): ERPSnapshot => {
    if (!raw) return raw;
    
    // Support both flat (legacy) and nested (new) module structures
    const modules = raw.modules || {};
    
    // Helper to find data in common locations
    const findArr = (key: string) => {
      if (Array.isArray(modules[key])) return modules[key];
      if (Array.isArray(raw[key])) return raw[key];
      return [];
    };

    // Special case for users (users vs erpUsers)
    const users = Array.isArray(modules.erpUsers) ? modules.erpUsers :
                  Array.isArray(modules.users) ? modules.users :
                  Array.isArray(raw.erpUsers) ? raw.erpUsers : [];

    const normalizedModules = {
      contracts: findArr('contracts'),
      clientVault: findArr('clientVault'),
      humanResources: findArr('humanResources'),
      activityLogs: findArr('activityLogs'),
      serviceCatalog: findArr('serviceCatalog'),
      systemSettings: modules.systemSettings || raw.systemSettings || {},
      permissions: Array.isArray(modules.permissions) ? modules.permissions : [],
      erpUsers: users
    };

    return {
      ...raw,
      schemaVersion: raw.schemaVersion || '1.1.0',
      appName: raw.appName || 'VERATAX ERP',
      sourceOfTruth: raw.sourceOfTruth || 'google_drive',
      revision: raw.revision || 0,
      savedAt: raw.savedAt || new Date().toISOString(),
      contracts: normalizedModules.contracts, // Flat compatibility
      activityLogs: normalizedModules.activityLogs, // Flat compatibility
      modules: normalizedModules,
      metadata: {
        totalContracts: normalizedModules.contracts.length,
        totalClients: normalizedModules.clientVault.length,
        totalEmployees: normalizedModules.humanResources.length,
        totalActivityLogs: normalizedModules.activityLogs.length,
        lastModule: raw.metadata?.lastModule || 'system',
        lastAction: raw.metadata?.lastAction || 'NORMALIZED'
      }
    };
  },

  hasBusinessData: (snapshot: any): boolean => {
    if (!snapshot) return false;
    const modules = snapshot.modules || {};
    const contracts = Array.isArray(modules.contracts) ? modules.contracts : Array.isArray(snapshot.contracts) ? snapshot.contracts : [];
    const vault = Array.isArray(modules.clientVault) ? modules.clientVault : Array.isArray(snapshot.clientVault) ? snapshot.clientVault : [];
    const hr = Array.isArray(modules.humanResources) ? modules.humanResources : Array.isArray(snapshot.humanResources) ? snapshot.humanResources : [];
    
    return contracts.length > 0 || vault.length > 0 || hr.length > 0;
  },

  isSafeToSyncSnapshot: (snapshot: any): boolean => {
    if (!snapshot) return false;
    
    // We only block if it's a significant revision but has ZERO primary data
    // This allows revision 1 (new apps) to be created empty
    const revision = snapshot.revision || 0;
    const hasData = DriveBackupService.hasBusinessData(snapshot);
    
    if (revision > 1 && !hasData) {
      return false;
    }
    
    return true;
  },

  loadCurrentSnapshotFromDrive: async (): Promise<any> => {
    try {
      // Use load_current action - this is optimized in Apps Script
      const result = await DriveBackupService.robustCall({ action: 'load_current' });
      
      if (!result || !result.ok) {
        throw new Error(result?.error || 'DRIVE_LOAD_FAILED');
      }

      return {
        snapshot: result.snapshot ? DriveBackupService.normalizeErpSnapshot(result.snapshot) : null,
        manifest: result.manifest || null,
        currentFileId: result.currentFileId || null,
        manifestFileId: result.manifestFileId || null,
        loadedAt: result.loadedAt || new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error loading current snapshot:', error);
      throw error;
    }
  },

  saveSnapshotToDrive: async (snapshot: ERPSnapshot, backupAction: string, options?: { createBackup?: boolean }) => {
    // Frontend safety check before network
    if (!DriveBackupService.isSafeToSyncSnapshot(snapshot) && backupAction !== 'RESET_DATA' && backupAction !== 'RESTORE_BACKUP') {
      console.warn('Prevented empty overwrite locally:', backupAction);
      throw new Error('REFUSE_EMPTY_OVERWRITE');
    }

    const createBackup = options?.createBackup ?? CRITICAL_BACKUP_ACTIONS.has(backupAction);
    
    const result = await DriveBackupService.robustCall({
      action: 'save_snapshot',
      backupAction,
      createBackup,
      snapshot
    });
    
    if (!result || !result.ok) {
      throw new Error(result?.error || 'DRIVE_SAVE_FAILED');
    }

    // currentFileId is required, backupFileId is only required IF createBackup is true
    if (!result.currentFileId || (createBackup && !result.backupFileId)) {
      if (createBackup) {
        throw new Error('DRIVE_SAVE_RESPONSE_MISSING_BACKUP_FILE_ID');
      }
    }

    localStorage.setItem(CACHE_KEYS.LAST_SYNC, result.savedAt || new Date().toISOString());
    return result;
  },

  buildFullSnapshot: (
    states: {
      contracts: any[];
      activityLogs: any[];
      clientVault?: any[];
      humanResources?: any[];
      serviceCatalog?: any[];
      systemSettings?: any;
    },
    user: any,
    action: string,
    module: string,
    prevRevision: number = 0
  ): ERPSnapshot => {
    return {
      schemaVersion: '1.1.0',
      appName: 'VERATAX ERP',
      sourceOfTruth: 'google_drive',
      driveFolderId: DRIVE_CONFIG.FOLDER_ID,
      revision: prevRevision + 1,
      savedAt: new Date().toISOString(),
      savedBy: user?.username || user?.name || 'Admin',
      deviceId: DriveBackupService.getOrCreateDeviceId(),
      contracts: states.contracts || [],
      activityLogs: states.activityLogs || [],
      serviceCatalog: states.serviceCatalog || [],
      systemSettings: states.systemSettings || {},
      modules: {
        contracts: states.contracts || [],
        activityLogs: states.activityLogs || [],
        clientVault: states.clientVault || [],
        humanResources: states.humanResources || [],
        serviceCatalog: states.serviceCatalog || [],
        systemSettings: states.systemSettings || {},
        permissions: [],
        erpUsers: []
      },
      metadata: {
        totalContracts: (states.contracts || []).length,
        totalClients: (states.clientVault || []).length,
        totalEmployees: (states.humanResources || []).length,
        totalActivityLogs: (states.activityLogs || []).length,
        lastModule: module,
        lastAction: action
      }
    };
  },

  queuePendingSync: (snapshot: ERPSnapshot, action: string = 'PENDING_UPDATE') => {
    // Don't queue unsafe snapshots
    if (!DriveBackupService.isSafeToSyncSnapshot(snapshot)) {
      return;
    }

    const queue = DriveBackupService.getPendingQueue();
    // Add new item to queue
    queue.push({
      id: Date.now().toString(),
      action,
      snapshot,
      timestamp: new Date().toISOString()
    });

    localStorage.setItem(CACHE_KEYS.PENDING_QUEUE, JSON.stringify(queue));
  },

  getPendingQueue: (): any[] => {
    const data = localStorage.getItem(CACHE_KEYS.PENDING_QUEUE);
    if (!data) return [];
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  cleanupInvalidPendingItems: () => {
    const queue = DriveBackupService.getPendingQueue();
    const cleaned = queue.filter(item => item && item.snapshot && DriveBackupService.isSafeToSyncSnapshot(item.snapshot));
    localStorage.setItem(CACHE_KEYS.PENDING_QUEUE, JSON.stringify(cleaned));
  },

  clearPendingSync: () => {
    localStorage.removeItem(CACHE_KEYS.PENDING_QUEUE);
  },

  listBackups: async () => {
    try {
      return await DriveBackupService.robustCall({ action: 'list_backups' });
    } catch (error) {
      console.error('Error listing backups:', error);
      return { ok: false, error: 'Failed to list backups' };
    }
  },

  restoreBackup: async (fileId: string) => {
    try {
      return await DriveBackupService.robustCall({ action: 'restore_backup', fileId });
    } catch (error) {
      console.error('Error restoring backup:', error);
      return { ok: false, error: 'Failed to restore backup' };
    }
  },

  withTimeout: withTimeout
};
