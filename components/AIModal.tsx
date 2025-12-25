
import React, { useState } from 'react';
import { Sparkles, X, Wand2 } from 'lucide-react';
import { generateMandalart } from '../groqService';
import { useMandaStore } from '../store';
import { GridPosition, MandaSubGrid, MandaCell } from '../types';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIModal: React.FC<AIModalProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const { setLoading, setEntireManda, manda, loading } = useMandaStore();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const result = await generateMandalart(prompt);

      // Transform AI response to store structure
      const positions: GridPosition[] = ['TL', 'TC', 'TR', 'ML', 'MM', 'MR', 'BL', 'BC', 'BR'];
      const newSubGrids = {} as Record<GridPosition, MandaSubGrid>;

      // Initialize all grids with complete cell data
      positions.forEach(pos => {
        newSubGrids[pos] = {
          position: pos,
          cells: Array.from({ length: 9 }, (_, i) => ({
            id: `${pos}-${i}`,
            text: '',
            isMainGoal: pos === 'MM' && i === 4,
            isSubGoal: (pos === 'MM' && i !== 4) || (pos !== 'MM' && i === 4),
            completed: false,
            priority: 'none'
          } as MandaCell))
        };
      });

      // Fill center grid (MM)
      newSubGrids.MM.cells[4].text = result.mainGoal;
      result.subGoals.forEach((sg, idx) => {
        const subGoalPositions: GridPosition[] = ['TL', 'TC', 'TR', 'ML', 'MM', 'MR', 'BL', 'BC', 'BR'];
        // The subgoals surround the center cell (index 4)
        const posIndex = idx < 4 ? idx : idx + 1;
        if (posIndex >= subGoalPositions.length) return;

        const gridPos = subGoalPositions[posIndex];

        // Update MM's surrounding cells (which point to sub-grids)
        newSubGrids.MM.cells[posIndex].text = sg.title;

        // Update the sub-grid's center cell (which mirrors MM's surrounding cell)
        newSubGrids[gridPos].cells[4].text = sg.title;

        // Fill the sub-grid's tasks
        sg.tasks.slice(0, 8).forEach((task, tIdx) => {
          const taskCellIndex = tIdx < 4 ? tIdx : tIdx + 1; // Skip the center cell (index 4)
          newSubGrids[gridPos].cells[taskCellIndex].text = task;
        });
      });

      // Update the entire state while ensuring mandatory properties like theme and isDarkMode are preserved
      setEntireManda({
        ...manda,
        id: Date.now().toString(),
        mainTitle: result.mainGoal,
        subGrids: newSubGrids
      });
      onClose();
    } catch (error: any) {
      console.error("Failed to generate:", error);
      alert(error.message || "AI 생성에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isDark = manda.isDarkMode;
  const themeColor = manda.theme;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="p-6 relative">
          <button
            onClick={onClose}
            className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-${themeColor}-100 text-${themeColor}-600`}>AI Beta</span>
          </div>

          <h2 className={`text-2xl md:text-3xl font-bold mb-4 text-center font-manda ${isDark ? 'text-white' : 'text-slate-900'}`}>Define Your Ultimate Goal</h2>
          <p className={`text-center mb-6 max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            최종적으로 이루고 싶은 목표를 입력하세요. AI가 8개의 하위 목표와 64개의 실행 계획을 자동으로 제안합니다.
          </p>

          <div className="relative mb-6">
            <div className={`absolute top-4 left-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <Sparkles size={20} />
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="예: 2024년까지 시니어 제품 디자이너 되기, 다이어트 성공하기..."
              className={`w-full h-28 pl-12 pr-4 py-4 rounded-2xl focus:ring-2 focus:ring-${themeColor}-500 outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'} border`}
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {["마라톤 완주", "일본어 마스터", "소설 출판", "스타트업 창업"].map((tag) => (
              <button
                key={tag}
                onClick={() => setPrompt(tag)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors flex items-center gap-1 ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
              >
                {tag} <span className={`text-lg leading-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>+</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className={`
              w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg transition-all font-manda
              ${loading || !prompt.trim()
                ? isDark ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : `bg-${themeColor}-500 hover:bg-${themeColor}-600 text-white shadow-lg shadow-${themeColor}-500/20`}
            `}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>AI가 구체적인 계획을 세우는 중...</span>
              </>
            ) : (
              <>
                <Wand2 size={20} />
                <span>Mandalart 생성하기</span>
              </>
            )}
          </button>

          <p className={`text-[10px] text-center mt-4 uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            보통 5~10초 정도 소요됩니다. Powered by Groq AI.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIModal;
