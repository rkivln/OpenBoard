import React from 'react';
import { GridConfig } from '../../../types.ts';

interface GridPopoverProps {
  gridConfig: GridConfig;
  onChangeGrid: (config: Partial<GridConfig>) => void;
  onClose: () => void;
}

export const GridPopover: React.FC<GridPopoverProps> = ({
  gridConfig,
  onChangeGrid,
  onClose,
}) => {
  return (
    <div
      id="grid-popover"
      className="absolute bottom-16 left-[72%] -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-slate-200/80 p-3 w-56 animate-in fade-in zoom-in-95 duration-100 text-slate-800"
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
        <span className="text-xs font-semibold text-slate-900">Canvas Grid</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
      </div>

      {/* Grid Pattern Type */}
      <div className="space-y-1 mb-3">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Style</span>
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            onClick={() => onChangeGrid({ type: 'dots' })}
            className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-colors ${
              gridConfig.type === 'dots'
                ? 'bg-purple-50 border-purple-400 text-purple-700'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            Dots
          </button>
          <button
            onClick={() => onChangeGrid({ type: 'lines' })}
            className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-colors ${
              gridConfig.type === 'lines'
                ? 'bg-purple-50 border-purple-400 text-purple-700'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            Lines
          </button>
          <button
            onClick={() => onChangeGrid({ type: 'blank' })}
            className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-colors ${
              gridConfig.type === 'blank'
                ? 'bg-purple-50 border-purple-400 text-purple-700'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            Blank
          </button>
        </div>
      </div>

      {/* Grid Dot Spacing Size */}
      {gridConfig.type !== 'blank' && (
        <div className="space-y-1 mb-3">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Spacing</span>
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[
              { label: 'Small', size: 16 },
              { label: 'Medium', size: 24 },
              { label: 'Large', size: 36 },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => onChangeGrid({ size: s.size })}
                className={`py-1 px-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                  gridConfig.size === s.size
                    ? 'bg-purple-50 border-purple-400 text-purple-700'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Opacity Slider */}
      {gridConfig.type !== 'blank' && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Opacity</span>
            <span>{Math.round(gridConfig.opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={gridConfig.opacity}
            onChange={(e) => onChangeGrid({ opacity: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
          />
        </div>
      )}
    </div>
  );
};
