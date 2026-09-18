import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Users, Sparkles, Check, Link2, Share2 } from 'lucide-react';
import { UserPresence, GridConfig } from '../../types.ts';

interface TopRightControlProps {
  currentUser: UserPresence;
  remoteUsers: UserPresence[];
  timerRemainingSec: number;
  isTimerRunning: boolean;
  isPlayingAudio: boolean;
  isTimerPanelOpen: boolean;
  onToggleTimerPanel: () => void;
  onOpenShareModal: () => void;
  gridConfig: GridConfig;
  onToggleGrid: () => void;
}

export const TopRightControl: React.FC<TopRightControlProps> = ({
  currentUser,
  remoteUsers,
  timerRemainingSec,
  isTimerRunning,
  isPlayingAudio,
  isTimerPanelOpen,
  onToggleTimerPanel,
  onOpenShareModal,
  gridConfig,
  onToggleGrid,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    if (isUserMenuOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  // Format mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
      {/* Remote active collaborators indicator pills (if any) */}
      {remoteUsers.length > 0 && (
        <div className="flex items-center -space-x-1.5 mr-1 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full border border-slate-200 shadow-sm text-xs text-slate-600">
          {remoteUsers.slice(0, 3).map((user) => (
            <div
              key={user.id}
              className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
              style={{ backgroundColor: user.color }}
              title={`${user.name} (online)`}
            >
              {user.avatar}
            </div>
          ))}
          {remoteUsers.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-600">
              +{remoteUsers.length - 3}
            </div>
          )}
        </div>
      )}

      {/* Main Floating Rounded Control Bar Container */}
      <div
        id="top-right-control-bar"
        className="flex items-center h-11 px-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-slate-200/80 gap-1.5 transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
      >
        {/* User Avatar + Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            id="user-avatar-btn"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-1 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            title={`${currentUser.name} (Account)`}
          >
            {/* Skeuomorphic/flat brown circular avatar matching screenshot 'G' */}
            <div className="w-7 h-7 rounded-full bg-[#4a3525] text-white flex items-center justify-center font-bold text-xs shadow-inner">
              {currentUser.avatar}
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User & Collaboration Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute top-12 right-0 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center gap-2.5 pb-2.5 mb-2.5 border-b border-slate-100">
                <div className="w-9 h-9 rounded-full bg-[#4a3525] text-white flex items-center justify-center font-bold text-sm">
                  {currentUser.avatar}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{currentUser.name} (You)</div>
                  <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online & Synchronizing
                  </div>
                </div>
              </div>

              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Active Collaborators ({remoteUsers.length + 1})
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto mb-2">
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-purple-50/60 text-purple-900">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#4a3525] text-white text-[10px] flex items-center justify-center font-bold">
                      {currentUser.avatar}
                    </div>
                    <span className="font-medium text-xs">{currentUser.name} (Host)</span>
                  </div>
                  <span className="text-[10px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded font-medium">Editor</span>
                </div>

                {remoteUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.avatar}
                      </div>
                      <span className="text-xs text-slate-700">{user.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Collaborator</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  onOpenShareModal();
                }}
                className="w-full py-2 px-3 bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Invite Collaborators</span>
              </button>
            </div>
          )}
        </div>

        {/* View / Layout / Grid Toggle Icon (Matches Screenshot 5 & 6) */}
        <button
          id="toggle-layout-btn"
          onClick={onToggleGrid}
          className={`p-2 rounded-xl text-slate-600 hover:text-purple-600 hover:bg-slate-100 transition-colors cursor-pointer ${
            gridConfig.type === 'dots' ? 'text-purple-700' : ''
          }`}
          title={`Toggle Canvas Grid (${gridConfig.type})`}
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
            <rect x="2.5" y="3.5" width="15" height="13" rx="2" />
            <line x1="2.5" y1="8" x2="17.5" y2="8" />
            <line x1="7.5" y1="8" x2="7.5" y2="16.5" />
          </svg>
        </button>

        {/* Timer & Music Widget Pill (Matches Screenshot 5 & 6) */}
        <button
          id="timer-music-widget-btn"
          onClick={onToggleTimerPanel}
          className={`flex items-center gap-1.5 h-8 px-2.5 rounded-xl border transition-all cursor-pointer ${
            isTimerPanelOpen
              ? 'bg-purple-100 border-purple-300 text-purple-900 shadow-xs'
              : 'bg-[#f5f0ff] hover:bg-[#ede5ff] border-purple-200/70 text-purple-800'
          }`}
          title="Open Timer, music, and voting panel"
        >
          {/* Vinyl Record Icon with Star Badge */}
          <div className="relative flex items-center justify-center">
            <div
              className={`w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center border border-slate-700 ${
                isPlayingAudio ? 'animate-spin' : ''
              }`}
              style={{ animationDuration: '3s' }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            </div>
            {/* Sparkle star badge */}
            <span className="absolute -top-1 -right-1 text-[9px] leading-none select-none">✨</span>
          </div>

          {/* Digital Clock display in SF Mono tabular figures */}
          <span className="font-mono tabular-nums tracking-wide font-semibold text-[13px] text-purple-700 pt-0.5">
            {formatTime(timerRemainingSec)}
          </span>
        </button>

        {/* Share Button (Solid Purple #8B5CF6 with White Text) */}
        <button
          id="share-board-btn"
          onClick={onOpenShareModal}
          className="h-8 px-3.5 bg-[#8b5cf6] hover:bg-[#7c3aed] active:scale-95 text-white font-medium text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-white/90" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};
