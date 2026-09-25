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
      className="absolute bottom-18 left-[64%] -translate-x-1/2 z-50 animate-in fade-in zoom-in-90 duration-150 select-none"
    >
      {/* Click outside backdrop */}
      <div className="fixed inset-0 z-0 pointer-events-auto" onClick={onClose} />

      {/* Radial Wheel Card - Apple Glass Disc */}
      <div className="relative z-10 w-52 h-52 rounded-full bg-white/90 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.04)] border border-black/[0.08] p-1 flex items-center justify-center">
        {/* Subtle radial guides */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="96" fill="none" stroke="#e4e4e7" strokeWidth="1" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="100"
              y1="100"
              x2={100 + 96 * Math.cos((deg * Math.PI) / 180)}
              y2={100 + 96 * Math.sin((deg * Math.PI) / 180)}
              stroke="#e4e4e7"
              strokeWidth="1"
            />
          ))}
        </svg>

        {/* 8 Radial Reaction Buttons */}

        {/* 1. Top: Thumbs Up 👍 */}
        <button
          onClick={() => handleSliceClick('thumbs-up')}
          className="absolute top-2 left-1/2 -translate-x-1/2 p-1.5 hover:scale-120 active:scale-95 transition-all cursor-pointer rounded-full"
          title="Thumbs Up"
        >
          <div className="w-8 h-8 rounded-full bg-white/95 border border-black/[0.06] shadow-xs flex items-center justify-center text-base">
            👍
          </div>
        </button>

        {/* 2. Top-Right: +1 */}
        <button
          onClick={() => handleSliceClick('plus-one')}
          className="absolute top-5 right-5 p-1.5 hover:scale-120 active:scale-95 transition-all cursor-pointer rounded-full"
          title="+1 reaction"
        >
          <div className="w-8 h-8 rounded-full bg-white/95 border border-black/[0.06] shadow-xs flex items-center justify-center font-bold text-xs text-[#0071e3]">
            +1
          </div>
        </button>

        {/* 3. Right: Star ⭐ */}
        <button
          onClick={() => handleSliceClick('star')}
          className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 hover:scale-120 active:scale-95 transition-all cursor-pointer rounded-full"
          title="Star"
        >
          <div className="w-8 h-8 rounded-full bg-white/95 border border-black/[0.06] shadow-xs flex items-center justify-center text-base">
            ⭐
          </div>
        </button>

        {/* 4. Bottom-Right: Question Mark ❓ */}
        <button
          onClick={() => handleSliceClick('question')}
          className="absolute bottom-5 right-5 p-1.5 hover:scale-120 active:scale-95 transition-all cursor-pointer rounded-full"
          title="Question"
        >
          <div className="w-8 h-8 rounded-full bg-white/95 border border-black/[0.06] shadow-xs flex items-center justify-center font-bold text-sm text-amber-600">
            ❓
          </div>
        </button>

        {/* 5. Bottom: Thumbs Down 👎 */}
        <button
          onClick={() => handleSliceClick('thumbs-down')}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 p-1.5 hover:scale-120 active:scale-95 transition-all cursor-pointer rounded-full"
          title="Thumbs Down"
        >
          <div className="w-8 h-8 rounded-full bg-white/95 border border-black/[0.06] shadow-xs flex items-center justify-center text-base">
            👎
          </div>
        </button>

        {/* 6. Bottom-Left: Stamp Badge 🔘 */}
        <button
          onClick={() => handleSliceClick('circle-badge')}
          className="absolute bottom-5 left-5 p-1.5 hover:scale-120 active:scale-95 transition-all cursor-pointer rounded-full"
          title="Badge Stamp"
        >
          <div className="w-8 h-8 rounded-full bg-white/95 border border-black/[0.06] shadow-xs flex items-center justify-center text-zinc-600">
            <div className="w-3.5 h-3.5 rounded-full border border-dashed border-zinc-400" />
          </div>
        </button>

        {/* 7. Left: User Avatar Badge */}
        <button
          onClick={() => handleSliceClick('avatar-g')}
          className="absolute top-1/2 left-2 -translate-y-1/2 p-1.5 hover:scale-120 active:scale-95 transition-all cursor-pointer rounded-full"
          title="User Avatar Stamp"
        >
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-black/10 text-white font-semibold text-xs flex items-center justify-center shadow-xs">
            G
          </div>
        </button>

        {/* 8. Top-Left: Heart ❤️ */}
        <button
          onClick={() => handleSliceClick('heart')}
          className="absolute top-5 left-5 p-1.5 hover:scale-120 active:scale-95 transition-all cursor-pointer rounded-full"
          title="Heart"
        >
          <div className="w-8 h-8 rounded-full bg-white/95 border border-black/[0.06] shadow-xs flex items-center justify-center text-base">
            ❤️
          </div>
        </button>

        {/* Inner Hub Circle - Apple Tapback Cluster */}
        <div
          className="relative z-20 w-16 h-16 rounded-full bg-white/95 shadow-sm border border-black/[0.06] flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all"
          onClick={() => handleSliceClick('emoji-fire', '🔥')}
          title="Fire Reaction"
        >
          <div className="grid grid-cols-2 gap-1 text-[11px] text-center select-none leading-none">
            <span>😂</span>
            <span>👏</span>
            <span>✨</span>
            <span>🔥</span>
          </div>
        </div>
      </div>
    </div>
  );
};
