import React from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Facebook, Linkedin, ShieldCheck, ChevronRight } from 'lucide-react';
import { seoKeywords } from '../data/keywords';
import logo from '../assest/logo.png';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center space-x-3 text-white">
              <div className="bg-white p-1 rounded-full"><img src={logo} alt="Veratax Logo" className="w-14 h-14 object-contain rounded-full" /></div>
              <span className="text-4xl font-display font-bold tracking-tight">VERATAX</span>
            </div>
            <p className="text-sm leading-relaxed">
              Đối tác đồng hành toàn diện về pháp lý, kế toán, thuế, hóa đơn và bảo hiểm xã hội. Giúp doanh nghiệp vận hành đúng luật, kiểm soát rủi ro ngay từ những nghiệp vụ phát sinh hàng ngày.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-display font-semibold mb-6">Dịch vụ chính</h3>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Dịch vụ Kế toán thuế</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Theo dõi Bảo hiểm xã hội</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Hóa đơn điện tử</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Thành lập doanh nghiệp</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Hoàn thuế GTGT</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Giải thể doanh nghiệp</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-display font-semibold mb-6">Liên kết hữu ích</h3>
            <ul className="space-y-4 text-sm">
              <li><a href="#why-us" className="hover:text-white transition-colors">Về chúng tôi</a></li>
              <li><a href="#process" className="hover:text-white transition-colors">Quy trình làm việc</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Câu hỏi thường gặp</a></li>
              <li><a href="https://thuvienphapluat.vn/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Tin tức & Pháp luật</a></li>
              <li><a href="https://zalo.me/0858849936" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Liên hệ tư vấn</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-display font-semibold mb-6">Thông tin liên hệ</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>323 Cách Mạng Tháng Tám, Phường Hòa Hưng, Thành phố Hồ Chí Minh, Việt Nam</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>0865 394 946</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>veratax.ad@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs">
            <p>© {currentYear} CÔNG TY TNHH VERATAX. Tất cả quyền được bảo lưu.</p>
            <div className="flex space-x-6 mb-4 md:mb-0">
              <a href="#privacy" className="hover:text-white transition-colors">Chính sách bảo mật</a>
              <a href="#terms" className="hover:text-white transition-colors">Điều khoản dịch vụ</a>
            </div>
          </div>
          
          <div className="sr-only">
            {seoKeywords.join(', ')}
          </div>
        </div>
      </div>
    </footer>
  );
}
