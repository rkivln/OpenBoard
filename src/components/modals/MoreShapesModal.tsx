import React, { useState } from 'react';
import { X, Search, Shapes, Database, Cloud, MessageSquare, Star, Network } from 'lucide-react';
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
      icon: <div className="w-6 h-6 border-2 border-zinc-700 rounded-xs" />,
    },
    {
      id: 'rounded-rect',
      label: 'Rounded Rectangle',
      category: 'basic',
      icon: <div className="w-6 h-6 border-2 border-zinc-700 rounded-lg" />,
    },
    {
      id: 'circle',
      label: 'Circle',
      category: 'basic',
      icon: <div className="w-6 h-6 border-2 border-zinc-700 rounded-full" />,
    },
    {
      id: 'diamond',
      label: 'Decision Diamond',
      category: 'flowchart',
      icon: <div className="w-5 h-5 border-2 border-zinc-700 rotate-45" />,
    },
    {
      id: 'triangle',
      label: 'Triangle',
      category: 'basic',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-zinc-700 stroke-2">
          <polygon points="12,3 22,21 2,21" />
        </svg>
      ),
    },
    {
      id: 'triangle-down',
      label: 'Inverted Triangle',
      category: 'basic',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-zinc-700 stroke-2">
          <polygon points="2,3 22,3 12,21" />
        </svg>
      ),
    },
    {
      id: 'pill',
      label: 'Capsule',
      category: 'flowchart',
      icon: <div className="w-7 h-4 border-2 border-zinc-700 rounded-full" />,
    },
    {
      id: 'cylinder',
      label: 'Database',
      category: 'architecture',
      icon: <Database className="w-6 h-6 text-zinc-700" />,
    },
    {
      id: 'cloud',
      label: 'Cloud Infrastructure',
      category: 'architecture',
      icon: <Cloud className="w-6 h-6 text-zinc-700" />,
    },
    {
      id: 'bubble',
      label: 'Speech Bubble',
      category: 'callouts',
      icon: <MessageSquare className="w-6 h-6 text-zinc-700" />,
    },
    {
      id: 'star',
      label: 'Star',
      category: 'callouts',
      icon: <Star className="w-6 h-6 text-zinc-700" />,
    },
    {
      id: 'mindmap',
      label: 'Mindmap Node',
      category: 'flowchart',
      icon: <Network className="w-6 h-6 text-zinc-700" />,
    },
  ];

  const filtered = shapes.filter((s) => {
    const matchesSearch = s.label.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-black/[0.08] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-black/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-[#0071e3]">
              <Shapes className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-900">Shape Library</h3>
              <p className="text-[11px] text-zinc-500">Pick any vector shape for diagrams and wireframes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-black/[0.04] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-3 border-b border-black/[0.06] space-y-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search shapes and diagrams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200/80 rounded-xl text-xs outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 focus:bg-white transition-all text-zinc-800"
            />
          </div>

          <div className="flex items-center gap-1 bg-zinc-100/90 p-1 rounded-xl text-xs overflow-x-auto">
            {['all', 'basic', 'flowchart', 'architecture', 'callouts'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-1 py-1 px-2 rounded-lg capitalize transition-all whitespace-nowrap cursor-pointer active:scale-95 text-center ${
                  activeCategory === cat
                    ? 'bg-white text-zinc-900 font-semibold shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Shape Grid */}
        <div className="p-4 max-h-72 overflow-y-auto grid grid-cols-4 gap-2.5">
          {filtered.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                onSelectShape(s.id);
                onClose();
              }}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-black/[0.06] hover:border-[#0071e3] hover:bg-blue-50/30 transition-all group cursor-pointer gap-2 active:scale-95 shadow-2xs"
            >
              <div className="h-8 flex items-center justify-center group-hover:scale-110 transition-transform">
                {s.icon}
              </div>
              <span className="text-[11px] font-medium text-zinc-700 text-center truncate w-full group-hover:text-[#0071e3]">
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
