import React, { useRef } from 'react';
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
      className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-slate-200/80 px-2 py-1.5 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-100"
    >
      {/* 1. Subtools Row: Pencil, Highlighter, Washi tape, Eraser */}
      <div className="flex items-center gap-1">
        {/* Pencil */}
        <button
          onClick={() => onSelectSubTool('pencil')}
          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
            penSubTool === 'pencil'
              ? 'bg-purple-100 ring-1 ring-purple-300'
              : 'hover:bg-slate-100'
          }`}
          title="Pencil (smooth crisp line)"
        >
          <div className="w-5 h-6 flex items-center justify-center">
            {/* Pencil Tip Icon */}
            <svg viewBox="0 0 20 28" fill="none" className="w-4 h-6">
              <polygon points="10,0 15,10 5,10" fill="#18181b" />
              <rect x="5" y="10" width="10" height="14" rx="1" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.8" />
              <rect x="7" y="10" width="6" height="14" fill="#d4d4d8" />
            </svg>
          </div>
        </button>

        {/* Highlighter */}
        <button
          onClick={() => onSelectSubTool('highlighter')}
          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
            penSubTool === 'highlighter'
              ? 'bg-purple-100 ring-1 ring-purple-300'
              : 'hover:bg-slate-100'
          }`}
          title="Highlighter (translucent chisel stroke)"
        >
          <div className="w-5 h-6 flex items-center justify-center">
            {/* Highlighter chisel tip icon */}
            <svg viewBox="0 0 20 28" fill="none" className="w-4 h-6">
              <polygon points="13,0 16,3 8,11 5,8" fill="#eab308" />
              <rect x="4" y="10" width="12" height="14" rx="2" fill="#f4f4f5" stroke="#a1a1aa" strokeWidth="0.8" />
              <path d="M 4 14 L 16 14" stroke="#eab308" strokeWidth="2" />
            </svg>
          </div>
        </button>

        {/* Washi Tape / Pattern Ribbon */}
        <button
          onClick={() => onSelectSubTool('washi-tape')}
          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
            penSubTool === 'washi-tape'
              ? 'bg-purple-100 ring-1 ring-purple-300'
              : 'hover:bg-slate-100'
          }`}
          title="Washi Pattern Tape"
        >
          <div className="w-5 h-6 flex items-center justify-center">
            {/* Grid Tape Roll Icon (Screenshot 2 & 3) */}
            <div className="w-4 h-5 rounded-xs border border-purple-400 bg-purple-50 overflow-hidden relative">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#c084fc_1px,transparent_1px),linear-gradient(to_bottom,#c084fc_1px,transparent_1px)] bg-[size:4px_4px]" />
            </div>
          </div>
        </button>

        {/* Eraser */}
        <button
          onClick={() => onSelectSubTool('eraser')}
          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
            penSubTool === 'eraser'
              ? 'bg-purple-100 ring-1 ring-purple-300'
              : 'hover:bg-slate-100'
          }`}
          title="Eraser (click or drag to erase strokes/objects)"
        >
          <div className="w-5 h-6 flex items-center justify-center">
            {/* Pink & White Rubber Eraser Icon */}
            <svg viewBox="0 0 20 28" fill="none" className="w-4 h-6">
              <rect x="4" y="4" width="12" height="10" rx="1.5" fill="#f43f5e" />
              <rect x="4" y="14" width="12" height="10" rx="1" fill="#3b82f6" />
              <rect x="3" y="12" width="14" height="4" fill="#e4e4e7" />
            </svg>
          </div>
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-200" />

      {/* 2. Stroke Widths: Thin wavy line, Thick wavy line */}
      <div className="flex items-center gap-1 px-0.5">
        <button
          onClick={() => onSelectStrokeWidth(2.5)}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            strokeWidth <= 3.5
              ? 'bg-purple-100 ring-1 ring-purple-300 text-purple-700'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
          title="Thin stroke"
        >
          <svg viewBox="0 0 24 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-3">
            <path d="M 2 7 Q 7 2 12 7 T 22 7" />
          </svg>
        </button>

        <button
          onClick={() => onSelectStrokeWidth(6)}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            strokeWidth > 3.5
              ? 'bg-purple-100 ring-1 ring-purple-300 text-purple-700'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
          title="Thick stroke"
        >
          <svg viewBox="0 0 24 14" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" className="w-5 h-3">
            <path d="M 2 7 Q 7 2 12 7 T 22 7" />
          </svg>
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-200" />

      {/* 3. Swatches: Colors OR Washi Patterns */}
      {penSubTool !== 'washi-tape' ? (
        /* Color Swatches (Screenshot 2) */
        <div className="flex items-center gap-1.5 px-1">
          {COLORS.map((c) => {
            const isSelected = strokeColor.toLowerCase() === c.hex.toLowerCase();
            return (
              <button
                key={c.name}
                onClick={() => onSelectColor(c.hex)}
                className={`w-6 h-6 rounded-full transition-all cursor-pointer relative flex items-center justify-center ${
                  isSelected ? 'scale-110' : 'hover:scale-105'
                }`}
                title={c.name}
              >
                {/* Purple active ring for selected color (matches Screenshot 2) */}
                {isSelected && (
                  <div className="absolute -inset-0.5 rounded-full ring-2 ring-purple-600 ring-offset-1 pointer-events-none" />
                )}
                <div
                  className="w-5 h-5 rounded-full border border-slate-200/60 shadow-xs"
                  style={{ backgroundColor: c.hex }}
                />
              </button>
            );
          })}

          {/* Rainbow Color Picker Wheel */}
          <div className="relative">
            <button
              onClick={() => colorInputRef.current?.click()}
              className="w-6 h-6 rounded-full cursor-pointer hover:scale-105 transition-transform flex items-center justify-center shadow-xs overflow-hidden"
              title="Custom color picker"
            >
              <div
                className="w-5 h-5 rounded-full"
                style={{
                  background:
                    'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)',
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
        /* Washi Pattern Swatches (Screenshot 3) */
        <div className="flex items-center gap-1.5 px-1">
          {WASHI_PATTERNS.map((p) => {
            const isSelected = washiPattern === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPattern(p.id)}
                className={`w-6 h-6 rounded-full transition-all cursor-pointer relative flex items-center justify-center ${
                  isSelected ? 'scale-110 ring-2 ring-purple-600 ring-offset-1' : 'hover:scale-105'
                }`}
                title={p.name}
              >
                <div
                  className="w-5 h-5 rounded-full border border-slate-300/80 shadow-xs overflow-hidden flex items-center justify-center"
                  style={{ backgroundColor: p.bg }}
                >
                  {p.id === 'purple-grid' && (
                    <div className="w-full h-full bg-[linear-gradient(to_right,#a855f7_1px,transparent_1px),linear-gradient(to_bottom,#a855f7_1px,transparent_1px)] bg-[size:3px_3px]" />
                  )}
                  {p.id === 'confetti' && (
                    <div className="text-[8px] leading-none">🎉</div>
                  )}
                  {p.id === 'checker' && (
                    <div className="w-full h-full bg-[repeating-conic-gradient(#3b82f6_0%_25%,#fff_0%_50%)] bg-[size:6px_6px]" />
                  )}
                  {p.id === 'stars' && (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-[7px] text-yellow-300">★</div>
                  )}
                  {p.id === 'hazard' && (
                    <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#84cc16,#84cc16_3px,#fef08a_3px,#fef08a_6px)]" />
                  )}
                  {p.id === 'floral' && (
                    <div className="w-full h-full bg-pink-100 flex items-center justify-center text-[7px] text-pink-500">🌸</div>
                  )}
                  {p.id === 'galaxy' && (
                    <div className="w-full h-full bg-purple-900 flex items-center justify-center text-[7px] text-purple-300">✨</div>
                  )}
                  {p.id === 'botanical' && (
                    <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-[7px] text-emerald-600">🌿</div>
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
