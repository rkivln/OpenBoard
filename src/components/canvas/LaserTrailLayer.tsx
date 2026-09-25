import React, { useEffect, useRef } from 'react';

export interface LaserPoint {
  x: number;
  y: number;
  time: number;
}

interface LaserTrailLayerProps {
  points: LaserPoint[];
  isActive: boolean;
  spotlightMode?: boolean;
  spotlightCenter?: { x: number; y: number } | null;
  zoom: number;
  pan: { x: number; y: number };
}

export const LaserTrailLayer: React.FC<LaserTrailLayerProps> = ({
  points,
  isActive,
  spotlightMode = false,
  spotlightCenter,
  zoom,
  pan,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Spotlight mode overlay: darkens the canvas except for soft circular spotlight around cursor
      if (spotlightMode && spotlightCenter) {
        ctx.save();
        const screenX = spotlightCenter.x * zoom + pan.x;
        const screenY = spotlightCenter.y * zoom + pan.y;
        const radius = 180;

        // Dark backdrop
        ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Cutout spotlight
        ctx.globalCompositeOperation = 'destination-out';
        const grad = ctx.createRadialGradient(screenX, screenY, radius * 0.4, screenX, screenY, radius);
        grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 2. Glowing Laser Trail
      const now = performance.now();
      const validPoints = points.filter((p) => now - p.time < 1100);

      if (validPoints.length > 1) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw multiple glowing segments with decaying alpha and neon color
        for (let i = 1; i < validPoints.length; i++) {
          const p1 = validPoints[i - 1];
          const p2 = validPoints[i];
          const age = now - p2.time;
          const life = Math.max(0, 1 - age / 1100);

          const s1x = p1.x * zoom + pan.x;
          const s1y = p1.y * zoom + pan.y;
          const s2x = p2.x * zoom + pan.y;
          const s2y = p2.y * zoom + pan.y;

          // Outer Neon Glow
          ctx.beginPath();
          ctx.moveTo(s1x, s1y);
          ctx.lineTo(s2x, s2y);
          ctx.strokeStyle = `rgba(239, 68, 68, ${life * 0.35})`;
          ctx.lineWidth = 14 * life;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 12;
          ctx.stroke();

          // Inner Vibrant Core
          ctx.beginPath();
          ctx.moveTo(s1x, s1y);
          ctx.lineTo(s2x, s2y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${life * 0.9})`;
          ctx.lineWidth = 4 * life;
          ctx.shadowColor = '#f87171';
          ctx.shadowBlur = 6;
          ctx.stroke();
        }

        // Tip glowing particle
        const tip = validPoints[validPoints.length - 1];
        const tipX = tip.x * zoom + pan.x;
        const tipY = tip.y * zoom + pan.y;

        ctx.beginPath();
        ctx.arc(tipX, tipY, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 16;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(tipX, tipY, 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.fill();

        ctx.restore();
      }

      if (isActive || validPoints.length > 0 || spotlightMode) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [points, isActive, spotlightMode, spotlightCenter, zoom, pan]);

  // Sync canvas size to window
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-30"
      style={{ display: isActive || spotlightMode || points.length > 0 ? 'block' : 'none' }}
    />
  );
};
