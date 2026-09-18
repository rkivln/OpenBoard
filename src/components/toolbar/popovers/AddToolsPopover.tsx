import React from 'react';
import { Layout, GitBranch, Columns, Users, Sparkles, Image as ImageIcon } from 'lucide-react';
import { CanvasElement } from '../../../types.ts';

interface AddToolsPopoverProps {
  onInsertTemplate: (templateType: 'kanban' | 'mindmap' | 'retro') => void;
  onClose: () => void;
}

export const AddToolsPopover: React.FC<AddToolsPopoverProps> = ({
  onInsertTemplate,
  onClose,
}) => {
  return (
    <div
      id="add-tools-popover"
      className="absolute bottom-16 left-[78%] -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-slate-200/80 p-2.5 w-60 animate-in fade-in zoom-in-95 duration-100 text-slate-800"
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
        <span className="text-xs font-semibold text-slate-900">Templates & Add-ons</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
      </div>

      <div className="space-y-1">
        <button
          onClick={() => {
            onInsertTemplate('kanban');
            onClose();
          }}
          className="w-full text-left p-2 rounded-xl hover:bg-slate-50 flex items-center gap-2.5 text-xs text-slate-700 transition-colors"
        >
          <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
            <Columns className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium text-slate-900">Kanban Board</div>
            <div className="text-[10px] text-slate-400">To Do, In Progress, Done columns</div>
          </div>
        </button>

        <button
          onClick={() => {
            onInsertTemplate('mindmap');
            onClose();
          }}
          className="w-full text-left p-2 rounded-xl hover:bg-slate-50 flex items-center gap-2.5 text-xs text-slate-700 transition-colors"
        >
          <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium text-slate-900">Mind Map Tree</div>
            <div className="text-[10px] text-slate-400">Central idea with branching nodes</div>
          </div>
        </button>

        <button
          onClick={() => {
            onInsertTemplate('retro');
            onClose();
          }}
          className="w-full text-left p-2 rounded-xl hover:bg-slate-50 flex items-center gap-2.5 text-xs text-slate-700 transition-colors"
        >
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium text-slate-900">Team Retrospective</div>
            <div className="text-[10px] text-slate-400">Went Well, Needs Improvement, Action Items</div>
          </div>
        </button>
      </div>
    </div>
  );
};
