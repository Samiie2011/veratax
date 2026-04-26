import React from 'react';

export default function TermsOfService() {
  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-slate-300">
      <h1 className="text-3xl font-display font-bold mb-8 text-white border-b border-slate-800 pb-4">Điều khoản dịch vụ</h1>
      <div className="space-y-6 text-[15px] leading-relaxed">
        <p>Khi sử dụng dịch vụ tại <strong>VERATAX</strong>, khách hàng đồng ý tuân thủ các điều khoản và quy định dưới đây. Các điều khoản này nhằm đảm bảo quyền lợi và trách nhiệm của cả hai bên trong suốt quá trình hợp tác.</p>
        
        <h2 className="text-xl font-bold mt-8 mb-4 text-white">1. Phạm vi dịch vụ</h2>
        <p>Veratax cung cấp các dịch vụ bao gồm nhưng không giới hạn: thành lập doanh nghiệp, kế toán thuế trọn gói, quyết toán thuế, bảo hiểm xã hội, rà soát sổ sách và hỗ trợ hoàn thuế. Phạm vi chi tiết của từng hạng mục sẽ được làm rõ trong Hợp đồng Dịch vụ của từng khách hàng.</p>

        <h2 className="text-xl font-bold mt-8 mb-4 text-white">2. Trách nhiệm của Veratax</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Thực hiện công việc đúng tiến độ, đảm bảo số liệu chuẩn xác tuân thủ các quy định hiện hành về kế toán - thuế.</li>
          <li>Bảo mật tuyệt đối thông tin dữ liệu doanh nghiệp trong và kể cả sau khi chấm dứt hợp đồng.</li>
          <li>Cảnh báo kịp thời các rủi ro pháp lý, thuế và đề xuất phương án giải quyết tối ưu.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-4 text-white">3. Trách nhiệm của khách hàng</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Cung cấp đầy đủ, trung thực, kịp thời các chứng từ, hóa đơn, thông tin cần thiết phục vụ cho việc lập báo cáo định kỳ.</li>
          <li>Chịu trách nhiệm trước pháp luật về tính hợp lý, hợp pháp của chứng từ bàn giao cho Veratax.</li>
          <li>Thanh toán phí dịch vụ đúng hạn theo phụ lục hợp đồng đã ký kết.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-4 text-white">4. Hiệu lực và Chấm dứt</h2>
        <p>Các điều khoản này có hiệu lực từ thời điểm doanh nghiệp bắt đầu sử dụng dịch vụ của Veratax. Cả hai bên có quyền chấm dứt thỏa thuận theo các điều kiện được quy định cụ thể tại Hợp đồng chính thức. Mọi nghĩa vụ chưa hoàn tất, bao gồm bàn giao sổ sách và thanh toán phí cần được giải quyết đầy đủ trước khi chấm dứt.</p>
      </div>
    </div>
  );
}
