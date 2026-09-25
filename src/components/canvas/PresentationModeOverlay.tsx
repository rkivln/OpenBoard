import React, { useEffect, useState, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Maximize2,
  Minimize2,
  Sparkles,
  Zap,
  Radio,
  Eye,
} from 'lucide-react';
import { CanvasElement, FrameElement } from '../../types.ts';
import { soundEngine } from '../../utils/audio.ts';

interface PresentationModeOverlayProps {
  isOpen: boolean;
  elements: CanvasElement[];
  onClose: () => void;
  onNavigateToBox: (x: number, y: number, width: number, height: number) => void;
  spotlightMode: boolean;
  onToggleSpotlight: () => void;
  isLaserActive: boolean;
  onToggleLaser: () => void;
}

export const PresentationModeOverlay: React.FC<PresentationModeOverlayProps> = ({
  isOpen,
  elements,
  onClose,
  onNavigateToBox,
  spotlightMode,
  onToggleSpotlight,
  isLaserActive,
  onToggleLaser,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Extract frames as slides, or group elements into logical slides
  const slides = React.useMemo(() => {
    const frames = elements.filter((e) => e.type === 'frame') as FrameElement[];
    if (frames.length > 0) {
      // Sort frames left-to-right, then top-to-bottom
      return frames.sort((a, b) => a.x - b.x || a.y - b.y).map((f, i) => ({
        id: f.id,
        title: f.title || `Slide ${i + 1}`,
        x: f.x,
        y: f.y,
        width: f.width,
        height: f.height,
      }));
    }

    // Fallback: If no frames, create whole canvas overview slide or cluster slide
    if (elements.length > 0) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      elements.forEach((el) => {
        const w = 'width' in el ? (el.width || 100) : 100;
        const h = 'height' in el ? (el.height || 60) : 60;
        minX = Math.min(minX, el.x);
        minY = Math.min(minY, el.y);
        maxX = Math.max(maxX, el.x + w);
        maxY = Math.max(maxY, el.y + h);
      });
      return [
        {
          id: 'overview',
          title: 'Full Board Overview',
          x: minX,
          y: minY,
          width: Math.max(maxX - minX, 600),
          height: Math.max(maxY - minY, 400),
        },
      ];
    }

    return [
      {
        id: 'empty',
        title: 'Canvas Presentation',
        x: 0,
        y: 0,
        width: 1200,
        height: 700,
      },
    ];
  }, [elements]);

  const goToSlide = useCallback(
    (index: number) => {
      const targetIndex = Math.max(0, Math.min(slides.length - 1, index));
      setCurrentSlideIndex(targetIndex);
      const slide = slides[targetIndex];
      if (slide) {
        soundEngine.playSlide();
        onNavigateToBox(slide.x, slide.y, slide.width, slide.height);
      }
    },
    [slides, onNavigateToBox]
  );

  // Jump to first slide upon opening
  useEffect(() => {
    if (isOpen) {
      setCurrentSlideIndex(0);
      if (slides.length > 0) {
        onNavigateToBox(slides[0].x, slides[0].y, slides[0].width, slides[0].height);
      }
    }
  }, [isOpen, slides, onNavigateToBox]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        goToSlide(currentSlideIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToSlide(currentSlideIndex - 1);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentSlideIndex, goToSlide, onClose]);

  if (!isOpen) return null;

  const currentSlide = slides[currentSlideIndex] || slides[0];

  return (
    <div className="fixed inset-0 pointer-events-none z-50 select-none">
      {/* Top Banner with Slide Title and Exit */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-3 px-4 py-2 bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-700/80 text-white animate-in fade-in slide-in-from-top-4 duration-150">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Presenting
          </span>
          <span className="text-xs text-slate-400 font-normal">|</span>
          <span className="text-xs font-medium text-white max-w-[200px] truncate">
            {currentSlide.title}
          </span>
        </div>

        <button
          onClick={onClose}
          className="ml-2 px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 cursor-pointer transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          <span>Exit (Esc)</span>
        </button>
      </div>

      {/* Bottom Floating Presentation Navigation Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-2 px-3 py-1.5 bg-[#1d1d1f]/90 backdrop-blur-2xl rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.35)] border border-white/10 text-white animate-in fade-in slide-in-from-bottom-4 duration-150">
        {/* Previous Slide Button */}
        <button
          onClick={() => goToSlide(currentSlideIndex - 1)}
          disabled={currentSlideIndex === 0}
          className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-white/10 flex items-center justify-center text-zinc-200 hover:text-white transition-all cursor-pointer active:scale-95"
          title="Previous slide"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2]" />
        </button>

        {/* Counter */}
        <div className="px-2 text-xs font-medium text-zinc-300 min-w-[70px] text-center font-mono">
          <span className="text-white font-semibold">{currentSlideIndex + 1}</span> / {slides.length}
        </div>

        {/* Next Slide Button */}
        <button
          onClick={() => goToSlide(currentSlideIndex + 1)}
          disabled={currentSlideIndex >= slides.length - 1}
          className="w-8 h-8 rounded-xl bg-[#0071e3] hover:bg-[#0077ED] active:bg-[#0062c4] disabled:opacity-30 disabled:hover:bg-[#0071e3] flex items-center justify-center text-white transition-all cursor-pointer shadow-xs active:scale-95"
          title="Next slide"
        >
          <ChevronRight className="w-4 h-4 stroke-[2]" />
        </button>

        <div className="w-px h-5 bg-white/10 mx-0.5" />

        {/* Spotlight Toggle */}
        <button
          onClick={onToggleSpotlight}
          className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
            spotlightMode
              ? 'bg-white/20 text-white font-medium shadow-2xs'
              : 'hover:bg-white/10 text-zinc-400 hover:text-zinc-200'
          }`}
          title="Spotlight Focus Mode"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Spotlight</span>
        </button>

        {/* Laser Pointer Toggle */}
        <button
          onClick={onToggleLaser}
          className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
            isLaserActive
              ? 'bg-[#0071e3] text-white font-medium shadow-2xs'
              : 'hover:bg-white/10 text-zinc-400 hover:text-zinc-200'
          }`}
          title="Laser Pointer"
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Laser</span>
        </button>
      </div>
    </div>
  );
};
