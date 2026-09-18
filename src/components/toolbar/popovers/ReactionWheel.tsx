import React from 'react';
import { StampKind } from '../../../types.ts';
import confetti from 'canvas-confetti';

interface ReactionWheelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStamp: (kind: StampKind, emoji?: string) => void;
  selectedStamp: StampKind;
}

export const ReactionWheel: React.FC<ReactionWheelProps> = ({
  isOpen,
  onClose,
  onSelectStamp,
  selectedStamp,
}) => {
  if (!isOpen) return null;

  const handleSliceClick = (kind: StampKind, emoji?: string) => {
    onSelectStamp(kind, emoji);
    confetti({
      particleCount: 18,
      spread: 35,
      origin: { y: 0.75, x: 0.65 },
    });
    onClose();
  };

  return (
    <div
      id="reaction-wheel-container"
      className="absolute bottom-18 left-[64%] -translate-x-1/2 z-50 animate-in fade-in zoom-in-75 duration-150"
    >
      {/* Click outside backdrop */}
      <div className="fixed inset-0 z-0 pointer-events-auto" onClick={onClose} />

      {/* Radial Wheel Card */}
      <div className="relative z-10 w-52 h-52 rounded-full bg-white/95 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.18)] border border-slate-200/90 p-1 flex items-center justify-center">
        {/* Outer Circle Segments Background Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="96" fill="none" stroke="#f1f5f9" strokeWidth="1" />
          {/* Radial dividing spokes */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="100"
              y1="100"
              x2={100 + 96 * Math.cos((deg * Math.PI) / 180)}
              y2={100 + 96 * Math.sin((deg * Math.PI) / 180)}
              stroke="#f1f5f9"
              strokeWidth="1.5"
            />
          ))}
        </svg>

        {/* 8 Radial Stamp Buttons positioned along the 8 sectors */}

        {/* 1. Top: Green Thumbs Up 👍 */}
        <button
          onClick={() => handleSliceClick('thumbs-up')}
          className="absolute top-2 left-1/2 -translate-x-1/2 p-2 hover:scale-125 transition-transform cursor-pointer rounded-full hover:bg-emerald-50"
          title="Thumbs Up"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-lg shadow-xs">
            👍
          </div>
        </button>

        {/* 2. Top-Right: Purple +1 ➕1 */}
        <button
          onClick={() => handleSliceClick('plus-one')}
          className="absolute top-6 right-6 p-2 hover:scale-125 transition-transform cursor-pointer rounded-full hover:bg-purple-50"
          title="+1 reaction"
        >
          <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center font-black text-xs text-purple-700 shadow-xs">
            +1
          </div>
        </button>

        {/* 3. Right: Yellow Star ⭐ */}
        <button
          onClick={() => handleSliceClick('star')}
          className="absolute top-1/2 right-2 -translate-y-1/2 p-2 hover:scale-125 transition-transform cursor-pointer rounded-full hover:bg-amber-50"
          title="Star"
        >
          <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-lg shadow-xs">
            ⭐
          </div>
        </button>

        {/* 4. Bottom-Right: Red/Orange Question Mark ❓ */}
        <button
          onClick={() => handleSliceClick('question')}
          className="absolute bottom-6 right-6 p-2 hover:scale-125 transition-transform cursor-pointer rounded-full hover:bg-orange-50"
          title="Question"
        >
          <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-300 flex items-center justify-center font-black text-sm text-orange-600 shadow-xs">
            ❓
          </div>
        </button>

        {/* 5. Bottom: Blue Thumbs Down 👎 */}
        <button
          onClick={() => handleSliceClick('thumbs-down')}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 p-2 hover:scale-125 transition-transform cursor-pointer rounded-full hover:bg-blue-50"
          title="Thumbs Down"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-lg shadow-xs">
            👎
          </div>
        </button>

        {/* 6. Bottom-Left: Blank Sticker Circle 🔘 */}
        <button
          onClick={() => handleSliceClick('circle-badge')}
          className="absolute bottom-6 left-6 p-2 hover:scale-125 transition-transform cursor-pointer rounded-full hover:bg-slate-100"
          title="Sticker Badge"
        >
          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-500 shadow-xs">
            <div className="w-4 h-4 rounded-full border border-dashed border-slate-400" />
          </div>
        </button>

        {/* 7. Left: User Avatar Badge 'G' */}
        <button
          onClick={() => handleSliceClick('avatar-g')}
          className="absolute top-1/2 left-2 -translate-y-1/2 p-2 hover:scale-125 transition-transform cursor-pointer rounded-full hover:bg-amber-50"
          title="User Avatar Stamp"
        >
          <div className="w-8 h-8 rounded-full bg-[#4a3525] border border-amber-900/40 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            G
          </div>
        </button>

        {/* 8. Top-Left: Red/Coral Heart ❤️ */}
        <button
          onClick={() => handleSliceClick('heart')}
          className="absolute top-6 left-6 p-2 hover:scale-125 transition-transform cursor-pointer rounded-full hover:bg-rose-50"
          title="Heart"
        >
          <div className="w-8 h-8 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-lg shadow-xs">
            ❤️
          </div>
        </button>

        {/* Inner Hub Circle with Emoji Cluster (Screenshot 4) */}
        <div
          className="relative z-20 w-16 h-16 rounded-full bg-white shadow-md border border-slate-200 flex flex-wrap items-center justify-center p-1.5 cursor-pointer hover:scale-110 transition-transform"
          onClick={() => handleSliceClick('emoji-fire', '🔥')}
          title="Quick Reaction Cluster"
        >
          <div className="grid grid-cols-2 gap-0.5 text-xs text-center select-none leading-none">
            <span>😂</span>
            <span>🙏</span>
            <span>👌</span>
            <span>🔥</span>
          </div>
        </div>
      </div>
    </div>
  );
};
