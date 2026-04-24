import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'Doanh nghiệp mới thành lập khi nào cần đăng ký hóa đơn điện tử?',
    answer: 'Ngay sau khi nhận Giấy chứng nhận Đăng ký doanh nghiệp và mở tài khoản ngân hàng, doanh nghiệp cần làm thủ tục thông báo phát hành hóa đơn điện tử để phục vụ hoạt động kinh doanh ngay lập tức.'
  },
  {
    question: 'Khi nào doanh nghiệp bắt buộc phải xuất hóa đơn?',
    answer: 'Theo quy định, hóa đơn phải được lập tại thời điểm chuyển giao quyền sở hữu hoặc quyền sử dụng hàng hóa, cung cấp dịch vụ cho người mua, không phân biệt đã thu được tiền hay chưa.'
  },
  {
    question: 'Người lao động thử việc có phải tham gia bảo hiểm xã hội không?',
    answer: 'Theo Luật Bảo hiểm xã hội hiện hành, người lao động có hợp đồng thử việc dưới 1 tháng không thuộc đối tượng tham gia BHXH bắt buộc. Tuy nhiên, nếu là hợp đồng lao động có thời hạn thử việc từ 1 tháng trở lên thì bắt buộc phải tham gia.'
  },
  {
    question: 'Chi phí lương cần hồ sơ gì để được tính là chi phí được trừ?',
    answer: 'Cần đồng bộ 4 lớp hồ sơ: Hợp đồng lao động, Bảng chấm công, Bảng thanh toán tiền lương và Chứng từ thanh toán.'
  },
  {
    question: 'Dịch vụ kế toán thuế của Veratax có bao gồm theo dõi BHXH không?',
    answer: 'Veratax cung cấp giải pháp đồng bộ. Tùy theo gói dịch vụ bạn lựa chọn, chúng tôi có thể bao gồm cả phần theo dõi BHXH và hóa đơn để đảm bảo tính nhất quán cao nhất cho hồ sơ.'
  },
  {
    question: 'Báo tăng, báo giảm BHXH chậm có rủi ro gì?',
    answer: 'Rủi ro lớn nhất là bị truy thu tiền đóng BHXH kèm lãi chậm đóng, đồng thời ảnh hưởng đến quyền lợi của người lao động và gây khó khăn khi quyết toán thuế TNCN.'
  }
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="section-padding bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6"
          >
            <HelpCircle className="w-8 h-8 text-emerald-600" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-display font-bold text-slate-900 mb-4"
          >
            Giải đáp thắc mắc thường gặp
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-600"
          >
            Mọi thắc mắc về pháp lý, hóa đơn, thuế và bảo hiểm xã hội của bạn đều có câu trả lời tại đây.
          </motion.p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <button
                className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-slate-50 transition-colors"
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
              >
                <span className="font-display font-bold text-slate-900 pr-8">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${activeIndex === index ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-6 text-slate-600 text-[15px] leading-relaxed border-t border-slate-50 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
