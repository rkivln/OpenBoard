import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Users, Share2, Play, Clock, LayoutGrid, Activity } from 'lucide-react';
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
  onStartPresentation?: () => void;
  isPhysicsActive?: boolean;
  isPhysicsPanelOpen?: boolean;
  onTogglePhysicsPanel?: () => void;
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
  onStartPresentation,
  isPhysicsActive = false,
  isPhysicsPanelOpen = false,
  onTogglePhysicsPanel,
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
    <div className="fixed top-4 right-4 z-40 flex items-center gap-2 select-none">
      {/* Remote active collaborators indicator pills */}
      {remoteUsers.length > 0 && (
        <div className="flex items-center -space-x-1 mr-1 bg-white/85 backdrop-blur-2xl px-2 py-1 rounded-2xl border border-black/[0.08] shadow-2xs text-xs text-zinc-600">
          {remoteUsers.slice(0, 3).map((user) => (
            <div
              key={user.id}
              className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-semibold text-white shadow-2xs"
              style={{ backgroundColor: user.color }}
              title={`${user.name} (online)`}
            >
              {user.avatar}
            </div>
          ))}
          {remoteUsers.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-zinc-100 border-2 border-white flex items-center justify-center text-[9px] font-semibold text-zinc-600">
              +{remoteUsers.length - 3}
            </div>
          )}
        </div>
      )}

      {/* Main Apple / Google Refined Control Bar */}
      <div
        id="top-right-control-bar"
        className="flex items-center h-10 px-1.5 bg-white/85 backdrop-blur-2xl rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] border border-black/[0.08] gap-1 transition-all"
      >
        {/* User Profile Avatar */}
        <div className="relative" ref={userMenuRef}>
          <button
            id="user-avatar-btn"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-1 pl-0.5 pr-1.5 py-0.5 rounded-xl hover:bg-black/[0.04] transition-colors cursor-pointer group active:scale-95"
            title={`${currentUser.name} (Account)`}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#0071e3] to-[#42a5f5] text-white flex items-center justify-center font-medium text-xs shadow-2xs">
              {currentUser.avatar}
            </div>
            <ChevronDown className={`w-3 h-3 text-zinc-400 group-hover:text-zinc-600 transition-transform duration-150 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User & Collaboration Dropdown (Apple macOS popover style) */}
          {isUserMenuOpen && (
            <div className="absolute top-11 right-0 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.04)] border border-black/[0.08] p-3 z-50 text-xs text-zinc-700 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center gap-2.5 pb-2.5 mb-2 border-b border-black/[0.06]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0071e3] to-[#42a5f5] text-white flex items-center justify-center font-semibold text-xs shadow-2xs">
                  {currentUser.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-zinc-900 text-xs truncate">{currentUser.name} (You)</div>
                  <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active session
                  </div>
                </div>
              </div>

              <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 px-0.5">
                Collaborators ({remoteUsers.length + 1})
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto mb-2.5">
                <div className="flex items-center justify-between p-1.5 rounded-xl bg-zinc-50 text-zinc-900">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#0071e3] text-white text-[10px] flex items-center justify-center font-bold">
                      {currentUser.avatar}
                    </div>
                    <span className="font-medium text-xs">{currentUser.name}</span>
                  </div>
                  <span className="text-[10px] bg-zinc-200 text-zinc-700 px-1.5 py-0.5 rounded-full font-medium">Host</span>
                </div>

                {remoteUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-1.5 rounded-xl hover:bg-zinc-50">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.avatar}
                      </div>
                      <span className="text-xs text-zinc-700">{user.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">Editor</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  onOpenShareModal();
                }}
                className="w-full py-1.5 px-3 bg-[#0071e3] hover:bg-[#0077ED] active:bg-[#0062c4] text-white font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-98"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Invite Collaborators</span>
              </button>
            </div>
          )}
        </div>

        {/* Apple Hairline Divider */}
        <div className="w-px h-4 bg-black/[0.08]" />

        {/* Canvas Grid Toggle */}
        <button
          id="toggle-layout-btn"
          onClick={onToggleGrid}
          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors cursor-pointer active:scale-95 ${
            gridConfig.type !== 'blank'
              ? 'text-zinc-900 hover:bg-black/[0.04]'
              : 'text-zinc-400 hover:text-zinc-700 hover:bg-black/[0.04]'
          }`}
          title={`Toggle Canvas Grid (${gridConfig.type})`}
        >
          <LayoutGrid className="w-3.5 h-3.5 stroke-[1.8]" />
        </button>

        {/* Apple Hairline Divider */}
        <div className="w-px h-4 bg-black/[0.08]" />

        {/* Focus Timer & Music Widget */}
        <button
          id="timer-music-widget-btn"
          onClick={onToggleTimerPanel}
          className={`h-7 px-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium active:scale-95 ${
            isTimerPanelOpen || isTimerRunning || isPlayingAudio
              ? 'bg-zinc-100/90 text-zinc-900 shadow-2xs'
              : 'hover:bg-black/[0.04] text-zinc-600 hover:text-zinc-900'
          }`}
          title="Focus Timer & Ambient Audio"
        >
          {isPlayingAudio ? (
            <div className="flex items-end gap-0.5 h-3 w-2.5">
              <span className="w-0.5 bg-[#0071e3] rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-full" />
              <span className="w-0.5 bg-[#0071e3] rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-2/3" />
              <span className="w-0.5 bg-[#0071e3] rounded-full animate-[pulse_0.9s_ease-in-out_infinite] h-4/5" />
            </div>
          ) : (
            <Clock className={`w-3.5 h-3.5 stroke-[1.8] ${isTimerRunning ? 'text-[#0071e3]' : 'text-zinc-500'}`} />
          )}

          <span className="font-mono tabular-nums tracking-tight font-medium text-[12px] text-zinc-700">
            {formatTime(timerRemainingSec)}
          </span>

          {isTimerRunning && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] animate-pulse ml-0.5" />
          )}
        </button>

        {/* Apple Hairline Divider */}
        <div className="w-px h-4 bg-black/[0.08]" />

        {/* Physics Sandbox Toggle Button */}
        {onTogglePhysicsPanel && (
          <button
            id="physics-panel-btn"
            onClick={onTogglePhysicsPanel}
            className={`h-7 px-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
              isPhysicsActive
                ? 'bg-purple-600 text-white shadow-[0_1px_4px_rgba(147,51,234,0.4)]'
                : isPhysicsPanelOpen
                ? 'bg-zinc-200/90 text-zinc-900'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.04]'
            }`}
            title="Physics Sandbox (Gravity, Collisions, Toss & Springs)"
          >
            <Activity className="w-3.5 h-3.5 stroke-[2.2]" />
            <span className="hidden md:inline">Physics</span>
            {isPhysicsActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
          </button>
        )}

        {/* Present Slides Button (Apple Keynote style) */}
        {onStartPresentation && (
          <button
            id="present-mode-btn"
            onClick={onStartPresentation}
            className="h-7 px-2.5 bg-zinc-100 hover:bg-zinc-200/80 active:scale-95 text-zinc-800 font-medium text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-black/[0.06] shadow-2xs"
            title="Present Mode"
          >
            <Play className="w-3 h-3 fill-current text-zinc-700" />
            <span className="hidden sm:inline">Present</span>
          </button>
        )}

        {/* Share Button (Apple System Blue style) */}
        <button
          id="share-board-btn"
          onClick={onOpenShareModal}
          className="h-7 px-3 bg-[#0071e3] hover:bg-[#0077ED] active:bg-[#0062c4] active:scale-95 text-white font-medium text-xs rounded-xl shadow-[0_1px_2px_rgba(0,113,227,0.35)] transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Share2 className="w-3 h-3 text-white stroke-[2]" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};
