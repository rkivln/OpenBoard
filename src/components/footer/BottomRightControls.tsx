import React from 'react';
import { Minus, Plus, HelpCircle, RotateCcw } from 'lucide-react';

interface BottomRightControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onOpenHelp: () => void;
}

export const BottomRightControls: React.FC<BottomRightControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onOpenHelp,
}) => {
  const percentage = Math.round(zoom * 100);

  return (
    <div
      id="bottom-right-controls"
      className="fixed bottom-4 right-4 z-40 flex items-center h-10 px-1.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-slate-200/80 gap-1 text-slate-700 select-none"
    >
      {/* Zoom Out [-] */}
      <button
        id="zoom-out-btn"
        onClick={onZoomOut}
        className="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900 cursor-pointer"
        title="Zoom Out (Ctrl -)"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      {/* Zoom Percentage */}
      <button
        id="zoom-percentage-btn"
        onClick={onResetZoom}
        className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:text-purple-600 hover:bg-slate-100 transition-colors cursor-pointer min-w-[44px] text-center"
        title="Reset to 100% (Ctrl 0)"
      >
        {percentage}%
      </button>

      {/* Zoom In [+] */}
      <button
        id="zoom-in-btn"
        onClick={onZoomIn}
        className="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900 cursor-pointer"
        title="Zoom In (Ctrl +)"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      {/* Divider */}
      <div className="w-px h-4 bg-slate-200 mx-0.5" />

      {/* Help Button [?] */}
      <button
        id="help-shortcuts-btn"
        onClick={onOpenHelp}
        className="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-600 hover:text-purple-600 cursor-pointer"
        title="Keyboard Shortcuts & Help (?)"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
    </div>
  );
};
