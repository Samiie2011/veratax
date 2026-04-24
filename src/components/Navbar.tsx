import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Menu, X, Phone } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Dịch vụ', href: '#services' },
    { name: 'Quy trình', href: '#process' },
    { name: 'Vì sao chọn chúng tôi', href: '#why-us' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <a href="#" className="flex items-center space-x-3 bg-white px-3 py-2 rounded-full hover:bg-slate-50 transition-colors shadow-sm">
            <img src="/Logo.png" alt="Veratax Logo" className="w-11 h-11 object-contain" />
            <span className="text-2xl font-display font-bold text-emerald-800 pr-3 tracking-tight">VERATAX</span>
          </a>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors ${isScrolled ? 'text-slate-600 hover:text-emerald-600' : 'text-slate-100/90 hover:text-white'}`}
              >
                {link.name}
              </a>
            ))}
            <a
              href="tel:0865394946"
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
            >
              <Phone className="w-4 h-4" />
              <span>0865 394 946</span>
            </a>
          </div>

          <button
            className="md:hidden text-slate-900 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className={isScrolled ? 'text-slate-900' : 'text-white'} /> : <Menu className={isScrolled ? 'text-slate-900' : 'text-white'} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-slate-100 md:hidden overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-base font-medium text-slate-600 hover:text-emerald-600 px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 px-4">
                <a
                  href="tel:0865394946"
                  className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-5 py-3 rounded-xl text-base font-semibold"
                >
                  <Phone className="w-5 h-5" />
                  <span>Gọi ngay: 0865 394 946</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
