import React from 'react';
import { motion } from 'motion/react';
import { Briefcase, Zap, UserCheck, ShieldCheck } from 'lucide-react';

const reasons = [
  {
    title: 'Đồng bộ 5 lớp hồ sơ',
    desc: 'Pháp lý, hóa đơn, kế toán, thuế và bảo hiểm xã hội luôn được đặt trong mối quan hệ gắn kết và nhất quán.',
    icon: ShieldCheck
  },
  {
    title: 'Kiểm soát rủi ro hằng ngày',
    desc: 'Không đợi đến cuối năm, chúng tôi rà soát rủi ro ngay từ khi bạn ký hợp đồng, xuất hóa đơn và thanh toán.',
    icon: Zap
  },
  {
    title: 'Đầu mối quản lý duy nhất',
    desc: 'Thay vì làm việc với nhiều bên rời rạc, bạn chỉ cần một đầu mối chuyên nghiệp để theo dõi mọi nghĩa vụ vận hành.',
    icon: UserCheck
  },
  {
    title: 'Tư vấn theo hồ sơ thực tế',
    desc: 'Mọi phương án tài chính và pháp lý đều dựa trên con số thực, quy mô chứng từ và mục tiêu thực tế của doanh nghiệp.',
    icon: Briefcase
  }
];

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="section-padding bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-emerald-600 font-bold tracking-widest text-sm uppercase mb-4">Giá trị cốt lõi</div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-8 leading-tight">
              Chúng tôi không chỉ xử lý việc, <br />
              Chúng tôi giúp bạn <span className="text-emerald-600">kiểm soát hệ thống</span>
            </h2>
            
            <div className="space-y-10">
              {reasons.map((reason, index) => (
                <div key={index} className="flex items-start space-x-6">
                  <div className="w-12 h-12 shrink-0 bg-emerald-50 rounded-2xl flex items-center justify-center">
                    <reason.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold text-slate-900 mb-2">{reason.title}</h3>
                    <p className="text-slate-600 text-[15px] leading-relaxed italic border-l-2 border-slate-100 pl-4">
                      {reason.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-emerald-500/5 rounded-[40px] transform rotate-3" />
            <div className="relative z-10 w-full p-8 md:p-12 rounded-[40px] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50">
              <div className="space-y-8">
                <div className="inline-block px-4 py-2 bg-emerald-50 rounded-full text-emerald-700 text-xs font-bold uppercase tracking-wider">Bảo mật & Trách nhiệm</div>
                <p className="text-2xl font-display font-medium text-slate-800 leading-snug">
                  “Dữ liệu tài chính và nhân sự là tài sản lớn của doanh nghiệp. Veratax cam kết bảo mật tuyệt đối và chịu trách nhiệm cao nhất trên mọi hồ sơ chúng tôi xử lý.”
                </p>
                
                <div className="pt-8 border-t border-slate-100 flex items-center space-x-4">
                  <div className="w-16 h-1 bg-emerald-600" />
                  <span className="text-slate-500 font-medium tracking-tight">CÔNG TY TNHH VERATAX</span>
                </div>
              </div>
              
              <div className="mt-12 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 text-center">
                  <div className="text-3xl font-display font-bold text-emerald-600 mb-1">100%</div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Đúng hạn nghĩa vụ</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 text-center">
                  <div className="text-3xl font-display font-bold text-emerald-600 mb-1">0%</div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Rủi ro bỏ sót tin</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
