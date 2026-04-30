import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, MapPin, MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export default function FloatingContact() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: 'Xin chào! Tôi là trợ lý AI của Veratax. Tôi có thể giúp gì cho bạn về kế toán, thuế hoặc thành lập doanh nghiệp?',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Initialize or retrieve session ID
    let savedSessionId = localStorage.getItem('veratax_session_id');
    if (!savedSessionId) {
      // Generate a unique session ID with VRTX_ prefix
      const randomStr = Math.random().toString(36).substring(2, 15);
      const timestamp = Date.now().toString(36);
      savedSessionId = `VRTX_${timestamp}_${randomStr}`;
      localStorage.setItem('veratax_session_id', savedSessionId);
    }
    setSessionId(savedSessionId);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!chatInput.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: chatInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://veratax.app.n8n.cloud/webhook/veratax-chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sessionId: sessionId,
          chatInput: currentInput 
        }),
      });

      if (!response.ok) throw new Error('Không thể kết nối với máy chủ AI');

      const data = await response.json();
      const botResponse = Array.isArray(data) ? (data[0]?.output || data[0]?.reply) : (data.output || data.reply || data.response || data.text || 'Xin lỗi, tôi gặp sự cố trong lúc xử lý tin nhắn.');

      setMessages(prev => [...prev, {
        role: 'bot',
        content: String(botResponse),
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, {
        role: 'bot',
        content: 'Rất tiếc, đã có lỗi xảy ra khi kết nối với hệ thống. Vui lòng thử lại sau hoặc liên hệ Hotline để được hỗ trợ trực tiếp.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const contacts = [
    {
      id: 'chatbot',
      icon: isChatOpen ? <X className="w-6 h-6" /> : <div className="relative"><MessageSquare className="w-6 h-6 text-white" /><span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-emerald-600" /></div>,
      color: isChatOpen ? 'bg-slate-800' : 'bg-emerald-600 hover:bg-emerald-500',
      shadow: 'shadow-emerald-500/30',
      label: (
        <div className="flex flex-col items-center min-w-[150px]">
          <span className="text-emerald-600 font-black uppercase text-xs tracking-widest mb-1 italic">HỎI GIẢI PHÁP AI</span>
          <div className="w-full h-1 bg-emerald-100 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-emerald-600" 
               initial={{ x: '-100%' }}
               animate={{ x: '100%' }}
               transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
             />
          </div>
        </div>
      ),
      onClick: () => setIsChatOpen(!isChatOpen),
      tooltipColor: 'bg-white',
    },
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
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-[300px] right-0 w-[350px] sm:w-[380px] h-[500px] sm:h-[550px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-[60]"
          >
            {/* Chatbot Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                      <Bot className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-white font-display font-bold text-base tracking-tight">Veratax AI</h3>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Đang trực tuyến</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 space-y-5 chatbot-scroll"
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'} space-x-2`}>
                    <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${
                      msg.role === 'user' ? 'bg-slate-700' : 'bg-emerald-600'
                    }`}>
                      {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user' 
                        ? 'bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-900/20 text-left' 
                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5 shadow-inner text-justify'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 shrink-0 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-white/5 text-slate-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-5 bg-slate-900/80 backdrop-blur-md border-t border-white/5">
              <div className="relative group">
                <textarea
                  rows={1}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Hỏi tôi bất cứ điều gì..."
                  className="w-full bg-slate-800 text-white text-sm rounded-xl pl-4 pr-12 py-3 border border-white/5 focus:border-emerald-500/50 focus:ring-0 resize-none transition-all placeholder:text-slate-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!chatInput.trim() || isLoading}
                  className={`absolute right-1.5 top-1.5 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    chatInput.trim() && !isLoading 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 active:scale-95' 
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-center space-x-2 text-[9px] text-slate-600 font-bold uppercase tracking-wider">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Powered by Veratax AI Hub</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

          {item.onClick ? (
               <div
               onClick={item.onClick}
               className={`${item.color} ${item.shadow} w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer relative border-2 border-white/10`}
             >
               <div className="relative z-10 flex items-center justify-center">
                 {item.icon}
               </div>
             </div>
          ) : item.id === 'hotline' ? (
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

