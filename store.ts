
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MandalartState, GridPosition, MandaCell, MandaSubGrid, Priority } from './types';

interface MandaStore {
  manda: MandalartState;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  updateCell: (gridPos: GridPosition, cellIndex: number, updates: Partial<MandaCell>) => void;
  updateMainTitle: (title: string) => void;
  toggleCellComplete: (gridPos: GridPosition, cellIndex: number) => void;
  setEntireManda: (data: MandalartState) => void;
  setDarkMode: (isDark: boolean) => void;
  setTheme: (theme: MandalartState['theme']) => void;
  resetManda: () => void;
  getShareableUrl: () => string;
  loadFromUrl: (hash: string) => void;
}

const createInitialCells = (gridPos: GridPosition): MandaCell[] => {
  return Array.from({ length: 9 }, (_, i) => ({
    id: `${gridPos}-${i}`,
    text: '',
    isMainGoal: gridPos === 'MM' && i === 4,
    isSubGoal: (gridPos === 'MM' && i !== 4) || (gridPos !== 'MM' && i === 4),
    completed: false,
    priority: 'none'
  }));
};

const initialSubGrids: Record<GridPosition, MandaSubGrid> = {
  TL: { position: 'TL', cells: createInitialCells('TL') },
  TC: { position: 'TC', cells: createInitialCells('TC') },
  TR: { position: 'TR', cells: createInitialCells('TR') },
  ML: { position: 'ML', cells: createInitialCells('ML') },
  MM: { position: 'MM', cells: createInitialCells('MM') },
  MR: { position: 'MR', cells: createInitialCells('MR') },
  BL: { position: 'BL', cells: createInitialCells('BL') },
  BC: { position: 'BC', cells: createInitialCells('BC') },
  BR: { position: 'BR', cells: createInitialCells('BR') },
};

export const useMandaStore = create<MandaStore>()(
  persist(
    (set, get) => ({
      manda: {
        id: 'default',
        mainTitle: '나의 만다라트',
        subGrids: { ...initialSubGrids },
        theme: 'cyan',
        isDarkMode: false,
      },
      loading: false,
      setLoading: (loading) => set({ loading }),
      
      updateMainTitle: (mainTitle) => set((state) => ({ manda: { ...state.manda, mainTitle } })),

      updateCell: (gridPos, cellIndex, updates) => set((state) => {
        const newSubGrids = { ...state.manda.subGrids };
        const targetSubGrid = { ...newSubGrids[gridPos] };
        const targetCells = [...targetSubGrid.cells];
        targetCells[cellIndex] = { ...targetCells[cellIndex], ...updates };
        targetSubGrid.cells = targetCells;
        newSubGrids[gridPos] = targetSubGrid;

        if (updates.text !== undefined) {
          const positions: GridPosition[] = ['TL', 'TC', 'TR', 'ML', 'MM', 'MR', 'BL', 'BC', 'BR'];
          if (gridPos === 'MM' && cellIndex !== 4) {
            const targetPos = positions[cellIndex];
            const subGrid = { ...newSubGrids[targetPos] };
            const subCells = [...subGrid.cells];
            subCells[4] = { ...subCells[4], text: updates.text };
            subGrid.cells = subCells;
            newSubGrids[targetPos] = subGrid;
          } else if (gridPos !== 'MM' && cellIndex === 4) {
            const mmIndex = positions.indexOf(gridPos);
            const mmSubGrid = { ...newSubGrids['MM'] };
            const mmCells = [...mmSubGrid.cells];
            mmCells[mmIndex] = { ...mmCells[mmIndex], text: updates.text };
            mmSubGrid.cells = mmCells;
            newSubGrids['MM'] = mmSubGrid;
          }
        }

        return { manda: { ...state.manda, subGrids: newSubGrids } };
      }),

      toggleCellComplete: (gridPos, cellIndex) => set((state) => {
        const newSubGrids = { ...state.manda.subGrids };
        const positions: GridPosition[] = ['TL', 'TC', 'TR', 'ML', 'MM', 'MR', 'BL', 'BC', 'BR'];
        const currentCompleted = newSubGrids[gridPos].cells[cellIndex].completed;
        const newStatus = !currentCompleted;

        // Function to update all cells in a sub-grid
        const cascadeSubGrid = (pos: GridPosition, status: boolean) => {
          const grid = { ...newSubGrids[pos] };
          grid.cells = grid.cells.map(c => ({ ...c, completed: status }));
          newSubGrids[pos] = grid;
        };

        // If it's a sub-goal in the center grid (MM)
        if (gridPos === 'MM' && cellIndex !== 4) {
          const targetSubGridPos = positions[cellIndex];
          // 1. Toggle the MM cell itself
          const mmGrid = { ...newSubGrids['MM'] };
          mmGrid.cells = [...mmGrid.cells];
          mmGrid.cells[cellIndex] = { ...mmGrid.cells[cellIndex], completed: newStatus };
          newSubGrids['MM'] = mmGrid;
          
          // 2. Cascade to the entire SubGrid
          cascadeSubGrid(targetSubGridPos, newStatus);
        } 
        // If it's the center cell of a surrounding sub-grid
        else if (gridPos !== 'MM' && cellIndex === 4) {
          // 1. Cascade the entire SubGrid
          cascadeSubGrid(gridPos, newStatus);
          
          // 2. Update the corresponding MM cell
          const mmIndex = positions.indexOf(gridPos);
          const mmGrid = { ...newSubGrids['MM'] };
          mmGrid.cells = [...mmGrid.cells];
          mmGrid.cells[mmIndex] = { ...mmGrid.cells[mmIndex], completed: newStatus };
          newSubGrids['MM'] = mmGrid;
        } 
        // Regular task
        else {
          const grid = { ...newSubGrids[gridPos] };
          grid.cells = [...grid.cells];
          grid.cells[cellIndex] = { ...grid.cells[cellIndex], completed: newStatus };
          newSubGrids[gridPos] = grid;
        }

        return { manda: { ...state.manda, subGrids: newSubGrids } };
      }),

      setEntireManda: (data) => set({ manda: data }),
      setDarkMode: (isDarkMode) => set((state) => ({ manda: { ...state.manda, isDarkMode } })),
      setTheme: (theme) => set((state) => ({ manda: { ...state.manda, theme } })),
      
      resetManda: () => set((state) => ({
        manda: {
          ...state.manda,
          mainTitle: '나의 만다라트',
          subGrids: { ...initialSubGrids },
        }
      })),

      getShareableUrl: () => {
        const data = JSON.stringify(get().manda);
        const encoded = btoa(encodeURIComponent(data));
        return `${window.location.origin}${window.location.pathname}#state=${encoded}`;
      },

      loadFromUrl: (hash) => {
        try {
          if (hash.startsWith('#state=')) {
            const encoded = hash.replace('#state=', '');
            const decoded = decodeURIComponent(atob(encoded));
            const parsed = JSON.parse(decoded);
            set({ manda: parsed });
          }
        } catch (e) {
          console.error("Failed to load state from URL", e);
        }
      }
    }),
    {
      name: 'manda-ai-storage',
    }
  )
);
