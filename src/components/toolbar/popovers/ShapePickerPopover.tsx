import React, { useState } from 'react';
import { ShapeKind, ConnectorKind } from '../../../types.ts';
import { ChevronDown } from 'lucide-react';

interface ShapePickerPopoverProps {
  selectedShape: ShapeKind;
  onSelectShape: (shape: ShapeKind) => void;
  selectedConnector: ConnectorKind;
  onSelectConnector: (connector: ConnectorKind) => void;
  onOpenMoreShapes: () => void;
  activeType: 'shape' | 'connector';
  setActiveType: (type: 'shape' | 'connector') => void;
}

export const ShapePickerPopover: React.FC<ShapePickerPopoverProps> = ({
  selectedShape,
  onSelectShape,
  selectedConnector,
  onSelectConnector,
  onOpenMoreShapes,
  activeType,
  setActiveType,
}) => {
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);

  return (
    <div
      id="shape-picker-popover"
      className="absolute bottom-18 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.04)] border border-black/[0.08] p-1.5 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-100 max-w-[95vw] overflow-x-auto select-none"
    >
      {/* 1. Line Style Selector */}
      <div className="relative">
        <button
          onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}
          className="flex items-center gap-1 px-2 py-1 rounded-xl hover:bg-black/[0.04] transition-colors text-zinc-700 cursor-pointer active:scale-95"
          title="Line & Stroke Style"
        >
          <div className="w-4 h-4 rounded-full border border-zinc-700 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
          </div>
          <ChevronDown className="w-3 h-3 text-zinc-400" />
        </button>

        {isStyleDropdownOpen && (
          <div className="absolute bottom-10 left-0 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-black/[0.08] p-1.5 z-50 w-36 text-xs text-zinc-800 space-y-0.5">
            <div className="font-semibold text-[10px] text-zinc-400 px-2 py-1 uppercase tracking-wider">Line Style</div>
            <button
              onClick={() => {
                setActiveType('connector');
                onSelectConnector('straight');
                setIsStyleDropdownOpen(false);
              }}
              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-zinc-100 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <div className="w-4 h-0.5 bg-zinc-700" />
              <span>Solid Line</span>
            </button>
            <button
              onClick={() => {
                setActiveType('connector');
                onSelectConnector('arrow');
                setIsStyleDropdownOpen(false);
              }}
              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-zinc-100 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <div className="w-4 h-0.5 bg-zinc-700 relative">
                <div className="absolute right-0 -top-1 w-1.5 h-1.5 border-t-2 border-r-2 border-zinc-700 rotate-45" />
              </div>
              <span>Arrow</span>
            </button>
          </div>
        )}
      </div>

      {/* Apple Hairline Divider */}
      <div className="w-px h-5 bg-black/[0.08]" />

      {/* 2. Connectors: Elbow, Curved, Straight Arrow, Straight Line */}
      <div className="flex items-center gap-0.5 bg-zinc-100/80 p-0.5 rounded-xl">
        {/* Orthogonal / Elbow */}
        <button
          onClick={() => {
            setActiveType('connector');
            onSelectConnector('elbow');
          }}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
            activeType === 'connector' && selectedConnector === 'elbow'
              ? 'bg-[#0071e3] text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.04]'
          }`}
          title="Elbow Connector"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
            <path d="M 4 15 L 9 15 L 9 5 L 16 5" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="13,2 16.5,5 13,8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Curved arrow */}
        <button
          onClick={() => {
            setActiveType('connector');
            onSelectConnector('curved');
          }}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
            activeType === 'connector' && selectedConnector === 'curved'
              ? 'bg-[#0071e3] text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.04]'
          }`}
          title="Curved Arrow"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
            <path d="M 4 15 Q 8 6 16 5" strokeLinecap="round" />
            <polyline points="13,2 16.5,5 13,8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Straight arrow */}
        <button
          onClick={() => {
            setActiveType('connector');
            onSelectConnector('arrow');
          }}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
            activeType === 'connector' && selectedConnector === 'arrow'
              ? 'bg-[#0071e3] text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.04]'
          }`}
          title="Straight Arrow"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
            <line x1="4" y1="16" x2="16" y2="4" strokeLinecap="round" />
            <polyline points="10,4 16,4 16,10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Straight line */}
        <button
          onClick={() => {
            setActiveType('connector');
            onSelectConnector('straight');
          }}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
            activeType === 'connector' && selectedConnector === 'straight'
              ? 'bg-[#0071e3] text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.04]'
          }`}
          title="Straight Line"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
            <line x1="4" y1="16" x2="16" y2="4" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Apple Hairline Divider */}
      <div className="w-px h-5 bg-black/[0.08]" />

      {/* 3. Shapes Row */}
      <div className="flex items-center gap-0.5 bg-zinc-100/80 p-0.5 rounded-xl">
        {/* Rectangle */}
        <button
          onClick={() => {
            setActiveType('shape');
            onSelectShape('rect');
          }}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
            activeType === 'shape' && selectedShape === 'rect'
              ? 'bg-[#0071e3] text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.04]'
          }`}
          title="Rectangle"
        >
          <div className="w-4 h-4 border-1.5 border-current rounded-xs" />
        </button>

        {/* Circle */}
        <button
          onClick={() => {
            setActiveType('shape');
            onSelectShape('circle');
          }}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
            activeType === 'shape' && selectedShape === 'circle'
              ? 'bg-[#0071e3] text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.04]'
          }`}
          title="Circle"
        >
          <div className="w-4 h-4 border-1.5 border-current rounded-full" />
        </button>

        {/* Diamond */}
        <button
          onClick={() => {
            setActiveType('shape');
            onSelectShape('diamond');
          }}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
            activeType === 'shape' && selectedShape === 'diamond'
              ? 'bg-[#0071e3] text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.04]'
          }`}
          title="Diamond"
        >
          <div className="w-3.5 h-3.5 border-1.5 border-current rotate-45" />
        </button>

        {/* Triangle Up */}
        <button
          onClick={() => {
            setActiveType('shape');
            onSelectShape('triangle');
          }}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
            activeType === 'shape' && selectedShape === 'triangle'
              ? 'bg-[#0071e3] text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.04]'
          }`}
          title="Triangle"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
            <polygon points="10,3 18,17 2,17" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Triangle Down */}
        <button
          onClick={() => {
            setActiveType('shape');
            onSelectShape('triangle-down');
          }}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
            activeType === 'shape' && selectedShape === 'triangle-down'
              ? 'bg-[#0071e3] text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.04]'
          }`}
          title="Inverted Triangle"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
            <polygon points="2,3 18,3 10,17" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Pill / Capsule */}
        <button
          onClick={() => {
            setActiveType('shape');
            onSelectShape('pill');
          }}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
            activeType === 'shape' && selectedShape === 'pill'
              ? 'bg-[#0071e3] text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.04]'
          }`}
          title="Capsule"
        >
          <div className="w-4 h-2.5 border-1.5 border-current rounded-full" />
        </button>

        {/* Cylinder / Database */}
        <button
          onClick={() => {
            setActiveType('shape');
            onSelectShape('cylinder');
          }}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
            activeType === 'shape' && selectedShape === 'cylinder'
              ? 'bg-[#0071e3] text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.04]'
          }`}
          title="Database"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
            <ellipse cx="10" cy="5" rx="6" ry="2" />
            <path d="M 4 5 L 4 15 C 4 17 16 17 16 15 L 16 5" />
          </svg>
        </button>

        {/* Mindmap Tree Node */}
        <button
          onClick={() => {
            setActiveType('shape');
            onSelectShape('mindmap');
          }}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
            activeType === 'shape' && selectedShape === 'mindmap'
              ? 'bg-[#0071e3] text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.04]'
          }`}
          title="Mindmap Node"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
            <rect x="2" y="7" width="5" height="5" rx="1" />
            <rect x="13" y="2" width="5" height="5" rx="1" />
            <rect x="13" y="12" width="5" height="5" rx="1" />
            <path d="M 7 9.5 L 10 9.5 L 10 4.5 L 13 4.5" />
            <path d="M 10 9.5 L 10 14.5 L 13 14.5" />
          </svg>
        </button>
      </div>

      {/* Apple Hairline Divider */}
      <div className="w-px h-5 bg-black/[0.08]" />

      {/* 4. "More shapes" Button */}
      <button
        onClick={onOpenMoreShapes}
        className="px-2.5 py-1 text-xs font-medium text-zinc-700 hover:text-zinc-900 bg-zinc-100/90 hover:bg-zinc-200/80 active:scale-95 rounded-xl border border-black/[0.06] transition-all shrink-0 cursor-pointer"
      >
        More shapes
      </button>
    </div>
  );
};
