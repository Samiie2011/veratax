import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { motion } from 'motion/react';
import { FileUp, Copy, Check, Info } from 'lucide-react';

export default function NewsImport() {
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      // Mapping logic based on your Excel image
      // B: Danh mục, C: Tiêu đề bài viết, D: URL Ảnh, E: Tóm tắt, F: Nội dung HTML
      const articles = data.map((row: any, index: number) => ({
        id: `article-${index + 1}-${Date.now()}`,
        title: row['Tiêu đề bài viết'] || row['C'] || 'No Title',
        category: row['Danh mục'] || row['B'] || 'Chung',
        imageUrl: row['URL Ảnh Minh Họa (Auto)'] || row['D'] || `https://images.unsplash.com/photo-${[
          '1554224155-6726b3ff858f', '1454165833222-381a25244510', '1589823436324-42998a4da8d3', '1450101499163-c8848c66ca85',
          '1554224154-26032ffc0d07', '1460925895917-afdab827c52f', '1560518883-ce09059eeffa', '1497366216548-37526070297c',
          '1507679799987-c7377f0da46', '1454165205734-3a731d40dc4e', '1516321318423-f06f85e504b3', '1553729459-efe14ef6055d'
        ][index % 12]}?auto=format&fit=crop&q=80&w=800`,
        excerpt: row['Tóm tắt (Excerpt)'] || row['E'] || '',
        date: new Date().toLocaleDateString('vi-VN'),
        author: 'Ban Nội Dung Veratax',
        content: row['Nội dung HTML (Long-form 800+ words)'] || row['F'] || ''
      }));

      const code = `export const newsArticles = ${JSON.stringify(articles, null, 2)};`;
      setGeneratedCode(code);
    };
    reader.readAsBinaryString(file);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-2xl font-display font-bold text-white mb-2">Công cụ Import Tin tức</h2>
        <p className="text-slate-400 mb-8">Kéo thả file Excel của bạn vào đây để tạo mã nguồn bài viết tự động.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <div className="space-y-6">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-800 border-dashed rounded-3xl cursor-pointer bg-slate-950/50 hover:bg-slate-950 transition-all hover:border-emerald-500/50 group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileUp className="w-12 h-12 text-slate-500 group-hover:text-emerald-500 transition-colors mb-4" />
                <p className="mb-2 text-sm text-slate-300">
                  <span className="font-bold">Nhấn để tải lên</span> hoặc kéo thả file
                </p>
                <p className="text-xs text-slate-500">File Excel (.xlsx) theo format 50 bài viết</p>
                {fileName && (
                  <div className="mt-4 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs font-bold">
                    Đã chọn: {fileName}
                  </div>
                )}
              </div>
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
            </label>

            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
              <div className="flex items-start space-x-3 text-emerald-400">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold mb-1">Hướng dẫn mapping:</p>
                  <ul className="list-disc pl-4 space-y-1 text-xs opacity-80">
                    <li>Cột B: Danh mục</li>
                    <li>Cột C: Tiêu đề bài viết</li>
                    <li>Cột D: URL Ảnh Minh Họa</li>
                    <li>Cột E: Tóm tắt (Excerpt)</li>
                    <li>Cột F: Nội dung HTML</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Result Area */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Kết quả (TypeScript Code)</span>
              {generatedCode && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all"
                >
                  {copySuccess ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copySuccess ? 'Đã sao chép' : 'Sao chép code'}</span>
                </button>
              )}
            </div>
            <div className="flex-grow bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-auto font-mono text-[10px] text-slate-400 max-h-[400px]">
              {generatedCode ? (
                <pre>{generatedCode}</pre>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 italic">
                  Chưa có dữ liệu để hiển thị...
                </div>
              )}
            </div>
            <p className="mt-4 text-[10px] text-slate-500 leading-relaxed italic">
              * Sau khi sao chép, hãy dán toàn bộ nội dung này vào file <strong>/src/data/newsData.ts</strong> để cập nhật danh sách bài viết.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
