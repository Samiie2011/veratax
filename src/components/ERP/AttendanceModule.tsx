import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Users,
  Briefcase,
  ChevronDown,
  X
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import ErpApiService from '../../services/ErpApiService';

interface StaffAttendance {
  id: string;
  name: string;
  role: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  checkIn: string;
  checkOut: string | null;
  location: string;
  dept: string;
}

interface AttendanceModuleProps {
  humanResources: StaffAttendance[];
  setHumanResources: React.Dispatch<React.SetStateAction<StaffAttendance[]>>;
  onPersist: (action: string, module: string, overrides?: any) => void;
  isHydrated: boolean;
}

export default function AttendanceModule({ 
  humanResources, 
  setHumanResources, 
  onPersist, 
  isHydrated 
}: AttendanceModuleProps) {
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      const response = await ErpApiService.apiDelete(`/employees/${id}`);
      if (response.ok) {
        const updatedHR = humanResources.filter(s => s.id !== id);
        setHumanResources(updatedHR);
        onPersist('DELETE_EMPLOYEE', 'HR', { humanResources: updatedHR });
      } else {
        throw new Error(response.error || 'DELETE_FAILED');
      }
    } catch (e) {
      console.error('Delete employee failed', e);
      alert('Không thể xóa nhân viên khỏi database');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredData = selectedDept === 'all' 
    ? humanResources 
    : humanResources.filter(s => s.dept === selectedDept);

  return (
    <div className="space-y-8">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center"
            >
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-rose-500" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 mb-2">Xác nhận xóa!</h3>
              <p className="text-sm font-bold text-slate-500 mb-8 leading-relaxed uppercase tracking-tight">
                ⚠️ BẢN GHI SẼ BỊ XÓA VĨNH VIỄN!<br/>
                Bạn có chắc chắn muốn xóa dữ liệu này?
              </p>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-3 px-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={() => handleDelete(deletingId)}
                  className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-rose-500/20 transition-all"
                >
                  Đồng ý xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-center space-x-6">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-800">Đúng giờ</p>
            <p className="text-2xl font-black text-emerald-900">{filteredData.filter(s => s.status === 'present').length || 0}</p>
          </div>
        </div>
        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-center space-x-6">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-800">Đi muộn</p>
            <p className="text-2xl font-black text-amber-900">{filteredData.filter(s => s.status === 'late').length || 0}</p>
          </div>
        </div>
        <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 flex items-center space-x-6">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-rose-600 shadow-sm">
            <XCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-rose-800">Nghỉ phép</p>
            <p className="text-2xl font-black text-rose-900">{filteredData.filter(s => s.status === 'absent').length || 0}</p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-slate-400" />
            <span className="font-bold text-slate-700">Thứ Sáu, 01/05/2026</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                className={`flex items-center space-x-3 px-5 py-2.5 bg-white border ${isDeptDropdownOpen ? 'border-emerald-500 ring-8 ring-emerald-500/5' : 'border-slate-100'} rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 shadow-sm hover:border-emerald-200 transition-all active:scale-95`}
              >
                <Filter className={`w-3.5 h-3.5 ${isDeptDropdownOpen ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span>{selectedDept === 'all' ? 'Tất cả phòng ban' : `Phòng ${selectedDept}`}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isDeptDropdownOpen ? 'rotate-180 text-emerald-500' : ''}`} strokeWidth={3} />
              </button>

              <AnimatePresence>
                {isDeptDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute top-full right-0 mt-3 w-64 bg-white border border-slate-100 rounded-[24px] shadow-2xl z-50 overflow-hidden p-2 ring-1 ring-slate-900/5"
                  >
                    <div className="px-3 py-2 text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">Lọc theo phòng ban</div>
                    {['all', 'Kế toán', 'Pháp lý', 'Hành chính'].map((dept) => (
                      <button
                        key={dept}
                        onClick={() => {
                          setSelectedDept(dept);
                          setIsDeptDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                          selectedDept === dept ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {dept === 'all' ? 'Tất cả phòng ban' : dept}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Nhân viên</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Giờ vào</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Giờ ra</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Địa điểm</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((staff) => (
                <tr key={staff.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 uppercase">
                        {staff.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 tracking-tight">{staff.name}</p>
                        <div className="flex items-center space-x-2">
                          <Briefcase className="w-3 h-3 text-slate-300" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{staff.role}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      staff.status === 'present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      staff.status === 'late' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        staff.status === 'present' ? 'bg-emerald-600' :
                        staff.status === 'late' ? 'bg-amber-600' :
                        'bg-rose-600'
                      }`} />
                      <span>{staff.status === 'present' ? 'Có mặt' : staff.status === 'late' ? 'Muộn' : 'Vắng'}</span>
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-2 text-slate-600">
                      <Clock className="w-4 h-4 text-slate-300" />
                      <span className="text-sm font-bold">{staff.checkIn}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-slate-600">
                    {staff.checkOut || '-'}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <MapPin className="w-4 h-4" />
                      <span className="text-xs font-semibold">{staff.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => setDeletingId(staff.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
