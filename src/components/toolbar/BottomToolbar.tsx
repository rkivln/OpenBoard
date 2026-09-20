import React from 'react';
import {
  MousePointer2,
  Hand,
  Type,
  StickyNote,
  Table,
  Stamp,
  MessageSquare,
  LayoutGrid,
  Plus,
} from 'lucide-react';
import { ToolType, PenSubTool, WashiPattern } from '../../types.ts';

interface BottomToolbarProps {
  tool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  penSubTool: PenSubTool;
  washiPattern: WashiPattern;
  activePopover: 'pen' | 'shapes' | 'reaction-wheel' | 'grid' | 'more' | 'none';
  onTogglePopover: (popover: 'pen' | 'shapes' | 'reaction-wheel' | 'grid' | 'more' | 'none') => void;
  onQuickAddTable: () => void;
  onQuickAddSticky: () => void;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  tool,
  onSelectTool,
  penSubTool,
  washiPattern,
  activePopover,
  onTogglePopover,
  onQuickAddTable,
  onQuickAddSticky,
}) => {
  const isSelectActive = tool === 'select';
  const isHandActive = tool === 'hand';
  const isPenActive = tool === 'pen';
  const isShapeActive = tool === 'shape' || tool === 'connector';
  const isTextActive = tool === 'text';
  const isStickyActive = tool === 'sticky';
  const isTableActive = tool === 'table';
  const isStampActive = tool === 'stamp';
  const isCommentActive = tool === 'comment';

  return (
    <div
      id="main-bottom-toolbar"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center h-12 px-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-slate-200/80 gap-1 select-none max-w-[95vw] overflow-x-auto"
    >
      {/* 1. Select Tool (Arrow Cursor) */}
      <button
        id="tool-select"
        onClick={() => {
          onSelectTool('select');
          onTogglePopover('none');
        }}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
          isSelectActive
            ? 'bg-[#8B5CF6] text-white shadow-xs'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
        title="Select (V) - Click to select, move, and edit objects"
      >
        <MousePointer2 className="w-4 h-4 fill-current transform -rotate-12" />
      </button>

      {/* 2. Hand / Pan Tool */}
      <button
        id="tool-hand"
        onClick={() => {
          onSelectTool('hand');
          onTogglePopover('none');
        }}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
          isHandActive
            ? 'bg-[#8B5CF6] text-white shadow-xs'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
        title="Hand / Pan (H) - Drag anywhere to pan workspace"
      >
        <Hand className="w-4 h-4" />
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-200 mx-0.5" />

      {/* 3. Pen Slot with Dynamic Skeuomorphic Preview (Matches Screenshots 1, 2, 3, 6!) */}
      <button
        id="tool-pen"
        onClick={() => {
          onSelectTool('pen');
          onTogglePopover(activePopover === 'pen' ? 'none' : 'pen');
        }}
        className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group ${
          isPenActive
            ? 'bg-purple-100/80 ring-1.5 ring-purple-400'
            : 'hover:bg-slate-100'
        }`}
        title="Pen Tool (Pencil, Highlighter, Washi Tape, Eraser)"
      >
        {/* Dynamic preview based on active penSubTool */}
        {penSubTool === 'pencil' && (
          <div className="w-5 h-7 flex items-center justify-center transform -translate-y-0.5 group-hover:-translate-y-1 transition-transform">
            <svg viewBox="0 0 20 28" fill="none" className="w-4 h-7 drop-shadow-xs">
              <polygon points="10,0 15,10 5,10" fill="#18181b" />
              <rect x="5" y="10" width="10" height="15" rx="1" fill="#f4f4f5" stroke="#71717a" strokeWidth="0.8" />
              <rect x="7" y="10" width="6" height="15" fill="#e4e4e7" />
            </svg>
          </div>
        )}

        {penSubTool === 'highlighter' && (
          <div className="w-5 h-7 flex items-center justify-center transform -translate-y-0.5 group-hover:-translate-y-1 transition-transform">
            <svg viewBox="0 0 20 28" fill="none" className="w-4 h-7 drop-shadow-xs">
              <polygon points="13,0 16,3 8,11 5,8" fill="#eab308" />
              <rect x="4" y="10" width="12" height="14" rx="2" fill="#fafafa" stroke="#a1a1aa" strokeWidth="0.8" />
              <path d="M 4 15 L 16 15" stroke="#eab308" strokeWidth="2.5" />
            </svg>
          </div>
        )}

        {penSubTool === 'washi-tape' && (
          <div className="w-5 h-7 flex items-center justify-center transform -translate-y-0.5 group-hover:-translate-y-1 transition-transform">
            <div className="w-4 h-6 rounded-xs border border-purple-400 bg-purple-50 overflow-hidden relative shadow-xs">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#a855f7_1.2px,transparent_1.2px),linear-gradient(to_bottom,#a855f7_1.2px,transparent_1.2px)] bg-[size:4px_4px]" />
            </div>
          </div>
        )}

        {penSubTool === 'eraser' && (
          <div className="w-5 h-7 flex items-center justify-center transform -translate-y-0.5 group-hover:-translate-y-1 transition-transform">
            <svg viewBox="0 0 20 28" fill="none" className="w-4 h-7 drop-shadow-xs">
              <rect x="4" y="4" width="12" height="10" rx="1.5" fill="#f43f5e" />
              <rect x="4" y="14" width="12" height="10" rx="1" fill="#3b82f6" />
              <rect x="3" y="12" width="14" height="4" fill="#e4e4e7" />
            </svg>
          </div>
        )}
      </button>

      {/* 4. Sticky Note Stack Icon Slot (Screenshot 1, 2, 3, 6) */}
      <button
        id="tool-sticky-stack"
        onClick={() => {
          onQuickAddSticky();
          onTogglePopover('none');
        }}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
          isStickyActive
            ? 'bg-purple-100/80 ring-1.5 ring-purple-400'
            : 'hover:bg-slate-100'
        }`}
        title="Sticky Note - Add note to board"
      >
        {/* Layered sheets with curled corner preview */}
        <div className="relative w-6 h-6">
          <div className="absolute inset-0 bg-slate-300 rounded-sm transform translate-x-0.5 translate-y-0.5 opacity-60" />
          <div className="absolute inset-0 bg-[#93c5fd] rounded-sm shadow-xs border border-blue-400/50" />
          {/* Folded paper dog-ear corner */}
          <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-100 border-b border-l border-blue-300 rounded-bl-sm" />
        </div>
      </button>

      {/* 5. Shapes Tool Slot (Square + Circle preview with connector arrow) */}
      <button
        id="tool-shapes"
        onClick={() => {
          onSelectTool('shape');
          onTogglePopover(activePopover === 'shapes' ? 'none' : 'shapes');
        }}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
          isShapeActive
            ? 'bg-purple-100/80 ring-1.5 ring-purple-400'
            : 'hover:bg-slate-100'
        }`}
        title="Shapes & Connectors (Rect, Circle, Diamond, Arrow, Elbow)"
      >
        <div className="relative w-6 h-6 flex items-center justify-center">
          {/* Square outline */}
          <div className="absolute top-0.5 left-0.5 w-3.5 h-3.5 border-1.5 border-slate-700 rounded-xs" />
          {/* Circle outline */}
          <div className="absolute bottom-0.5 right-0.5 w-3 h-3 border-1.5 border-slate-700 rounded-full" />
          {/* Connecting arrow */}
          <svg viewBox="0 0 16 16" fill="none" className="absolute inset-0 w-full h-full stroke-slate-600 stroke-1.5 pointer-events-none">
            <path d="M 4 8 Q 8 4 12 8" />
          </svg>
        </div>
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-200 mx-0.5" />

      {/* 6. Text Tool 'T' */}
      <button
        id="tool-text"
        onClick={() => {
          onSelectTool('text');
          onTogglePopover('none');
        }}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
          isTextActive
            ? 'bg-[#8B5CF6] text-white shadow-xs'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
        title="Text (T) - Click canvas to write text"
      >
        <Type className="w-4 h-4" />
      </button>

      {/* 7. Table Tool */}
      <button
        id="tool-table"
        onClick={() => {
          onQuickAddTable();
          onTogglePopover('none');
        }}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
          isTableActive
            ? 'bg-[#8B5CF6] text-white shadow-xs'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
        title="Table - Add editable table"
      >
        <Table className="w-4 h-4" />
      </button>

      {/* 9. Stamp / Reaction Tool (Screenshot 4: Purple background when active!) */}
      <button
        id="tool-stamp"
        onClick={() => {
          onSelectTool('stamp');
          onTogglePopover(activePopover === 'reaction-wheel' ? 'none' : 'reaction-wheel');
        }}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
          isStampActive || activePopover === 'reaction-wheel'
            ? 'bg-[#8B5CF6] text-white shadow-xs'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
        title="Stamps & Reaction Wheel"
      >
        <Stamp className="w-4 h-4" />
      </button>

      {/* 10. Comment Tool */}
      <button
        id="tool-comment"
        onClick={() => {
          onSelectTool('comment');
          onTogglePopover('none');
        }}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
          isCommentActive
            ? 'bg-[#8B5CF6] text-white shadow-xs'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
        title="Comments (C) - Click canvas to drop a comment pin"
      >
        <MessageSquare className="w-4 h-4" />
      </button>

      {/* 11. More Tools / Grid View */}
      <button
        id="tool-more"
        onClick={() => {
          onTogglePopover(activePopover === 'grid' ? 'none' : 'grid');
        }}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
          activePopover === 'grid'
            ? 'bg-purple-100 text-purple-700'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
        title="Grid Settings & Canvas Background"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>

      {/* 12. Add (+) Tool */}
      <button
        id="tool-add"
        onClick={() => {
          onTogglePopover(activePopover === 'more' ? 'none' : 'more');
        }}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
          activePopover === 'more'
            ? 'bg-purple-100 text-purple-700'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
        title="Add Templates, Media, Wireframes"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
