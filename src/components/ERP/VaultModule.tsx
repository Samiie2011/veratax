import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Copy, 
  Search, 
  Plus,
  ShieldCheck,
  Building2,
  ChevronRight,
  Globe,
  Database,
  Cloud,
  Download
} from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, ShieldAlert } from 'lucide-react';
import ErpApiService from '../../services/ErpApiService';

interface VaultEntry {
  id: string;
  serviceName: string;
  websiteUrl: string;
  username: string;
  password: string;
  gmail: string;
  taxLogin: string;
  phone: string;
  recoveryEmail: string;
  pin: string;
  operationNote: string;
  updatedAt: string;
  updatedBy: string;
}

interface ClientVault {
  id: string;
  clientName: string;
  taxCode: string;
  shortName: string;
  notes: string;
  vaultEntries: VaultEntry[];
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

// Helper to ensure data structure is correct and migrated
export const normalizeClientVaultData = (data: any[], currentUserEmail?: string): ClientVault[] => {
  if (!Array.isArray(data)) return [];
  
  const user = currentUserEmail || "Admin";
  const now = new Date().toISOString();

  return data.map(client => {
    // Basic migration and default ID
    const clientId = client.id || `client_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const clientName = client.clientName || client.name || "";
    const taxCode = client.taxCode || client.mst || "";
    
    // Migrate old accounts to vaultEntries
    let rawEntries = client.vaultEntries || client.accounts || [];
    if (!Array.isArray(rawEntries)) rawEntries = [];

    const normalizedEntries: VaultEntry[] = rawEntries.map((entry: any, index: number) => {
      // Determine a stable ID if missing
      let entryId = entry.id;
      if (!entryId) {
        if (entry.serviceName?.includes('eTax')) entryId = 'entry_etax';
        else if (entry.serviceName?.includes('Hóa đơn')) entryId = 'entry_invoice';
        else entryId = `entry_custom_${Date.now()}_${index}`;
      }

      return {
        id: entryId,
        serviceName: entry.serviceName || "",
        websiteUrl: entry.websiteUrl || entry.serviceName || "",
        username: entry.username || entry.account || "",
        password: entry.password || entry.pass || "",
        gmail: entry.gmail || entry.email || "",
        taxLogin: entry.taxLogin || entry.mst || entry.taxCode || "",
        phone: entry.phone || entry.phoneNumber || "",
        recoveryEmail: entry.recoveryEmail || entry.recovery || "",
        pin: entry.pin || entry.token || "",
        operationNote: entry.operationNote || entry.note || "",
        updatedAt: entry.updatedAt || entry.lastChanged || now,
        updatedBy: entry.updatedBy || user
      };
    });

    // Ensure default entries exist
    const hasEtax = normalizedEntries.some(e => e.id === 'entry_etax' || e.serviceName.includes('eTax'));
    const hasInvoice = normalizedEntries.some(e => e.id === 'entry_invoice' || e.serviceName.includes('Hóa đơn'));

    if (!hasEtax) {
      normalizedEntries.push({
        id: 'entry_etax',
        serviceName: 'Thuế điện tử eTax',
        websiteUrl: 'https://thuedientu.gdt.gov.vn',
        username: '',
        password: '',
        gmail: '',
        taxLogin: '',
        phone: '',
        recoveryEmail: '',
        pin: '',
        operationNote: '',
        updatedAt: now,
        updatedBy: user
      });
    }

    if (!hasInvoice) {
      normalizedEntries.push({
        id: 'entry_invoice',
        serviceName: 'Hóa đơn điện tử',
        websiteUrl: 'https://hoadondientu.gdt.gov.vn',
        username: '',
        password: '',
        gmail: '',
        taxLogin: '',
        phone: '',
        recoveryEmail: '',
        pin: '',
        operationNote: '',
        updatedAt: now,
        updatedBy: user
      });
    }

    return {
      id: clientId,
      clientName: clientName,
      taxCode: taxCode,
      shortName: client.shortName || "",
      notes: client.notes || "",
      vaultEntries: normalizedEntries,
      createdAt: client.createdAt || now,
      updatedAt: client.updatedAt || now,
      updatedBy: client.updatedBy || user
    };
  });
};

interface VaultModuleProps {
  clientVault: ClientVault[];
  setClientVault: React.Dispatch<React.SetStateAction<ClientVault[]>>;
  onPersist: (action: string, module: string, overrides?: any) => void;
  isHydrated: boolean;
}

export default function VaultModule({ 
  clientVault, 
  setClientVault, 
  onPersist, 
  isHydrated 
}: VaultModuleProps) {
  const [search, setSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showPassMap, setShowPassMap] = useState<Record<string, boolean>>({});
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', mst: '' });
  const [isSavingInProgress, setIsSavingInProgress] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});
  const [isSyncingEntry, setIsSyncingEntry] = useState<string | null>(null);

  const dispatchActivityLog = useCallback((action: string, title: string, description: string, entityId?: string, entityName?: string) => {
    const user = auth.currentUser?.email || "Admin";
    const log = {
      id: `log_${Date.now()}`,
      module: 'clientVault',
      action,
      title,
      description,
      entityType: 'client',
      entityId,
      entityName,
      customerName: entityName,
      timestamp: new Date().toLocaleTimeString(),
      fullTimestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      user,
      type: 'success'
    };
    
    window.dispatchEvent(new CustomEvent('erp-notification', { detail: log }));
  }, []);

  const selectedClient = useMemo(() => {
    if (!selectedClientId && clientVault.length > 0) return clientVault[0];
    return clientVault.find(v => v.id === selectedClientId) || null;
  }, [clientVault, selectedClientId]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      let d: Date;
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts[0].length === 4) {
          d = new Date(dateStr);
        } else {
          d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
      } else if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        d = new Date(dateStr);
      }
      if (isNaN(d.getTime())) return dateStr;
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  // Helper to map UI entry to API payload
  const mapEntryToApi = (entry: VaultEntry) => ({
    service_name: entry.serviceName,
    website_url: entry.websiteUrl,
    username: entry.username,
    password_encrypted: entry.password,
    gmail: entry.gmail,
    tax_login: entry.taxLogin,
    phone: entry.phone,
    recovery_email: entry.recoveryEmail,
    pin_encrypted: entry.pin,
    operation_note: entry.operationNote,
    updated_by: auth.currentUser?.email || 'Admin'
  });

  const syncEntryToDatabase = useCallback(async (clientId: string, entry: VaultEntry) => {
    setIsSyncingEntry(entry.id);
    try {
      const payload = mapEntryToApi(entry);
      let response;
      
      if (entry.id && entry.id.startsWith('entry_')) {
        // It's a new unsaved entry (entry_custom_ or entry_etax_temp etc)
        response = await ErpApiService.apiPost(`/client-vault/${clientId}/entries`, payload);
        if (response.ok && response.id) {
           // Update the ID in local state if it was a temp ID
           setClientVault(prev => prev.map(c => {
             if (c.id !== clientId) return c;
             return {
               ...c,
               vaultEntries: c.vaultEntries.map(e => e.id === entry.id ? { ...e, id: String(response.id) } : e)
             };
           }));
        }
      } else {
        // It's an existing entry
        response = await ErpApiService.apiPut(`/client-vault/entries/${entry.id}`, payload);
      }
      
      if (!response.ok) throw new Error(response.error || 'SYNC_FAILED');
      
    } catch (error) {
      console.error('Vault entry sync failed:', error);
      // Show error but keep pending in memory
      alert('Lưu Database lỗi. Vui lòng kiểm tra kết nối.');
    } finally {
      setIsSyncingEntry(null);
    }
  }, [setClientVault]);

  // Debounced sync for individual entries
  const entrySyncTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  const scheduleEntrySync = useCallback((clientId: string, entry: VaultEntry) => {
    if (entrySyncTimeouts.current[entry.id]) {
      clearTimeout(entrySyncTimeouts.current[entry.id]);
    }
    
    entrySyncTimeouts.current[entry.id] = setTimeout(() => {
      syncEntryToDatabase(clientId, entry);
      delete entrySyncTimeouts.current[entry.id];
    }, 2000);
  }, [syncEntryToDatabase]);

  const handleUpdateEntry = useCallback((clientId: string, entryId: string, field: string, value: string) => {
    const user = auth.currentUser?.email || "Admin";
    const now = new Date().toISOString();

    let updatedEntry: VaultEntry | null = null;

    const nextVault = clientVault.map(client => {
      if (client.id !== clientId) return client;

      const nextEntries = client.vaultEntries.map(entry => {
        if (entry.id !== entryId) return entry;
        if ((entry as any)[field] === value) return entry;

        updatedEntry = {
          ...entry,
          [field]: value,
          updatedAt: now,
          updatedBy: user
        };
        return updatedEntry;
      });

      return {
        ...client,
        vaultEntries: nextEntries,
        updatedAt: now,
        updatedBy: user
      };
    });

    setClientVault(nextVault);
    if (updatedEntry) {
      scheduleEntrySync(clientId, updatedEntry);
    }
  }, [clientVault, scheduleEntrySync, setClientVault]);

  const flushAllSyncs = useCallback(async () => {
    const activeEntries = Object.keys(entrySyncTimeouts.current);
    if (activeEntries.length === 0) return;

    // Clear all timeouts
    activeEntries.forEach(id => {
      clearTimeout(entrySyncTimeouts.current[id]);
      delete entrySyncTimeouts.current[id];
    });

    // Find and sync immediately
    for (const client of clientVault) {
       for (const entry of client.vaultEntries) {
         if (activeEntries.includes(entry.id)) {
           await syncEntryToDatabase(client.id, entry);
         }
       }
    }
  }, [clientVault, syncEntryToDatabase]);

  useEffect(() => {
    return () => {
      // Flush on unmount
      const activeEntries = Object.keys(entrySyncTimeouts.current);
      activeEntries.forEach(id => clearTimeout(entrySyncTimeouts.current[id]));
    };
  }, []);

  const handleSelectClient = useCallback(async (id: string) => {
    await flushAllSyncs();
    setSelectedClientId(id);
    setIsClientListOpen(false);
  }, [flushAllSyncs]);

  const handleDeleteAccount = async (clientId: string, accId: string) => {
    if (!accId) return;
    try {
      if (!accId.startsWith('entry_custom_')) {
        const response = await ErpApiService.apiDelete(`/client-vault/entries/${accId}`);
        if (!response.ok) throw new Error(response.error || 'DELETE_FAILED');
      }

      const updatedVault = clientVault.map(v => v.id === clientId ? {
        ...v,
        vaultEntries: v.vaultEntries.filter(acc => acc.id !== accId)
      } : v);
      
      setClientVault(updatedVault);
      dispatchActivityLog('DELETE_VAULT_ENTRY', 'Xóa tài khoản', `Đã xóa một dòng tài khoản trong kho của khách hàng`, clientId);
    } catch (e) {
      alert('Lỗi khi xóa tài khoản khỏi database');
    } finally {
      setDeletingAccountModal(null);
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      const response = await ErpApiService.apiDelete(`/clients/${id}`);
      if (!response.ok) throw new Error(response.error || 'DELETE_FAILED');

      const updatedVault = clientVault.filter(v => v.id !== id);
      setClientVault(updatedVault);
      dispatchActivityLog('DELETE_CLIENT', 'Xóa khách hàng', `Đã xóa khách hàng khỏi kho dữ liệu`, id);
      if (selectedClientId === id) setSelectedClientId(null);
    } catch (e) {
      alert('Lỗi khi xóa khách hàng khỏi database');
    } finally {
      setDeletingClientModal(null);
    }
  };

  const handleAddAccount = async (clientId: string) => {
    const user = auth.currentUser?.email || "Admin";
    const now = new Date().toISOString();
    
    // Create local entry first
    const newEntry: VaultEntry = { 
      id: `entry_custom_${Date.now()}`, 
      serviceName: '', 
      websiteUrl: '',
      username: '', 
      password: '', 
      gmail: '',
      taxLogin: '',
      phone: '',
      recoveryEmail: '',
      pin: '',
      operationNote: '',
      updatedAt: now,
      updatedBy: user
    };

    const updatedVault = clientVault.map(v => v.id === clientId ? {
      ...v,
      vaultEntries: [...v.vaultEntries, newEntry],
      updatedAt: now,
      updatedBy: user
    } : v);
    
    setClientVault(updatedVault);
    // Don't sync yet, wait for user input or explicit save
    // syncEntryToDatabase(clientId, newEntry); 
  };

  const exportSingleVault = (client: ClientVault) => {
    const data = client.vaultEntries.map(acc => ({
      'Dịch vụ': acc.serviceName,
      'Website': acc.websiteUrl,
      'Tài khoản': acc.username,
      'Mật khẩu': acc.password,
      'Gmail': acc.gmail || '',
      'Mã số thuế': acc.taxLogin || '',
      'Số điện thoại': acc.phone || '',
      'Khôi phục': acc.recoveryEmail || '',
      'Mã Pin': acc.pin || '',
      'Ghi chú': acc.operationNote || '',
      'Ngày cập nhật': formatDate(acc.updatedAt)
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vault_' + client.taxCode);
    XLSX.writeFile(wb, `Mat_khau_${client.taxCode}.xlsx`);
  };

  const exportAllVaults = () => {
    const data = clientVault.flatMap(v => v.vaultEntries.map(acc => ({
      'Khách hàng': v.clientName,
      'MST': v.taxCode,
      'Dịch vụ': acc.serviceName,
      'Website': acc.websiteUrl,
      'Tên đăng nhập': acc.username,
      'Mật khẩu': acc.password,
      'Cập nhật cuối': formatDate(acc.updatedAt)
    })));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Veratax_Vault_Master');
    XLSX.writeFile(wb, `Toan_bo_Kho_mat_khau_${new Date().getTime()}.xlsx`);
  };

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.mst) return;
    setIsSavingInProgress(true);
    
    try {
      const now = new Date().toISOString();
      const user = auth.currentUser?.email || "Admin";

      // 1. Create client in backend
      const response = await ErpApiService.apiPost('/clients', {
        name: newClient.name,
        tax_code: newClient.mst,
        short_name: '',
        notes: '',
        managed_by: user
      });

      if (!response.ok || !response.id) throw new Error(response.error || 'CLIENT_CREATE_FAILED');

      const clientId = response.id;

      const client: ClientVault = {
        id: clientId,
        clientName: newClient.name,
        taxCode: newClient.mst,
        shortName: '',
        notes: '',
        vaultEntries: [
          { 
            id: 'entry_etax', 
            serviceName: 'Thuế điện tử eTax', 
            websiteUrl: 'https://thuedientu.gdt.gov.vn',
            username: '', 
            password: '', 
            gmail: '', 
            taxLogin: '', 
            phone: '', 
            recoveryEmail: '', 
            pin: '', 
            operationNote: '', 
            updatedAt: now, 
            updatedBy: user 
          },
          { 
            id: 'entry_invoice', 
            serviceName: 'Hóa đơn điện tử', 
            websiteUrl: 'https://hoadondientu.gdt.gov.vn',
            username: '', 
            password: '', 
            gmail: '', 
            taxLogin: '', 
            phone: '', 
            recoveryEmail: '', 
            pin: '', 
            operationNote: '', 
            updatedAt: now, 
            updatedBy: user 
          }
        ],
        createdAt: now,
        updatedAt: now,
        updatedBy: user
      };
      
      // Sync the default entries
      await ErpApiService.apiPost(`/client-vault/${clientId}/entries`, mapEntryToApi(client.vaultEntries[0]));
      await ErpApiService.apiPost(`/client-vault/${clientId}/entries`, mapEntryToApi(client.vaultEntries[1]));

      const updatedVault = [client, ...clientVault];
      setClientVault(updatedVault);
      
      dispatchActivityLog('CREATE_CLIENT', 'Tạo kho khách hàng', `Đã khởi tạo kho dữ liệu cho ${client.clientName}`, client.id, client.clientName);
      
      setIsAddingClient(false);
      setNewClient({ name: '', mst: '' });
      setSelectedClientId(client.id);
    } catch (error) {
      console.error('Vault persist failed:', error);
    } finally {
      setIsSavingInProgress(false);
    }
  };

  const handleDeleteClientStop = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingClientModal(id);
  };

  const filteredVaults = clientVault.filter(v => 
    v.clientName.toLowerCase().includes(search.toLowerCase()) || 
    v.taxCode.includes(search)
  );
  
  const [isClientListOpen, setIsClientListOpen] = useState(false);
  const [deletingClientModal, setDeletingClientModal] = useState<string | null>(null);
  const [deletingAccountModal, setDeletingAccountModal] = useState<{clientId: string, accId: string} | null>(null);
  const [isRevealing, setIsRevealing] = useState<string | null>(null);

  const revealSecret = async (entryId: string) => {
    if (showPassMap[entryId]) {
      setShowPassMap({ ...showPassMap, [entryId]: false });
      return;
    }

    setIsRevealing(entryId);
    try {
      const response = await ErpApiService.apiPost<any>(`/client-vault/entries/${entryId}/reveal`, {});
      if (response.ok && response.data) {
        setClientVault(prev => prev.map(c => ({
          ...c,
          vaultEntries: c.vaultEntries.map(e => e.id === entryId ? { 
            ...e, 
            password: response.data.password, 
            pin: response.data.pin 
          } : e)
        })));
        setShowPassMap(prev => ({ ...prev, [entryId]: true }));
        dispatchActivityLog('REVEAL_SECRET', 'Xem mật khẩu', `Hệ thống hiển thị mật khẩu bảo mật`, entryId);
      }
    } catch (error) {
      alert('Không có quyền xem hoặc lỗi kết nối.');
    } finally {
      setIsRevealing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 w-full xl:flex-1">
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Tìm tên công ty, MST..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-sm text-slate-600 placeholder:text-slate-300"
            />
          </div>

          {/* Client Selection Filter - Now stretches to fill space */}
          <div className="relative w-full md:flex-1 min-w-[200px]">
            <button 
              onClick={() => setIsClientListOpen(!isClientListOpen)}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-left hover:bg-white hover:border-emerald-200 transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-emerald-600 shadow-sm">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Khách hàng</span>
                  <span className="text-xs font-black text-slate-900 truncate flex-1">
                    {selectedClient ? selectedClient.clientName : 'Chọn khách hàng...'}
                  </span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 text-slate-300 transition-transform ${isClientListOpen ? 'rotate-90 text-emerald-500' : ''}`} />
            </button>

            <AnimatePresence>
              {isClientListOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[24px] shadow-2xl border border-slate-100 z-50 overflow-hidden max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200"
                >
                  <div className="p-3">
                    {filteredVaults.map(client => (
                      <button
                        key={client.id}
                        onClick={() => handleSelectClient(client.id)}
                        className={`w-full p-4 text-left rounded-xl transition-all border border-transparent ${selectedClientId === client.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'hover:bg-slate-50 text-slate-600'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-xs font-black uppercase tracking-tight">{client.clientName}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${selectedClientId === client.id ? 'text-emerald-100' : 'text-slate-400'}`}>MST: {client.taxCode}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                             <div 
                               onClick={(e) => handleDeleteClientStop(e, client.id)}
                               className={`p-2 rounded-lg transition-all ${selectedClientId === client.id ? 'hover:bg-emerald-500 text-emerald-100' : 'hover:bg-rose-50 text-slate-300 hover:text-rose-500'}`}
                             >
                               <X className="w-3.5 h-3.5" />
                             </div>
                             {selectedClientId === client.id && <ShieldCheck className="w-4 h-4" />}
                          </div>
                        </div>
                      </button>
                    ))}
                    {filteredVaults.length === 0 && (
                      <div className="p-8 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        Không tìm thấy khách hàng
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full xl:w-auto justify-end">
          <button 
            onClick={exportAllVaults}
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-emerald-50 text-emerald-700 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100 shadow-sm"
          >
            <Database className="w-4 h-4" />
            <span>Xuất toàn bộ kho</span>
          </button>
          <button 
            onClick={() => setIsAddingClient(true)}
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm khách hàng</span>
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {deletingAccountModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center"
            >
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <X className="w-10 h-10 text-rose-500" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 mb-2">Xác nhận xóa tài khoản!</h3>
              <p className="text-sm font-bold text-slate-500 mb-8 leading-relaxed uppercase tracking-tight">
                ⚠️ Dữ liệu này sẽ mất vĩnh viễn.<br/>Bạn có chắc chắn muốn xóa không?
              </p>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setDeletingAccountModal(null)}
                  className="flex-1 py-3 px-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all font-bold"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={() => deletingAccountModal && handleDeleteAccount(deletingAccountModal.clientId, deletingAccountModal.accId)}
                  className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-rose-500/20 transition-all font-bold"
                >
                  Đồng ý xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Client Modal */}
      <AnimatePresence>
        {deletingClientModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center"
            >
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-10 h-10 text-rose-500" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 mb-2">Xóa kho dữ liệu!</h3>
              <p className="text-sm font-bold text-slate-500 mb-8 leading-relaxed uppercase tracking-tight">
                ⚠️ TOÀN BỘ MẬT KHẨU CỦA KHÁCH HÀNG NÀY SẼ BỊ XÓA VĨNH VIỄN!<br/>
                Bạn có chắc chắn?
              </p>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setDeletingClientModal(null)}
                  className="flex-1 py-3 px-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all font-bold"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={() => handleDeleteClient(deletingClientModal)}
                  className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-rose-500/20 transition-all font-bold"
                >
                  Xác nhận xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddingClient && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Thêm khách hàng mới</h3>
                <button onClick={() => setIsAddingClient(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mã số thuế</label>
                  <input 
                    type="text" 
                    value={newClient.mst}
                    onChange={e => setNewClient({...newClient, mst: e.target.value})}
                    placeholder="MST doanh nghiệp"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tên doanh nghiệp</label>
                  <input 
                    type="text" 
                    value={newClient.name}
                    onChange={e => setNewClient({...newClient, name: e.target.value})}
                    placeholder="Tên đầy đủ công ty"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  />
                </div>
              </div>
              <div className="p-6 bg-slate-50 flex items-center justify-end space-x-3">
                <button 
                  onClick={() => setIsAddingClient(false)}
                  className="px-6 py-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleAddClient}
                  disabled={isSavingInProgress}
                  className={`px-8 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all ${isSavingInProgress ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSavingInProgress ? 'Đang tạo...' : 'Khởi tạo kho'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="w-full">
        <AnimatePresence mode="wait">
          {selectedClient ? (
            <motion.div
              key={selectedClient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[40px] border border-slate-100 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.05)] overflow-hidden"
            >
              <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-slate-900 rounded-[24px] flex items-center justify-center text-emerald-400 shadow-xl shadow-slate-900/20 transition-transform hover:scale-105">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-none mb-2">{selectedClient.clientName}</h3>
                    <div className="flex items-center space-x-3">
                      <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-emerald-600">
                        <Database className="w-3.5 h-3.5" />
                        <span>Mã số thuế: {selectedClient.taxCode}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest hidden sm:block">• Bảo mật tài khoản Veratax</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => handleAddAccount(selectedClient.id)}
                    className="flex items-center space-x-3 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-emerald-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm thông tin</span>
                  </button>
                  <button 
                    onClick={() => exportSingleVault(selectedClient)}
                    className="flex items-center space-x-3 px-6 py-4 bg-white border border-slate-100 text-slate-900 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                  >
                    <Download className="w-4 h-4 text-emerald-500" />
                    <span>Xuất báo cáo</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
                <table className="w-full text-left border-collapse min-w-[1500px]">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100/30">Trang web (URL)</th>
                      <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100/30">Tài khoản</th>
                      <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100/30">Mật khẩu</th>
                      <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100/30">Gmail</th>
                      <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100/30">Mã số thuế</th>
                      <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100/30">Số điện thoại</th>
                      <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100/30">Khôi phục</th>
                      <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100/30">Mã Pin</th>
                      <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest lg:max-w-xs">Ghi chú vận hành</th>
                      <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Cập nhật</th>
                      <th className="px-6 py-6 w-20"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {selectedClient.vaultEntries.map((acc) => (
                      <tr key={acc.id} className="hover:bg-emerald-50/30 transition-all group">
                        {[
                          { field: 'serviceName', placeholder: 'Dịch vụ/Web...', icon: Globe },
                          { field: 'username', placeholder: 'Username' },
                          { field: 'password', placeholder: 'Password', secret: true },
                          { field: 'gmail', placeholder: 'Gmail liên kết' },
                          { field: 'taxLogin', placeholder: 'MST đăng nhập' },
                          { field: 'phone', placeholder: 'Số điện thoại' },
                          { field: 'recoveryEmail', placeholder: 'Email khôi phục' },
                          { field: 'pin', placeholder: 'Pin/Token', secret: true },
                          { field: 'operationNote', placeholder: 'Ghi chú quan trọng' }
                        ].map(col => (
                          <td key={col.field} className="px-4 py-4 border-r border-slate-100/30">
                            <div className="relative flex items-center">
                              <input 
                                type={col.secret && !showPassMap[acc.id] ? "password" : "text"}
                                value={(acc as any)[col.field] || ''}
                                onChange={(e) => handleUpdateEntry(selectedClient.id, acc.id, col.field, e.target.value)}
                                placeholder={col.placeholder}
                                className={`w-full px-3 py-3 bg-transparent border border-transparent focus:border-emerald-300 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300 placeholder:italic ${col.field === 'password' || col.field === 'pin' ? 'font-mono tracking-normal text-emerald-600' : ''} ${isSyncingEntry === acc.id ? 'opacity-50' : ''}`}
                              />
                              {col.secret && (
                                <button 
                                  onClick={() => revealSecret(acc.id)}
                                  disabled={isRevealing === acc.id}
                                  className={`p-2 rounded-lg hover:bg-slate-50 transition-all ${showPassMap[acc.id] ? 'text-emerald-500' : 'text-slate-300'} ${isRevealing === acc.id ? 'animate-pulse' : ''}`}
                                >
                                  {showPassMap[acc.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              )}
                              {isSyncingEntry === acc.id && (
                                <div className="absolute right-10 flex items-center">
                                  <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                              )}
                              <div className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-white shadow-lg border border-slate-100 rounded-xl overflow-hidden z-10">
                                <button 
                                  onClick={() => copyToClipboard((acc as any)[col.field] || '')}
                                  className="p-2 hover:bg-slate-50 text-slate-400 hover:text-emerald-500 transition-all border-l border-slate-100"
                                  title="Sao chép"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </td>
                        ))}
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                             {formatDate(acc.updatedAt)}
                           </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                           <button 
                             onClick={() => setDeletingAccountModal({clientId: selectedClient.id, accId: acc.id})}
                             className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                           >
                             <X className="w-5 h-5" />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {selectedClient.vaultEntries.length === 0 && (
                  <div className="p-20 text-center text-slate-400 bg-slate-50/30">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <Cloud className="w-10 h-10 text-slate-200" />
                    </div>
                    <p className="text-sm font-black uppercase tracking-widest">Kho dữ liệu trống. Hãy thêm bản ghi mới.</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center bg-white rounded-[40px] border border-slate-100 border-dashed animate-pulse">
              <Search className="w-12 h-12 mb-4 opacity-10" />
              <p className="text-slate-300 font-black uppercase tracking-widest text-xs">Phân tích hệ thống... Vui lòng chọn khách hàng</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
