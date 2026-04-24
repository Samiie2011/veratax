import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, ShieldAlert, ZapOff, Clock, TrendingDown } from 'lucide-react';

const problems = [
  {
    title: 'Thành lập nhưng chưa thiết lập quy trình',
    desc: 'Mới mở công ty nhưng chưa có hồ sơ thuế, hóa đơn và lộ trình kế toán bài bản ban đầu.',
    icon: ShieldAlert
  },
  {
    title: 'Hóa đơn chưa đồng bộ chứng từ',
    desc: 'Xuất hóa đơn nhưng thiếu hợp đồng, biên bản nghiệm thu hoặc không đúng thời điểm quy định.',
    icon: ZapOff
  },
  {
    title: 'Rủi ro hóa đơn đầu vào',
    desc: 'Chưa kiểm tra tính hợp lệ của nhà cung cấp, dễ dẫn đến bị loại chi phí, bác bỏ thuế GTGT.',
    icon: AlertCircle
  },
  {
    title: 'Hồ sơ lao động & BHXH rời rạc',
    desc: 'Hợp đồng lao động, bảng lương và BHXH không khớp nhau, tiềm ẩn rủi ro truy thu lớn.',
    icon: Clock
  },
  {
    title: 'Báo tăng giảm BHXH chậm trễ',
    desc: 'Dẫn đến sai lệch chi phí lương, khó giải trình khi cơ quan chức năng thanh kiểm tra.',
    icon: TrendingDown
  },
  {
    title: 'Khó khăn khi giải thể, hoàn thuế',
    desc: 'Muốn dừng hoạt động hoặc hoàn thuế nhưng vướng mắc về sổ sách, hóa đơn và công nợ chưa xử lý.',
    icon: AlertCircle
  }
];

export default function PainPoints() {
  return (
    <section className="section-padding bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-6 leading-tight"
          >
            Doanh nghiệp không chỉ rủi ro vì sai thuế, mà còn vì <span className="text-emerald-600">thiếu đồng bộ</span> giữa pháp lý & vận hành
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 leading-relaxed"
          >
            Một doanh nghiệp vận hành an toàn cần đồng bộ năm lớp hồ sơ: pháp lý, hóa đơn, kế toán, thuế và lao động bảo hiểm.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {problems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-t-full" />
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
                <item.icon className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-display font-bold text-slate-900 mb-4">{item.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 p-8 rounded-2xl bg-slate-900 text-white text-center"
        >
          <p className="text-lg md:text-xl font-medium">
            “Đừng để những sai sót nghiệp vụ nhỏ hằng ngày trở thành <span className="text-red-500">gánh nặng pháp lý</span> khổng lồ trong tương lai.”
          </p>
        </motion.div>
      </div>
    </section>
  );
}
