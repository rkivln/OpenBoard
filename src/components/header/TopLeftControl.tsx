import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Copy,
  FolderPlus,
  Download,
  Trash2,
  HelpCircle,
  Sparkles,
  Check,
  Edit2,
} from 'lucide-react';

interface TopLeftControlProps {
  boardTitle: string;
  onRename: (title: string) => void;
  onDuplicate: () => void;
  onNewBoard: () => void;
  onExport: (format: 'png' | 'svg' | 'json') => void;
  onClear: () => void;
  onOpenHelp: () => void;
}

export const TopLeftControl: React.FC<TopLeftControlProps> = ({
  boardTitle,
  onRename,
  onDuplicate,
  onNewBoard,
  onExport,
  onClear,
  onOpenHelp,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(boardTitle);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitleInput(boardTitle);
  }, [boardTitle]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleFinishRename = () => {
    setIsEditing(false);
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== boardTitle) {
      onRename(trimmed);
    } else {
      setTitleInput(boardTitle);
    }
  };

  const handleDuplicateClick = () => {
    onDuplicate();
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="fixed top-4 left-4 z-40 flex items-center select-none">
      {/* Main Apple / Google Refined Bar */}
      <div
        id="top-left-workspace-bar"
        className="flex items-center h-10 px-2 bg-white/85 backdrop-blur-2xl rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] border border-black/[0.08] text-zinc-800 transition-all hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)]"
      >
        {/* Workspace Menu */}
        <div className="relative" ref={menuRef}>
          <button
            id="workspace-dropdown-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-1.5 px-1.5 py-1 rounded-xl text-zinc-700 hover:text-zinc-900 hover:bg-black/[0.04] transition-colors cursor-pointer active:scale-95"
            title="OpenBoard Menu"
          >
            {/* Apple style modern app icon */}
            <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-[#0071e3] to-[#42a5f5] text-white flex items-center justify-center shadow-2xs font-bold text-[10px]">
              OB
            </div>
            <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform duration-150 ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Apple macOS style Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-11 left-0 w-60 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.04)] border border-black/[0.08] p-1.5 z-50 text-xs text-zinc-700 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-black/[0.06] mb-1">
                <div className="font-semibold text-zinc-900 text-xs flex items-center gap-1.5">
                  <span>OpenBoard</span>
                  <span className="text-[10px] text-zinc-500 font-normal">Workspace</span>
                </div>
                <div className="text-[11px] text-zinc-400">Real-time collaborative canvas</div>
              </div>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onNewBoard();
                }}
                className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 hover:bg-zinc-100 transition-colors text-left cursor-pointer active:scale-98"
              >
                <FolderPlus className="w-3.5 h-3.5 text-zinc-500" />
                <span>New Board</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleDuplicateClick();
                }}
                className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 hover:bg-zinc-100 transition-colors text-left cursor-pointer active:scale-98"
              >
                <Copy className="w-3.5 h-3.5 text-zinc-500" />
                <span>Duplicate Board</span>
              </button>

              <div className="my-1 border-t border-black/[0.06]" />

              <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                Export
              </div>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onExport('png');
                }}
                className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 hover:bg-zinc-100 transition-colors text-left cursor-pointer active:scale-98"
              >
                <Download className="w-3.5 h-3.5 text-zinc-500" />
                <span>Export as PNG</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onExport('svg');
                }}
                className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 hover:bg-zinc-100 transition-colors text-left cursor-pointer active:scale-98"
              >
                <Download className="w-3.5 h-3.5 text-zinc-500" />
                <span>Export as SVG</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onExport('json');
                }}
                className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 hover:bg-zinc-100 transition-colors text-left cursor-pointer active:scale-98"
              >
                <Download className="w-3.5 h-3.5 text-zinc-500" />
                <span>Export as JSON</span>
              </button>

              <div className="my-1 border-t border-black/[0.06]" />

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onClear();
                }}
                className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 hover:bg-rose-50 text-rose-600 transition-colors text-left cursor-pointer active:scale-98"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Clear Canvas</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenHelp();
                }}
                className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 hover:bg-zinc-100 transition-colors text-left cursor-pointer active:scale-98"
              >
                <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                <span>Shortcuts & Help</span>
              </button>
            </div>
          )}
        </div>

        {/* Apple Hairline Divider */}
        <div className="w-px h-4 bg-black/[0.08] mx-1" />

        {/* Board Title (Clicking allows inline editing) */}
        <div className="px-1">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleFinishRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFinishRename();
                if (e.key === 'Escape') {
                  setTitleInput(boardTitle);
                  setIsEditing(false);
                }
              }}
              className="h-6 px-2 text-xs font-medium text-zinc-900 bg-zinc-100/90 rounded-md outline-none border border-black/10 focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] w-36 transition-all"
            />
          ) : (
            <button
              id="board-title-btn"
              onClick={() => setIsEditing(true)}
              className="group flex items-center gap-1.5 text-xs font-semibold text-zinc-800 hover:text-zinc-950 px-1.5 py-0.5 rounded-md hover:bg-black/[0.04] transition-colors cursor-pointer"
              title="Click to rename board"
            >
              <span className="max-w-[140px] truncate">{boardTitle}</span>
              <Edit2 className="w-2.5 h-2.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>

        {/* Duplicate Board Action */}
        <button
          id="duplicate-board-btn"
          onClick={handleDuplicateClick}
          className="p-1 text-zinc-400 hover:text-zinc-800 hover:bg-black/[0.04] rounded-lg transition-colors cursor-pointer active:scale-95"
          title="Duplicate Board"
        >
          {copiedNotification ? (
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Floating duplicate toast feedback */}
      {copiedNotification && (
        <div className="ml-2.5 px-3 py-1.5 bg-[#1d1d1f]/95 text-white backdrop-blur-xl border border-white/10 text-xs rounded-full shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-left duration-200">
          <Sparkles className="w-3 h-3 text-[#0071e3]" />
          <span>Board duplicated!</span>
        </div>
      )}
    </div>
  );
};
