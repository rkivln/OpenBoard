import React from 'react';
import {
  Activity,
  Zap,
  Magnet,
  Flame,
  Globe,
  Feather,
  Rocket,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Wind,
  X,
} from 'lucide-react';
import { GravityPreset, FrictionPreset } from '../../hooks/usePhysics.ts';
import { PhysicsConfig } from '../../utils/physicsEngine.ts';

interface PhysicsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isPhysicsActive: boolean;
  onTogglePhysics: () => void;
  gravityPreset: GravityPreset;
  onSelectGravityPreset: (preset: GravityPreset) => void;
  frictionPreset?: FrictionPreset;
  onSelectFrictionPreset?: (preset: FrictionPreset) => void;
  onSelectMomentumDecay?: (decay: number) => void;
  physicsConfig: PhysicsConfig;
  onSelectBounciness: (val: number) => void;
  onToggleFloorBarrier?: () => void;
  onToggleMagnet: () => void;
  onShakeBoard: () => void;
  onSettleAndFreeze: () => void;
}

export const PhysicsPanel: React.FC<PhysicsPanelProps> = ({
  isOpen,
  onClose,
  isPhysicsActive,
  onTogglePhysics,
  gravityPreset,
  onSelectGravityPreset,
  frictionPreset = 'medium',
  onSelectFrictionPreset,
  onSelectMomentumDecay,
  physicsConfig,
  onSelectBounciness,
  onToggleFloorBarrier,
  onToggleMagnet,
  onShakeBoard,
  onSettleAndFreeze,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="physics-control-panel"
      className="fixed top-18 right-6 z-40 w-84 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.14),0_2px_4px_rgba(0,0,0,0.04)] border border-black/[0.08] p-4 text-zinc-800 select-none animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <Activity className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-tight text-zinc-900">Physics Sandbox</h3>
            <p className="text-[10px] text-zinc-500">Gravity, Collisions, Springs & Friction</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full hover:bg-black/[0.06] flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Physics Toggle */}
      <div className="mt-3">
        <button
          onClick={onTogglePhysics}
          className={`w-full py-2 px-3 rounded-xl flex items-center justify-between font-medium text-xs transition-all cursor-pointer shadow-xs active:scale-[0.98] ${
            isPhysicsActive
              ? 'bg-[#0071e3] text-white shadow-[0_2px_8px_rgba(0,113,227,0.35)]'
              : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {isPhysicsActive ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span className="font-semibold">
              {isPhysicsActive ? 'Physics Active (Simulating)' : 'Activate Physics'}
            </span>
          </div>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              isPhysicsActive ? 'bg-white/25 text-white' : 'bg-zinc-200 text-zinc-600'
            }`}
          >
            {isPhysicsActive ? 'LIVE' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Gravity Modes */}
      <div className="mt-3.5">
        <label className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider block mb-1.5">
          Gravity Environment
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {/* Zero-G */}
          <button
            onClick={() => onSelectGravityPreset('zero')}
            className={`py-1.5 px-2.5 rounded-xl flex items-center gap-2 text-xs font-medium transition-all cursor-pointer border active:scale-95 ${
              gravityPreset === 'zero'
                ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-2xs font-semibold'
                : 'bg-zinc-50 hover:bg-zinc-100 border-black/[0.04] text-zinc-600'
            }`}
          >
            <Rocket className="w-3.5 h-3.5 text-purple-500" />
            <span>Zero Gravity</span>
          </button>

          {/* Gentle Float */}
          <button
            onClick={() => onSelectGravityPreset('gentle')}
            className={`py-1.5 px-2.5 rounded-xl flex items-center gap-2 text-xs font-medium transition-all cursor-pointer border active:scale-95 ${
              gravityPreset === 'gentle'
                ? 'bg-sky-50 border-sky-300 text-sky-700 shadow-2xs font-semibold'
                : 'bg-zinc-50 hover:bg-zinc-100 border-black/[0.04] text-zinc-600'
            }`}
          >
            <Feather className="w-3.5 h-3.5 text-sky-500" />
            <span>Gentle Float</span>
          </button>

          {/* Earth Normal */}
          <button
            onClick={() => onSelectGravityPreset('earth')}
            className={`py-1.5 px-2.5 rounded-xl flex items-center gap-2 text-xs font-medium transition-all cursor-pointer border active:scale-95 ${
              gravityPreset === 'earth'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs font-semibold'
                : 'bg-zinc-50 hover:bg-zinc-100 border-black/[0.04] text-zinc-600'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-500" />
            <span>Earth Gravity</span>
          </button>

          {/* Helium Inverted */}
          <button
            onClick={() => onSelectGravityPreset('helium')}
            className={`py-1.5 px-2.5 rounded-xl flex items-center gap-2 text-xs font-medium transition-all cursor-pointer border active:scale-95 ${
              gravityPreset === 'helium'
                ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-2xs font-semibold'
                : 'bg-zinc-50 hover:bg-zinc-100 border-black/[0.04] text-zinc-600'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Helium Rise</span>
          </button>
        </div>
      </div>

      {/* Momentum Decay (Friction) Section */}
      <div className="mt-3.5">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider flex items-center gap-1">
            <Wind className="w-3.5 h-3.5 text-indigo-500" />
            <span>Momentum Decay (Friction)</span>
          </label>
          <span className="text-[10px] font-bold text-zinc-500">
            {Math.round(physicsConfig.momentumDecay * 1000) / 10}% air drag
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1 bg-zinc-100/90 p-1 rounded-xl mb-2">
          {/* Low Friction / Ice Glide */}
          <button
            onClick={() => onSelectFrictionPreset?.('low')}
            className={`py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer text-center ${
              frictionPreset === 'low' || physicsConfig.momentumDecay < 0.025
                ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
            title="Ice / Low Friction: High momentum throw, long sliding distance"
          >
            Ice Glide
          </button>

          {/* Medium / Natural Fluid */}
          <button
            onClick={() => onSelectFrictionPreset?.('medium')}
            className={`py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer text-center ${
              frictionPreset === 'medium' ||
              (physicsConfig.momentumDecay >= 0.025 && physicsConfig.momentumDecay <= 0.055)
                ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
            title="Natural Fluid: Realistic smooth momentum decay and toss deceleration"
          >
            Fluid
          </button>

          {/* High / Felt Cushion */}
          <button
            onClick={() => onSelectFrictionPreset?.('high')}
            className={`py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer text-center ${
              frictionPreset === 'high' ||
              (physicsConfig.momentumDecay > 0.055 && physicsConfig.momentumDecay <= 0.1)
                ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
            title="Felt Cushion: Gentle cushioned deceleration and soft landing"
          >
            Felt
          </button>

          {/* Ultra / Heavy Drag */}
          <button
            onClick={() => onSelectFrictionPreset?.('ultra')}
            className={`py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer text-center ${
              frictionPreset === 'ultra' || physicsConfig.momentumDecay > 0.1
                ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
            title="Heavy Drag: Strong braking resistance when flung"
          >
            Heavy Drag
          </button>
        </div>

        {/* Fine-Tuning Slider */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] text-zinc-400 font-medium">Glide</span>
          <input
            type="range"
            min="0.008"
            max="0.14"
            step="0.004"
            value={physicsConfig.momentumDecay}
            onChange={(e) => onSelectMomentumDecay?.(parseFloat(e.target.value))}
            className="flex-1 h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#0071e3]"
            title="Slide to fine-tune momentum decay rate"
          />
          <span className="text-[10px] text-zinc-400 font-medium">Brake</span>
        </div>
      </div>

      {/* Bounciness (Restitution) */}
      <div className="mt-3.5">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
            Bounciness & Elasticity
          </label>
          <span className="text-[10px] font-bold text-zinc-500">
            {Math.round(physicsConfig.bounciness * 100)}%
          </span>
        </div>
        <div className="flex items-center gap-1 bg-zinc-100/90 p-1 rounded-xl">
          <button
            onClick={() => onSelectBounciness(0.3)}
            className={`flex-1 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
              physicsConfig.bounciness <= 0.4
                ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Firm
          </button>
          <button
            onClick={() => onSelectBounciness(0.7)}
            className={`flex-1 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
              physicsConfig.bounciness > 0.4 && physicsConfig.bounciness <= 0.75
                ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Bouncy
          </button>
          <button
            onClick={() => onSelectBounciness(0.95)}
            className={`flex-1 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
              physicsConfig.bounciness > 0.75
                ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Superball
          </button>
        </div>
      </div>

      {/* Interactive Actions */}
      <div className="mt-3.5 pt-3 border-t border-black/[0.06] grid grid-cols-2 gap-2">
        {/* Shake Board */}
        <button
          onClick={onShakeBoard}
          className="py-2 px-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200/80 text-orange-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
          title="Agitate and bounce all elements with an explosive force impulse"
        >
          <Zap className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
          <span>Shake Board</span>
        </button>

        {/* Magnetic Cursor */}
        <button
          onClick={onToggleMagnet}
          className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs border ${
            physicsConfig.isMagnetActive
              ? 'bg-rose-50 border-rose-300 text-rose-700 ring-1 ring-rose-400'
              : 'bg-zinc-50 hover:bg-zinc-100 border-black/[0.06] text-zinc-700'
          }`}
          title="Attract all elements toward your cursor magnetically"
        >
          <Magnet className="w-3.5 h-3.5 text-rose-500" />
          <span>{physicsConfig.isMagnetActive ? 'Magnet ON' : 'Magnet Mode'}</span>
        </button>
      </div>

      {/* Desk Floor Barrier Toggle */}
      {onToggleFloorBarrier && (
        <div className="mt-2">
          <button
            onClick={onToggleFloorBarrier}
            className={`w-full py-1.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
              physicsConfig.hasFloor
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
            }`}
            title="When active, elements land and stack realistically on a desk surface instead of falling infinitely"
          >
            <span className="font-semibold text-[11px]">Desk Surface Barrier</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                physicsConfig.hasFloor ? 'bg-emerald-600 text-white' : 'bg-zinc-200 text-zinc-600'
              }`}
            >
              {physicsConfig.hasFloor ? 'FLOOR ON' : 'OFF'}
            </span>
          </button>
        </div>
      )}

      {/* Settle & Freeze button */}
      <div className="mt-2">
        <button
          onClick={onSettleAndFreeze}
          className="w-full py-1.5 px-3 rounded-xl hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          title="Stop all movement and freeze elements at their current settled resting positions"
        >
          <RotateCcw className="w-3 h-3 text-zinc-400" />
          <span>Settle & Freeze Positions</span>
        </button>
      </div>

      {/* Tip Banner */}
      <div className="mt-3 p-2 rounded-xl bg-purple-500/8 border border-purple-500/15 flex items-start gap-2 text-[10px] text-purple-900 leading-tight">
        <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
        <div>
          <strong>Tactile Drag & Push:</strong> Dragging elements pushes and scatters obstacles. Releasing with flick throws them realistically across the board.
        </div>
      </div>
    </div>
  );
};
