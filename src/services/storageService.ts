/**
 * Centralized Storage Service for VERATAX
 * Handles persistence, backups, and autosave status
 */

const STORAGE_KEYS = {
  CONTRACTS: 'veratax_contracts',
  LOGS: 'veratax_activity_logs',
  SESSION: 'veratax_auth_session',
  CURRENT_USER: 'veratax_current_user',
  BACKUP: 'veratax_data_backup',
  LAST_SAVED: 'veratax_last_saved_at',
  SETTINGS: 'veratax_system_settings'
};

export const StorageService = {
  // --- Core Persistence (DISABLED for ERP security) ---
  
  saveContracts: (contracts: any[]) => {
    // No local persistence
  },

  loadContracts: (): any[] | null => {
    return null;
  },

  saveLogs: (logs: any[]) => {
    // No local persistence
  },

  loadLogs: (): any[] | null => {
    return null;
  },

  // --- Session Management (Safe Logout) ---
  
  clearSession: () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    // Cleanup Legacy Keys
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  },

  // --- Backup & Restore ---
  
  createBackup: () => {
    return null;
  },

  restoreFromBackup: () => {
    return null;
  },

  getLastSavedAt: (): string | null => {
    return null;
  }
};
