import React, { useState } from 'react';
import {
  Square,
  Circle,
  Diamond,
  Triangle,
  Database,
  Bold,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Copy,
  ChevronDown,
  Link,
  List,
} from 'lucide-react';
import { ShapeElement, ShapeKind } from '../../types.ts';

interface ShapeContextBarProps {
  element: ShapeElement;
  zoom: number;
  onUpdate: (updated: Partial<ShapeElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export const ShapeContextBar: React.FC<ShapeContextBarProps> = ({
  element,
  zoom,
  onUpdate,
  onDelete,
  onDuplicate,
}) => {
  const [openMenu, setOpenMenu] = useState<'shape' | 'color' | 'border' | 'typography' | 'align' | null>(null);

  const fillColors = [
    { label: 'White', color: '#ffffff', border: '#e2e8f0' },
    { label: 'Slate', color: '#f8fafc', border: '#cbd5e1' },
    { label: 'Sky Blue', color: '#e0f2fe', border: '#7dd3fc' },
    { label: 'Purple', color: '#f3e8ff', border: '#d8b4fe' },
    { label: 'Emerald', color: '#dcfce7', border: '#86efac' },
    { label: 'Amber', color: '#fef3c7', border: '#fde047' },
    { label: 'Rose', color: '#ffe4e6', border: '#fda4af' },
    { label: 'Transparent', color: 'transparent', border: '#94a3b8' },
  ];

  const strokeColors = [
    { label: 'Dark Slate', color: '#334155' },
    { label: 'Flowchart Gray', color: '#52525b' },
    { label: 'Purple', color: '#8b5cf6' },
    { label: 'Blue', color: '#0ea5e9' },
    { label: 'Emerald', color: '#10b981' },
  ];

  const shapes: { kind: ShapeKind; label: string; icon: React.ReactNode }[] = [
    {
      kind: 'rect',
      label: 'Rectangle',
      icon: <div className="w-3.5 h-3.5 border border-current rounded-xs" />,
    },
    {
      kind: 'rounded-rect',
      label: 'Rounded Rectangle',
      icon: <div className="w-3.5 h-3.5 border border-current rounded-md" />,
    },
    {
      kind: 'circle',
      label: 'Circle',
      icon: <div className="w-3.5 h-3.5 border border-current rounded-full" />,
    },
    {
      kind: 'diamond',
      label: 'Diamond (Decision)',
      icon: <div className="w-3 h-3 border border-current rotate-45 m-0.5" />,
    },
    {
      kind: 'triangle',
      label: 'Triangle',
      icon: (
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 stroke-current fill-none stroke-1.5">
          <polygon points="8,2 14,14 2,14" />
        </svg>
      ),
    },
    {
      kind: 'cylinder',
      label: 'Database / Storage',
      icon: (
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 stroke-current fill-none stroke-1.5">
          <ellipse cx="8" cy="4" rx="5.5" ry="2" />
          <path d="M 2.5 4 L 2.5 12 C 2.5 13.5 13.5 13.5 13.5 12 L 13.5 4" />
        </svg>
      ),
    },
    {
      kind: 'pill',
      label: 'Pill / Terminal',
      icon: <div className="w-4 h-2.5 border border-current rounded-full my-0.5" />,
    },
  ];

  const currentShapeObj = shapes.find((s) => s.kind === element.shapeKind) || shapes[0];

  return (
    <div
      id={`shape-context-bar-${element.id}`}
      onMouseDown={(e) => e.stopPropagation()}
      className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 bg-[#18181b] text-white rounded-xl shadow-2xl border border-zinc-700/80 px-2 py-1 flex items-center gap-1 text-xs select-none pointer-events-auto"
      style={{
        transform: `translateX(-50%) scale(${Math.max(0.85, Math.min(1.2, 1 / zoom))})`,
        transformOrigin: 'bottom center',
      }}
    >
      {/* 1. Shape Switcher Dropdown */}
      <div className="relative">
        <button
          onClick={() => setOpenMenu(openMenu === 'shape' ? null : 'shape')}
          className="flex items-center gap-1 px-1.5 py-1 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-200 cursor-pointer"
          title="Change shape type"
        >
          {currentShapeObj.icon}
          <ChevronDown className="w-3 h-3 text-zinc-400" />
        </button>

        {openMenu === 'shape' && (
          <div className="absolute bottom-9 left-0 bg-[#1e1e24] border border-zinc-700 rounded-xl shadow-xl p-1.5 z-60 w-44 space-y-0.5">
            <div className="text-[10px] font-semibold uppercase text-zinc-400 px-2 py-0.5">Shape Type</div>
            {shapes.map((s) => (
              <button
                key={s.kind}
                onClick={() => {
                  onUpdate({ shapeKind: s.kind });
                  setOpenMenu(null);
                }}
                className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  element.shapeKind === s.kind
                    ? 'bg-purple-600/30 text-purple-300 font-medium'
                    : 'text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                <span className="shrink-0">{s.icon}</span>
                <span className="truncate">{s.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-zinc-700 mx-0.5" />

      {/* 2. Color Fill Picker Dropdown */}
      <div className="relative">
        <button
          onClick={() => setOpenMenu(openMenu === 'color' ? null : 'color')}
          className="flex items-center gap-1 px-1.5 py-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Fill Color"
        >
          <div
            className="w-4 h-4 rounded-full border border-zinc-400 shadow-xs"
            style={{ backgroundColor: element.fillColor || '#ffffff' }}
          />
          <ChevronDown className="w-3 h-3 text-zinc-400" />
        </button>

        {openMenu === 'color' && (
          <div className="absolute bottom-9 left-0 bg-[#1e1e24] border border-zinc-700 rounded-xl shadow-xl p-2 z-60 w-40">
            <div className="text-[10px] font-semibold uppercase text-zinc-400 px-1 mb-1.5">Fill Color</div>
            <div className="grid grid-cols-4 gap-1.5">
              {fillColors.map((c) => (
                <button
                  key={c.color}
                  onClick={() => {
                    onUpdate({ fillColor: c.color });
                    setOpenMenu(null);
                  }}
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center cursor-pointer"
                  style={{
                    backgroundColor: c.color,
                    borderColor: element.fillColor === c.color ? '#8b5cf6' : c.border,
                  }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Border & Stroke Style */}
      <div className="relative">
        <button
          onClick={() => setOpenMenu(openMenu === 'border' ? null : 'border')}
          className="flex items-center gap-1 px-1.5 py-1 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-300 cursor-pointer"
          title="Border Style & Color"
        >
          <div
            className="w-3.5 h-3.5 rounded-xs border-2"
            style={{
              borderColor: element.strokeColor || '#52525b',
              borderStyle: element.strokeDash === 'dashed' ? 'dashed' : 'solid',
            }}
          />
          <ChevronDown className="w-3 h-3 text-zinc-400" />
        </button>

        {openMenu === 'border' && (
          <div className="absolute bottom-9 left-0 bg-[#1e1e24] border border-zinc-700 rounded-xl shadow-xl p-2 z-60 w-44 space-y-2">
            <div className="text-[10px] font-semibold uppercase text-zinc-400 px-1">Border Color</div>
            <div className="flex items-center gap-1.5 px-1">
              {strokeColors.map((sc) => (
                <button
                  key={sc.color}
                  onClick={() => onUpdate({ strokeColor: sc.color })}
                  className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer"
                  style={{
                    backgroundColor: sc.color,
                    borderColor: element.strokeColor === sc.color ? '#8b5cf6' : '#27272a',
                  }}
                  title={sc.label}
                />
              ))}
            </div>
            <div className="text-[10px] font-semibold uppercase text-zinc-400 px-1 pt-1">Border Style</div>
            <div className="grid grid-cols-2 gap-1 px-1">
              <button
                onClick={() => onUpdate({ strokeDash: 'solid' })}
                className={`py-1 px-2 rounded-lg text-center text-[11px] border transition-colors cursor-pointer ${
                  element.strokeDash !== 'dashed'
                    ? 'bg-zinc-800 border-purple-500 text-purple-300'
                    : 'border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                Solid
              </button>
              <button
                onClick={() => onUpdate({ strokeDash: 'dashed' })}
                className={`py-1 px-2 rounded-lg text-center text-[11px] border transition-colors cursor-pointer ${
                  element.strokeDash === 'dashed'
                    ? 'bg-zinc-800 border-purple-500 text-purple-300'
                    : 'border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                Dashed
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-zinc-700 mx-0.5" />

      {/* 4. Font Size Dropdown (Aa / Small / Medium / Large - Screenshot 2) */}
      <div className="relative">
        <button
          onClick={() => setOpenMenu(openMenu === 'typography' ? null : 'typography')}
          className="flex items-center gap-1 px-1.5 py-1 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-200 cursor-pointer"
          title="Font Size"
        >
          <span className="font-semibold text-xs">Aa</span>
          <span className="text-[11px] text-zinc-300">
            {(element.fontSize || 14) <= 13 ? 'Small' : (element.fontSize || 14) <= 17 ? 'Medium' : 'Large'}
          </span>
          <ChevronDown className="w-3 h-3 text-zinc-400" />
        </button>

        {openMenu === 'typography' && (
          <div className="absolute bottom-9 left-0 bg-[#1e1e24] border border-zinc-700 rounded-xl shadow-xl p-1 z-60 w-32 space-y-0.5">
            <button
              onClick={() => {
                onUpdate({ fontSize: 13 });
                setOpenMenu(null);
              }}
              className="w-full text-left px-2 py-1 rounded-lg text-xs hover:bg-zinc-800 text-zinc-200 cursor-pointer"
            >
              Small (13px)
            </button>
            <button
              onClick={() => {
                onUpdate({ fontSize: 16 });
                setOpenMenu(null);
              }}
              className="w-full text-left px-2 py-1 rounded-lg text-xs hover:bg-zinc-800 text-zinc-200 cursor-pointer"
            >
              Medium (16px)
            </button>
            <button
              onClick={() => {
                onUpdate({ fontSize: 20 });
                setOpenMenu(null);
              }}
              className="w-full text-left px-2 py-1 rounded-lg text-xs hover:bg-zinc-800 text-zinc-200 cursor-pointer"
            >
              Large (20px)
            </button>
          </div>
        )}
      </div>

      {/* 5. Bold & Strikethrough (B & S - Screenshot 2) */}
      <button
        onClick={() => onUpdate({ bold: !element.bold })}
        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
          element.bold ? 'bg-purple-600 text-white' : 'text-zinc-300 hover:bg-zinc-800'
        }`}
        title="Bold"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => onUpdate({ strikethrough: !element.strikethrough })}
        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
          element.strikethrough ? 'bg-purple-600 text-white' : 'text-zinc-300 hover:bg-zinc-800'
        }`}
        title="Strikethrough"
      >
        <Strikethrough className="w-3.5 h-3.5" />
      </button>

      {/* 6. Alignment Dropdown */}
      <div className="relative">
        <button
          onClick={() => setOpenMenu(openMenu === 'align' ? null : 'align')}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Text Alignment"
        >
          {element.align === 'left' ? (
            <AlignLeft className="w-3.5 h-3.5" />
          ) : element.align === 'right' ? (
            <AlignRight className="w-3.5 h-3.5" />
          ) : (
            <AlignCenter className="w-3.5 h-3.5" />
          )}
        </button>

        {openMenu === 'align' && (
          <div className="absolute bottom-9 left-0 bg-[#1e1e24] border border-zinc-700 rounded-xl shadow-xl p-1 z-60 flex gap-0.5">
            <button
              onClick={() => {
                onUpdate({ align: 'left' });
                setOpenMenu(null);
              }}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 cursor-pointer"
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                onUpdate({ align: 'center' });
                setOpenMenu(null);
              }}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 cursor-pointer"
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                onUpdate({ align: 'right' });
                setOpenMenu(null);
              }}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 cursor-pointer"
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-zinc-700 mx-0.5" />

      {/* 7. Duplicate & Delete */}
      {onDuplicate && (
        <button
          onClick={() => onDuplicate(element.id)}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Duplicate (Ctrl+D)"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      )}

      <button
        onClick={() => onDelete(element.id)}
        className="w-6 h-6 rounded-lg flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors cursor-pointer"
        title="Delete shape"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
