import React from 'react';
import {
  MousePointer2,
  Hand,
  PenTool,
  StickyNote,
  Shapes,
  Type,
  Table,
  Smile,
  MessageSquare,
  Sparkles,
  Grid3X3,
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
  washiPattern: _washiPattern,
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
  const isLaserActive = tool === 'laser';

  return (
    <div
      id="main-bottom-toolbar"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center h-12 px-2 bg-white/85 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.04)] border border-black/[0.08] gap-1 select-none max-w-[95vw] overflow-x-auto"
    >
      {/* 1. Select Tool (Apple / Google arrow cursor) */}
      <button
        id="tool-select"
        onClick={() => {
          onSelectTool('select');
          onTogglePopover('none');
        }}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 ${
          isSelectActive
            ? 'bg-[#0071e3] text-white shadow-[0_1px_3px_rgba(0,113,227,0.35)]'
            : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.05] active:bg-black/[0.08]'
        }`}
        title="Select (V)"
      >
        <MousePointer2 className="w-[18px] h-[18px] fill-current transform -rotate-12 stroke-[1.8]" />
      </button>

      {/* 2. Hand / Pan Tool */}
      <button
        id="tool-hand"
        onClick={() => {
          onSelectTool('hand');
          onTogglePopover('none');
        }}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 ${
          isHandActive
            ? 'bg-[#0071e3] text-white shadow-[0_1px_3px_rgba(0,113,227,0.35)]'
            : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.05] active:bg-black/[0.08]'
        }`}
        title="Pan Canvas (H)"
      >
        <Hand className="w-[18px] h-[18px] stroke-[1.8]" />
      </button>

      {/* Apple Hairline Divider */}
      <div className="w-px h-5 bg-black/[0.08] mx-0.5 shrink-0" />

      {/* 3. Drawing / Pen Tool (Apple PencilKit style) */}
      <button
        id="tool-pen"
        onClick={() => {
          onSelectTool('pen');
          onTogglePopover(activePopover === 'pen' ? 'none' : 'pen');
        }}
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 ${
          isPenActive || activePopover === 'pen'
            ? 'bg-[#0071e3] text-white shadow-[0_1px_3px_rgba(0,113,227,0.35)]'
            : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.05] active:bg-black/[0.08]'
        }`}
        title={`Pen (${penSubTool})`}
      >
        <PenTool className="w-[18px] h-[18px] stroke-[1.8]" />
        {/* Subtle subtool indicator dot */}
        <span
          className={`absolute bottom-1 w-1 h-1 rounded-full ${
            isPenActive || activePopover === 'pen' ? 'bg-white/80' : 'bg-[#0071e3]'
          }`}
        />
      </button>

      {/* 4. Sticky Note */}
      <button
        id="tool-sticky-stack"
        onClick={() => {
          onQuickAddSticky();
          onTogglePopover('none');
        }}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 ${
          isStickyActive
            ? 'bg-[#0071e3] text-white shadow-[0_1px_3px_rgba(0,113,227,0.35)]'
            : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.05] active:bg-black/[0.08]'
        }`}
        title="Sticky Note (S)"
      >
        <StickyNote className="w-[18px] h-[18px] stroke-[1.8]" />
      </button>

      {/* 5. Shapes & Connectors (Apple Keynote / Google Slides style) */}
      <button
        id="tool-shapes"
        onClick={() => {
          onSelectTool('shape');
          onTogglePopover(activePopover === 'shapes' ? 'none' : 'shapes');
        }}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 ${
          isShapeActive || activePopover === 'shapes'
            ? 'bg-[#0071e3] text-white shadow-[0_1px_3px_rgba(0,113,227,0.35)]'
            : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.05] active:bg-black/[0.08]'
        }`}
        title="Shapes & Connectors (R)"
      >
        <Shapes className="w-[18px] h-[18px] stroke-[1.8]" />
      </button>

      {/* Apple Hairline Divider */}
      <div className="w-px h-5 bg-black/[0.08] mx-0.5 shrink-0" />

      {/* 6. Typography / Text Tool 'T' */}
      <button
        id="tool-text"
        onClick={() => {
          onSelectTool('text');
          onTogglePopover('none');
        }}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 ${
          isTextActive
            ? 'bg-[#0071e3] text-white shadow-[0_1px_3px_rgba(0,113,227,0.35)]'
            : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.05] active:bg-black/[0.08]'
        }`}
        title="Text (T)"
      >
        <Type className="w-[18px] h-[18px] stroke-[2]" />
      </button>

      {/* 7. Table Tool */}
      <button
        id="tool-table"
        onClick={() => {
          onQuickAddTable();
          onTogglePopover('none');
        }}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 ${
          isTableActive
            ? 'bg-[#0071e3] text-white shadow-[0_1px_3px_rgba(0,113,227,0.35)]'
            : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.05] active:bg-black/[0.08]'
        }`}
        title="Table"
      >
        <Table className="w-[18px] h-[18px] stroke-[1.8]" />
      </button>

      {/* 8. Reactions & Stamps */}
      <button
        id="tool-stamp"
        onClick={() => {
          onSelectTool('stamp');
          onTogglePopover(activePopover === 'reaction-wheel' ? 'none' : 'reaction-wheel');
        }}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 ${
          isStampActive || activePopover === 'reaction-wheel'
            ? 'bg-[#0071e3] text-white shadow-[0_1px_3px_rgba(0,113,227,0.35)]'
            : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.05] active:bg-black/[0.08]'
        }`}
        title="Reactions & Stamps"
      >
        <Smile className="w-[18px] h-[18px] stroke-[1.8]" />
      </button>

      {/* 9. Comments */}
      <button
        id="tool-comment"
        onClick={() => {
          onSelectTool('comment');
          onTogglePopover('none');
        }}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 ${
          isCommentActive
            ? 'bg-[#0071e3] text-white shadow-[0_1px_3px_rgba(0,113,227,0.35)]'
            : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.05] active:bg-black/[0.08]'
        }`}
        title="Comments (C)"
      >
        <MessageSquare className="w-[18px] h-[18px] stroke-[1.8]" />
      </button>

      {/* 10. Laser Pointer / Live Spotlight */}
      <button
        id="tool-laser"
        onClick={() => {
          onSelectTool(tool === 'laser' ? 'select' : 'laser');
          onTogglePopover('none');
        }}
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 ${
          isLaserActive
            ? 'bg-[#0071e3] text-white shadow-[0_1px_3px_rgba(0,113,227,0.35)]'
            : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.05] active:bg-black/[0.08]'
        }`}
        title="Laser Pointer (L)"
      >
        <Sparkles className="w-[18px] h-[18px] stroke-[1.8]" />
        {isLaserActive && (
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white animate-ping" />
        )}
      </button>

      {/* Apple Hairline Divider */}
      <div className="w-px h-5 bg-black/[0.08] mx-0.5 shrink-0" />

      {/* 11. Canvas Grid Setting */}
      <button
        id="tool-grid"
        onClick={() => {
          onTogglePopover(activePopover === 'grid' ? 'none' : 'grid');
        }}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 ${
          activePopover === 'grid'
            ? 'bg-zinc-200/80 text-zinc-900'
            : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.05] active:bg-black/[0.08]'
        }`}
        title="Grid Settings"
      >
        <Grid3X3 className="w-[18px] h-[18px] stroke-[1.8]" />
      </button>

      {/* 12. Add Creative Media / Templates */}
      <button
        id="tool-add"
        onClick={() => {
          onTogglePopover(activePopover === 'more' ? 'none' : 'more');
        }}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 ${
          activePopover === 'more'
            ? 'bg-zinc-200/80 text-zinc-900'
            : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.05] active:bg-black/[0.08]'
        }`}
        title="Templates, Media & Cards"
      >
        <Plus className="w-[18px] h-[18px] stroke-[2]" />
      </button>
    </div>
  );
};
