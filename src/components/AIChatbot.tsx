import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, User, X, Send, Loader2, Sparkles, MessageSquare } from 'lucide-react';

interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface AIChatbotProps {
  welcomeMessage?: string;
}

export default function AIChatbot({ welcomeMessage }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: welcomeMessage || 'Xin chào! Tôi là trợ lý AI của Veratax. Tôi có thể giúp gì cho bạn?',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    let saved = localStorage.getItem('veratax_session_id');
    if (!saved) {
      saved = `VRTX_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem('veratax_session_id', saved);
    }
    setSessionId(saved);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://veratax.app.n8n.cloud/webhook/veratax-chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, chatInput: currentInput }),
      });

      if (!response.ok) throw new Error('Network error');

      const data = await response.json();
      const botResponse = Array.isArray(data) ? (data[0]?.output || data[0]?.reply) : (data.output || data.reply || 'Xin lỗi, tôi không thể trả lời lúc này.');

      setMessages(prev => [...prev, {
        role: 'bot',
        content: String(botResponse),
        timestamp: new Date(),
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'bot',
        content: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x > 100) setIsOpen(false);
            }}
            className="fixed inset-0 sm:inset-auto sm:bottom-28 sm:right-4 sm:w-[380px] sm:h-[600px] bg-slate-900 border-t sm:border border-slate-800 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col z-[1000]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <Bot className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-white font-black text-xs sm:text-sm uppercase tracking-tight">Veratax AI Support</h3>
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">Online • Trợ lý thông minh</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl text-sm leading-relaxed max-w-[85%] ${
                    msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-white/5">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-5 border-t border-white/5 bg-slate-900/50 backdrop-blur-sm">
              <div className="relative">
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder="Hỏi AI bất kỳ điều gì..."
                  className="w-full bg-slate-800 text-white text-sm rounded-xl pl-4 pr-12 py-3 border border-white/5 focus:border-emerald-500/50 outline-none resize-none transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1.5 top-1.5 w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center disabled:opacity-30 transition-all shadow-lg active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 text-center">
                 <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center justify-center gap-1">
                   <Sparkles className="w-2.5 h-2.5" />
                   VERATAX AI HUB READY
                 </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-slate-950 text-white rounded-full flex items-center justify-center shadow-2xl shadow-slate-900/40 hover:scale-110 active:scale-95 transition-all group relative border-4 border-white"
      >
        <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20 group-hover:opacity-40 transition-opacity"></div>
        <Bot className="w-8 h-8 group-hover:rotate-12 transition-transform text-emerald-400" />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
          <div className="w-2 h-2 bg-emerald-100 rounded-full animate-pulse"></div>
        </div>
      </button>
    </div>
  );
}
