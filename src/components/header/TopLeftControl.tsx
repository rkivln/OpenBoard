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
    <div className="fixed top-4 left-4 z-40 flex items-center">
      {/* Main Floating Rounded Container */}
      <div
        id="top-left-workspace-bar"
        className="flex items-center h-11 px-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-slate-200/80 text-slate-800 transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
      >
        {/* Workspace Logo + Dropdown Arrow */}
        <div className="relative" ref={menuRef}>
          <button
            id="workspace-dropdown-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-purple-600 transition-colors cursor-pointer"
            title="OpenBoard workspace menu"
          >
            {/* Custom geometric logo reproducing the reference icon */}
            <div className="w-5 h-5 flex items-center justify-center text-purple-600">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <circle cx="6" cy="6" r="3.5" fill="#8B5CF6" />
                <circle cx="18" cy="6" r="3.5" fill="#A78BFA" />
                <circle cx="6" cy="18" r="3.5" fill="#C4B5FD" />
                <rect x="14.5" y="14.5" width="7" height="7" rx="2" fill="#7C3AED" />
              </svg>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-12 left-0 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-1.5 border-b border-slate-100 mb-1">
                <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                  <span className="text-purple-600 font-bold">OpenBoard</span>
                  <span className="text-[10px] font-medium bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">v1.2</span>
                </div>
                <div className="text-[11px] text-slate-400">Think. Create. Collaborate.</div>
              </div>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onNewBoard();
                }}
                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 transition-colors text-left"
              >
                <FolderPlus className="w-4 h-4 text-slate-500" />
                <span>New Board</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleDuplicateClick();
                }}
                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 transition-colors text-left"
              >
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Duplicate Board</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Export Options
              </div>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onExport('png');
                }}
                className="w-full px-3.5 py-1.5 flex items-center gap-2.5 hover:bg-slate-50 transition-colors text-left"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export as PNG Image</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onExport('svg');
                }}
                className="w-full px-3.5 py-1.5 flex items-center gap-2.5 hover:bg-slate-50 transition-colors text-left"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export as SVG Vector</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onExport('json');
                }}
                className="w-full px-3.5 py-1.5 flex items-center gap-2.5 hover:bg-slate-50 transition-colors text-left"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export as JSON</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onClear();
                }}
                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-rose-50 text-rose-600 transition-colors text-left"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Canvas</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenHelp();
                }}
                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 transition-colors text-left"
              >
                <HelpCircle className="w-4 h-4 text-slate-500" />
                <span>Shortcuts & Help</span>
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-200 mx-1.5" />

        {/* Board Title (Clicking allows inline editing) */}
        <div className="px-1.5">
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
              className="h-7 px-2 text-sm font-medium text-slate-800 bg-slate-100 rounded-lg outline-none border border-purple-400 w-32 focus:w-44 transition-all"
            />
          ) : (
            <button
              id="board-title-btn"
              onClick={() => setIsEditing(true)}
              className="group flex items-center gap-1.5 text-sm font-medium text-slate-800 hover:text-purple-600 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
              title="Click to rename board"
            >
              <span className="max-w-[150px] truncate">{boardTitle}</span>
              <Edit2 className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>

        {/* Duplicate Board Icon */}
        <button
          id="duplicate-board-btn"
          onClick={handleDuplicateClick}
          className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer ml-0.5"
          title="Duplicate board (clones elements to new copy)"
        >
          {copiedNotification ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Floating duplicate toast feedback */}
      {copiedNotification && (
        <div className="ml-3 px-3 py-1.5 bg-slate-900/90 text-white text-xs rounded-xl shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-left duration-200">
          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
          <span>Board duplicated successfully!</span>
        </div>
      )}
    </div>
  );
};
