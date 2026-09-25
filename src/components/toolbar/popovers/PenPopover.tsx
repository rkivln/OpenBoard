import React, { useRef } from 'react';
import { Pencil, Highlighter, Sparkles, Eraser } from 'lucide-react';
import { PenSubTool, WashiPattern } from '../../../types.ts';
import { WASHI_PATTERNS } from '../../../utils/patterns.tsx';

interface PenPopoverProps {
  penSubTool: PenSubTool;
  onSelectSubTool: (tool: PenSubTool) => void;
  strokeWidth: number;
  onSelectStrokeWidth: (width: number) => void;
  strokeColor: string;
  onSelectColor: (color: string) => void;
  washiPattern: WashiPattern;
  onSelectPattern: (pattern: WashiPattern) => void;
}

const COLORS = [
  { name: 'Black', hex: '#1e293b' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'White', hex: '#ffffff' },
];

export const PenPopover: React.FC<PenPopoverProps> = ({
  penSubTool,
  onSelectSubTool,
  strokeWidth,
  onSelectStrokeWidth,
  strokeColor,
  onSelectColor,
  washiPattern,
  onSelectPattern,
}) => {
  const colorInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      id="pen-popover"
      className="absolute bottom-18 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.04)] border border-black/[0.08] px-2 py-1.5 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-100 select-none"
    >
      {/* 1. Subtools Row: Pencil, Highlighter, Washi tape, Eraser */}
      <div className="flex items-center gap-0.5 bg-zinc-100/80 p-0.5 rounded-xl">
        {/* Pencil */}
        <button
          onClick={() => onSelectSubTool('pencil')}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
            penSubTool === 'pencil'
              ? 'bg-[#0071e3] text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.04]'
          }`}
          title="Pencil (fine line)"
        >
          <Pencil className="w-3.5 h-3.5 stroke-[2]" />
        </button>

        {/* Highlighter */}
        <button
          onClick={() => onSelectSubTool('highlighter')}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
            penSubTool === 'highlighter'
              ? 'bg-[#0071e3] text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.04]'
          }`}
          title="Highlighter (translucent)"
        >
          <Highlighter className="w-3.5 h-3.5 stroke-[2]" />
        </button>

        {/* Washi Tape / Decorative Ribbon */}
        <button
          onClick={() => onSelectSubTool('washi-tape')}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
            penSubTool === 'washi-tape'
              ? 'bg-[#0071e3] text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.04]'
          }`}
          title="Pattern Ribbon Tape"
        >
          <Sparkles className="w-3.5 h-3.5 stroke-[2]" />
        </button>

        {/* Eraser */}
        <button
          onClick={() => onSelectSubTool('eraser')}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
            penSubTool === 'eraser'
              ? 'bg-[#0071e3] text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.04]'
          }`}
          title="Eraser"
        >
          <Eraser className="w-3.5 h-3.5 stroke-[2]" />
        </button>
      </div>

      {/* Apple Hairline Divider */}
      <div className="w-px h-5 bg-black/[0.08]" />

      {/* 2. Apple Stroke Weights: Thin, Medium, Bold */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onSelectStrokeWidth(2)}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
            strokeWidth <= 3
              ? 'bg-zinc-200/90 text-zinc-900'
              : 'text-zinc-400 hover:text-zinc-700 hover:bg-black/[0.04]'
          }`}
          title="Thin (2px)"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-current" />
        </button>

        <button
          onClick={() => onSelectStrokeWidth(5)}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
            strokeWidth > 3 && strokeWidth <= 7
              ? 'bg-zinc-200/90 text-zinc-900'
              : 'text-zinc-400 hover:text-zinc-700 hover:bg-black/[0.04]'
          }`}
          title="Medium (5px)"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-current" />
        </button>

        <button
          onClick={() => onSelectStrokeWidth(10)}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
            strokeWidth > 7
              ? 'bg-zinc-200/90 text-zinc-900'
              : 'text-zinc-400 hover:text-zinc-700 hover:bg-black/[0.04]'
          }`}
          title="Thick (10px)"
        >
          <div className="w-3.5 h-3.5 rounded-full bg-current" />
        </button>
      </div>

      {/* Apple Hairline Divider */}
      <div className="w-px h-5 bg-black/[0.08]" />

      {/* 3. Color Wells (Apple Markup Palette) */}
      {penSubTool !== 'washi-tape' ? (
        <div className="flex items-center gap-1.5 px-0.5">
          {COLORS.map((c) => {
            const isSelected = strokeColor.toLowerCase() === c.hex.toLowerCase();
            return (
              <button
                key={c.name}
                onClick={() => onSelectColor(c.hex)}
                className={`w-5 h-5 rounded-full transition-all cursor-pointer relative flex items-center justify-center active:scale-90 ${
                  isSelected ? 'ring-2 ring-[#0071e3] ring-offset-1 scale-110' : 'hover:scale-105'
                }`}
                title={c.name}
              >
                <div
                  className="w-full h-full rounded-full border border-black/10 shadow-2xs"
                  style={{ backgroundColor: c.hex }}
                />
              </button>
            );
          })}

          {/* Color Picker Swatch */}
          <div className="relative">
            <button
              onClick={() => colorInputRef.current?.click()}
              className="w-5 h-5 rounded-full cursor-pointer hover:scale-110 active:scale-90 transition-transform flex items-center justify-center shadow-2xs border border-black/10 overflow-hidden"
              title="Custom Color"
            >
              <div
                className="w-full h-full"
                style={{
                  background:
                    'conic-gradient(from 0deg, #ff3b30, #ff9500, #ffcc00, #34c759, #007aff, #af52de, #ff3b30)',
                }}
              />
            </button>
            <input
              ref={colorInputRef}
              type="color"
              value={strokeColor}
              onChange={(e) => onSelectColor(e.target.value)}
              className="absolute inset-0 opacity-0 pointer-events-none"
            />
          </div>
        </div>
      ) : (
        /* Washi Pattern Swatches */
        <div className="flex items-center gap-1.5 px-0.5">
          {WASHI_PATTERNS.map((p) => {
            const isSelected = washiPattern === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPattern(p.id)}
                className={`w-5 h-5 rounded-full transition-all cursor-pointer relative flex items-center justify-center active:scale-90 ${
                  isSelected ? 'ring-2 ring-[#0071e3] ring-offset-1 scale-110' : 'hover:scale-105'
                }`}
                title={p.name}
              >
                <div
                  className="w-full h-full rounded-full border border-black/15 shadow-2xs overflow-hidden flex items-center justify-center"
                  style={{ backgroundColor: p.bg }}
                >
                  {p.id === 'purple-grid' && (
                    <div className="w-full h-full bg-[linear-gradient(to_right,#a855f7_1px,transparent_1px),linear-gradient(to_bottom,#a855f7_1px,transparent_1px)] bg-[size:3px_3px]" />
                  )}
                  {p.id === 'confetti' && (
                    <div className="text-[7px] leading-none">🎉</div>
                  )}
                  {p.id === 'checker' && (
                    <div className="w-full h-full bg-[repeating-conic-gradient(#3b82f6_0%_25%,#fff_0%_50%)] bg-[size:4px_4px]" />
                  )}
                  {p.id === 'stars' && (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-[6px] text-yellow-300">★</div>
                  )}
                  {p.id === 'hazard' && (
                    <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#84cc16,#84cc16_2px,#fef08a_2px,#fef08a_4px)]" />
                  )}
                  {p.id === 'floral' && (
                    <div className="w-full h-full bg-pink-100 flex items-center justify-center text-[6px] text-pink-500">🌸</div>
                  )}
                  {p.id === 'galaxy' && (
                    <div className="w-full h-full bg-purple-900 flex items-center justify-center text-[6px] text-purple-300">✨</div>
                  )}
                  {p.id === 'botanical' && (
                    <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-[6px] text-emerald-600">🌿</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
