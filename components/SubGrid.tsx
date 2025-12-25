
import React from 'react';
import { GridPosition } from '../types';
import MandaCell from './MandaCell';
import { useMandaStore } from '../store';

interface SubGridProps {
  position: GridPosition;
  isCenter?: boolean;
}

const SubGrid: React.FC<SubGridProps> = ({ position, isCenter }) => {
  const { manda } = useMandaStore();
  const subGrid = manda.subGrids[position];

  // Calculate progress
  const completedCount = subGrid.cells.filter((c, idx) => idx !== 4 && c.completed).length;
  const progress = (completedCount / 8) * 100;

  const isDark = manda.isDarkMode;
  const themeColor = manda.theme;

  return (
    <div className={`
      relative group flex flex-col gap-1 sm:gap-1.5 p-1.5 sm:p-2 md:p-3 rounded-xl sm:rounded-2xl transition-all duration-300
      ${isDark
        ? 'bg-slate-900/80 border-slate-700'
        : 'bg-slate-100/80 border-slate-200 shadow-sm'}
      border-2 ${isCenter
        ? `ring-4 ring-${themeColor}-500/20 border-${themeColor}-300`
        : ''}
    `}>
      <div className="grid grid-cols-3 gap-1 sm:gap-1.5 md:gap-2 flex-1">
        {subGrid.cells.map((cell, idx) => (
          <MandaCell
            key={`${position}-${idx}`}
            gridPos={position}
            cellIndex={idx}
            text={cell.text}
            isMainGoal={cell.isMainGoal}
            isSubGoal={cell.isSubGoal}
            completed={cell.completed}
            priority={cell.priority}
          />
        ))}
      </div>

      {/* Progress Bar */}
      {!isCenter && (
        <div className={`w-full h-1 rounded-full mt-1 overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
          <div
            className={`h-full bg-${themeColor}-500 transition-all duration-500 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default SubGrid;
