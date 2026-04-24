import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  FileText, 
  Receipt, 
  Users, 
  Search, 
  Scale, 
  RotateCcw, 
  Eraser 
} from 'lucide-react';

const services = [
  {
    id: 1,
    title: 'Thành lập doanh nghiệp',
    desc: 'Tư vấn loại hình, vốn, ngành nghề, người đại diện, địa chỉ, hồ sơ thuế ban đầu, chữ ký số và hóa đơn điện tử.',
    icon: Building2,
    color: 'bg-blue-500'
  },
  {
    id: 2,
    title: 'Kế toán thuế trọn gói',
    desc: 'Tiếp nhận chứng từ, kiểm tra hóa đơn, hạch toán, kê khai thuế, lập báo cáo tài chính, quyết toán thuế và lưu trữ hồ sơ.',
    icon: FileText,
    color: 'bg-sky-500'
  },
  {
    id: 3,
    title: 'Hóa đơn & Xuất hóa đơn',
    desc: 'Hỗ trợ lập hóa đơn theo chứng từ hợp lệ, kiểm tra thông tin, theo dõi hóa đơn đầu vào đầu ra, xử lý sai sót và đối chiếu doanh thu.',
    icon: Receipt,
    color: 'bg-indigo-500'
  },
  {
    id: 4,
    title: 'Theo dõi Bảo hiểm xã hội',
    desc: 'Theo dõi lao động, báo tăng giảm, điều chỉnh mức đóng, đối chiếu bảng lương, hợp đồng lao động, thuế TNCN và nghĩa vụ BHXH.',
    icon: Users,
    color: 'bg-teal-500'
  },
  {
    id: 5,
    title: 'Rà soát sổ sách & Rủi ro',
    desc: 'Kiểm tra hóa đơn, hợp đồng, chi phí, lương, bảo hiểm, tờ khai và báo cáo tài chính để phát hiện và cảnh báo rủi ro kịp thời.',
    icon: Search,
    color: 'bg-amber-500'
  },
  {
    id: 6,
    title: 'Tư vấn pháp lý DN',
    desc: 'Hỗ trợ thay đổi đăng ký kinh doanh, bổ sung ngành nghề, thay đổi vốn, người đại diện, tạm ngừng kinh doanh và hồ sơ nội bộ.',
    icon: Scale,
    color: 'bg-violet-500'
  },
  {
    id: 7,
    title: 'Hoàn thuế GTGT',
    desc: 'Rà soát điều kiện, kiểm tra hóa đơn, thanh toán, hợp đồng, tờ khai, sổ kế toán và chuẩn bị hồ sơ giải trình chi tiết.',
    icon: RotateCcw,
    color: 'bg-emerald-500'
  },
  {
    id: 8,
    title: 'Giải thể doanh nghiệp',
    desc: 'Rà soát thuế, hóa đơn, báo cáo tài chính, lao động, bảo hiểm, công nợ, đóng mã số thuế và hoàn tất mọi thủ tục pháp lý.',
    icon: Eraser,
    color: 'bg-rose-500'
  }
];

export default function Services() {
  return (
    <section id="services" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-emerald-600 font-bold tracking-widest text-sm uppercase mb-4"
          >
            Hệ sinh thái dịch vụ
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-slate-900 mb-6"
          >
            Giúp doanh nghiệp vận hành <span className="text-emerald-600">toàn diện</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600"
          >
            Từ những hồ sơ pháp lý ban đầu đến các nghĩa vụ vận hành định kỳ hằng tháng, hằng năm.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
            >
              <div className={`w-14 h-14 rounded-2xl ${service.color} flex items-center justify-center mb-8 shadow-lg shadow-current/20 text-white transform group-hover:scale-110 transition-transform duration-500`}>
                <service.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-display font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors">
                {service.title}
              </h3>
              <p className="text-slate-600 text-[15px] leading-relaxed">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
