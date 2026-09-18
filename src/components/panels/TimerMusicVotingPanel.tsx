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
  BarChart2,
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
      className="fixed top-18 right-4 z-40 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-200/80 p-4 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-800"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="font-semibold text-sm text-slate-900">Timer, music, and voting</h2>
        <button
          id="close-timer-panel-btn"
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* A. AUDIO VOLUME */}
      <div className="py-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMute}
            className="text-slate-500 hover:text-purple-600 transition-colors cursor-pointer"
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
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
            />
          </div>
        </div>
      </div>

      {/* B. TIMER CARD */}
      <div className="py-3 border-b border-slate-100">
        <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-100">
          {/* Digital clock display */}
          <div className="flex justify-center mb-3">
            <div className="bg-[#f3e8ff]/80 border border-purple-200/80 rounded-xl px-5 py-1.5 shadow-inner">
              <span className="font-mono tabular-nums text-4xl font-bold tracking-widest text-slate-900 select-none">
                {formatTime(timerRemainingSec)}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <button
                onClick={onAddOneMinute}
                className="h-8 px-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>1 min</span>
              </button>
              <button
                onClick={onResetTimer}
                className="h-8 w-8 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors shadow-xs cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onToggleTimer}
              className="w-9 h-9 rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
              title={isTimerRunning ? 'Pause Timer' : 'Start Timer'}
            >
              {isTimerRunning ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* C. MUSIC PLAYER CARD */}
      <div className="py-3 border-b border-slate-100">
        <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-100">
          {/* Vinyl & Speaker Graphic (Screenshot 5) */}
          <div className="flex items-center justify-around mb-3 px-2">
            {/* Vinyl record with bird emblem */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              {/* Spinning record disc */}
              <div
                className={`w-20 h-20 rounded-full bg-[#18181b] shadow-md flex items-center justify-center border-2 border-slate-700 ${
                  isPlayingAudio ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '4s' }}
              >
                {/* Vinyl Grooves concentric rings */}
                <div className="w-16 h-16 rounded-full border border-slate-800/80 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border border-slate-800/60 flex items-center justify-center bg-slate-300">
                    {/* Center Label with Bird Icon */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="#27272a" strokeWidth="1.8" className="w-6 h-6">
                      <path d="M16 7c-2-3-7-3-10 1-1.5 2-2 5-1 7l4 2c2 1 4 0 5-1l4-2c2-1 3-3 2-5-1-1-2-2-4-2z" />
                      <circle cx="9" cy="9" r="1" fill="#27272a" />
                      <path d="M12 12c1 1 3 2 5 2" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Tonearm needle resting on vinyl */}
              <div className="absolute -top-1 right-0 w-8 h-12 pointer-events-none">
                <svg viewBox="0 0 32 48" fill="none" className="w-full h-full">
                  <path d="M 28 4 L 28 16 L 16 34" stroke="#d4d4d8" strokeWidth="2.5" strokeLinecap="round" />
                  <rect x="12" y="32" width="7" height="10" rx="2" fill="#e4e4e7" stroke="#71717a" strokeWidth="1" transform="rotate(-20 15 36)" />
                  <circle cx="28" cy="6" r="3" fill="#a1a1aa" />
                </svg>
              </div>
            </div>

            {/* Speaker dot matrix pattern */}
            <div className="grid grid-cols-5 gap-1.5 p-2 bg-slate-100/70 rounded-xl">
              {Array.from({ length: 25 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    isPlayingAudio
                      ? 'bg-purple-400 animate-pulse'
                      : 'bg-slate-300'
                  }`}
                  style={{ animationDelay: `${(i % 5) * 0.15}s` }}
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
                className="w-full h-9 pl-3 pr-8 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 appearance-none focus:outline-none focus:border-purple-400 cursor-pointer"
              >
                <option value="Acoustic ambient">Acoustic ambient</option>
                <option value="Focus">Focus</option>
                <option value="Lo-fi">Lo-fi</option>
                <option value="Calm">Calm</option>
                <option value="Productivity">Productivity</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            <button
              onClick={onToggleAudio}
              className="w-9 h-9 rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
              title={isPlayingAudio ? 'Pause Audio' : 'Play Ambient Track'}
            >
              {isPlayingAudio ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* D. VOTING SECTION */}
      <div className="pt-3">
        <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-100">
          {!isCreatingVote && (!activeVote || !activeVote.isActive) ? (
            /* Voting Illustration Card (Screenshot 5) */
            <div>
              <div className="relative h-24 mb-3 rounded-xl bg-gradient-to-b from-amber-50/50 to-orange-50/30 flex items-center justify-center overflow-hidden">
                {/* Yellow sticky note graphic */}
                <div className="w-20 h-20 bg-amber-200/90 rounded-md shadow-md transform -rotate-6 flex items-center justify-center">
                  <div className="w-16 h-1 bg-amber-300/60 mb-8 rounded" />
                </div>

                {/* Floating stickers (Heart, +1, Thumbs up) */}
                <div className="absolute top-2 right-12 bg-rose-50 border border-rose-200 p-1.5 rounded-full shadow-md transform rotate-12">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                </div>
                <div className="absolute bottom-3 right-8 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-lg shadow-md font-bold text-xs text-purple-700 transform -rotate-6">
                  +1
                </div>
                <div className="absolute bottom-2 right-20 bg-emerald-50 border border-emerald-200 p-1.5 rounded-full shadow-md transform rotate-6">
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setIsCreatingVote(true)}
                  className="px-5 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] active:scale-95 text-white font-medium text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  New vote
                </button>
              </div>
            </div>
          ) : isCreatingVote ? (
            /* Create New Vote Form */
            <form onSubmit={handleStartNewVote} className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">Create Poll / Vote</span>
                <button
                  type="button"
                  onClick={() => setIsCreatingVote(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Cancel
                </button>
              </div>

              <input
                type="text"
                placeholder="Question (e.g. Which concept?)"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-purple-500"
                required
              />

              <div className="space-y-1.5">
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
                    className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-purple-400"
                  />
                ))}
              </div>

              {newOptions.length < 5 && (
                <button
                  type="button"
                  onClick={() => setNewOptions([...newOptions, `Option ${newOptions.length + 1}`])}
                  className="text-[11px] text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add option
                </button>
              )}

              <button
                type="submit"
                className="w-full py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium text-xs rounded-xl shadow-xs transition-all cursor-pointer mt-1"
              >
                Start Voting
              </button>
            </form>
          ) : (
            /* Active Live Voting Card */
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider bg-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" />
                  Active Vote
                </span>
                <button
                  onClick={onEndVote}
                  className="text-[11px] text-slate-400 hover:text-rose-600 font-medium cursor-pointer"
                >
                  End vote
                </button>
              </div>

              <div className="text-xs font-semibold text-slate-800">{activeVote?.question}</div>

              <div className="space-y-1.5">
                {activeVote?.options.map((opt) => {
                  const hasVoted = opt.votes.includes(currentUser.id);
                  const pct = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => onCastVote(opt.id)}
                      className={`w-full relative overflow-hidden text-left p-2 rounded-xl border transition-all text-xs cursor-pointer ${
                        hasVoted
                          ? 'border-purple-400 bg-purple-50/40 text-purple-900 font-medium'
                          : 'border-slate-200 bg-white hover:border-purple-200 text-slate-700'
                      }`}
                    >
                      {/* Vote percentage bar fill */}
                      <div
                        className="absolute inset-y-0 left-0 bg-purple-100/70 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />

                      <div className="relative flex items-center justify-between">
                        <span className="truncate pr-2">{opt.text}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] font-bold text-slate-500">{pct}%</span>
                          {hasVoted && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>{totalVotes} total vote{totalVotes === 1 ? '' : 's'}</span>
                <span>Created by {activeVote?.creator}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
