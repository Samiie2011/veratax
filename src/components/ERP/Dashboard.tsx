import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function Dashboard({ contracts = [] }: { contracts?: any[] }) {
  const totalRevenue = contracts.reduce((sum, c) => sum + (Number(c.total) || 0), 0);
  const totalContracts = contracts.length;
  const officialContracts = contracts.filter(c => c.isOfficial).length;
  const agreementContracts = contracts.filter(c => !c.isOfficial).length;

  const stats = [
    { name: 'Tổng doanh thu', value: `${totalRevenue.toLocaleString('vi-VN')}đ`, change: '+10.5%', trend: 'up', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Tổng hợp đồng', value: totalContracts.toString(), change: '+5.2%', trend: 'up', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'HĐ Chính thức', value: officialContracts.toString(), change: '+4.1%', trend: 'up', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'HĐ Thỏa thuận', value: agreementContracts.toString(), change: '+2.4%', trend: 'up', icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const recentActivities = contracts.slice(0, 5).map((c, i) => ({
    id: c.id || i,
    title: c.clientName,
    sub: c.serviceDetail || c.serviceType,
    time: c.contractDate ? new Date(c.contractDate).toLocaleDateString('vi-VN') : 'Gần đây',
    amount: `${(Number(c.total) || 0).toLocaleString('vi-VN')}đ`,
    status: c.isCompleted ? 'Thành công' : 'Đang xử lý'
  }));

  const exportActivityToExcel = () => {
    const data = recentActivities.map(a => ({
      'STT': a.id,
      'Hoạt động': a.title,
      'Đối tượng': a.sub,
      'Thời gian': a.time,
      'Số tiền': a.amount,
      'Trạng thái': a.status
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hoạt động gần đây');
    XLSX.writeFile(wb, `Hoat_dong_Veratax_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`);
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className={`flex items-center space-x-1 py-1 px-2 rounded-full text-xs font-bold ${
                stat.trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
              }`}>
                <span>{stat.change}</span>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">{stat.name}</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight leading-none">Hoạt động gần đây</h3>
            <div className="flex items-center space-x-4">
              <button 
                onClick={exportActivityToExcel}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200"
              >
                <Download className="w-3 h-3" />
                <span>Xuất Excel</span>
              </button>
              <button 
                onClick={() => alert('Dữ liệu đang được tải...')}
                className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 underline underline-offset-4"
              >
                Xem tất cả
              </button>
            </div>
          </div>
          <div className="space-y-6">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                    <TrendingUp className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{activity.title}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{activity.sub} • {activity.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900 tracking-tight">{activity.amount}</p>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{activity.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">Chấm công hôm nay</h3>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-emerald-800">Đã chấm công</p>
                <p className="text-2xl font-black text-emerald-900">42/45</p>
              </div>
              <Users className="w-10 h-10 text-emerald-600/30" />
            </div>
            
            <div className="space-y-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Chưa chấm công</p>
              {['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C'].map((name) => (
                <div key={name} className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                    {name[0]}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
