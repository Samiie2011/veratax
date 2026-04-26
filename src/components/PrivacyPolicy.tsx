import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-slate-300">
      <h1 className="text-3xl font-display font-bold mb-8 text-white border-b border-slate-800 pb-4">Chính sách bảo mật</h1>
      <div className="space-y-6 text-[15px] leading-relaxed">
        <p><strong>CÔNG TY TNHH VERATAX</strong> cam kết bảo vệ thông tin cá nhân và dữ liệu doanh nghiệp của khách hàng theo các tiêu chuẩn bảo mật nghiêm ngặt. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn.</p>
        
        <h2 className="text-xl font-bold mt-8 mb-4 text-white">1. Thu thập thông tin</h2>
        <p>Chúng tôi chỉ thu thập các thông tin cần thiết phục vụ cho việc cung cấp dịch vụ pháp lý, kế toán, thuế và bảo hiểm xã hội, bao gồm: tên người liên hệ, số điện thoại, email, thông tin đăng ký kinh doanh, chữ ký số, hóa đơn, chứng từ và các dữ liệu liên quan khác.</p>

        <h2 className="text-xl font-bold mt-8 mb-4 text-white">2. Sử dụng thông tin</h2>
        <p>Thông tin của bạn được sử dụng vào các mục đích:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Thực hiện các dịch vụ kế toán thuế, xử lý hồ sơ, lập báo cáo,... theo đúng thỏa thuận hợp đồng.</li>
          <li>Liên hệ hỗ trợ, tư vấn và trả lời các yêu cầu của bạn.</li>
          <li>Thay mặt doanh nghiệp nộp tờ khai và làm việc với cơ quan chức năng khi được ủy quyền.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-4 text-white">3. Bảo mật dữ liệu</h2>
        <p>Dữ liệu tài chính, kế toán và pháp lý là tài sản quan trọng. Veratax áp dụng các biện pháp kỹ thuật và tổ chức bảo mật nghiêm ngặt nhằm tránh truy cập trái phép, đánh cắp hay rò rỉ dữ liệu.</p>

        <h2 className="text-xl font-bold mt-8 mb-4 text-white">4. Chia sẻ thông tin</h2>
        <p>Chúng tôi cam kết KHÔNG bán, cho thuê hay trao đổi thông tin khách hàng với bất kỳ bên thứ ba nào, ngoại trừ việc cung cấp dữ liệu cho cơ quan Thuế, BHXH, quan ban ngành liên quan phục vụ trực tiếp cho nghĩa vụ của doanh nghiệp bạn theo quy định pháp luật.</p>

        <h2 className="text-xl font-bold mt-8 mb-4 text-white">5. Thông tin liên hệ</h2>
        <p>Nếu có thắc mắc về Chính sách bảo mật, vui lòng liên hệ:</p>
        <p className="font-medium">Email: veratax.ad@gmail.com</p>
        <p className="font-medium">SĐT: 0865 394 946 (Ms. Trinh) / 0858 849 936 (Mr. Duy)</p>
      </div>
    </div>
  );
}
