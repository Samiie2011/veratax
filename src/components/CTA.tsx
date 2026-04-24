import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, FileUp, Sparkles } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-24 bg-[#0f172a] relative overflow-hidden">
      {/* Decorative stars/dots */}
      <div className="absolute top-10 left-10 text-emerald-500/20"><Sparkles className="w-12 h-12" /></div>
      <div className="absolute bottom-10 right-10 text-emerald-500/20 rotate-180"><Sparkles className="w-12 h-12" /></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-display font-bold text-white mb-8 leading-tight"
          >
            Doanh nghiệp của bạn đang cần kiểm soát pháp lý, hóa đơn, thuế hay bảo hiểm xã hội?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-400 mb-12 leading-relaxed"
          >
            Hãy để chúng tôi rà soát tình trạng hiện tại và đề xuất lộ trình xử lý phù hợp. Mọi nghĩa vụ cần được xử lý đúng thời điểm và chuẩn xác từng hồ sơ.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <a href="https://zalo.me/0858849936" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-red-600 hover:bg-red-500 text-white px-10 py-5 rounded-full font-display font-bold transition-all shadow-2xl shadow-red-600/30 active:scale-95">
              <MessageSquare className="w-6 h-6" />
              <span>Nhận tư vấn theo tình trạng</span>
            </a>
            
            <a href="https://zalo.me/0858849936" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-white hover:bg-slate-100 text-slate-900 px-10 py-5 rounded-full font-display font-bold transition-all shadow-xl active:scale-95">
              <FileUp className="w-6 h-6" />
              <span>Gửi hồ sơ rà soát sơ bộ</span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
