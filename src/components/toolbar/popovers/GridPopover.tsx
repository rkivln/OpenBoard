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
      className="absolute bottom-18 left-[72%] -translate-x-1/2 z-40 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.04)] border border-black/[0.08] p-3 w-60 animate-in fade-in zoom-in-95 duration-100 text-zinc-800 select-none"
    >
      <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] mb-2.5">
        <span className="text-xs font-semibold text-zinc-900 tracking-tight">Canvas Grid</span>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-zinc-700 w-5 h-5 rounded-md flex items-center justify-center text-xs hover:bg-black/[0.04] transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Grid Pattern Type - Apple Segmented Control */}
      <div className="space-y-1.5 mb-3">
        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Style</span>
        <div className="grid grid-cols-3 gap-1 bg-zinc-100/80 p-1 rounded-xl">
          <button
            onClick={() => onChangeGrid({ type: 'dots' })}
            className={`py-1 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer active:scale-95 ${
              gridConfig.type === 'dots'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Dots
          </button>
          <button
            onClick={() => onChangeGrid({ type: 'lines' })}
            className={`py-1 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer active:scale-95 ${
              gridConfig.type === 'lines'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Lines
          </button>
          <button
            onClick={() => onChangeGrid({ type: 'blank' })}
            className={`py-1 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer active:scale-95 ${
              gridConfig.type === 'blank'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Blank
          </button>
        </div>
      </div>

      {/* Grid Dot Spacing Size */}
      {gridConfig.type !== 'blank' && (
        <div className="space-y-1.5 mb-3">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Spacing</span>
          <div className="grid grid-cols-3 gap-1 bg-zinc-100/80 p-1 rounded-xl">
            {[
              { label: 'Compact', size: 16 },
              { label: 'Medium', size: 24 },
              { label: 'Spacious', size: 36 },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => onChangeGrid({ size: s.size })}
                className={`py-1 px-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer active:scale-95 ${
                  gridConfig.size === s.size
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
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
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            <span>Opacity</span>
            <span className="tabular-nums font-mono">{Math.round(gridConfig.opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={gridConfig.opacity}
            onChange={(e) => onChangeGrid({ opacity: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#0071e3]"
          />
        </div>
      )}
    </div>
  );
};
