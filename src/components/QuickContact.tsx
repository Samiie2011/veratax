import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle, AlertCircle, Loader2, ChevronDown } from 'lucide-react';

export default function QuickContact() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: 'Kế toán trọn gói',
    message: ''
  });

  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const validatePhone = (phone: string) => {
    const regex = /^(0[3|5|7|8|9])([0-9]{8})$/;
    return regex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhone(formData.phone)) {
      setErrorMsg('Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0).');
      setStatus('error');
      return;
    }

    setStatus('sending');
    setErrorMsg('');

    try {
      const formattedMessage = `Họ và tên: ${formData.name}\nSố điện thoại: ${formData.phone}\nDịch vụ quan tâm: ${formData.service}\nLời nhắn: ${formData.message || 'Không có'}`;
      
      // Attempt to send to webhook if URL is provided, but don't fail if it doesn't work
      const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;
      
      if (webhookUrl && webhookUrl !== '') {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...formData,
              formattedMessage,
              source: 'Veratax Web',
              timestamp: new Date().toISOString()
            }),
          });
        } catch (webhookError) {
          console.warn('Webhook delivery failed, proceeding to Zalo redirect:', webhookError);
        }
      }

      // Copy message to clipboard so user can easily paste in Zalo
      try {
        await navigator.clipboard.writeText(formattedMessage);
      } catch (clipboardError) {
        console.warn('Clipboard write failed:', clipboardError);
      }

      setStatus('success');
      
      // Auto redirect to Zalo
      setTimeout(() => {
        window.open('https://zalo.me/0858849936', '_blank');
        setFormData({ name: '', phone: '', service: 'Kế toán trọn gói', message: '' });
        // Don't reset status immediately so they can see the success message
      }, 2000);

    } catch (error: any) {
      console.error('Unexpected error:', error);
      setStatus('error');
      setErrorMsg('Có lỗi xảy ra. Vui lòng chat trực tiếp qua nút Zalo ở góc màn hình.');
    }
  };

  return (
    <section id="contact-form" className="py-16 bg-slate-950">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 md:p-12 rounded-3xl shadow-2xl"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Nhận Tư Vấn <span className="text-emerald-400 font-black">Miễn Phí</span>
            </h2>
            <p className="text-slate-400">Để lại thông tin, chuyên viên Veratax sẽ liên hệ hỗ trợ bạn trong 5 phút.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Họ và tên</label>
                <input
                  required
                  type="text"
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Số điện thoại (Zalo)</label>
                <input
                  required
                  type="tel"
                  placeholder="0912 345 678"
                  className={`w-full bg-slate-800/50 border ${status === 'error' && errorMsg.includes('Số điện thoại') ? 'border-red-500' : 'border-slate-700'} rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all`}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Dịch vụ quan tâm</label>
              <div className="relative group">
                <select
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                >
                  <option value="Kế toán trọn gói">Dịch vụ kế toán trọn gói</option>
                  <option value="Thành lập doanh nghiệp">Thành lập doanh nghiệp</option>
                  <option value="Thay đổi giấy phép">Thay đổi giấy phép kinh doanh</option>
                  <option value="BHXH - Nhân sự">Bảo hiểm xã hội & Nhân sự</option>
                  <option value="Tư vấn Thuế - Pháp lý">Tư vấn Thuế & Pháp lý</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-emerald-500 transition-colors">
                  <ChevronDown className="w-4 h-4" strokeWidth={3} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Lời nhắn (không bắt buộc)</label>
              <textarea
                rows={3}
                placeholder="Nội dung cần hỗ trợ..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <div className="pt-4">
              <button
                disabled={status === 'sending'}
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-1 flex items-center justify-center space-x-2"
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>ĐANG GỬI...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>GỬI YÊU CẦU NGAY</span>
                  </>
                )}
              </button>
            </div>

            {status === 'success' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center space-x-3 text-emerald-400"
              >
                <CheckCircle className="w-6 h-6 flex-shrink-0" />
                <p className="text-sm font-medium">Gửi thành công! Nội dung yêu cầu đã được tự động sao chép. Bạn chỉ cần dán (Paste) và gửi trong Zalo!</p>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-3 text-red-400"
              >
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <p className="text-sm font-medium">{errorMsg}</p>
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}
