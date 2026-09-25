import React, { useState } from 'react';
import {
  Sparkles,
  Layout,
  Code2,
  Image as ImageIcon,
  Columns,
  GitBranch,
  Smile,
  Target,
  Smartphone,
  Monitor,
  Layers,
  Wand2,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { soundEngine } from '../../../utils/audio.ts';

interface CreativeHubPopoverProps {
  onInsertTemplate: (templateType: 'kanban' | 'mindmap' | 'retro' | 'swot' | 'funnel') => void;
  onInsertFrame: (frameType: 'desktop' | 'mobile' | 'square' | 'sprint') => void;
  onInsertCodeCard: (language: string) => void;
  onInsertSticker: (label: string, emoji: string, bg: string, color: string) => void;
  onGenerateAiDiagram: (prompt: string) => Promise<void>;
  onTriggerImageUpload: () => void;
  onClose: () => void;
}

export const CreativeHubPopover: React.FC<CreativeHubPopoverProps> = ({
  onInsertTemplate,
  onInsertFrame,
  onInsertCodeCard,
  onInsertSticker,
  onGenerateAiDiagram,
  onTriggerImageUpload,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'frames' | 'stickers' | 'code' | 'templates'>('ai');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (queryToUse?: string) => {
    const q = queryToUse || prompt;
    if (!q.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      soundEngine.playPop();
      await onGenerateAiDiagram(q.trim());
      onClose();
    } finally {
      setIsGenerating(false);
    }
  };

  const stickers = [
    { label: 'APPROVED', emoji: '✅', bg: '#ecfdf5', color: '#047857' },
    { label: 'IN PROGRESS', emoji: '⏳', bg: '#fffbeb', color: '#b45309' },
    { label: 'HIGH PRIORITY', emoji: '🔥', bg: '#fef2f2', color: '#b91c1c' },
    { label: 'NEED REVIEW', emoji: '👀', bg: '#eef2ff', color: '#4338ca' },
    { label: 'BUG FIX', emoji: '🐛', bg: '#fdf2f8', color: '#be185d' },
    { label: 'IDEA', emoji: '💡', bg: '#fefce8', color: '#854d0e' },
    { label: 'LAUNCH READY', emoji: '🚀', bg: '#f5f3ff', color: '#6d28d9' },
    { label: 'PERFECT', emoji: '💯', bg: '#fff7ed', color: '#c2410c' },
    { label: 'MILESTONE', emoji: '🏆', bg: '#fefce8', color: '#a16207' },
    { label: 'MVP TARGET', emoji: '🎯', bg: '#eff6ff', color: '#1d4ed8' },
    { label: 'COFFEE BREAK', emoji: '☕', bg: '#fbf7ee', color: '#6f4e37' },
    { label: 'TOP RATED', emoji: '👑', bg: '#fefce8', color: '#ca8a04' },
  ];

  const aiPrompts = [
    'User Registration & Verification Flow',
    'E-Commerce Checkout & Fulfillment Pipeline',
    'Microservices Event Architecture',
    'Customer Onboarding Journey Map',
    'Sprint Retrospective & Action Items',
  ];

  return (
    <div
      id="creative-hub-popover"
      className="fixed bottom-18 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.04)] border border-black/[0.08] w-[420px] max-w-[95vw] overflow-hidden animate-in fade-in zoom-in-95 duration-120 text-zinc-800 select-none"
    >
      {/* Header - Apple style clean banner */}
      <div className="px-3.5 py-2.5 border-b border-black/[0.06] flex items-center justify-between bg-white/80">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#0071e3] text-white flex items-center justify-center shadow-2xs">
            <Sparkles className="w-3 h-3" />
          </div>
          <span className="text-xs font-semibold text-zinc-900 tracking-tight">Studio Templates & Media</span>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-zinc-700 w-5 h-5 rounded-md flex items-center justify-center text-xs hover:bg-black/[0.04] transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Apple Segmented Navigation Bar */}
      <div className="p-2 pb-0">
        <div className="flex items-center gap-1 bg-zinc-100/90 p-1 rounded-xl text-[11px] font-medium text-zinc-600">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-1 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
              activeTab === 'ai' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'hover:text-zinc-900'
            }`}
          >
            <Wand2 className="w-3 h-3" />
            AI Flows
          </button>
          <button
            onClick={() => setActiveTab('frames')}
            className={`flex-1 py-1 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
              activeTab === 'frames' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'hover:text-zinc-900'
            }`}
          >
            <Layout className="w-3 h-3" />
            Frames
          </button>
          <button
            onClick={() => setActiveTab('stickers')}
            className={`flex-1 py-1 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
              activeTab === 'stickers' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'hover:text-zinc-900'
            }`}
          >
            <Smile className="w-3 h-3" />
            Stickers
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-1 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
              activeTab === 'code' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'hover:text-zinc-900'
            }`}
          >
            <Code2 className="w-3 h-3" />
            Code
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-1 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
              activeTab === 'templates' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'hover:text-zinc-900'
            }`}
          >
            <Columns className="w-3 h-3" />
            Boards
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="p-3 max-h-[340px] overflow-y-auto">
        {/* 1. AI & Smart Diagram Tab */}
        {activeTab === 'ai' && (
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-medium text-zinc-700 block mb-1">
                Describe a flow, system, or process:
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleGenerate();
                  }}
                  placeholder="e.g. Stripe Checkout Pipeline, Authentication Flow..."
                  className="flex-1 px-3 py-1.5 bg-zinc-50 border border-zinc-200/80 rounded-xl text-xs outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 focus:bg-white transition-all text-zinc-800"
                />
                <button
                  onClick={() => handleGenerate()}
                  disabled={isGenerating || !prompt.trim()}
                  className="px-3.5 py-1.5 bg-[#0071e3] hover:bg-[#0077ED] active:bg-[#0062c4] text-white rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-all shrink-0 active:scale-95"
                >
                  {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Generate
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Quick Inspiration Examples
              </span>
              <div className="space-y-1">
                {aiPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPrompt(p);
                      handleGenerate(p);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 text-[11px] text-zinc-700 hover:text-zinc-900 flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <span className="truncate">{p}</span>
                    <ArrowRight className="w-3 h-3 text-zinc-300 group-hover:text-zinc-600 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-xs text-zinc-800">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-zinc-600" />
                <span className="text-[11px]">Or paste any image onto the canvas</span>
              </div>
              <button
                onClick={() => {
                  onTriggerImageUpload();
                  onClose();
                }}
                className="px-2.5 py-1 bg-white border border-zinc-200 text-zinc-800 rounded-lg text-[10px] font-medium hover:bg-zinc-50 cursor-pointer shadow-2xs active:scale-95 transition-all"
              >
                Upload File
              </button>
            </div>
          </div>
        )}

        {/* 2. Frames / Artboards Tab */}
        {activeTab === 'frames' && (
          <div className="space-y-2">
            <p className="text-[11px] text-zinc-500 mb-2">
              Artboard frames organize sections and auto-generate slides in Present Mode.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  soundEngine.playSticky();
                  onInsertFrame('desktop');
                  onClose();
                }}
                className="p-2.5 rounded-xl border border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50 flex flex-col items-start gap-1 text-left transition-all cursor-pointer group active:scale-98 shadow-2xs"
              >
                <div className="p-1 rounded bg-zinc-100 text-zinc-700 group-hover:bg-[#0071e3] group-hover:text-white transition-colors">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-900">Desktop View</div>
                  <div className="text-[10px] text-zinc-400">1200 × 750 Frame</div>
                </div>
              </button>

              <button
                onClick={() => {
                  soundEngine.playSticky();
                  onInsertFrame('mobile');
                  onClose();
                }}
                className="p-2.5 rounded-xl border border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50 flex flex-col items-start gap-1 text-left transition-all cursor-pointer group active:scale-98 shadow-2xs"
              >
                <div className="p-1 rounded bg-zinc-100 text-zinc-700 group-hover:bg-[#0071e3] group-hover:text-white transition-colors">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-900">Mobile Screen</div>
                  <div className="text-[10px] text-zinc-400">380 × 680 Frame</div>
                </div>
              </button>

              <button
                onClick={() => {
                  soundEngine.playSticky();
                  onInsertFrame('sprint');
                  onClose();
                }}
                className="p-2.5 rounded-xl border border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50 flex flex-col items-start gap-1 text-left transition-all cursor-pointer group active:scale-98 shadow-2xs"
              >
                <div className="p-1 rounded bg-zinc-100 text-zinc-700 group-hover:bg-[#0071e3] group-hover:text-white transition-colors">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-900">Sprint Section</div>
                  <div className="text-[10px] text-zinc-400">800 × 500 Container</div>
                </div>
              </button>

              <button
                onClick={() => {
                  soundEngine.playSticky();
                  onInsertFrame('square');
                  onClose();
                }}
                className="p-2.5 rounded-xl border border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50 flex flex-col items-start gap-1 text-left transition-all cursor-pointer group active:scale-98 shadow-2xs"
              >
                <div className="p-1 rounded bg-zinc-100 text-zinc-700 group-hover:bg-[#0071e3] group-hover:text-white transition-colors">
                  <Layout className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-900">Square Card</div>
                  <div className="text-[10px] text-zinc-400">600 × 600 Canvas</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* 3. Creative Stickers & Badges */}
        {activeTab === 'stickers' && (
          <div className="space-y-2">
            <p className="text-[11px] text-zinc-500 mb-1">
              Click to place status badges, tags, and milestones:
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {stickers.map((st, i) => (
                <button
                  key={i}
                  onClick={() => {
                    soundEngine.playPop();
                    onInsertSticker(st.label, st.emoji, st.bg, st.color);
                    onClose();
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-black/[0.06] hover:scale-102 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-2xs hover:shadow-xs"
                  style={{ backgroundColor: st.bg, color: st.color }}
                >
                  <span className="text-sm">{st.emoji}</span>
                  <span className="text-[11px] font-bold tracking-wide">{st.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Code Snippets Tab */}
        {activeTab === 'code' && (
          <div className="space-y-2">
            <p className="text-[11px] text-zinc-500 mb-2">
              Insert code cards with syntax tags, line numbers, and copy action:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { lang: 'typescript', label: 'TypeScript', ext: '.ts' },
                { lang: 'python', label: 'Python', ext: '.py' },
                { lang: 'javascript', label: 'JavaScript', ext: '.js' },
                { lang: 'sql', label: 'SQL Query', ext: '.sql' },
                { lang: 'html', label: 'HTML / JSX', ext: '.tsx' },
                { lang: 'css', label: 'CSS / Styles', ext: '.css' },
              ].map((item) => (
                <button
                  key={item.lang}
                  onClick={() => {
                    soundEngine.playPop();
                    onInsertCodeCard(item.lang);
                    onClose();
                  }}
                  className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs active:scale-98"
                >
                  <div className="flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                    <div>
                      <div className="text-xs font-medium text-zinc-100">{item.label}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{item.ext}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-400 group-hover:text-white font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    + Add
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 5. Diagram Templates */}
        {activeTab === 'templates' && (
          <div className="space-y-1.5">
            <button
              onClick={() => {
                soundEngine.playSticky();
                onInsertTemplate('kanban');
                onClose();
              }}
              className="w-full text-left p-2.5 rounded-xl hover:bg-zinc-50 border border-zinc-200/80 hover:border-zinc-300 flex items-center gap-2.5 text-xs text-zinc-700 transition-colors cursor-pointer shadow-2xs active:scale-98"
            >
              <div className="p-1.5 rounded-lg bg-blue-50 text-[#0071e3]">
                <Columns className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-zinc-900">Kanban Board</div>
                <div className="text-[10px] text-zinc-400">To Do, In Progress, Done sprint columns</div>
              </div>
            </button>

            <button
              onClick={() => {
                soundEngine.playSticky();
                onInsertTemplate('mindmap');
                onClose();
              }}
              className="w-full text-left p-2.5 rounded-xl hover:bg-zinc-50 border border-zinc-200/80 hover:border-zinc-300 flex items-center gap-2.5 text-xs text-zinc-700 transition-colors cursor-pointer shadow-2xs active:scale-98"
            >
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <GitBranch className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-zinc-900">Mind Map Tree</div>
                <div className="text-[10px] text-zinc-400">Central node with branching thoughts</div>
              </div>
            </button>

            <button
              onClick={() => {
                soundEngine.playSticky();
                onInsertTemplate('retro');
                onClose();
              }}
              className="w-full text-left p-2.5 rounded-xl hover:bg-zinc-50 border border-zinc-200/80 hover:border-zinc-300 flex items-center gap-2.5 text-xs text-zinc-700 transition-colors cursor-pointer shadow-2xs active:scale-98"
            >
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-zinc-900">Team Retrospective</div>
                <div className="text-[10px] text-zinc-400">Went Well, To Improve, Action Items</div>
              </div>
            </button>

            <button
              onClick={() => {
                soundEngine.playSticky();
                onInsertTemplate('swot');
                onClose();
              }}
              className="w-full text-left p-2.5 rounded-xl hover:bg-zinc-50 border border-zinc-200/80 hover:border-zinc-300 flex items-center gap-2.5 text-xs text-zinc-700 transition-colors cursor-pointer shadow-2xs active:scale-98"
            >
              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-zinc-900">SWOT Matrix</div>
                <div className="text-[10px] text-zinc-400">Strengths, Weaknesses, Opportunities, Threats</div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
