import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'V', desc: 'Select / Pointer tool' },
    { key: 'H or Space + Drag', desc: 'Hand / Pan tool' },
    { key: 'L', desc: 'Laser pointer & live trail' },
    { key: 'M', desc: 'Toggle Minimap Radar' },
    { key: 'F', desc: 'Frame / Artboard tool' },
    { key: 'P', desc: 'Drawing & PencilKit tool' },
    { key: 'S', desc: 'Sticky Note tool' },
    { key: 'T', desc: 'Typography / Text tool' },
    { key: 'R', desc: 'Rectangle tool' },
    { key: 'O', desc: 'Circle / Oval tool' },
    { key: 'C', desc: 'Comment tool' },
    { key: '⌘ / Ctrl + V', desc: 'Paste image or screenshot' },
    { key: '⌘ / Ctrl + D', desc: 'Duplicate selected elements' },
    { key: '⌘ / Ctrl + Z', desc: 'Undo last change' },
    { key: '⌘ / Ctrl + ⇧ + Z', desc: 'Redo change' },
    { key: 'Delete / ⌫', desc: 'Delete selected object' },
    { key: 'Ctrl + Scroll', desc: 'Zoom canvas' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-black/[0.08] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-black/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-[#0071e3]">
              <Keyboard className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-900">Shortcuts & Gestures</h3>
              <p className="text-[11px] text-zinc-500">Keyboard controls and canvas navigation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-black/[0.04] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-4 max-h-80 overflow-y-auto space-y-1.5">
          {shortcuts.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-50 transition-colors text-xs"
            >
              <span className="text-zinc-600 font-medium">{s.desc}</span>
              <kbd className="px-2 py-0.5 bg-zinc-100 border border-black/10 rounded-md font-mono text-[11px] font-medium text-zinc-800 shadow-2xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-50 border-t border-black/[0.06] text-center text-[11px] text-zinc-500 font-medium">
          Double-click anywhere on the canvas to quickly add a note.
        </div>
      </div>
    </div>
  );
};
