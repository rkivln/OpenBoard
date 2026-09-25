import React, { useState } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Plus,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ThumbsUp,
  Heart,
  ChevronDown,
} from 'lucide-react';
import { ActiveVote, UserPresence } from '../../types.ts';

interface TimerMusicVotingPanelProps {
  isOpen: boolean;
  onClose: () => void;

  // Audio
  isPlayingAudio: boolean;
  audioVolume: number;
  audioCategory: string;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  onChangeAudioCategory: (cat: string) => void;
  onChangeAudioVolume: (val: number) => void;
  onToggleMute: () => void;

  // Timer
  timerRemainingSec: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onAddOneMinute: () => void;
  onResetTimer: () => void;

  // Voting
  activeVote: ActiveVote | null;
  currentUser: UserPresence;
  onCastVote: (optionId: string) => void;
  onCreateVote: (question: string, options: string[], durationSec?: number) => void;
  onEndVote: () => void;
}

export const TimerMusicVotingPanel: React.FC<TimerMusicVotingPanelProps> = ({
  isOpen,
  onClose,
  isPlayingAudio,
  audioVolume,
  audioCategory,
  isAudioMuted,
  onToggleAudio,
  onChangeAudioCategory,
  onChangeAudioVolume,
  onToggleMute,
  timerRemainingSec,
  isTimerRunning,
  onToggleTimer,
  onAddOneMinute,
  onResetTimer,
  activeVote,
  currentUser,
  onCastVote,
  onCreateVote,
  onEndVote,
}) => {
  const [isCreatingVote, setIsCreatingVote] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['Option A', 'Option B']);

  if (!isOpen) return null;

  // Format mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartNewVote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    const validOptions = newOptions.filter((o) => o.trim().length > 0);
    if (validOptions.length < 2) return;
    onCreateVote(newQuestion.trim(), validOptions);
    setIsCreatingVote(false);
    setNewQuestion('');
    setNewOptions(['Option A', 'Option B']);
  };

  // Calculate voting percentages
  const totalVotes =
    activeVote?.options.reduce((acc, opt) => acc + opt.votes.length, 0) || 0;

  return (
    <div
      id="timer-music-voting-panel"
      className="fixed top-18 right-4 z-40 w-80 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.04)] border border-black/[0.08] p-4 animate-in fade-in slide-in-from-top-2 duration-150 text-zinc-800 select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
        <h2 className="font-semibold text-xs text-zinc-900 tracking-tight">Focus & Audio Center</h2>
        <button
          id="close-timer-panel-btn"
          onClick={onClose}
          className="w-5 h-5 text-zinc-400 hover:text-zinc-700 hover:bg-black/[0.04] rounded-md flex items-center justify-center text-xs transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* A. AUDIO VOLUME */}
      <div className="py-2.5 border-b border-black/[0.06]">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleMute}
            className="text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
            title={isAudioMuted ? 'Unmute' : 'Mute'}
          >
            {isAudioMuted || audioVolume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-500" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isAudioMuted ? 0 : audioVolume}
              onChange={(e) => onChangeAudioVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#0071e3]"
            />
          </div>
        </div>
      </div>

      {/* B. TIMER CARD - Apple Watch style */}
      <div className="py-3 border-b border-black/[0.06]">
        <div className="bg-zinc-50/90 rounded-2xl p-3 border border-black/[0.04]">
          {/* Digital clock display */}
          <div className="flex justify-center mb-3">
            <div className="bg-white border border-black/[0.06] rounded-xl px-5 py-2 shadow-2xs">
              <span className="font-mono tabular-nums text-3xl font-semibold tracking-wider text-zinc-900 select-none">
                {formatTime(timerRemainingSec)}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <button
                onClick={onAddOneMinute}
                className="h-8 px-2.5 bg-white hover:bg-zinc-50 border border-black/10 rounded-xl text-xs font-medium text-zinc-700 flex items-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>1 min</span>
              </button>
              <button
                onClick={onResetTimer}
                className="h-8 w-8 bg-white hover:bg-zinc-50 border border-black/10 rounded-xl flex items-center justify-center text-zinc-500 hover:text-zinc-800 active:scale-95 transition-all shadow-2xs cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onToggleTimer}
              className="w-8 h-8 rounded-full bg-[#0071e3] hover:bg-[#0077ED] active:bg-[#0062c4] text-white flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer"
              title={isTimerRunning ? 'Pause Timer' : 'Start Timer'}
            >
              {isTimerRunning ? (
                <Pause className="w-3.5 h-3.5 fill-white" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* C. MUSIC PLAYER CARD */}
      <div className="py-3 border-b border-black/[0.06]">
        <div className="bg-zinc-50/90 rounded-2xl p-3 border border-black/[0.04]">
          {/* Vinyl & Speaker Graphic */}
          <div className="flex items-center justify-around mb-3 px-2">
            {/* Vinyl record with clean Apple minimalist disc */}
            <div className="relative w-18 h-18 flex items-center justify-center">
              <div
                className={`w-18 h-18 rounded-full bg-[#18181b] shadow-md flex items-center justify-center border-2 border-zinc-700 ${
                  isPlayingAudio ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '4s' }}
              >
                <div className="w-14 h-14 rounded-full border border-zinc-800/80 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full border border-zinc-800/60 flex items-center justify-center bg-zinc-300">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
                  </div>
                </div>
              </div>
            </div>

            {/* Speaker wave indicator */}
            <div className="flex items-center gap-1 h-6 px-3 py-1 bg-white border border-black/[0.06] rounded-xl shadow-2xs">
              {[0.4, 0.8, 0.5, 0.9, 0.6].map((h, i) => (
                <span
                  key={i}
                  className={`w-1 bg-[#0071e3] rounded-full transition-all duration-300 ${
                    isPlayingAudio ? 'animate-pulse' : 'opacity-30'
                  }`}
                  style={{
                    height: isPlayingAudio ? `${Math.round(h * 16)}px` : '4px',
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Track selector dropdown & Play button */}
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <select
                value={audioCategory}
                onChange={(e) => onChangeAudioCategory(e.target.value)}
                className="w-full h-8 pl-3 pr-7 bg-white border border-black/10 rounded-xl text-xs font-medium text-zinc-700 appearance-none focus:outline-none focus:border-[#0071e3] cursor-pointer shadow-2xs"
              >
                <option value="Acoustic ambient">Acoustic ambient</option>
                <option value="Focus">Focus</option>
                <option value="Lo-fi">Lo-fi</option>
                <option value="Calm">Calm</option>
                <option value="Productivity">Productivity</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            <button
              onClick={onToggleAudio}
              className="w-8 h-8 rounded-full bg-[#0071e3] hover:bg-[#0077ED] active:bg-[#0062c4] text-white flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
              title={isPlayingAudio ? 'Pause Audio' : 'Play Ambient Track'}
            >
              {isPlayingAudio ? (
                <Pause className="w-3.5 h-3.5 fill-white" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* D. VOTING SECTION */}
      <div className="pt-3">
        <div className="bg-zinc-50/90 rounded-2xl p-3 border border-black/[0.04]">
          {!isCreatingVote && (!activeVote || !activeVote.isActive) ? (
            /* Voting Illustration Card */
            <div>
              <div className="relative h-20 mb-3 rounded-xl bg-white border border-black/[0.06] flex items-center justify-center overflow-hidden shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-rose-50 border border-rose-200/80 flex items-center justify-center text-xs">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  </div>
                  <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200/80 flex items-center justify-center text-xs font-bold text-[#0071e3]">
                    +1
                  </div>
                  <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-xs">
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setIsCreatingVote(true)}
                  className="px-4 py-1.5 bg-[#0071e3] hover:bg-[#0077ED] active:bg-[#0062c4] active:scale-95 text-white font-medium text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Create Poll
                </button>
              </div>
            </div>
          ) : isCreatingVote ? (
            /* Create New Vote Form */
            <form onSubmit={handleStartNewVote} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-800">New Poll</span>
                <button
                  type="button"
                  onClick={() => setIsCreatingVote(false)}
                  className="text-zinc-400 hover:text-zinc-600 text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <input
                type="text"
                placeholder="Question (e.g. Which design direction?)"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-black/10 rounded-lg text-xs outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
                required
              />

              <div className="space-y-1">
                {newOptions.map((opt, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const copy = [...newOptions];
                      copy[i] = e.target.value;
                      setNewOptions(copy);
                    }}
                    className="w-full px-2.5 py-1 bg-white border border-black/10 rounded-lg text-xs outline-none focus:border-[#0071e3]"
                  />
                ))}
              </div>

              {newOptions.length < 5 && (
                <button
                  type="button"
                  onClick={() => setNewOptions([...newOptions, `Option ${newOptions.length + 1}`])}
                  className="text-[11px] text-[#0071e3] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  Add option
                </button>
              )}

              <button
                type="submit"
                className="w-full py-1.5 bg-[#0071e3] hover:bg-[#0077ED] active:bg-[#0062c4] text-white font-medium text-xs rounded-xl shadow-xs transition-all cursor-pointer mt-1 active:scale-98"
              >
                Start Poll
              </button>
            </form>
          ) : (
            /* Active Live Voting Card */
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Voting
                </span>
                <button
                  onClick={onEndVote}
                  className="text-[11px] text-zinc-400 hover:text-rose-600 font-medium cursor-pointer"
                >
                  End poll
                </button>
              </div>

              <div className="text-xs font-semibold text-zinc-800">{activeVote?.question}</div>

              <div className="space-y-1.5">
                {activeVote?.options.map((opt) => {
                  const hasVoted = opt.votes.includes(currentUser.id);
                  const pct = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => onCastVote(opt.id)}
                      className={`w-full relative overflow-hidden text-left p-2 rounded-xl border transition-all text-xs cursor-pointer active:scale-98 ${
                        hasVoted
                          ? 'border-[#0071e3] bg-blue-50/40 text-zinc-900 font-medium'
                          : 'border-black/10 bg-white hover:border-[#0071e3]/40 text-zinc-700'
                      }`}
                    >
                      {/* Vote percentage bar fill */}
                      <div
                        className="absolute inset-y-0 left-0 bg-[#0071e3]/10 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />

                      <div className="relative flex items-center justify-between">
                        <span className="truncate pr-2">{opt.text}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] font-bold text-zinc-500">{pct}%</span>
                          {hasVoted && <CheckCircle2 className="w-3.5 h-3.5 text-[#0071e3]" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                <span>{totalVotes} vote{totalVotes === 1 ? '' : 's'}</span>
                <span>By {activeVote?.creator}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
