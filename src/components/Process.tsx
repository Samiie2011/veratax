import React from 'react';
import { motion } from 'motion/react';

const steps = [
  {
    number: '01',
    title: 'Tiếp nhận tình trạng',
    desc: 'Xác định doanh nghiệp đang ở giai đoạn nào: mới thành lập, đang vận hành, cần hoàn thuế hay giải thể.'
  },
  {
    number: '02',
    title: 'Kiểm tra hồ sơ nền',
    desc: 'Rà soát giấy phép, hồ sơ thuế, hóa đơn, tài khoản điện tử, hợp đồng và tình trạng lao động hiện tại.'
  },
  {
    number: '03',
    title: 'Phân loại nghĩa vụ',
    desc: 'Phân loại các nghĩa vụ pháp lý, hóa đơn, kế toán, thuế và bảo hiểm theo mức độ ưu tiên cần xử lý.'
  },
  {
    number: '04',
    title: 'Đề xuất phương án',
    desc: 'Trình bày rõ phạm vi công việc, hồ sơ cần bổ sung, thời hạn thực hiện, chi phí và trách nhiệm của hai bên.'
  },
  {
    number: '05',
    title: 'Thực hiện định kỳ',
    desc: 'Hỗ trợ kê khai, xuất hóa đơn, hạch toán, theo dõi BHXH, báo cáo số liệu và nhắc hạn nghĩa vụ thường xuyên.'
  },
  {
    number: '06',
    title: 'Báo cáo & Cảnh báo',
    desc: 'Bàn giao kết quả, lưu trữ hồ sơ, cập nhật quy định mới và cảnh báo rủi ro phát sinh trong vận hành.'
  }
];

export default function Process() {
  return (
    <section id="process" className="section-padding bg-slate-900 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-emerald-500/10 blur-[120px] -z-0" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-emerald-600/10 blur-[100px] -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-tight"
            >
              Quy trình vận hành đồng bộ, <span className="text-emerald-500">không bỏ sót</span> nghĩa vụ
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:text-right"
          >
            <p className="text-slate-400 max-w-sm ml-auto">
              Chúng tôi áp dụng quy trình rà soát đa lớp để đảm bảo hồ sơ của bạn luôn an toàn trước mọi kỳ thanh tra.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="text-7xl font-display font-black text-white/5 absolute -top-8 -left-4 group-hover:text-emerald-500/10 transition-colors duration-500">
                {step.number}
              </div>
              <div className="relative">
                <div className="w-10 h-1 bg-emerald-500 mb-6" />
                <h3 className="text-xl font-display font-bold mb-4">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
