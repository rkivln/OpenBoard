import React from 'react';
import { Minus, Plus, HelpCircle, Map } from 'lucide-react';

interface BottomRightControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onOpenHelp: () => void;
  isMinimapOpen?: boolean;
  onToggleMinimap?: () => void;
}

export const BottomRightControls: React.FC<BottomRightControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onOpenHelp,
  isMinimapOpen = false,
  onToggleMinimap,
}) => {
  const percentage = Math.round(zoom * 100);

  return (
    <div
      id="bottom-right-controls"
      className="fixed bottom-4 right-4 z-40 flex items-center h-10 px-1 bg-white/85 backdrop-blur-2xl rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] border border-black/[0.08] gap-0.5 text-zinc-700 select-none"
    >
      {/* Minimap Radar Toggle */}
      {onToggleMinimap && (
        <>
          <button
            id="minimap-toggle-btn"
            onClick={onToggleMinimap}
            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
              isMinimapOpen
                ? 'bg-[#0071e3] text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.04]'
            }`}
            title="Toggle Canvas Radar / Minimap"
          >
            <Map className="w-3.5 h-3.5 stroke-[1.8]" />
          </button>
          <div className="w-px h-4 bg-black/[0.08] mx-0.5" />
        </>
      )}

      {/* Zoom Out [-] */}
      <button
        id="zoom-out-btn"
        onClick={onZoomOut}
        className="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-black/[0.04] active:scale-95 transition-all text-zinc-600 hover:text-zinc-900 cursor-pointer"
        title="Zoom Out (Ctrl -)"
      >
        <Minus className="w-3.5 h-3.5 stroke-[2]" />
      </button>

      {/* Zoom Percentage */}
      <button
        id="zoom-percentage-btn"
        onClick={onResetZoom}
        className="px-1.5 py-0.5 rounded-lg text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:bg-black/[0.04] active:scale-95 transition-all cursor-pointer min-w-[42px] text-center tabular-nums"
        title="Reset to 100% (Ctrl 0)"
      >
        {percentage}%
      </button>

      {/* Zoom In [+] */}
      <button
        id="zoom-in-btn"
        onClick={onZoomIn}
        className="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-black/[0.04] active:scale-95 transition-all text-zinc-600 hover:text-zinc-900 cursor-pointer"
        title="Zoom In (Ctrl +)"
      >
        <Plus className="w-3.5 h-3.5 stroke-[2]" />
      </button>

      {/* Apple Hairline Divider */}
      <div className="w-px h-4 bg-black/[0.08] mx-0.5" />

      {/* Help Button [?] */}
      <button
        id="help-shortcuts-btn"
        onClick={onOpenHelp}
        className="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-black/[0.04] active:scale-95 transition-all text-zinc-600 hover:text-zinc-900 cursor-pointer"
        title="Keyboard Shortcuts & Help (?)"
      >
        <HelpCircle className="w-3.5 h-3.5 stroke-[1.8]" />
      </button>
    </div>
  );
};
