import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'V', desc: 'Select / Pointer tool' },
    { key: 'H or Space + Drag', desc: 'Hand / Pan tool' },
    { key: 'P', desc: 'Pen / Drawing tool' },
    { key: 'S', desc: 'Sticky Note tool' },
    { key: 'T', desc: 'Text tool' },
    { key: 'R', desc: 'Rectangle tool' },
    { key: 'O', desc: 'Circle / Oval tool' },
    { key: 'C', desc: 'Comment tool' },
    { key: 'Ctrl + Z', desc: 'Undo last change' },
    { key: 'Ctrl + Shift + Z', desc: 'Redo change' },
    { key: 'Delete / Backspace', desc: 'Delete selected object' },
    { key: 'Ctrl + Scroll', desc: 'Zoom in and out' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Shortcuts & Gestures</h3>
              <p className="text-[11px] text-slate-400">Master OpenBoard keyboard controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-4 max-h-80 overflow-y-auto space-y-2">
          {shortcuts.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors text-xs"
            >
              <span className="text-slate-600">{s.desc}</span>
              <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg font-mono text-[11px] font-semibold text-slate-700 shadow-2xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
          Tip: Double click anywhere on the canvas to quickly add a sticky note!
        </div>
      </div>
    </div>
  );
};
