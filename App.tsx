
import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Share2,
  Sparkles,
  Trash2,
  Moon,
  Sun,
  Palette,
  TrendingUp,
  Target,
  CheckCircle,
} from 'lucide-react';
import SubGrid from './components/SubGrid';
import { useMandaStore } from './store';
import AIModal from './components/AIModal';
import { MandaSubGrid } from './types';

declare const html2canvas: any;

const App: React.FC = () => {
  const { manda, resetManda, setDarkMode, setTheme, getShareableUrl, loadFromUrl, updateMainTitle } = useMandaStore();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.location.hash) {
      loadFromUrl(window.location.hash);
    }
  }, []);

  const handleShare = () => {
    const url = getShareableUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (gridRef.current) {
      try {
        // Wait for fonts to load
        await document.fonts.ready;

        const canvas = await html2canvas(gridRef.current, {
          backgroundColor: manda.isDarkMode ? '#000000' : '#F8FAFC',
          scale: 2, // High quality
          useCORS: true,
          logging: false,
          // Mobile optimization
          windowWidth: gridRef.current.scrollWidth,
          windowHeight: gridRef.current.scrollHeight,
          // Font rendering
          onclone: (clonedDoc: Document) => {
            // Ensure fonts are applied in cloned document
            const style = clonedDoc.createElement('style');
            style.textContent = `
              @import url('https://fonts.googleapis.com/css2?family=Do+Hyeon&display=swap');
              .font-manda { font-family: 'Do Hyeon', sans-serif !important; }
            `;
            clonedDoc.head.appendChild(style);
          }
        });

        const dataUrl = canvas.toDataURL('image/png');

        // Mobile-friendly download
        const link = document.createElement('a');
        link.download = `${manda.mainTitle || 'mandalart'}.png`;
        link.href = dataUrl;

        // For iOS Safari
        if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
          window.open(dataUrl, '_blank');
        } else {
          link.click();
        }
      } catch (err) {
        console.error("Download failed:", err);
        alert("이미지 저장에 실패했습니다. 다시 시도해 주세요.");
      }
    }
  };

  const themes: { name: string; color: string }[] = [
    { name: 'cyan', color: 'bg-cyan-500' },
    { name: 'rose', color: 'bg-rose-500' },
    { name: 'amber', color: 'bg-amber-500' },
    { name: 'emerald', color: 'bg-emerald-500' },
    { name: 'indigo', color: 'bg-indigo-500' },
  ];

  const totalCompleted = (Object.values(manda.subGrids) as MandaSubGrid[])
    .flatMap(g => g.cells)
    .filter(c => !c.isMainGoal && !c.isSubGoal && c.completed).length;

  const totalTasks = 64;
  const overallProgress = Math.round((totalCompleted / totalTasks) * 100);

  // Explicit black/white for maximum contrast
  const titleColor = manda.isDarkMode ? 'text-white' : 'text-black';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${manda.isDarkMode ? 'bg-black text-white' : 'bg-[#F8FAFC] text-slate-900'}`}>
      {/* Header */}
      <header className={`no-print h-auto md:h-20 px-4 md:px-8 border-b flex flex-col md:flex-row items-center justify-between sticky top-0 z-40 transition-colors duration-500 ${manda.isDarkMode ? 'bg-black/95 border-slate-800' : 'bg-white/95 border-slate-200'} backdrop-blur-md py-4 md:py-0 gap-4`}>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-colors duration-500 bg-${manda.theme}-500 shadow-${manda.theme}-500/20 shrink-0`}>
            <Target size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className={`font-black text-xl md:text-2xl tracking-tighter ${titleColor} font-manda`}>Manda-AI</h1>
            <div className="flex items-center gap-1.5 -mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Goal Master</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsAIModalOpen(true)}
            className={`
              flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-2xl font-black transition-all transform hover:scale-105 active:scale-95
              bg-${manda.theme}-500 text-white shadow-xl shadow-${manda.theme}-500/30 hover:bg-${manda.theme}-600 text-sm md:text-lg font-manda
            `}
          >
            <Sparkles size={18} fill="currentColor" />
            <span>AI 자동 생성</span>
          </button>

          <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => setShowThemePicker(!showThemePicker)}
                className={`p-2 rounded-xl transition-all ${manda.isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                title="테마 색상"
              >
                <Palette size={24} />
              </button>
              {showThemePicker && (
                <div className={`absolute top-full right-0 mt-2 p-3 rounded-2xl border shadow-2xl z-50 flex gap-2 animate-fade-in ${manda.isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                  {themes.map(t => (
                    <button
                      key={t.name}
                      onClick={() => { setTheme(t.name as any); setShowThemePicker(false); }}
                      className={`w-8 h-8 rounded-full transition-transform hover:scale-125 ${t.color} ${manda.theme === t.name ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setDarkMode(!manda.isDarkMode)}
              className={`p-2 rounded-xl transition-all ${manda.isDarkMode ? 'hover:bg-slate-800 text-amber-400' : 'hover:bg-slate-100 text-indigo-500'}`}
            >
              {manda.isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>

            <button
              onClick={handleShare}
              className={`relative p-2 rounded-xl transition-all ${copied ? 'text-green-500' : manda.isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
            >
              {copied ? <CheckCircle size={24} /> : <Share2 size={24} />}
              {copied && <span className="absolute -bottom-10 right-0 text-sm font-bold bg-green-500 text-white px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap">링크 복사됨!</span>}
            </button>

            <button
              onClick={handleDownload}
              className={`p-2 rounded-xl transition-all ${manda.isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              title="이미지 다운로드"
            >
              <Download size={24} />
            </button>

            <button
              onClick={resetManda}
              className={`p-2 rounded-xl transition-all hover:bg-rose-50 hover:text-rose-500 ${manda.isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
            >
              <Trash2 size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 lg:p-16 max-w-[1800px] mx-auto w-full flex flex-col items-center">
        {/* Title & Stats */}
        <div className="w-full mb-6 md:mb-12 flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-10">
          <div className="flex-1 w-full text-center lg:text-left">
            <input
              type="text"
              value={manda.mainTitle}
              onChange={(e) => updateMainTitle(e.target.value)}
              className={`w-full bg-transparent border-none outline-none text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter mb-3 ${titleColor} placeholder:text-slate-300 focus:ring-0 text-center lg:text-left font-manda`}
              placeholder="나의 만다라트"
            />
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 md:gap-6 mt-3">
              <div className={`px-4 py-2 md:px-6 md:py-3 rounded-2xl border-2 flex items-center gap-2 md:gap-3 ${manda.isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100 shadow-lg'}`}>
                <TrendingUp size={24} className={`text-${manda.theme}-500`} />
                <span className={`font-black text-xl md:text-2xl ${titleColor} font-manda`}>{overallProgress}%</span>
                <span className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-widest">Progress</span>
              </div>
              <div className={`px-4 py-2 md:px-6 md:py-3 rounded-2xl border-2 flex items-center gap-2 md:gap-3 ${manda.isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100 shadow-lg'}`}>
                <CheckCircle size={24} className="text-green-500" />
                <span className={`font-black text-lg md:text-xl uppercase tracking-widest ${titleColor} font-manda`}>{totalCompleted} / 64 Done</span>
              </div>
            </div>
          </div>

          <div className={`hidden lg:flex p-8 rounded-[2.5rem] border-2 flex-col gap-5 min-w-[350px] ${manda.isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 shadow-2xl'}`}>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">Goal Master Radar</p>
                <h4 className={`text-4xl font-black mt-1 ${titleColor} font-manda`}>{overallProgress}%</h4>
              </div>
              <Target className={`text-${manda.theme}-500 opacity-40`} size={64} />
            </div>
            <div className={`w-full h-4 rounded-full overflow-hidden ${manda.isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <div
                className={`h-full transition-all duration-1000 ease-out bg-${manda.theme}-500`}
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className={`text-lg italic font-bold text-center ${manda.isDarkMode ? 'text-slate-400' : 'text-slate-500'} font-manda`}>
              "꿈은 구체적일수록 현실이 됩니다."
            </p>
          </div>
        </div>

        {/* Grid Container */}
        <div
          ref={gridRef}
          className={`
            w-full grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 p-3 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl md:rounded-[3rem] 
            transition-colors duration-500 overflow-visible preload-fonts
            ${manda.isDarkMode ? 'bg-black' : 'bg-slate-200/50'}
          `}
        >
          <SubGrid position="TL" />
          <SubGrid position="TC" />
          <SubGrid position="TR" />

          <SubGrid position="ML" />
          <SubGrid position="MM" isCenter />
          <SubGrid position="MR" />

          <SubGrid position="BL" />
          <SubGrid position="BC" />
          <SubGrid position="BR" />
        </div>

        {/* Shortcuts */}
        <div className="mt-12 md:mt-20 flex flex-wrap justify-center gap-4 md:gap-10 opacity-50 hover:opacity-100 transition-opacity no-print">
          {["Enter 편집", "Click 달성", "Share 공유"].map((item) => (
            <div key={item} className="flex items-center gap-3 text-xs md:text-base font-black uppercase tracking-widest text-slate-500 font-manda">
              <span className={`px-3 py-1.5 rounded-xl ${manda.isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-slate-300'} border-2`}>{item.split(' ')[0]}</span>
              <span>{item.split(' ')[1]}</span>
            </div>
          ))}
        </div>
      </main>

      <footer className={`py-8 md:py-12 border-t text-center transition-colors duration-500 ${manda.isDarkMode ? 'bg-black border-slate-800 text-slate-600' : 'bg-white border-slate-200 text-slate-400'} text-xs md:text-sm font-bold uppercase tracking-[0.3em] font-manda`}>
        <p>© 2026 MANDA-AI • MASTER YOUR DESTINY</p>
      </footer>

      <AIModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
    </div>
  );
};

export default App;
