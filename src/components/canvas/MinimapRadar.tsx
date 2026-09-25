import React, { useMemo } from 'react';
import { CanvasElement } from '../../types.ts';
import { soundEngine } from '../../utils/audio.ts';

interface MinimapRadarProps {
  elements: CanvasElement[];
  zoom: number;
  pan: { x: number; y: number };
  onNavigatePan: (newPan: { x: number; y: number }) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const MinimapRadar: React.FC<MinimapRadarProps> = ({
  elements,
  zoom,
  pan,
  onNavigatePan,
  isOpen,
  onToggle,
}) => {
  const mapWidth = 180;
  const mapHeight = 120;

  // Calculate bounding box of all elements on the canvas
  const bounds = useMemo(() => {
    if (elements.length === 0) {
      return { minX: -500, minY: -400, maxX: 1500, maxY: 1000, width: 2000, height: 1400 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    elements.forEach((el) => {
      const w = 'width' in el ? (el.width || 100) : 100;
      const h = 'height' in el ? (el.height || 60) : 60;
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + w);
      maxY = Math.max(maxY, el.y + h);
    });

    // Add margin
    const pad = 400;
    minX -= pad;
    minY -= pad;
    maxX += pad;
    maxY += pad;

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: Math.max(maxX - minX, 1000),
      height: Math.max(maxY - minY, 800),
    };
  }, [elements]);

  // Scaled viewport rect on minimap
  const viewX = (-pan.x / zoom - bounds.minX) / bounds.width * mapWidth;
  const viewY = (-pan.y / zoom - bounds.minY) / bounds.height * mapHeight;
  const viewW = (window.innerWidth / zoom / bounds.width) * mapWidth;
  const viewH = (window.innerHeight / zoom / bounds.height) * mapHeight;

  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert minimap coordinate to world coordinate
    const targetWorldX = bounds.minX + (clickX / mapWidth) * bounds.width;
    const targetWorldY = bounds.minY + (clickY / mapHeight) * bounds.height;

    // Center screen on target
    const newPanX = window.innerWidth / 2 - targetWorldX * zoom;
    const newPanY = window.innerHeight / 2 - targetWorldY * zoom;

    soundEngine.playSnap();
    onNavigatePan({ x: newPanX, y: newPanY });
  };

  if (!isOpen) return null;

  return (
    <div
      id="minimap-radar"
      className="fixed bottom-16 right-4 z-30 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.04)] border border-black/[0.08] p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-100 select-none"
    >
      <div className="flex items-center justify-between pb-1.5 px-1 border-b border-black/[0.06] mb-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
        <span>Minimap Navigator</span>
        <button
          onClick={onToggle}
          className="text-zinc-400 hover:text-zinc-700 w-4 h-4 rounded flex items-center justify-center text-xs hover:bg-black/[0.04] transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>

      <div
        onClick={handleMinimapClick}
        style={{ width: `${mapWidth}px`, height: `${mapHeight}px` }}
        className="relative bg-zinc-50 rounded-xl border border-black/[0.06] overflow-hidden cursor-crosshair shadow-inner"
      >
        {/* Render elements as miniature blocks */}
        {elements.map((el) => {
          const rx = ((el.x - bounds.minX) / bounds.width) * mapWidth;
          const ry = ((el.y - bounds.minY) / bounds.height) * mapHeight;
          const rw = Math.max((('width' in el ? (el.width || 80) : 80) / bounds.width) * mapWidth, 3);
          const rh = Math.max((('height' in el ? (el.height || 50) : 50) / bounds.height) * mapHeight, 2);

          let color = '#94a3b8';
          if (el.type === 'sticky') color = '#facc15';
          else if (el.type === 'shape') color = (el as any).strokeColor || '#0071e3';
          else if (el.type === 'frame') color = '#0284c7';
          else if (el.type === 'code') color = '#18181b';
          else if (el.type === 'image') color = '#38bdf8';

          return (
            <div
              key={el.id}
              className="absolute rounded-2xs pointer-events-none"
              style={{
                left: `${rx}px`,
                top: `${ry}px`,
                width: `${rw}px`,
                height: `${rh}px`,
                backgroundColor: color,
                opacity: el.type === 'frame' ? 0.3 : 0.85,
              }}
            />
          );
        })}

        {/* Viewport Indicator Rectangle - Apple System Blue */}
        <div
          className="absolute border-2 border-[#0071e3] bg-[#0071e3]/15 rounded-xs pointer-events-none transition-all duration-75 shadow-2xs"
          style={{
            left: `${Math.max(0, Math.min(mapWidth - 8, viewX))}px`,
            top: `${Math.max(0, Math.min(mapHeight - 8, viewY))}px`,
            width: `${Math.min(mapWidth, Math.max(12, viewW))}px`,
            height: `${Math.min(mapHeight, Math.max(10, viewH))}px`,
          }}
        />
      </div>
    </div>
  );
};
