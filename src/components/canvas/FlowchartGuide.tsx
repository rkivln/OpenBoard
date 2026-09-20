import React from 'react';
import { CanvasElement } from '../../types.ts';

interface FlowchartGuideProps {
  onStartGuide: () => void;
}

export const FlowchartGuide: React.FC<FlowchartGuideProps> = ({ onStartGuide }) => {
  return (
    <div
      onClick={onStartGuide}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer select-none group pointer-events-auto transition-all hover:scale-102"
      title="Click to start flowchart or mind map"
    >
      <div className="relative flex items-center">
        {/* Center Topic Pill */}
        <div className="px-5 py-3 rounded-2xl bg-white/70 backdrop-blur-xs border border-slate-200/80 shadow-xs group-hover:border-purple-300 group-hover:shadow-md transition-all text-center">
          <span className="text-base font-semibold text-slate-600 group-hover:text-purple-700 transition-colors">
            Any question or topic
          </span>
          <div className="text-[11px] text-slate-400 group-hover:text-purple-500 mt-0.5">
            Click to start brainstorming
          </div>
        </div>

        {/* SVG Connector curves matching Screenshot 1 */}
        <svg
          className="w-44 h-48 overflow-visible stroke-slate-300 group-hover:stroke-purple-300 transition-colors pointer-events-none"
          fill="none"
          strokeWidth="1.8"
        >
          {/* Top branch */}
          <path d="M 0 96 C 40 96, 40 24, 80 24" strokeLinecap="round" />
          {/* Middle branch */}
          <path d="M 0 96 L 80 96" strokeLinecap="round" />
          {/* Bottom branch */}
          <path d="M 0 96 C 40 96, 40 168, 80 168" strokeLinecap="round" />
        </svg>

        {/* Three branch items matching Screenshot 1 */}
        <div className="flex flex-col justify-between h-44 -ml-2 text-slate-400 font-medium text-sm">
          <div className="py-1 px-3 rounded-xl bg-white/50 border border-slate-200/50 group-hover:border-purple-200 group-hover:text-slate-600 transition-colors">
            A concept
          </div>
          <div className="py-1 px-3 rounded-xl bg-white/50 border border-slate-200/50 group-hover:border-purple-200 group-hover:text-slate-600 transition-colors">
            An idea
          </div>
          <div className="py-1 px-3 rounded-xl bg-white/50 border border-slate-200/50 group-hover:border-purple-200 group-hover:text-slate-600 transition-colors">
            A thought
          </div>
        </div>
      </div>
    </div>
  );
};
