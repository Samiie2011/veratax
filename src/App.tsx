/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import SEO from './components/SEO';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PainPoints from './components/PainPoints';
import Services from './components/Services';
import Process from './components/Process';
import WhyChooseUs from './components/WhyChooseUs';
import FAQ from './components/FAQ';
import CTA from './components/CTA';
import Footer from './components/Footer';
import FloatingContact from './components/FloatingContact';
import SalaryCalculator from './components/SalaryCalculator';
import QuickContact from './components/QuickContact';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import NewsHub from './components/NewsHub';
import NewsImport from './components/NewsImport';
import SchemaMarkup from './components/SchemaMarkup';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'main' | 'privacy' | 'terms' | 'news' | 'admin-news'>('main');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#';
      
      if (hash === '#privacy') {
        setCurrentPage('privacy');
        window.scrollTo(0, 0);
      } else if (hash === '#terms') {
        setCurrentPage('terms');
        window.scrollTo(0, 0);
      } else if (hash === '#news') {
        setCurrentPage('news');
        window.scrollTo(0, 0);
      } else if (hash === '#admin-news') {
        setCurrentPage('admin-news');
        window.scrollTo(0, 0);
      } else {
        setCurrentPage(prevPage => {
          if (prevPage !== 'main') {
            setTimeout(() => {
              const id = hash.replace('#', '');
              if (id) {
                const element = document.getElementById(id);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }, 50);
          }
          return 'main';
        });
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const seoData = {
    main: {
      title: "Trang chủ",
      description: "Dịch vụ kế toán trọn gói, thành lập doanh nghiệp và tư vấn pháp lý thuế chuyên nghiệp tại TP. HCM. Hỗ trợ tính lương Gross-Net miễn phí."
    },
    privacy: {
      title: "Chính sách bảo mật",
      description: "Chính sách bảo mật thông tin khách hàng tại Veratax."
    },
    terms: {
      title: "Điều khoản sử dụng",
      description: "Điều khoản sử dụng dịch vụ và website Veratax."
    },
    news: {
      title: "Tin tức & Kiến thức",
      description: "Cập nhật kiến thức pháp luật, thuế và kế toán doanh nghiệp mới nhất tại Veratax News Hub."
    },
    'admin-news': {
      title: "Quản trị Tin tức",
      description: "Công cụ quản trị và import bài viết cho Veratax."
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <SEO 
        title={seoData[currentPage].title} 
        description={seoData[currentPage].description} 
      />

      {/* Schema.org Structured Data */}
      <SchemaMarkup 
        type="Organization"
        data={{
          name: "VERATAX",
          url: "https://veratax.vn",
          logo: "https://veratax.vn/logo.png",
          description: "Dịch vụ kế toán, thuế và bảo hiểm xã hội chuyên nghiệp cho doanh nghiệp.",
          address: {
            "@type": "PostalAddress",
            "addressLocality": "Hồ Chí Minh",
            "addressCountry": "VN"
          },
          contactPoint: {
            "@type": "ContactPoint",
            "telephone": "+84-865-394-946",
            "contactType": "customer service"
          }
        }}
      />

      {/* Analytics (Mock scripts for production readiness) */}
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
      <script dangerouslySetInnerHTML={{ __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-XXXXXXXXXX');
      `}} />

      <Navbar />
      <main>
        {currentPage === 'main' && (
          <>
            <Hero />
            <PainPoints />
            <Services />
            <Process />
            <WhyChooseUs />
            <SalaryCalculator />
            <FAQ />
            <QuickContact />
            <CTA />
          </>
        )}
        {currentPage === 'privacy' && <PrivacyPolicy />}
        {currentPage === 'terms' && <TermsOfService />}
        {currentPage === 'news' && <NewsHub />}
        {currentPage === 'admin-news' && <NewsImport />}
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
}
