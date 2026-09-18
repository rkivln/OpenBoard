import React, { useState } from 'react';
import { X, Search, Shapes, Database, Cloud, MessageSquare, Star, Network, Cpu, Layout } from 'lucide-react';
import { ShapeKind } from '../../types.ts';

interface MoreShapesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectShape: (shape: ShapeKind) => void;
}

interface ShapeItem {
  id: ShapeKind;
  label: string;
  category: 'basic' | 'flowchart' | 'callouts' | 'architecture';
  icon: React.ReactNode;
}

export const MoreShapesModal: React.FC<MoreShapesModalProps> = ({
  isOpen,
  onClose,
  onSelectShape,
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const shapes: ShapeItem[] = [
    {
      id: 'rect',
      label: 'Rectangle',
      category: 'basic',
      icon: <div className="w-6 h-6 border-2 border-slate-700 rounded-xs" />,
    },
    {
      id: 'rounded-rect',
      label: 'Rounded Rectangle',
      category: 'basic',
      icon: <div className="w-6 h-6 border-2 border-slate-700 rounded-lg" />,
    },
    {
      id: 'circle',
      label: 'Circle / Oval',
      category: 'basic',
      icon: <div className="w-6 h-6 border-2 border-slate-700 rounded-full" />,
    },
    {
      id: 'diamond',
      label: 'Decision Diamond',
      category: 'flowchart',
      icon: <div className="w-5 h-5 border-2 border-slate-700 rotate-45" />,
    },
    {
      id: 'triangle',
      label: 'Triangle',
      category: 'basic',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-slate-700 stroke-2">
          <polygon points="12,3 22,21 2,21" />
        </svg>
      ),
    },
    {
      id: 'triangle-down',
      label: 'Inverted Triangle',
      category: 'basic',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-slate-700 stroke-2">
          <polygon points="2,3 22,3 12,21" />
        </svg>
      ),
    },
    {
      id: 'pill',
      label: 'Pill / Terminator',
      category: 'flowchart',
      icon: <div className="w-7 h-4 border-2 border-slate-700 rounded-full" />,
    },
    {
      id: 'cylinder',
      label: 'Database / Cylinder',
      category: 'architecture',
      icon: <Database className="w-6 h-6 text-slate-700" />,
    },
    {
      id: 'cloud',
      label: 'Cloud Storage',
      category: 'architecture',
      icon: <Cloud className="w-6 h-6 text-slate-700" />,
    },
    {
      id: 'bubble',
      label: 'Speech Bubble',
      category: 'callouts',
      icon: <MessageSquare className="w-6 h-6 text-slate-700" />,
    },
    {
      id: 'star',
      label: '5-Point Star',
      category: 'callouts',
      icon: <Star className="w-6 h-6 text-slate-700" />,
    },
    {
      id: 'mindmap',
      label: 'Mindmap Node',
      category: 'flowchart',
      icon: <Network className="w-6 h-6 text-slate-700" />,
    },
  ];

  const filtered = shapes.filter((s) => {
    const matchesSearch = s.label.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
              <Shapes className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Shape Library</h3>
              <p className="text-[11px] text-slate-400">Select any shape to insert on your canvas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-3 border-b border-slate-100 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search shapes, flowcharts, architecture..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-400 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['all', 'basic', 'flowchart', 'architecture', 'callouts'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-purple-600 text-white font-medium'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Shape Grid */}
        <div className="p-4 max-h-72 overflow-y-auto grid grid-cols-4 gap-3">
          {filtered.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                onSelectShape(s.id);
                onClose();
              }}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200/80 hover:border-purple-400 hover:bg-purple-50/50 transition-all group cursor-pointer gap-2"
            >
              <div className="h-8 flex items-center justify-center group-hover:scale-110 transition-transform">
                {s.icon}
              </div>
              <span className="text-[11px] font-medium text-slate-700 text-center truncate w-full">
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
