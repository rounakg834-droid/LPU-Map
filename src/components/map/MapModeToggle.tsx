import React from 'react';
import { Layers, Box } from 'lucide-react';

export type MapDisplayMode = '2d' | '3d';

interface MapModeToggleProps {
  mode: MapDisplayMode;
  onChangeMode: (newMode: MapDisplayMode) => void;
  className?: string;
}

export const MapModeToggle: React.FC<MapModeToggleProps> = ({
  mode,
  onChangeMode,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center p-0.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-full border border-black/[0.06] dark:border-white/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.06)] pointer-events-auto transition-all ${className}`}
      role="group"
      aria-label="Map Perspective Mode"
    >
      {/* 2D Navigation Mode */}
      <button
        type="button"
        onClick={() => onChangeMode('2d')}
        className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
          mode === '2d'
            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
        }`}
        title="2D Navigation Mode: Recommended for routing, GPS tracking, and turn-by-turn guidance"
      >
        <Layers className="w-3.5 h-3.5" />
        <span>2D</span>
      </button>

      {/* 3D Explore Mode */}
      <button
        type="button"
        onClick={() => onChangeMode('3d')}
        className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
          mode === '3d'
            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
        }`}
        title="3D Explore Mode: Architectural building models, tilt, bearing, and WebGL campus visualization"
      >
        <Box className="w-3.5 h-3.5" />
        <span>3D</span>
      </button>
    </div>
  );
};
