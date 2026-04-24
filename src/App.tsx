/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PainPoints from './components/PainPoints';
import Services from './components/Services';
import Process from './components/Process';
import WhyChooseUs from './components/WhyChooseUs';
import FAQ from './components/FAQ';
import CTA from './components/CTA';
import Footer from './components/Footer';
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        {currentPage === 'main' && (
          <>
            <Hero />
            <PainPoints />
            <Services />
            <Process />
            <WhyChooseUs />
            <FAQ />
            <CTA />
          </>
        )}
        {currentPage === 'privacy' && <PrivacyPolicy />}
        {currentPage === 'terms' && <TermsOfService />}
      </main>
      <Footer />
      <QuickContact />
    </div>
  );
}
