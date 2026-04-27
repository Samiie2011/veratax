import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, ArrowLeft } from 'lucide-react';
import { newsArticles, Article, getArticleImageUrl } from '../data/newsData';
import NewsCard from './NewsCard';
import SchemaMarkup from './SchemaMarkup';

export default function NewsHub() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [filter, setFilter] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const categories = ['Tất cả', ...new Set(newsArticles.map(a => a.category))];

  const filteredArticles = newsArticles.filter(a => {
    const matchesCategory = filter === 'Tất cả' || a.category === filter;
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstItem, indexOfLastItem);

  const handleFilterChange = (cat: string) => {
    setFilter(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisible = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button key={1} onClick={() => handlePageChange(1)} className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">1</button>
      );
      if (startPage > 2) pages.push(<span key="dots-start" className="text-slate-600 px-1">...</span>);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 border ${
            currentPage === i
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push(<span key="dots-end" className="text-slate-600 px-1">...</span>);
      pages.push(
        <button key={totalPages} onClick={() => handlePageChange(totalPages)} className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">{totalPages}</button>
      );
    }

    return pages;
  };

  if (selectedArticle) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto"
      >
        <SchemaMarkup 
          type="Article"
          data={{
            headline: selectedArticle.title,
            image: getArticleImageUrl(selectedArticle),
            datePublished: selectedArticle.date,
            author: { "@type": "Person", "name": selectedArticle.author },
            description: selectedArticle.excerpt
          }}
        />
        <button
          onClick={() => {
            setSelectedArticle(null);
            window.scrollTo(0, 0);
          }}
          className="flex items-center text-emerald-500 font-bold text-xs uppercase tracking-widest mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Quay lại danh sách
        </button>

        <header className="mb-10">
          <div className="flex items-center space-x-3 mb-6">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
              {selectedArticle.category}
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {selectedArticle.date} • {selectedArticle.author}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-white leading-[1.2] mb-8">
            {selectedArticle.title}
          </h1>
          <p className="text-lg text-slate-400 font-medium italic border-l-4 border-emerald-500 pl-6 py-2 leading-relaxed">
            {selectedArticle.excerpt}
          </p>
        </header>

        <div className="rounded-3xl overflow-hidden mb-12 shadow-2xl relative aspect-video">
          <img 
            src={getArticleImageUrl(selectedArticle)} 
            alt={selectedArticle.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800';
            }}
          />
        </div>

        <article className="max-w-none">
          <div 
            className="blog-content text-slate-300 leading-[1.8] space-y-8 text-[18px] [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:pt-6 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-white [&_h3]:pt-4 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_strong]:text-emerald-400"
            dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
          />
        </article>

        <div className="mt-20 pt-10 border-t border-slate-800">
          <p className="text-slate-500 text-sm italic mb-10">
            * Nội dung bài viết mang tính chất tham khảo kiến thức. Để được tư vấn chi tiết cho trường hợp cụ thể của doanh nghiệp, vui lòng liên hệ trực tiếp với đội ngũ chuyên gia Veratax qua Hotline.
          </p>

          <div className="flex justify-center">
            <button
              onClick={() => {
                setSelectedArticle(null);
                setTimeout(() => {
                  const newsSection = document.getElementById('news');
                  if (newsSection) {
                    newsSection.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }, 10);
              }}
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-full font-bold transition-all shadow-xl shadow-emerald-500/20 active:scale-95 group uppercase text-xs tracking-widest"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span>Quay lại trang tin tức</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center space-x-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6"
        >
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">KHO TRI THỨC VERATAX</span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-display font-bold text-white mb-6 tracking-tight"
        >
          Góc Nhìn & <span className="text-emerald-500">Kiến Thức Doanh Nghiệp</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed"
        >
          Cập nhật những thay đổi mới nhất về pháp luật Thuế, Kế toán và Bảo hiểm giúp doanh nghiệp vận hành an toàn và tối ưu.
        </motion.p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12">
        <div className="flex flex-wrap justify-center lg:justify-start gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleFilterChange(cat)}
              className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 border ${
                filter === cat 
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <AnimatePresence mode="popLayout">
          {currentArticles.map((article) => (
            <NewsCard 
              key={article.id} 
              article={article} 
              onClick={(art) => {
                setSelectedArticle(art);
                window.scrollTo(0, 0);
              }} 
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-12 mb-20">
          {renderPagination()}
        </div>
      )}

      {filteredArticles.length === 0 && (
        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
          <p className="text-slate-500 font-bold uppercase tracking-widest">Không tìm thấy bài viết nào trong chuyên mục này.</p>
        </div>
      )}
    </div>
  );
}
