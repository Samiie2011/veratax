import React from 'react';
import { motion } from 'motion/react';
import { Phone, MapPin } from 'lucide-react';

export default function FloatingContact() {
  const contacts = [
    {
      id: 'hotline',
      icon: <Phone className="w-5 h-5 fill-white" />,
      color: 'bg-[#e31e24]',
      shadow: 'shadow-red-500/30',
      label: (
        <div className="space-y-4 min-w-[300px]">
          <div className="flex items-center space-x-3 group/line">
            <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center shrink-0 bg-white/10">
              <Phone className="w-6 h-6 fill-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline space-x-2">
                <span className="text-xs font-black text-white/70 whitespace-nowrap uppercase tracking-wider">Hotline:</span>
                <a href="tel:0865394946" className="text-2xl font-black text-white hover:text-red-300 transition-colors tracking-tighter">0865.394.946</a>
              </div>
              <span className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em] mt-0.5">MS. TRINH - TƯ VẤN 24/7</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 group/line">
            <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center shrink-0 bg-white/10">
              <Phone className="w-6 h-6 fill-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline space-x-2">
                <span className="text-xs font-black text-white/70 whitespace-nowrap uppercase tracking-wider">Kỹ Thuật:</span>
                <a href="tel:0858849936" className="text-2xl font-black text-white hover:text-red-300 transition-colors tracking-tighter">0858.849.936</a>
              </div>
              <span className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em] mt-0.5">MR. DUY - HỖ TRỢ KỸ THUẬT</span>
            </div>
          </div>
        </div>
      ),
      href: 'tel:0865394946',
      animate: true,
      tooltipColor: 'bg-[#002d52]',
    },
    {
      id: 'zalo',
      icon: (
        <svg viewBox="0 0 24 24" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="12" fill="#0088ff"/>
          <path d="M12.003 5c-4.418 0-8 3.134-8 7s3.582 7 8 7c.607 0 1.192-.059 1.744-.17a.78.78 0 0 1 .593.133l2.801 1.867a.4.4 0 0 0 .61-.433l-.438-2.628a.8.8 0 0 1 .235-.632c1.554-1.39 2.455-3.238 2.455-5.137 0-3.866-3.582-7-8-7z" fill="#fff"/>
          <path d="M15.5 10c-.276 0-.5.224-.5.5s.224.5.5.5.5-.224.5-.5-.224-.5-.5-.5zm-7 0c-.276 0-.5.224-.5.5s.224.5.5.5.5-.224.5-.5-.224-.5-.5-.5zm3.5 0c-.276 0-.5.224-.5.5s.224.5.5.5.5-.224.5-.5-.224-.5-.5-.5z" fill="#0088ff"/>
        </svg>
      ),
      color: 'bg-white',
      shadow: 'shadow-blue-500/20',
      label: (
        <div className="flex flex-col items-center min-w-[150px]">
          <span className="text-blue-600 font-black uppercase text-xs tracking-widest mb-1 italic">CHAT ZALO NGAY</span>
          <div className="w-full h-1 bg-blue-100 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-blue-600" 
               initial={{ x: '-100%' }}
               animate={{ x: '100%' }}
               transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
             />
          </div>
        </div>
      ),
      href: 'https://zalo.me/0858849936',
      tooltipColor: 'bg-white',
    },
    {
      id: 'map',
      icon: (
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/50 shadow-2xl relative group-hover:border-white transition-colors duration-300">
           <img 
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=150&h=150" 
            alt="Veratax Office Map" 
            className="w-full h-full object-cover grayscale brightness-110 contrast-125 group-hover:grayscale-0 transition-all duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay" />
          <div className="absolute inset-0 flex items-center justify-center">
             <motion.div 
               animate={{ scale: [1, 1.2, 1] }} 
               transition={{ duration: 2, repeat: Infinity }}
               className="w-3 h-3 bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.8)] border border-white" 
             />
          </div>
        </div>
      ),
      color: 'bg-white',
      shadow: 'shadow-black/20',
      label: (
        <div className="flex flex-col space-y-1 min-w-[180px]">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Địa chỉ văn phòng</span>
          <span className="text-sm font-bold text-slate-900 leading-tight">Văn Phòng TP. Hồ Chí Minh</span>
          <div className="flex items-center space-x-1 text-emerald-600 text-[10px] font-bold">
            <MapPin className="w-3 h-3" />
            <span>Click để tìm đường đi</span>
          </div>
        </div>
      ),
      href: 'https://www.google.com/maps/search/Kế+toán+Veratax/@10.8230989,106.6296638,13z',
      tooltipColor: 'bg-white',
    }
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-center space-y-4">
      {contacts.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: index * 0.1 
          }}
          className="relative group"
        >
          {/* Tooltip */}
          <div className="absolute right-full mr-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hidden md:block transition-all duration-300 translate-x-4 group-hover:translate-x-0 pointer-events-auto">
            <div className={`${item.tooltipColor || 'bg-slate-900'} p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative`}>
              {item.label}
              {/* Arrow */}
              <div className={`absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 ${item.tooltipColor || 'bg-slate-900'} rotate-45`} />
            </div>
          </div>

          {item.id === 'hotline' ? (
            <div
              className={`${item.color} ${item.shadow} w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer relative border-2 border-white/10`}
            >
              {item.animate && (
                <span className="absolute inset-0 rounded-full bg-inherit animate-ping opacity-30"></span>
              )}
              <div className="relative z-10 flex items-center justify-center">
                {item.icon}
              </div>
            </div>
          ) : (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${item.color} ${item.shadow} w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer relative border-2 border-white/10`}
            >
              {item.animate && (
                <span className="absolute inset-0 rounded-full bg-inherit animate-ping opacity-30"></span>
              )}
              <div className="relative z-10 flex items-center justify-center">
                {item.icon}
              </div>
            </a>
          )}
        </motion.div>
      ))}
    </div>
  );
}

