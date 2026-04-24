import React from 'react';
import { Phone, MapPin, MessageCircle } from 'lucide-react';

export default function QuickContact() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4">
      {/* Phone with Hover Tooltip */}
      <div className="group relative flex items-center">
        <div className="absolute right-full mr-4 bg-slate-900 text-white text-sm whitespace-nowrap rounded-xl shadow-2xl opacity-0 translate-x-4 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto border border-slate-700">
          <div className="p-3 space-y-3">
            <a href="tel:0865394946" className="flex items-center space-x-3 hover:text-emerald-400 transition-colors">
              <div className="bg-slate-800 p-2 rounded-full"><Phone className="w-4 h-4" /></div>
              <span className="font-medium">Ms. Trinh: 0865 394 946</span>
            </a>
            <div className="w-full h-px bg-slate-800"></div>
            <a href="tel:0858849936" className="flex items-center space-x-3 hover:text-emerald-400 transition-colors">
              <div className="bg-slate-800 p-2 rounded-full"><Phone className="w-4 h-4" /></div>
              <span className="font-medium">Mr. Duy: 0858 849 936</span>
            </a>
          </div>
          {/* Triangle pointing to circle */}
          <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-slate-900 border-t border-r border-slate-700 rotate-45"></div>
        </div>
        
        <button className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-xl shadow-red-600/30 transition-transform hover:scale-110 isolate cursor-pointer relative focus:outline-none">
          <div className="absolute inset-0 rounded-full border border-red-500 animate-ping opacity-75"></div>
          <Phone className="w-6 h-6 animate-pulse" />
        </button>
      </div>

      {/* Zalo */}
      <a href="https://zalo.me/0858849936" target="_blank" rel="noopener noreferrer" className="relative w-14 h-14 bg-[#0068FF] hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-500/30 transition-transform hover:scale-110">
        <MessageCircle className="w-6 h-6 opacity-0" />
        <span className="absolute text-[13px] font-black tracking-wide">Zalo</span>
      </a>

      {/* Map Address */}
      <a href="https://maps.google.com/?q=323+Cách+Mạng+Tháng+Tám,+Phường+Hòa+Hưng,+Thành+phố+Hồ+Chí+Minh" target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-white border border-slate-200 text-emerald-600 rounded-full flex items-center justify-center shadow-xl hover:bg-slate-50 transition-transform hover:scale-110">
        <MapPin className="w-6 h-6" />
      </a>
    </div>
  );
}
