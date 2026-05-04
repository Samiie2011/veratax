import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cloud, 
  RotateCcw, 
  Clock, 
  Download, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  FileJson,
  User,
  Calendar
} from 'lucide-react';
import { DriveBackupService } from '../../services/DriveBackupService';

interface BackupFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  size?: number;
  metadata?: any;
}

interface BackupCenterProps {
  onRestoreAction: (fileId: string) => Promise<void>;
  currentRevision: number;
}

export default function BackupCenter({ onRestoreAction, currentRevision }: BackupCenterProps) {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const fetchBackups = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await DriveBackupService.listBackups() as any;
      if (result && result.ok) {
        setBackups(result.files || []);
      } else {
        setError(result?.error || 'Không thể lấy danh sách bản sao lưu');
      }
    } catch (err) {
      setError('Lỗi kết nối khi tải danh sách backup');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleRestore = async (fileId: string) => {
    setRestoringId(fileId);
    setConfirmId(null);
    try {
      await onRestoreAction(fileId);
    } catch (err) {
      setError('Khôi phục thất bại');
    } finally {
      setRestoringId(null);
    }
  };

  const filteredBackups = backups.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(1) + ' KB';
    return (kb / 1024).toFixed(1) + ' MB';
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return {
        date: d.toLocaleDateString('vi-VN'),
        time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
    } catch {
      return { date: isoStr, time: '' };
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
            <Cloud className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none mb-2">Trung tâm Sao lưu</h2>
            <div className="flex items-center space-x-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                PHIÊN BẢN HIỆN TẠI: <span className="text-indigo-600">REV {currentRevision}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                TỔNG SỐ BẢN GHI: <span className="text-indigo-600">{backups.length}</span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-all" />
            <input 
              type="text" 
              placeholder="Tìm kiếm version..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold text-sm text-slate-600 placeholder:text-slate-300"
            />
          </div>
          <button 
            onClick={fetchBackups}
            disabled={isLoading}
            className="p-3.5 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-50 border border-rose-100 rounded-3xl p-6 flex items-center space-x-4 text-rose-600"
        >
          <XCircle className="w-6 h-6 shrink-0" />
          <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
        </motion.div>
      )}

      {/* Backup List */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Đang quét Google Drive...</p>
          </div>
        ) : filteredBackups.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Cloud className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Drive chưa có bản sao lưu</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest max-w-xs">Hệ thống sẽ tự động tạo backup khi có các thay đổi quan trọng.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filteredBackups.map((backup) => {
              const { date, time } = formatDate(backup.createdTime);
              const isCurrent = backup.name.includes('current');
              
              return (
                <div key={backup.id} className="p-8 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                  <div className="flex items-center space-x-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 ${isCurrent ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                      {isCurrent ? <CheckCircle2 className="w-7 h-7" /> : <FileJson className="w-7 h-7" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{backup.name}</h4>
                        {isCurrent && <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">Current</span>}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1.5 text-slate-400 italic">
                          <Calendar className="w-3 h-3" />
                          <span className="text-[10px] font-bold">{date}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-slate-400 italic">
                          <Clock className="w-3 h-3" />
                          <span className="text-[10px] font-bold">{time}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-slate-400 italic">
                          <Download className="w-3 h-3" />
                          <span className="text-[10px] font-bold uppercase">{formatSize(backup.size)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {confirmId === backup.id ? (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center space-x-2 bg-rose-50 p-1 rounded-2xl border border-rose-100 shadow-sm"
                      >
                        <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest px-3">Xác nhận phục hồi?</span>
                        <button 
                          onClick={() => handleRestore(backup.id)}
                          disabled={!!restoringId}
                          className="px-4 py-2 bg-rose-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/10 hover:bg-rose-500 transition-all disabled:opacity-50"
                        >
                          {restoringId === backup.id ? 'Loading...' : 'ĐỒNG Ý'}
                        </button>
                        <button 
                          onClick={() => setConfirmId(null)}
                          className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600"
                        >
                          HỦY
                        </button>
                      </motion.div>
                    ) : (
                      <button 
                        onClick={() => setConfirmId(backup.id)}
                        disabled={!!restoringId || isCurrent}
                        className={`flex items-center space-x-3 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 ${isCurrent ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                      >
                        <RotateCcw className={`w-4 h-4 ${restoringId === backup.id ? 'animate-spin' : ''}`} />
                        <span>{restoringId === backup.id ? 'Đang tải...' : 'Phục hồi'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Warning Card */}
      <div className="bg-amber-50 border border-amber-100 p-8 rounded-[40px] flex items-start space-x-6">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm shrink-0">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div>
          <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight mb-2">Lưu ý trước khi phục hồi dữ liệu</h4>
          <p className="text-xs font-bold text-amber-800 leading-relaxed uppercase tracking-tight opacity-80 decoration-slate-900">
            Việc phục hồi dữ liệu sẽ GHI ĐÈ toàn bộ thông tin HIỆN TẠI. <br/>
            Hệ thống sẽ tự động tạo một bản sao lưu hiện hành trước khi tiến hành khôi phục để đảm bảo an toàn. <br/>
            Khuyến cáo: Tải xuống file Excel master trước khi thực hiện các tác vụ can thiệp sâu vào Database.
          </p>
        </div>
      </div>
    </div>
  );
}
