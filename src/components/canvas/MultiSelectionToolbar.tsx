import React from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Grid,
  Copy,
  Trash2,
  Columns,
} from 'lucide-react';
import { CanvasElement } from '../../types.ts';
import { soundEngine } from '../../utils/audio.ts';

interface MultiSelectionToolbarProps {
  selectedElements: CanvasElement[];
  onBatchUpdate: (updates: { id: string; partial: Partial<CanvasElement> }[]) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  zoom: number;
}

export const MultiSelectionToolbar: React.FC<MultiSelectionToolbarProps> = ({
  selectedElements,
  onBatchUpdate,
  onDuplicate,
  onDelete,
}) => {
  if (selectedElements.length < 2) return null;

  const getDims = (el: CanvasElement) => ({
    w: 'width' in el ? (el.width || 100) : 100,
    h: 'height' in el ? (el.height || 60) : 60,
  });

  // 1. Align Left
  const handleAlignLeft = () => {
    soundEngine.playSnap();
    const minX = Math.min(...selectedElements.map((e) => e.x));
    const updates = selectedElements.map((e) => ({ id: e.id, partial: { x: minX } }));
    onBatchUpdate(updates);
  };

  // 2. Align Center Horizontally
  const handleAlignCenter = () => {
    soundEngine.playSnap();
    const minX = Math.min(...selectedElements.map((e) => e.x));
    const maxX = Math.max(...selectedElements.map((e) => e.x + getDims(e).w));
    const midX = (minX + maxX) / 2;
    const updates = selectedElements.map((e) => ({
      id: e.id,
      partial: { x: midX - getDims(e).w / 2 },
    }));
    onBatchUpdate(updates);
  };

  // 3. Align Right
  const handleAlignRight = () => {
    soundEngine.playSnap();
    const maxX = Math.max(...selectedElements.map((e) => e.x + getDims(e).w));
    const updates = selectedElements.map((e) => ({
      id: e.id,
      partial: { x: maxX - getDims(e).w },
    }));
    onBatchUpdate(updates);
  };

  // 4. Align Top
  const handleAlignTop = () => {
    soundEngine.playSnap();
    const minY = Math.min(...selectedElements.map((e) => e.y));
    const updates = selectedElements.map((e) => ({ id: e.id, partial: { y: minY } }));
    onBatchUpdate(updates);
  };

  // 5. Align Middle Vertically
  const handleAlignMiddle = () => {
    soundEngine.playSnap();
    const minY = Math.min(...selectedElements.map((e) => e.y));
    const maxY = Math.max(...selectedElements.map((e) => e.y + getDims(e).h));
    const midY = (minY + maxY) / 2;
    const updates = selectedElements.map((e) => ({
      id: e.id,
      partial: { y: midY - getDims(e).h / 2 },
    }));
    onBatchUpdate(updates);
  };

  // 6. Align Bottom
  const handleAlignBottom = () => {
    soundEngine.playSnap();
    const maxY = Math.max(...selectedElements.map((e) => e.y + getDims(e).h));
    const updates = selectedElements.map((e) => ({
      id: e.id,
      partial: { y: maxY - getDims(e).h },
    }));
    onBatchUpdate(updates);
  };

  // 7. Distribute Horizontally
  const handleDistributeHorizontal = () => {
    if (selectedElements.length < 3) return;
    soundEngine.playSnap();
    const sorted = [...selectedElements].sort((a, b) => a.x - b.x);
    const minX = sorted[0].x;
    const last = sorted[sorted.length - 1];
    const maxX = last.x;
    const step = (maxX - minX) / (sorted.length - 1);

    const updates = sorted.map((e, idx) => ({
      id: e.id,
      partial: { x: minX + step * idx },
    }));
    onBatchUpdate(updates);
  };

  // 8. Tidy Up Grid Auto-Arrange
  const handleTidyUp = () => {
    soundEngine.playSnap();
    const count = selectedElements.length;
    const cols = Math.ceil(Math.sqrt(count));
    const minX = Math.min(...selectedElements.map((e) => e.x));
    const minY = Math.min(...selectedElements.map((e) => e.y));
    const gap = 30;

    const maxW = Math.max(...selectedElements.map((e) => getDims(e).w));
    const maxH = Math.max(...selectedElements.map((e) => getDims(e).h));

    const updates = selectedElements.map((e, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      return {
        id: e.id,
        partial: {
          x: minX + col * (maxW + gap),
          y: minY + row * (maxH + gap),
        },
      };
    });
    onBatchUpdate(updates);
  };

  return (
    <div
      id="multi-selection-alignment-bar"
      className="fixed top-18 left-1/2 -translate-x-1/2 z-40 bg-[#1d1d1f]/90 text-white backdrop-blur-2xl px-2 py-1 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.3)] border border-white/10 flex items-center gap-1 select-none animate-in fade-in slide-in-from-top-2 duration-120"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <span className="text-[10px] font-medium text-zinc-400 px-1.5 uppercase tracking-wider">
        {selectedElements.length} Selected
      </span>

      <div className="w-px h-4 bg-white/10 mx-0.5" />

      {/* Horizontal Alignment */}
      <button
        onClick={handleAlignLeft}
        className="w-7 h-7 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
        title="Align Left"
      >
        <AlignLeft className="w-3.5 h-3.5 stroke-[2]" />
      </button>
      <button
        onClick={handleAlignCenter}
        className="w-7 h-7 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
        title="Align Center"
      >
        <AlignCenter className="w-3.5 h-3.5 stroke-[2]" />
      </button>
      <button
        onClick={handleAlignRight}
        className="w-7 h-7 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
        title="Align Right"
      >
        <AlignRight className="w-3.5 h-3.5 stroke-[2]" />
      </button>

      <div className="w-px h-4 bg-white/10 mx-0.5" />

      {/* Vertical Alignment */}
      <button
        onClick={handleAlignTop}
        className="w-7 h-7 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
        title="Align Top"
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
          <path d="M 2 2.5 L 14 2.5" />
          <rect x="4" y="5.5" width="8" height="3" rx="0.5" />
          <rect x="6" y="10.5" width="4" height="3" rx="0.5" />
        </svg>
      </button>
      <button
        onClick={handleAlignMiddle}
        className="w-7 h-7 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
        title="Align Middle"
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
          <line x1="2" y1="8" x2="14" y2="8" strokeDasharray="1.5 1.5" />
          <rect x="3.5" y="4" width="3.5" height="8" rx="0.5" />
          <rect x="9" y="5" width="3.5" height="6" rx="0.5" />
        </svg>
      </button>
      <button
        onClick={handleAlignBottom}
        className="w-7 h-7 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
        title="Align Bottom"
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
          <path d="M 2 13.5 L 14 13.5" />
          <rect x="4" y="7.5" width="8" height="3" rx="0.5" />
          <rect x="6" y="2.5" width="4" height="3" rx="0.5" />
        </svg>
      </button>

      <div className="w-px h-4 bg-white/10 mx-0.5" />

      {/* Distribute & Tidy */}
      <button
        onClick={handleDistributeHorizontal}
        disabled={selectedElements.length < 3}
        className="w-7 h-7 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center transition-all cursor-pointer active:scale-95"
        title="Distribute Horizontally"
      >
        <Columns className="w-3.5 h-3.5 stroke-[2]" />
      </button>
      <button
        onClick={handleTidyUp}
        className="w-7 h-7 rounded-lg hover:bg-[#0071e3] text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
        title="Tidy Up Grid"
      >
        <Grid className="w-3.5 h-3.5 stroke-[2]" />
      </button>

      <div className="w-px h-4 bg-white/10 mx-0.5" />

      {/* Duplicate & Delete */}
      <button
        onClick={onDuplicate}
        className="w-7 h-7 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
        title="Duplicate (Ctrl+D)"
      >
        <Copy className="w-3.5 h-3.5 stroke-[2]" />
      </button>
      <button
        onClick={onDelete}
        className="w-7 h-7 rounded-lg hover:bg-rose-600/80 text-rose-400 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
        title="Delete (Backspace)"
      >
        <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
      </button>
    </div>
  );
};
