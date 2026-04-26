import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Calendar, User } from 'lucide-react';
import { Article, getArticleImageUrl } from '../data/newsData';

interface NewsCardProps {
  article: Article;
  onClick: (article: Article) => void;
  key?: string;
}

export default function NewsCard({ article, onClick }: NewsCardProps) {
  const imageUrl = getArticleImageUrl(article);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden hover:border-emerald-500/50 transition-all duration-500 flex flex-col h-full shadow-2xl shadow-black/20"
    >
      {/* Image Container */}
      <div 
        className="relative aspect-video overflow-hidden cursor-pointer"
        onClick={() => onClick(article)}
      >
        <motion.img
          src={imageUrl}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
        
        {/* Category Tag */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">
            {article.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center space-x-4 mb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1.5 text-emerald-500" />
            {article.date}
          </div>
          <div className="flex items-center">
            <User className="w-3 h-3 mr-1.5 text-emerald-500" />
            {article.author}
          </div>
        </div>

        <h3 
          className="text-lg font-bold text-white mb-3 line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors cursor-pointer"
          onClick={() => onClick(article)}
        >
          {article.title}
        </h3>

        <p className="text-slate-400 text-sm line-clamp-3 mb-6 leading-relaxed flex-grow">
          {article.excerpt}
        </p>

        <button
          onClick={() => onClick(article)}
          className="flex items-center text-emerald-500 font-bold text-xs uppercase tracking-[0.2em] group/btn transition-all"
        >
          <span>Đọc tiếp</span>
          <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
        </button>
      </div>
    </motion.div>
  );
}
