import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Users, 
  FileText, 
  ShieldAlert, 
  Calendar, 
  LogOut, 
  Settings, 
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Clock,
  Briefcase,
  Key,
  Menu,
  X,
  Download,
  Save,
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import AIChatbot from '../AIChatbot';
import logo from '../../assets/logo.png';
import Dashboard from './Dashboard';
import FinanceModule from './FinanceModule';
import VaultModule, { normalizeClientVaultData } from './VaultModule';
import AttendanceModule from './AttendanceModule';
import BackupCenter from './BackupCenter';
import { StorageService } from '../../services/storageService';
import { DriveBackupService, ERPSnapshot, CRITICAL_BACKUP_ACTIONS } from '../../services/DriveBackupService';
import { getCurrentUser, clearAuthSession } from '../../services/AuthService';
import ErpApiService from '../../services/ErpApiService';

interface ERPLayoutProps {
  children?: React.ReactNode;
  activeTab: 'dashboard' | 'finance' | 'vault' | 'hr' | 'backup' | 'audit';
  onTabChange: (tab: 'dashboard' | 'finance' | 'vault' | 'hr' | 'backup' | 'audit') => void;
}

export default function ERPLayout({ children, activeTab, onTabChange }: ERPLayoutProps) {
  const [userRole, setUserRole] = useState<'admin' | 'staff' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(2026, 4, 1)); // May 2026
  const [dateRange, setDateRange] = useState<{start: Date | null, end: Date | null}>({
    start: new Date(2026, 4, 1), 
    end: new Date(2026, 4, 15)
  });
  const [inputStart, setInputStart] = useState('01/05/2026');
  const [inputEnd, setInputEnd] = useState('15/05/2026');
  
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '';
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(d.getTime())) return String(date);
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return String(date);
    }
  };

  const handleDateChange = (val: string, type: 'start' | 'end') => {
    // Basic mask for DD/MM/YYYY text input
    let digits = val.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length >= 2) formatted = digits.slice(0, 2) + '/' + digits.slice(2);
    if (digits.length >= 4) formatted = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
    
    if (type === 'start') setInputStart(formatted);
    else setInputEnd(formatted);

    if (digits.length === 8) {
      const d = digits.slice(0, 2);
      const m = digits.slice(2, 4);
      const y = digits.slice(4);
      const newDate = new Date(`${y}-${m}-${d}`);
      if (!isNaN(newDate.getTime())) {
        setDateRange(prev => ({ ...prev, [type]: newDate }));
      }
    }
  };

  // Global ERP State
  const [contracts, setContracts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [clientVaultEntries, setClientVaultEntries] = useState<any[]>([]);
  const [clientVault, setClientVault] = useState<any[]>([]);
  const [humanResources, setHumanResources] = useState<any[]>([]);
  const [serviceCatalog, setServiceCatalog] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any>({});
  const [notifications, setNotifications] = useState<{ id: string, message: string, timestamp: string, type: string, user?: string, module?: string }[]>([]);
  const [revision, setRevision] = useState(0);
  
  // Sync Status
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'saving' | 'saved' | 'pending' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('Đang sẵn sàng');
  const [lastDatabaseSync, setLastDatabaseSync] = useState<string | null>(null);
  const [lastDriveSync, setLastDriveSync] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [backupFileName, setBackupFileName] = useState<string | null>(null);
  const [isDataHydrated, setIsDataHydrated] = useState(false);
  const [hydrationError, setHydrationError] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  const lastGoodDataRef = useRef<any>(null);
  const isHydratingRef = useRef(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const [isExpandedLog, setIsExpandedLog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initial Hydration Logic
  useEffect(() => {
    // Security Cleanup: Remove legacy sensitive keys from Local Storage
    const legacyKeys = [
      'veratax_erp_snapshot_cache', 
      'veratax_last_good_snapshot', 
      'veratax_pending_sync_queue', 
      'veratax_drive_backup_token',
      'veratax_app_key',
      'veratax_vault_key',
      'veratax_erp_cache' // previous caching key
    ];
    legacyKeys.forEach(key => localStorage.removeItem(key));

    const hydrateData = async () => {
      if (isHydratingRef.current) return;
      isHydratingRef.current = true;
      
      setSyncStatus('loading');
      setSyncMessage('Đang tải dữ liệu ERP từ database...');
      
      try {
        const response = await ErpApiService.apiGet<any>('/bootstrap');

        if (response && response.ok && response.data) {
          const data = response.data;
          
          setContracts(data.contracts || []);
          setClients(data.clients || []);
          setClientVaultEntries(data.clientVaultEntries || data.clientVault || []); 
          
          const groupedVault = rebuildGroupedVault(data.clients || [], data.clientVaultEntries || data.clientVault || []);
          setClientVault(groupedVault);
          
          setHumanResources(data.humanResources || data.employees || []);
          setNotifications(data.activityLogs || []);
          setSystemSettings(data.systemSettings || {});
          
          setLastDatabaseSync(new Date().toLocaleTimeString());
          
          setSyncStatus('saved');
          setSyncMessage('Đã tải dữ liệu ERP từ Database');
        } else {
          throw new Error(response?.error || 'BOOTSTRAP_FAILED');
        }
      } catch (error: any) {
        if (error.message === 'UNAUTHORIZED') {
          handleLogout();
          return;
        }

        setSyncStatus('error');
        setSyncMessage('Không thể kết nối Database. Vui lòng kiểm tra lại mạng.');
      } finally {
        setIsDataHydrated(true);
        setHasHydrated(true);
        setIsLoading(false);
        isHydratingRef.current = false;
      }
    };

    const rebuildGroupedVault = (clientList: any[], entries: any[]) => {
      return clientList.map(client => {
        const clientEntries = entries.filter(e => e.client_id == client.id || e.clientId == client.id);
        
        // Map backend fields to frontend fields
        const normalizedEntries = clientEntries.map(e => ({
          id: e.id,
          serviceName: e.service_name || e.serviceName || "",
          websiteUrl: e.website_url || e.websiteUrl || "",
          username: e.username_masked || e.username || "",
          password: "", // Handled by revealSecret
          gmail: e.gmail_masked || e.gmail || "",
          taxLogin: e.tax_login_masked || e.taxLogin || "",
          phone: e.phone_masked || e.phone || "",
          recoveryEmail: e.recovery_email || e.recoveryEmail || "",
          pin: "", // Handled by revealSecret
          operationNote: e.operation_note || e.operationNote || "",
          updatedAt: e.updated_at || e.updatedAt || "",
          updatedBy: e.updatedBy || "System",
          hasPassword: e.has_password,
          hasPin: e.has_pin
        }));

        return {
          id: client.id,
          clientName: client.name || client.clientName,
          taxCode: client.tax_code || client.taxCode,
          vaultEntries: normalizedEntries,
          createdAt: client.created_at || client.createdAt,
          updatedAt: client.updated_at || client.updatedAt
        };
      });
    };

    const user = getCurrentUser();
    if (user) {
      hydrateData();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Tab Switcher and Global State
  // (Removed duplicate clients state)

  const persistData = useCallback(async (
    action: string, 
    module: string,
    overrides: any = {},
    options?: { createBackup?: boolean }
  ) => {
    // For now, keep as a wrapper for backward compatibility but plan to migrate individual calls
    if (action === 'LOG_ACTIVITY') {
       // Log audit trail to MySQL
       try {
         const user = getCurrentUser();
         const log = overrides.notification || (overrides.notifications ? overrides.notifications[0] : null);
         
         await ErpApiService.apiPost('/activity-logs', {
           user_id: user?.uid || 'anonymous',
           user_name: user?.displayName || user?.username || user?.email || 'System',
           action: log?.action || log?.title || 'System Activity',
           details: log?.message || log?.description || log?.details || 'N/A',
           module: log?.module || module || 'system',
           type: log?.type || 'info'
         });
       } catch (e) {
         console.warn('Logging failed', e);
       }
       return;
    }

    // Google Drive backup only on explicit request or critical actions
    if (options?.createBackup) {
      setSyncStatus('saving');
      setSyncMessage('Đang chuẩn bị bản sao lưu lên Google Drive...');
      
      const user = getCurrentUser();
      const snapshot = DriveBackupService.buildFullSnapshot(
        {
          contracts: overrides.contracts || contracts,
          activityLogs: notifications,
          clientVault: overrides.clientVault || clientVault,
          humanResources: overrides.humanResources || humanResources,
          serviceCatalog: overrides.serviceCatalog || serviceCatalog,
          systemSettings: overrides.systemSettings || systemSettings
        },
        { name: user?.displayName || user?.username || 'User' },
        action,
        module,
        revision
      );

      try {
        const result = await DriveBackupService.saveSnapshotToDrive(snapshot, action, options) as any;
        setSyncStatus('saved');
        setSyncMessage(`Đã sao lưu lên Drive thành công: ${result.backupFileName}`);
        return result;
      } catch (e) {
        setSyncStatus('error');
        setSyncMessage('Lỗi khi sao lưu dữ liệu lên Drive');
      }
    }
  }, [contracts, notifications, clientVault, humanResources, serviceCatalog, systemSettings, revision]);

  useEffect(() => {
    const handleNotification = (e: any) => {
      const newLog = e.detail;
      setNotifications(prev => [newLog, ...prev].slice(0, 10000));
      
      // Schedule persist outside of state setter
      setTimeout(() => {
        persistData('LOG_ACTIVITY', 'system', { notification: newLog });
      }, 0);
      
      setIsSaving(true);
      setTimeout(() => {
        setIsSaving(false);
      }, 800);
    };
    window.addEventListener('erp-notification', handleNotification);
    return () => window.removeEventListener('erp-notification', handleNotification);
  }, [persistData]);

  const formatInputDate = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length >= 3) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    if (digits.length >= 5) {
      const year = digits.slice(4, 8); // Ensure max 4 digits for year
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${year}`;
    }
    return formatted;
  };

  const parseDate = (str: string) => {
    const parts = str.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const year = parseInt(parts[2]);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    return null;
  };

  const handleRestoreData = async (fileId: string) => {
    setSyncStatus('loading');
    setSyncMessage('Đang phục hồi dữ liệu từ bản sao lưu...');
    try {
      const result = await DriveBackupService.restoreBackup(fileId) as any;
      if (result && result.ok) {
        const snapshot = result.snapshot;
        if (snapshot) {
          const mod = snapshot.modules || snapshot; // Support both flat and nested
          setContracts(mod.contracts || mod.modules?.contracts || []);
          setClientVault(normalizeClientVaultData(mod.clientVault || mod.modules?.clientVault || []));
          setHumanResources(mod.humanResources || mod.modules?.humanResources || []);
          setNotifications(mod.activityLogs || mod.modules?.activityLogs || []);
          setServiceCatalog(mod.serviceCatalog || mod.modules?.serviceCatalog || []);
          setSystemSettings(mod.systemSettings || mod.modules?.systemSettings || {});
          
          setRevision(snapshot.revision || 0);
          setLastDriveSync(snapshot.savedAt);
          DriveBackupService.saveToLocalCache(snapshot);
          setSyncStatus('saved');
          setSyncMessage('Phục hồi dữ liệu thành công!');
        }
      } else {
        throw new Error(result?.error || 'Không thể khôi phục bản sao lưu');
      }
    } catch (error: any) {
      console.error('Restore error:', error);
      setSyncStatus('error');
      setSyncMessage(`Khôi phục lỗi: ${error.message}`);
    }
  };

  const handleApplyFilter = () => {
    const start = parseDate(inputStart);
    const end = parseDate(inputEnd);
    if (start && end) {
      setDateRange({ start, end });
      setShowCalendar(false);
    } else {
      alert('Định dạng ngày không hợp lệ. Vui lòng nhập theo dd/mm/yyyy');
    }
  };

  const handlePresetClick = (presetType: string, days?: number) => {
    const end = new Date();
    let start = new Date();
    
    if (days !== undefined) {
      start.setDate(end.getDate() - days);
    } else if (presetType === 'thisMonth') {
      start = new Date(end.getFullYear(), end.getMonth(), 1);
    } else if (presetType === 'lastMonth') {
      start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
      end.setDate(0); // Last day of previous month
    }

    const startStr = formatDateForInput(start);
    const endStr = formatDateForInput(end);
    setInputStart(startStr);
    setInputEnd(endStr);
    setDateRange({ start, end });
  };

  const formatDateForInput = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(newDate);
  };
  const [settings, setSettings] = useState({
    notifications: true,
    security: true,
    hrSync: true
  });

  useEffect(() => {
    const fetchRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role as 'admin' | 'staff');
        }
      }
      setIsLoading(false);
    };
    fetchRole();
  }, []);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'finance', name: 'Hợp đồng', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'vault', name: 'Client Vault', icon: Key, color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 'hr', name: 'Nhân sự', icon: Users, color: 'text-rose-500', bg: 'bg-rose-50' },
    { id: 'backup', name: 'Sao lưu', icon: Cloud, color: 'text-indigo-500', bg: 'bg-indigo-50', adminOnly: true },
    { id: 'audit', name: 'Audit Logs', icon: ShieldAlert, color: 'text-slate-500', bg: 'bg-slate-50', adminOnly: true },
  ];

  if (hydrationError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-rose-50 rounded-[40px] flex items-center justify-center text-rose-500 mb-8 border border-rose-100 shadow-lg shadow-rose-500/10">
          <CloudOff className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">Lỗi kết nối dữ liệu</h1>
        <p className="text-slate-500 font-bold uppercase tracking-tight max-w-md leading-relaxed mb-10">
          Hệ thống không thể kết nối tới Google Drive và không tìm thấy bản sao lưu tạm thời trên thiết bị này.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center space-x-3 px-10 py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-900/20 active:scale-95 transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Thử lại ngay</span>
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabTitles = {
    dashboard: 'Tổng quan Dashboard',
    finance: 'Quản lý Hợp đồng',
    vault: 'Kho mật khẩu Client',
    hr: 'Quản lý Nhân sự',
    backup: 'Trung tâm Sao lưu dữ liệu'
  };

  const handleExportHistory = () => {
    if (notifications.length === 0) return;
    
    // Create structured data for Excel
    const data = notifications.map((n, index) => ({
      'STT': index + 1,
      'Thời gian': n.timestamp,
      'Tác vụ': n.type === 'success' ? 'Thành công' : 'Lỗi/Cảnh báo',
      'Nội dung': n.message,
      'Người thực hiện': n.user || 'Admin',
      'Mã hệ thống': n.id
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 5 },  // STT
      { wch: 15 }, // Thời gian
      { wch: 15 }, // Tác vụ
      { wch: 50 }, // Nội dung
      { wch: 20 }, // Người thực hiện
      { wch: 20 }  // Mã hệ thống
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lich su hoat dong');
    
    const fileName = `Lich_su_hoat_dong_VERATAX_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${new Date().getHours()}${new Date().getMinutes()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const NotificationBell = () => (
    <div className="relative">
      <button 
        id="notification-bell-btn"
        onClick={() => setShowNotifications(!showNotifications)}
        className={`p-3 rounded-2xl transition-all border border-transparent relative group ${showNotifications ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100'}`}
      >
        <Clock className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      <AnimatePresence>
        {showNotifications && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`absolute right-0 mt-3 ${isExpandedLog ? 'w-[400px]' : 'w-80'} bg-white rounded-[32px] shadow-2xl border border-slate-100 z-50 overflow-hidden transition-all duration-300`}
          >
            <div className="p-5 border-b border-slate-50 flex items-center justify-between">
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Hoạt động hệ thống</h4>
              <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-widest">{(notifications?.length || 0).toLocaleString()} Tác vụ</span>
            </div>
            <div className={`overflow-y-auto ${isExpandedLog ? 'max-h-[600px]' : 'max-h-[400px]'}`}>
              {notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <Clock className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hệ thống đang sẵn sàng</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {notifications.slice(0, isExpandedLog ? 500 : 10).map((n) => (
                    <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start space-x-3 group">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-700 leading-normal line-clamp-2 uppercase tracking-tight">{n.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{n.timestamp}</span>
                          <span className="text-[8px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                            By: {n.user || 'Admin'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col space-y-2">
               <button 
                onClick={() => setIsExpandedLog(!isExpandedLog)}
                className="w-full text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors flex items-center justify-center space-x-2 py-2"
               >
                 <span>{isExpandedLog ? 'THU GỌN DANH SÁCH' : 'XEM TOÀN BỘ LỊCH SỬ'}</span>
                 <ChevronRight className={`w-3 h-3 transition-transform ${isExpandedLog ? '-rotate-90' : 'rotate-0'}`} />
               </button>
               {isExpandedLog && (
                 <button 
                  onClick={handleExportHistory}
                  className="w-full text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] hover:text-emerald-600 transition-colors flex items-center justify-center space-x-2 py-2 border-t border-slate-100"
                 >
                   <span>XUẤT FILE EXCEL (.CSV)</span>
                 </button>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const handleLogout = async () => {
    try {
      setSyncStatus('loading');
      setSyncMessage('Đang đăng xuất...');

      // Only clear critical login keys, preserve ERP cache for recovery
      const keysToClear = ['veratax_auth_session', 'veratax_current_user', 'veratax_access_token', 'veratax_login_state'];
      keysToClear.forEach(k => localStorage.removeItem(k));
      
      window.location.hash = '#login';
      window.location.reload(); 
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('veratax_auth_session');
      window.location.hash = '#login';
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-hidden">
      {/* Sidebar Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-72 bg-white z-[101] lg:hidden shadow-2xl flex flex-col p-8"
          >
            <div className="flex items-center justify-between mb-12" id="mobile-logo-header">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 p-1">
                  <img src={logo} alt="VT" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-black text-slate-900 leading-tight">VERATAX</span>
                </div>
              </div>
              <button 
                id="close-mobile-menu"
                onClick={() => setIsMobileMenuOpen(false)} 
                className="p-2 text-slate-400 group hover:text-rose-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              {menuItems.map((item) => (
                (!item.adminOnly || userRole === 'admin') && (
                  <button
                    key={item.id}
                    id={`mobile-nav-${item.id}`}
                    onClick={() => {
                      if (item.id !== 'audit') onTabChange(item.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 p-4 rounded-2xl transition-all ${
                      activeTab === item.id 
                        ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">{item.name}</span>
                  </button>
                )
              ))}
            </nav>

            <button 
              id="mobile-logout-btn"
              onClick={handleLogout}
              className="mt-auto flex items-center justify-center space-x-2 p-4 rounded-2xl text-red-600 bg-red-50 font-black text-[10px] tracking-[0.2em] active:scale-95 transition-transform"
            >
              <LogOut className="w-4 h-4" />
              <span>ĐĂNG XUẤT</span>
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Sidebar Desktop */}
      <aside className="w-72 bg-white border-r border-slate-200 fixed inset-y-0 left-0 z-40 hidden lg:block shadow-sm">
        <div className="p-8 flex flex-col h-full uppercase tracking-tight">
          <div className="flex items-center space-x-3 mb-12" id="desktop-logo-header">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm overflow-hidden border border-slate-100 p-1">
              <img 
                src={logo} 
                alt="Veratax Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-slate-900 leading-tight">VERATAX</span>
              <span className="text-[10px] font-black text-emerald-600 tracking-[0.2em]">ERP SYSTEM</span>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => (
              (!item.adminOnly || userRole === 'admin') && (
                <button
                  key={item.id}
                  id={`desktop-nav-${item.id}`}
                  onClick={() => item.id !== 'audit' && onTabChange(item.id as any)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl group transition-all ${
                    activeTab === item.id 
                      ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' 
                      : 'hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${activeTab === item.id ? 'bg-white/10' : item.bg}`}>
                      <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-white' : item.color}`} />
                    </div>
                    <span className={`text-xs font-black tracking-widest ${activeTab === item.id ? 'text-white' : 'group-hover:text-slate-900 text-slate-500'}`}>
                      {item.name}
                    </span>
                  </div>
                  <ChevronRight className={`w-3 h-3 transition-transform ${activeTab === item.id ? 'text-white translate-x-1' : 'text-slate-300'}`} />
                </button>
              )
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <button 
              id="desktop-logout-btn"
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 p-4 rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all font-black text-[10px] tracking-[0.2em] border-2 border-transparent hover:border-red-100 active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>ĐĂNG XUẤT</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-h-screen">
        {/* AI Chatbot Floating */}
        <div className="fixed bottom-10 right-10 z-50">
          <AIChatbot welcomeMessage="Chào mừng bạn đến với Hệ thống Quản trị Veratax! Tôi là AI Agent hỗ trợ vận hành. Bạn cần tư vấn hay tra cứu gì?" />
        </div>

        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
             <button 
               id="toggle-sidebar-mobile"
               onClick={() => setIsMobileMenuOpen(true)}
               className="p-2 text-slate-400 hover:text-slate-900 lg:hidden"
             >
                <Menu className="w-6 h-6" />
             </button>
             <div className="flex flex-col">
              <h2 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2 uppercase">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse hidden sm:block"></div>
                <span className="truncate max-w-[150px] sm:max-w-none">{tabTitles[activeTab]}</span>
              </h2>
              <div className="flex items-center space-x-2 mt-0.5">
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thời gian thực • Báo cáo</p>
                <span className="text-[9px] text-slate-300">•</span>
                <div className="flex items-center space-x-1.5 min-w-[150px]">
                  {syncStatus === 'saving' || syncStatus === 'loading' ? (
                    <>
                      <RefreshCw className="w-2.5 h-2.5 text-indigo-500 animate-spin" />
                      <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest animate-pulse">
                        {syncMessage}
                      </span>
                    </>
                  ) : syncStatus === 'saved' ? (
                    <>
                      <Cloud className="w-2.5 h-2.5 text-emerald-500" />
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                          {syncMessage}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">
                            LAST SYNC: {lastDatabaseSync || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : syncStatus === 'pending' ? (
                    <>
                      <CloudOff className="w-2.5 h-2.5 text-amber-500 animate-bounce" />
                      <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">
                        {syncMessage}
                      </span>
                    </>
                  ) : (
                    <>
                      <Save className="w-2.5 h-2.5 text-slate-400" />
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                        {syncMessage}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
             <NotificationBell />
             <button 
               id="open-calendar-btn"
               onClick={() => setShowCalendar(true)}
               className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all border border-transparent hover:border-emerald-100 relative group"
             >
                <Calendar className="w-5 h-5" />
             </button>
             <button 
               id="open-settings-btn"
               onClick={() => setShowSettings(true)}
               className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100"
             >
                <Settings className="w-5 h-5" />
             </button>
          </div>
        </header>

        <AnimatePresence>
          {showCalendar && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-[40px] w-full max-w-4xl overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] flex flex-col md:flex-row"
              >
                {/* Left Sidebar: Presets */}
                <div className="w-full md:w-56 bg-slate-50 border-r border-slate-100 p-6 flex flex-col">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Lọc nhanh</h4>
                   <div className="space-y-2">
                     {[
                       { label: 'Hôm nay', days: 0 },
                       { label: 'Hôm qua', days: 1 },
                       { label: '7 ngày qua', days: 7 },
                       { label: '14 ngày qua', days: 14 },
                       { label: '30 ngày qua', days: 30 },
                       { label: 'Tháng này', type: 'thisMonth' },
                       { label: 'Tháng trước', type: 'lastMonth' }
                     ].map((preset) => (
                       <button
                         key={preset.label}
                         onClick={() => handlePresetClick(preset.type || 'days', preset.days)}
                         className="w-full text-left px-4 py-3 rounded-2xl text-[11px] font-black text-slate-600 hover:bg-white hover:text-emerald-600 hover:shadow-sm transition-all border border-transparent hover:border-slate-100 uppercase tracking-tight"
                       >
                         {preset.label}
                       </button>
                     ))}
                   </div>
                   <div className="mt-auto pt-6 border-t border-slate-200/50">
                     <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                        <Calendar className="w-5 h-5" />
                     </div>
                   </div>
                </div>

                {/* Right side: Calendar Grid */}
                <div className="flex-1 p-8 flex flex-col min-h-0 overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 border-l-4 border-emerald-500 pl-4">Lịch làm việc Veratax</h3>
                    <button onClick={() => setShowCalendar(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  <div className="flex flex-col xl:flex-row gap-10 flex-1 min-h-0 overflow-y-auto xl:overflow-visible">
                    {/* Month 1 */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-6 px-2">
                        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><ChevronLeft className="w-4 h-4" /></button>
                        <span className="text-xs font-black text-slate-900 uppercase tracking-widest">
                          Tháng {(viewDate.getMonth() + 1).toString().padStart(2, '0')}/{viewDate.getFullYear()}
                        </span>
                        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><ChevronRight className="w-4 h-4" /></button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                          <span key={d} className={`text-[10px] font-black uppercase tracking-tighter ${d === 'CN' ? 'text-rose-500' : 'text-slate-400'}`}>{d}</span>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                          const day = i + 1;
                          const currentDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                          const isSelected = (dateRange.start && currentDate.getTime() === dateRange.start.getTime()) || (dateRange.end && currentDate.getTime() === dateRange.end.getTime());
                          const isInRange = dateRange.start && dateRange.end && currentDate > dateRange.start && currentDate < dateRange.end;

                          return (
                            <button 
                              key={i} 
                              onClick={() => {
                                if (!dateRange.start || (dateRange.start && dateRange.end)) {
                                  setDateRange({ start: currentDate, end: null });
                                  setInputStart(formatDateForInput(currentDate));
                                  setInputEnd('');
                                } else {
                                  setDateRange({ start: dateRange.start, end: currentDate });
                                  setInputEnd(formatDateForInput(currentDate));
                                }
                              }}
                              className={`aspect-square flex items-center justify-center text-[11px] font-black rounded-xl transition-all relative ${
                                isSelected ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/30 active:scale-90 scale-105 z-10' : 
                                isInRange ? 'bg-emerald-50 text-emerald-600 rounded-none first:rounded-l-xl last:rounded-r-xl' :
                                'hover:bg-slate-50 text-slate-600'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Month 2 (Desktop Only or xl) */}
                    <div className="flex-1 hidden xl:block border-l border-slate-100 pl-10">
                      {(() => {
                        const nextMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
                        return (
                          <>
                            <div className="flex items-center justify-between mb-6 px-2">
                              <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 opacity-0"><ChevronRight className="w-4 h-4 rotate-180" /></button>
                              <span className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                Tháng {(nextMonth.getMonth() + 1).toString().padStart(2, '0')}/{nextMonth.getFullYear()}
                              </span>
                              <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                                <span key={d} className={`text-[10px] font-black uppercase tracking-tighter ${d === 'CN' ? 'text-rose-500' : 'text-slate-400'}`}>{d}</span>
                              ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center">
                              {Array.from({ length: new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate() }).map((_, i) => {
                                const day = i + 1;
                                const currentDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day);
                                const isSelected = (dateRange.start && currentDate.getTime() === dateRange.start.getTime()) || (dateRange.end && currentDate.getTime() === dateRange.end.getTime());
                                const isInRange = dateRange.start && dateRange.end && currentDate > dateRange.start && currentDate < dateRange.end;

                                return (
                                  <button 
                                    key={i} 
                                    onClick={() => {
                                      if (!dateRange.start || (dateRange.start && dateRange.end)) {
                                        setDateRange({ start: currentDate, end: null });
                                        setInputStart(formatDateForInput(currentDate));
                                        setInputEnd('');
                                      } else {
                                        setDateRange({ start: dateRange.start, end: currentDate });
                                        setInputEnd(formatDateForInput(currentDate));
                                      }
                                    }}
                                    className={`aspect-square flex items-center justify-center text-[11px] font-black rounded-xl transition-all hover:bg-slate-50 relative ${
                                      isSelected ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/30' : 
                                      isInRange ? 'bg-emerald-50 text-emerald-600 rounded-none' :
                                      'text-slate-400'
                                    }`}
                                  >
                                    {day}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col lg:flex-row items-center justify-between gap-6 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                    <div className="flex items-center space-x-8">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Ngày bắt đầu:</span>
                        <input 
                          type="text"
                          value={inputStart}
                          onChange={(e) => setInputStart(formatInputDate(e.target.value))}
                          placeholder="dd/mm/yyyy"
                          className="text-sm font-black text-slate-900 border-b-2 border-emerald-500 pb-1 bg-transparent w-24 focus:outline-none"
                        />
                      </div>
                      <div className="w-8 h-px bg-slate-200 hidden sm:block"></div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Ngày kết thúc:</span>
                        <input 
                          type="text"
                          value={inputEnd}
                          onChange={(e) => setInputEnd(formatInputDate(e.target.value))}
                          placeholder="dd/mm/yyyy"
                          className="text-sm font-black text-slate-900 border-b-2 border-emerald-500 pb-1 bg-transparent w-24 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 w-full lg:w-auto">
                      <button 
                        onClick={() => {
                          setDateRange({start: null, end: null});
                          setInputStart('');
                          setInputEnd('');
                        }}
                        className="flex-1 lg:flex-none px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                      >
                        Hủy bỏ
                      </button>
                      <button 
                        onClick={handleApplyFilter}
                        className="flex-1 lg:flex-none px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all whitespace-nowrap"
                      >
                        Áp dụng lọc
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {showSettings && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[32px] w-full max-sm overflow-hidden shadow-2xl border border-slate-100"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">Cài đặt hệ thống</h3>
                  <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { id: 'notifications', name: 'Thông báo đẩy', desc: 'Nhận tin nhắn từ AI Agent' },
                    { id: 'security', name: 'Chế độ bảo mật', desc: 'Tự động ẩn mật khẩu kho' },
                    { id: 'hrSync', name: 'Đồng bộ HR', desc: 'Tự động kiểm tra chấm công' }
                  ].map(s => (
                    <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{s.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.desc}</p>
                      </div>
                      <button 
                        onClick={() => setSettings(prev => ({ ...prev, [s.id]: !prev[s.id as keyof typeof settings] }))}
                        className={`w-10 h-6 rounded-full relative transition-colors ${settings[s.id as keyof typeof settings] ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-1 transform transition-all w-4 h-4 bg-white rounded-full shadow-sm ${settings[s.id as keyof typeof settings] ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {isExpandedLog && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[600] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="bg-white w-full max-w-5xl h-[85vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Toàn bộ lịch sử hoạt động</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Hệ thống lưu trữ {notifications.length} bản ghi</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={handleExportHistory}
                      className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      <span>XUẤT EXCEL HISTORY</span>
                    </button>
                    <button 
                      onClick={() => setIsExpandedLog(false)}
                      className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100"
                    >
                      <X className="w-6 h-6 text-slate-400" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-8">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="border-b border-slate-100">
                        <th className="pb-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">STT</th>
                        <th className="pb-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Thời gian</th>
                        <th className="pb-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Tác vụ</th>
                        <th className="pb-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Nội dung</th>
                        <th className="pb-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Người thực hiện</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {notifications.map((n, i) => (
                        <tr key={n.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4 text-[10px] font-black text-slate-400">{i + 1}</td>
                          <td className="py-4 px-4 text-[11px] font-bold text-slate-600 font-mono">{n.timestamp}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${n.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                              {n.type === 'success' ? 'Thành công' : 'Hoạt động'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-[11px] font-bold text-slate-900 uppercase tracking-tight">{n.message}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-500 uppercase">
                                {(n.user || 'A')[0]}
                              </div>
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{n.user || 'Admin'}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="p-8">
          {activeTab === 'dashboard' && <Dashboard contracts={contracts} />}
          {activeTab === 'finance' && (
            <FinanceModule 
              contracts={contracts} 
              setContracts={setContracts} 
              notifications={notifications}
              setNotifications={setNotifications}
              onPersist={persistData}
              isHydrated={isDataHydrated}
            />
          )}
          {activeTab === 'vault' && (
            <VaultModule 
              clientVault={clientVault}
              setClientVault={setClientVault}
              onPersist={persistData}
              isHydrated={isDataHydrated}
            />
          )}
          {activeTab === 'hr' && (
            <AttendanceModule 
              humanResources={humanResources}
              setHumanResources={setHumanResources}
              onPersist={persistData}
              isHydrated={isDataHydrated}
            />
          )}
          {activeTab === 'backup' && (
            <BackupCenter 
              onRestoreAction={handleRestoreData}
              currentRevision={revision}
            />
          )}
        </div>
      </main>
    </div>
  );
}
