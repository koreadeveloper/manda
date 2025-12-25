
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GridPosition, Priority } from '../types';
import { useMandaStore } from '../store';
import { CheckCircle2, Circle, Flag } from 'lucide-react';

interface MandaCellProps {
  gridPos: GridPosition;
  cellIndex: number;
  text: string;
  isMainGoal?: boolean;
  isSubGoal?: boolean;
  completed?: boolean;
  priority?: Priority;
}

const MandaCell: React.FC<MandaCellProps> = ({ gridPos, cellIndex, text, isMainGoal, isSubGoal, completed, priority }) => {
  const { updateCell, toggleCellComplete, manda } = useMandaStore();
  const cellRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [fontSize, setFontSize] = useState(16);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateCell(gridPos, cellIndex, { text: e.target.value });
  };

  const cyclePriority = () => {
    const next: Record<Priority, Priority> = {
      none: 'low',
      low: 'medium',
      medium: 'high',
      high: 'none'
    };
    updateCell(gridPos, cellIndex, { priority: next[priority || 'none'] });
  };

  /**
   * Advanced dynamic font sizing algorithm.
   * Calculates optimal font size based on:
   * 1. Cell container size
   * 2. Text length
   * 3. Cell type (main goal, sub goal, task)
   */
  const calculateOptimalFontSize = useCallback(() => {
    if (!cellRef.current) return;

    const container = cellRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Available space (accounting for padding and action buttons)
    const availableWidth = containerWidth - 12;
    const availableHeight = containerHeight - 16;

    const textLength = text.length || 1;

    // Base size multipliers based on cell type
    let baseMultiplier = 1;
    if (isMainGoal) baseMultiplier = 1.5;
    else if (isSubGoal) baseMultiplier = 1.2;

    // Calculate font size based on container and text length
    const widthBasedSize = (availableWidth / Math.sqrt(textLength)) * 0.7;
    const heightBasedSize = availableHeight / 4; // Assume max 4 lines for safety

    // Use the smaller of width/height based calculations
    let optimalSize = Math.min(widthBasedSize, heightBasedSize) * baseMultiplier;

    // Clamp to reasonable bounds based on cell type
    let minSize = 8;
    let maxSize = 20;

    if (isMainGoal) {
      minSize = 10;
      maxSize = 32;
    } else if (isSubGoal) {
      minSize = 9;
      maxSize = 26;
    }

    // Additional scaling for very short or very long text
    if (textLength <= 3) {
      optimalSize *= 1.2;
    } else if (textLength >= 15) {
      optimalSize *= 0.85;
    }

    optimalSize = Math.max(minSize, Math.min(maxSize, optimalSize));

    setFontSize(Math.round(optimalSize));
  }, [text, isMainGoal, isSubGoal]);

  // Recalculate on text change or resize
  useEffect(() => {
    calculateOptimalFontSize();

    const resizeObserver = new ResizeObserver(() => {
      calculateOptimalFontSize();
    });

    if (cellRef.current) {
      resizeObserver.observe(cellRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [calculateOptimalFontSize]);

  const themeColor = manda.theme;
  const isDark = manda.isDarkMode;

  // Explicit black/white text colors for maximum contrast
  const textColor = isDark ? 'text-white' : 'text-black';

  let cellStyle = `
    relative group flex items-center justify-center p-1 border aspect-square
    transition-all duration-300 ease-out hover:z-20 hover:scale-[1.02] hover:shadow-lg
    rounded-lg cursor-text select-none
  `;

  if (isMainGoal) {
    cellStyle += ` bg-${themeColor}-500 text-white border-${themeColor}-400 shadow-md shadow-${themeColor}-500/30`;
  } else if (isSubGoal) {
    cellStyle += isDark
      ? ` bg-slate-800 border-slate-600 ${textColor}`
      : ` bg-${themeColor}-50 border-${themeColor}-200 ${textColor}`;
  } else {
    cellStyle += isDark
      ? ` bg-black border-slate-700 ${textColor}`
      : ` bg-white border-slate-200 ${textColor} hover:border-${themeColor}-300`;
  }

  if (completed) {
    cellStyle += isDark ? " opacity-40 grayscale" : " opacity-50 grayscale-[0.3]";
  }

  const priorityColors = {
    high: 'text-rose-500',
    medium: 'text-amber-500',
    low: 'text-blue-500',
    none: isDark ? 'text-slate-500' : 'text-slate-300'
  };

  return (
    <div
      ref={cellRef}
      className={cellStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) toggleCellComplete(gridPos, cellIndex);
      }}
    >
      {/* Mini Actions Overlay */}
      <div className="absolute top-0.5 left-0.5 right-0.5 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
        <button
          onClick={(e) => { e.stopPropagation(); toggleCellComplete(gridPos, cellIndex); }}
          className={`p-0.5 rounded-full transition-all pointer-events-auto ${completed ? 'text-green-500 bg-white shadow-sm' : isDark ? 'text-slate-400 bg-slate-700' : 'text-slate-400 bg-white border shadow-sm'}`}
        >
          {completed ? <CheckCircle2 size={12} /> : <Circle size={12} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); cyclePriority(); }}
          className={`p-0.5 rounded-full transition-all pointer-events-auto ${isDark ? 'bg-slate-700' : 'bg-white border shadow-sm'} ${priorityColors[priority || 'none']}`}
        >
          <Flag size={12} fill={priority !== 'none' ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Text Display - Centered */}
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ padding: '4px' }}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          placeholder={isMainGoal ? "최종 목표" : isSubGoal ? "하위 목표" : "실행 계획"}
          className={`
            w-full bg-transparent border-none outline-none resize-none text-center
            focus:ring-0 placeholder-slate-400/40 placeholder:font-normal font-manda
            flex items-center justify-center
            ${completed ? 'line-through' : ''}
            ${isMainGoal ? 'text-white font-bold' : textColor}
            transition-all duration-200
          `}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: 1.3,
            textWrap: 'balance',
            wordBreak: 'keep-all',
            overflow: 'hidden',
            textAlign: 'center',
            WebkitTextFillColor: 'inherit'
          }}
          rows={3}
        />
      </div>

      {completed && (
        <div className="absolute inset-0 bg-green-500/10 pointer-events-none flex items-center justify-center">
          <CheckCircle2 className="text-green-500/20 w-8 h-8 md:w-12 md:h-12" />
        </div>
      )}
    </div>
  );
};

export default MandaCell;
