
export type GridPosition = 'TL' | 'TC' | 'TR' | 'ML' | 'MM' | 'MR' | 'BL' | 'BC' | 'BR';
export type Priority = 'low' | 'medium' | 'high' | 'none';

export interface MandaCell {
  id: string;
  text: string;
  isMainGoal?: boolean;
  isSubGoal?: boolean;
  completed?: boolean;
  priority?: Priority;
  deadline?: string;
}

export interface MandaSubGrid {
  position: GridPosition;
  cells: MandaCell[]; // 9 cells
}

export interface MandalartState {
  id: string;
  mainTitle: string;
  subGrids: Record<GridPosition, MandaSubGrid>;
  theme: 'cyan' | 'rose' | 'amber' | 'emerald' | 'indigo';
  isDarkMode: boolean;
}

export interface AIResponse {
  mainGoal: string;
  subGoals: {
    title: string;
    tasks: string[];
  }[];
}
