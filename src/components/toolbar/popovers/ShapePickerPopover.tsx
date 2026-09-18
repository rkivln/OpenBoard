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
      className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-slate-200/80 p-1.5 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-100 max-w-[95vw] overflow-x-auto"
    >
      {/* 1. Left pill: Line Style / Stroke indicator with dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}
          className="flex items-center gap-1 px-2 py-1 rounded-xl hover:bg-slate-100 transition-colors text-slate-700 cursor-pointer"
          title="Line & Stroke Style"
        >
          <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
          </div>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {isStyleDropdownOpen && (
          <div className="absolute bottom-10 left-0 bg-white rounded-xl shadow-lg border border-slate-100 p-2 z-50 w-36 text-xs text-slate-700 space-y-1">
            <div className="font-semibold text-[11px] text-slate-400 px-1 uppercase">Line Style</div>
            <button
              onClick={() => {
                setActiveType('connector');
                onSelectConnector('straight');
                setIsStyleDropdownOpen(false);
              }}
              className="w-full text-left px-2 py-1 rounded-lg hover:bg-slate-50 flex items-center gap-2"
            >
              <div className="w-4 h-0.5 bg-slate-700" />
              <span>Solid Line</span>
            </button>
            <button
              onClick={() => {
                setActiveType('connector');
                onSelectConnector('arrow');
                setIsStyleDropdownOpen(false);
              }}
              className="w-full text-left px-2 py-1 rounded-lg hover:bg-slate-50 flex items-center gap-2"
            >
              <div className="w-4 h-0.5 bg-slate-700 relative">
                <div className="absolute right-0 -top-1 w-1.5 h-1.5 border-t-2 border-r-2 border-slate-700 rotate-45" />
              </div>
              <span>Arrow</span>
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-200" />

      {/* 2. Connectors: Orthogonal, Curved, Straight Arrow, Straight Line */}
      <div className="flex items-center gap-1">
        {/* Orthogonal / Elbow connector */}
        <button
          onClick={() => {
            setActiveType('connector');
            onSelectConnector('elbow');
          }}
          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
            activeType === 'connector' && selectedConnector === 'elbow'
              ? 'ring-1.5 ring-purple-600 text-purple-600 bg-purple-50'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Elbow Connector"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
            <path d="M 4 15 L 9 15 L 9 5 L 16 5" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="13,2 16.5,5 13,8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Curved arrow connector */}
        <button
          onClick={() => {
            setActiveType('connector');
            onSelectConnector('curved');
          }}
          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
            activeType === 'connector' && selectedConnector === 'curved'
              ? 'ring-1.5 ring-purple-600 text-purple-600 bg-purple-50'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Curved Arrow"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
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
          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
            activeType === 'connector' && selectedConnector === 'arrow'
              ? 'ring-1.5 ring-purple-600 text-purple-600 bg-purple-50'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Straight Arrow"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
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
          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
            activeType === 'connector' && selectedConnector === 'straight'
              ? 'ring-1.5 ring-purple-600 text-purple-600 bg-purple-50'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Straight Line"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
            <line x1="4" y1="16" x2="16" y2="4" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-200" />

      {/* 3. Shapes Row: Rectangle, Circle, Diamond, Triangle, Triangle Down, Pill, Cylinder, Mindmap */}
      <div className="flex items-center gap-1">
        {/* Rectangle */}
        <button
          onClick={() => {
            setActiveType('shape');
            onSelectShape('rect');
          }}
          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
            activeType === 'shape' && selectedShape === 'rect'
              ? 'ring-1.5 ring-purple-600 text-purple-600 bg-purple-50'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Rectangle"
        >
          <div className="w-5 h-5 border-1.5 border-current rounded-xs" />
        </button>

        {/* Circle (In Screenshot 1, this has purple outline!) */}
        <button
          onClick={() => {
            setActiveType('shape');
            onSelectShape('circle');
          }}
          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
            activeType === 'shape' && selectedShape === 'circle'
              ? 'ring-1.5 ring-purple-600 text-purple-600 bg-purple-50'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Circle / Ellipse"
        >
          <div className="w-5 h-5 border-1.5 border-current rounded-full" />
        </button>

        {/* Diamond */}
        <button
          onClick={() => {
            setActiveType('shape');
            onSelectShape('diamond');
          }}
          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
            activeType === 'shape' && selectedShape === 'diamond'
              ? 'ring-1.5 ring-purple-600 text-purple-600 bg-purple-50'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Diamond (Decision)"
        >
          <div className="w-4 h-4 border-1.5 border-current rotate-45 m-0.5" />
        </button>

        {/* Triangle Up */}
        <button
          onClick={() => {
            setActiveType('shape');
            onSelectShape('triangle');
          }}
          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
            activeType === 'shape' && selectedShape === 'triangle'
              ? 'ring-1.5 ring-purple-600 text-purple-600 bg-purple-50'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Triangle"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
            <polygon points="10,3 18,17 2,17" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Triangle Down (Inverted) */}
        <button
          onClick={() => {
            setActiveType('shape');
            onSelectShape('triangle-down');
          }}
          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
            activeType === 'shape' && selectedShape === 'triangle-down'
              ? 'ring-1.5 ring-purple-600 text-purple-600 bg-purple-50'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Inverted Triangle"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
            <polygon points="2,3 18,3 10,17" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Pill / Oval */}
        <button
          onClick={() => {
            setActiveType('shape');
            onSelectShape('pill');
          }}
          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
            activeType === 'shape' && selectedShape === 'pill'
              ? 'ring-1.5 ring-purple-600 text-purple-600 bg-purple-50'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Pill / Capsule"
        >
          <div className="w-5 h-3.5 border-1.5 border-current rounded-full my-1" />
        </button>

        {/* Cylinder / Database Storage */}
        <button
          onClick={() => {
            setActiveType('shape');
            onSelectShape('cylinder');
          }}
          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
            activeType === 'shape' && selectedShape === 'cylinder'
              ? 'ring-1.5 ring-purple-600 text-purple-600 bg-purple-50'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Cylinder / Database"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
            <ellipse cx="10" cy="5" rx="7" ry="2.5" />
            <path d="M 3 5 L 3 15 C 3 17 17 17 17 15 L 17 5" />
          </svg>
        </button>

        {/* Mindmap / Tree Node */}
        <button
          onClick={() => {
            setActiveType('shape');
            onSelectShape('mindmap');
          }}
          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
            activeType === 'shape' && selectedShape === 'mindmap'
              ? 'ring-1.5 ring-purple-600 text-purple-600 bg-purple-50'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Mindmap Tree Node"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
            <rect x="2" y="7" width="5" height="5" rx="1" />
            <rect x="13" y="2" width="5" height="5" rx="1" />
            <rect x="13" y="12" width="5" height="5" rx="1" />
            <path d="M 7 9.5 L 10 9.5 L 10 4.5 L 13 4.5" />
            <path d="M 10 9.5 L 10 14.5 L 13 14.5" />
          </svg>
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-200" />

      {/* 4. "More shapes" Button (Screenshot 1) */}
      <button
        onClick={onOpenMoreShapes}
        className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-purple-700 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-xl transition-colors shrink-0 cursor-pointer"
      >
        More shapes
      </button>
    </div>
  );
};
