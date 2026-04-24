import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Hero() {
  const points = [
    'Thành lập và thay đổi pháp lý doanh nghiệp',
    'Kế toán thuế định kỳ, báo cáo tài chính',
    'Theo dõi hóa đơn điện tử, rà soát rủi ro',
    'Theo dõi lao động, bảng lương & BHXH',
    'Hỗ trợ hoàn thuế và giải thể doanh nghiệp',
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 overflow-hidden bg-[#0f172a]">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-900/20 to-transparent blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-emerald-900/10 to-transparent blur-2xl -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-400 text-xs font-semibold mb-6 tracking-wide uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Đối tác đồng hành toàn diện</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-display font-bold leading-[1.15] mb-6">
              Dịch vụ pháp lý, kế toán, thuế, hóa đơn & bảo hiểm cho doanh nghiệp vận hành <span className="text-emerald-500">an toàn, đúng luật</span>
            </h1>
            
            <p className="text-lg text-slate-400 font-medium mb-8 max-w-xl leading-relaxed">
              Chúng tôi đồng hành cùng doanh nghiệp suốt vòng đời vận hành. Không chỉ là kế toán thuế, Veratax là bộ phận trợ lý pháp lý và vận hành chuyên sâu cho mọi chủ doanh nghiệp.
            </p>
            
            <div className="space-y-4 mb-10">
              {points.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center space-x-3 text-slate-300"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-sm md:text-base">{point}</span>
                </motion.div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <a href="https://zalo.me/0858849936" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full font-bold transition-all shadow-xl shadow-red-600/30 active:scale-95 group w-full sm:w-auto">
                <span>Nhận tư vấn theo tình trạng</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#services" className="flex items-center justify-center space-x-2 border border-slate-700 hover:border-slate-500 text-white px-8 py-4 rounded-full font-bold transition-all active:scale-95 w-full sm:w-auto">
                <span>Xem hệ sinh thái dịch vụ</span>
              </a>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 p-8 rounded-3xl overflow-hidden glass-morphism bg-white/5 border-white/10 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&q=80&w=1470"
                alt="Business professional consulting"
                className="rounded-2xl w-full h-[500px] object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-60" />
              
              <div className="absolute bottom-12 left-12 right-12 text-white">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl">
                  <p className="text-sm font-medium text-emerald-400 mb-2">Định vị thương hiệu</p>
                  <p className="text-xl font-display font-medium leading-tight">
                    “Giúp doanh nghiệp vận hành đúng luật, đủ hồ sơ, đúng hạn nghĩa vụ và kiểm soát rủi ro từ những nghiệp vụ nhỏ nhất.”
                  </p>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-600/20 backdrop-blur-xl border border-emerald-500/30 rounded-2xl -z-10"
            />
            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-600/10 backdrop-blur-xl border border-red-500/20 rounded-full -z-10"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
