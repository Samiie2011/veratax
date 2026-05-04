import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, ChevronRight, Info, CheckCircle2, ArrowRightLeft, Settings2, Users, MapPin, ShieldCheck, Banknote, ChevronDown, Plus, Minus } from 'lucide-react';

// --- CUSTOM COMPONENTS ---

interface CustomSelectProps {
  value: number;
  options: { id: number; name: string }[];
  onChange: (id: number) => void;
  icon?: React.ReactNode;
  label: string;
}

const CustomSelect = ({ value, options, onChange, icon, label }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(o => o.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 ml-1">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-slate-950 border transition-all duration-300 rounded-2xl pl-12 pr-4 py-3.5 text-left flex items-center justify-between group ${isOpen ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-slate-800 hover:border-slate-700'}`}
      >
        <div className="flex items-center space-x-3">
          <div className={`absolute left-4 transition-colors duration-300 ${isOpen ? 'text-emerald-500' : 'text-slate-500'}`}>
            {icon}
          </div>
          <span className={`font-bold transition-colors duration-300 ${isOpen ? 'text-white' : 'text-slate-300'}`}>
            {selectedOption?.name}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-xl"
          >
            <div className="p-1.5">
              {options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group/item ${value === opt.id ? 'bg-emerald-500 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  <span className="font-bold text-sm tracking-tight">{opt.name}</span>
                  {value === opt.id && <CheckCircle2 className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface CustomNumberInputProps {
  value: number;
  onChange: (val: number) => void;
  label: string;
  icon?: React.ReactNode;
}

const CustomNumberInput = ({ value, onChange, label, icon }: CustomNumberInputProps) => {
  return (
    <div>
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors duration-300">
          {icon}
        </div>
        <div className="flex items-center bg-slate-950 border border-slate-800 group-focus-within:border-emerald-500 group-focus-within:ring-4 group-focus-within:ring-emerald-500/10 rounded-2xl px-2 py-1.5 transition-all duration-300">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full bg-transparent border-none pl-10 pr-2 py-2 text-white font-black text-lg focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <div className="flex items-center space-x-1 pr-1">
            <button
              onClick={() => onChange(Math.max(0, value - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-700 transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => onChange(value + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-700 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import { 
  calculateGrossToNet, 
  calculateNetToGross, 
  PeriodMode, 
  InsuranceMode,
  REGULATION_CONFIG 
} from '../services/salaryCalculator';

type CalcMode = 'GROSS_TO_NET' | 'NET_TO_GROSS';
type Regulation = PeriodMode;
type InsuranceBase = InsuranceMode;

const LAW = {
  VUNG: [
    { id: 1, name: 'Vùng I', salary: REGULATION_CONFIG.REGION_2024.regionalMinSalaries[1] },
    { id: 2, name: 'Vùng II', salary: REGULATION_CONFIG.REGION_2024.regionalMinSalaries[2] },
    { id: 3, name: 'Vùng III', salary: REGULATION_CONFIG.REGION_2024.regionalMinSalaries[3] },
    { id: 4, name: 'Vùng IV', salary: REGULATION_CONFIG.REGION_2024.regionalMinSalaries[4] }
  ],
  REGULATIONS: {
    REGION_2024: {
      label: 'Từ 01/07/2024 - 31/12/2025',
    },
    REGION_2026: {
      label: 'Từ 01/01/2026',
    }
  }
};

const formatVND = (value: number) => {
  if (isNaN(value)) return '0 đ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(value));
};

const parseVND = (str: string) => {
  const numeric = str.replace(/\D/g, '');
  if (!numeric) return 0;
  return parseInt(numeric, 10) || 0;
};

// --- MAIN COMPONENT ---
export default function SalaryCalculator() {
  const [mode, setMode] = useState<CalcMode>('GROSS_TO_NET');
  const [regulation, setRegulation] = useState<Regulation>('REGION_2024');
  const [amountStr, setAmountStr] = useState('20,000,000');
  const [dependents, setDependents] = useState(0);
  const [insuranceType, setInsuranceType] = useState<InsuranceBase>('OFFICIAL');
  const [customInsuranceStr, setCustomInsuranceStr] = useState('10,000,000');
  const [regionId, setRegionId] = useState(1);

  const [activeTab, setActiveTab] = useState<'details' | 'tax'>('details');

  const amount = parseVND(amountStr);
  const customInsurance = parseVND(customInsuranceStr);
  const region = LAW.VUNG.find(v => v.id === regionId)!;

  const results = useMemo(() => {
    const calcParams = {
      grossIncome: mode === 'GROSS_TO_NET' ? amount : 0, 
      dependentCount: dependents,
      region: regionId as 1 | 2 | 3 | 4,
      period: regulation,
      insuranceMode: insuranceType,
      customInsuranceSalary: customInsurance
    };

    if (mode === 'GROSS_TO_NET') {
      return calculateGrossToNet(calcParams);
    } else {
      return calculateNetToGross({ ...calcParams, targetNetIncome: amount });
    }
  }, [mode, regulation, amount, dependents, insuranceType, customInsurance, regionId]);

  const handleAmountChange = (val: string) => {
    const numeric = val.replace(/\D/g, '');
    setAmountStr(new Intl.NumberFormat('en-US').format(Number(numeric)));
  };

  return (
    <section id="salary-tool" className="py-20 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4"
          >
            <Banknote className="w-4 h-4" />
            <span>Chuẩn xác 100% Thuế & Bảo hiểm 2024-2026</span>
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
            Công cụ tính lương
          </h2>
          <div className="flex justify-center space-x-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl w-fit mx-auto">
            <button 
              onClick={() => setMode('GROSS_TO_NET')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${mode === 'GROSS_TO_NET' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              GROSS &rarr; NET
            </button>
            <button 
              onClick={() => setMode('NET_TO_GROSS')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${mode === 'NET_TO_GROSS' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              NET &rarr; GROSS
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: INPUTS */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-emerald-500" />
                Thiết lập thông số
              </h3>

              <div className="space-y-6">
                {/* Regulation Choice */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Áp dụng quy định</label>
                  <div className="grid grid-cols-1 gap-2">
                    {(Object.keys(LAW.REGULATIONS) as Regulation[]).map((reg) => (
                      <button
                        key={reg}
                        onClick={() => setRegulation(reg)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${regulation === reg ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                      >
                        <span className="text-sm font-medium">{LAW.REGULATIONS[reg].label}</span>
                        {regulation === reg && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    {mode === 'GROSS_TO_NET' ? 'Lương Gross (VND)' : 'Lương Net (VND)' }
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={amountStr}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 font-bold">đ</div>
                  </div>
                </div>

                {/* Dependents & Region */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CustomNumberInput 
                    label="Số người phụ thuộc"
                    value={dependents}
                    onChange={setDependents}
                    icon={<Users className="w-5 h-5" />}
                  />
                  <CustomSelect 
                    label="Vùng đóng BH"
                    value={regionId}
                    options={LAW.VUNG}
                    onChange={setRegionId}
                    icon={<MapPin className="w-5 h-5" />}
                  />
                </div>

                {/* Insurance Mode */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Mức lương đóng bảo hiểm</label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      onClick={() => setInsuranceType('OFFICIAL')}
                      className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${insuranceType === 'OFFICIAL' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-white'}`}
                    >
                      TRÊN LƯƠNG CHÍNH THỨC
                    </button>
                    <button
                      onClick={() => setInsuranceType('OTHER')}
                      className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${insuranceType === 'OTHER' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-white'}`}
                    >
                      MỨC LƯƠNG KHÁC
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {insuranceType === 'OTHER' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="relative mt-2">
                           <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                           <input
                            type="text"
                            value={customInsuranceStr}
                            onChange={(e) => {
                              const numeric = e.target.value.replace(/\D/g, '');
                              setCustomInsuranceStr(new Intl.NumberFormat('en-US').format(Number(numeric)));
                            }}
                            className="w-full bg-slate-950 border border-emerald-500/30 rounded-xl pl-12 pr-12 py-3 text-emerald-400 focus:outline-none focus:border-emerald-500 font-mono"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-xs">VND</div>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 italic px-1">* Phải bằng ít nhất Lương tối thiểu vùng ({formatVND(region.salary)})</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="lg:col-span-7 space-y-8">
            {/* Main Result Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">LƯƠNG GROSS</p>
                    <p className="text-2xl md:text-3xl font-display font-black text-white">{formatVND(results.grossIncome)}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">LƯƠNG NET (THỰC NHẬN)</p>
                    <p className="text-3xl md:text-4xl font-display font-black text-emerald-500 tracking-tighter shadow-emerald-500/10 drop-shadow-sm">
                      {formatVND(results.netIncome)}
                    </p>
                  </div>
               </div>
            </div>

            {/* Tabs */}
            <div className="space-y-4">
              <div className="flex space-x-1 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
                <button 
                  onClick={() => setActiveTab('details')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'details' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}
                >
                  DIỄN GIẢI CHI TIẾT
                </button>
                <button 
                  onClick={() => setActiveTab('tax')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'tax' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}
                >
                   BẢNG THUẾ TNCN
                </button>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
                {activeTab === 'details' ? (
                  <div className="p-6 space-y-8">
                    {/* Employee Deductions */}
                    <table className="w-full text-left">
                      <tbody className="divide-y divide-slate-800/50">
                        <tr className="group">
                          <td className="py-4 text-slate-400 group-hover:text-white transition-colors">Lương cơ sở tính bảo hiểm</td>
                          <td className="py-4 text-right font-bold text-white">{formatVND(results.configUsed.insuranceSalaryUsed)}</td>
                        </tr>
                        <tr className="group">
                          <td className="py-4 text-slate-400 group-hover:text-white transition-colors">Bảo hiểm xã hội (8%)</td>
                          <td className="py-4 text-right font-medium text-red-400">-{formatVND(results.employeeInsurance.bhxh)}</td>
                        </tr>
                        <tr className="group">
                          <td className="py-4 text-slate-400 group-hover:text-white transition-colors">Bảo hiểm y tế (1.5%)</td>
                          <td className="py-4 text-right font-medium text-red-400">-{formatVND(results.employeeInsurance.bhyt)}</td>
                        </tr>
                        <tr className="group">
                          <td className="py-4 text-slate-400 group-hover:text-white transition-colors">Bảo hiểm thất nghiệp (1%)</td>
                          <td className="py-4 text-right font-medium text-red-400">-{formatVND(results.employeeInsurance.bhtn)}</td>
                        </tr>
                        <tr className="bg-slate-950/40">
                          <td className="py-4 pl-4 text-slate-300 font-bold uppercase text-[10px] tracking-widest">Thu nhập trước thuế</td>
                          <td className="py-4 pr-4 text-right font-black text-white">{formatVND(results.incomeBeforeTax)}</td>
                        </tr>
                        <tr className="group">
                          <td className="py-4 text-slate-400 group-hover:text-white transition-colors">
                            Giảm trừ bản thân
                          </td>
                          <td className="py-4 text-right font-medium text-slate-500">-{formatVND(results.personalDeduction)}</td>
                        </tr>
                        <tr className="group">
                          <td className="py-4 text-slate-400 group-hover:text-white transition-colors">
                            Giảm trừ người phụ thuộc ({dependents} người)
                          </td>
                          <td className="py-4 text-right font-medium text-slate-500">-{formatVND(results.dependentDeduction)}</td>
                        </tr>
                        <tr className="group">
                          <td className="py-4 text-slate-400 group-hover:text-white transition-colors">Thu nhập chịu thuế</td>
                          <td className="py-4 text-right font-bold text-amber-500">{formatVND(results.taxableIncome)}</td>
                        </tr>
                        <tr className="group">
                          <td className="py-4 text-slate-400 group-hover:text-white transition-colors">Thuế thu nhập cá nhân (TNCN)</td>
                          <td className="py-4 text-right font-black text-red-500">-{formatVND(results.personalIncomeTax)}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Employer Contributions */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Người sử dụng lao động trả</h4>
                      <table className="w-full text-left">
                        <tbody className="divide-y divide-slate-800/50">
                          <tr className="group">
                            <td className="py-4 text-slate-400 group-hover:text-white transition-colors">Lương GROSS</td>
                            <td className="py-4 text-right font-bold text-white">{formatVND(results.grossIncome)}</td>
                          </tr>
                          <tr className="group">
                            <td className="py-4 text-slate-400 group-hover:text-white transition-colors">BHXH (17%)</td>
                            <td className="py-4 text-right font-medium text-slate-300">{formatVND(results.employerInsurance.bhxh)}</td>
                          </tr>
                          <tr className="group">
                            <td className="py-4 text-slate-400 group-hover:text-white transition-colors">Bảo hiểm tai nạn lao động, bệnh nghề nghiệp (0,5%)</td>
                            <td className="py-4 text-right font-medium text-slate-300">{formatVND(results.employerInsurance.bhtnldBnn)}</td>
                          </tr>
                          <tr className="group">
                            <td className="py-4 text-slate-400 group-hover:text-white transition-colors">BHYT (3%)</td>
                            <td className="py-4 text-right font-medium text-slate-300">{formatVND(results.employerInsurance.bhyt)}</td>
                          </tr>
                          <tr className="group">
                            <td className="py-4 text-slate-400 group-hover:text-white transition-colors">BHTN (1%)</td>
                            <td className="py-4 text-right font-medium text-slate-300">{formatVND(results.employerInsurance.bhtn)}</td>
                          </tr>
                          <tr className="bg-slate-950/40 border-t border-slate-700">
                            <td className="py-4 pl-4 text-emerald-500 font-bold uppercase text-[10px] tracking-widest">Tổng chi phí doanh nghiệp đóng</td>
                            <td className="py-4 pr-4 text-right text-lg font-black text-emerald-500">{formatVND(results.employerTotalCost)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="bg-slate-950/50 rounded-2xl border border-slate-800 p-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Tổng tiền thuế</span>
                        <span className="text-xl font-black text-amber-500">{formatVND(results.personalIncomeTax)}</span>
                      </div>
                    </div>
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-slate-600 border-b border-slate-800 uppercase tracking-widest text-[9px] font-black">
                          <td className="pb-4">Bậc Thuế</td>
                          <td className="pb-4">Lương chịu thuế</td>
                          <td className="pb-4">% Thuế suất</td>
                          <td className="pb-4 text-right">Tiền nộp</td>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/30">
                        {results.taxDetails.map((b) => (
                          <tr key={b.level} className="hover:bg-white/5 transition-colors">
                            <td className="py-4 font-bold text-slate-300">Bậc {b.level}</td>
                            <td className="py-4 text-slate-400">{formatVND(b.taxableAmount)}</td>
                            <td className="py-4 font-mono text-emerald-400 font-bold">{b.rate}%</td>
                            <td className="py-4 text-right font-black text-white">{formatVND(b.taxAmount)}</td>
                          </tr>
                        ))}
                        {results.taxDetails.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-12 text-center text-slate-600 italic">Thu nhập tính thuế = 0. Không phát sinh thuế TNCN.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Ad */}
            <a 
              href="https://zalo.me/0858849936"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 flex items-start space-x-6 relative group cursor-pointer hover:bg-emerald-500/15 transition-all block"
            >
              <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-white mb-2">Chuyên gia Kế toán & Thuế hàng đầu</h4>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Kế toán tiền lương, Bảo hiểm xã hội và Thuế TNCN là rào cản pháp lý lớn đối với doanh nghiệp. 
                  Veratax cung cấp giải pháp trọn gói, giúp bạn tối ưu chi phí và đảm bảo an toàn tuyệt đối trước mọi đợt thanh tra.
                </p>
                <div className="inline-flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                  <span>Chat với chuyên viên tư vấn ngay</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
