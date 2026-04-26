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

export default function App() {
  const [currentPage, setCurrentPage] = useState<'main' | 'privacy' | 'terms'>('main');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#';
      
      if (hash === '#privacy') {
        setCurrentPage('privacy');
        window.scrollTo(0, 0);
      } else if (hash === '#terms') {
        setCurrentPage('terms');
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
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <SEO 
        title={seoData[currentPage].title} 
        description={seoData[currentPage].description} 
      />
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
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
}
