import { useState, useEffect, useRef, useCallback } from 'react';
import { CanvasElement } from '../types.ts';
import {
  WhiteboardPhysicsEngine,
  PhysicsConfig,
  DEFAULT_PHYSICS_CONFIG,
  FrictionPreset,
} from '../utils/physicsEngine.ts';
import { soundEngine } from '../utils/audio.ts';

export type GravityPreset = 'zero' | 'gentle' | 'earth' | 'helium';
export type { FrictionPreset };

export interface UsePhysicsOptions {
  elements: CanvasElement[];
  onElementsUpdateLive: (elements: CanvasElement[]) => void;
  onElementsCommit: () => void;
}

export function usePhysics({
  elements,
  onElementsUpdateLive,
  onElementsCommit,
}: UsePhysicsOptions) {
  const engineRef = useRef<WhiteboardPhysicsEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new WhiteboardPhysicsEngine();
  }

  const [physicsConfig, setPhysicsConfig] = useState<PhysicsConfig>(DEFAULT_PHYSICS_CONFIG);
  const [gravityPreset, setGravityPresetState] = useState<GravityPreset>('earth');
  const [frictionPreset, setFrictionPresetState] = useState<FrictionPreset>('medium');
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const elementsRef = useRef<CanvasElement[]>(elements);
  elementsRef.current = elements;

  // Sync Matter.js world when elements change
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.syncElements(elements);
    }
  }, [elements]);

  // Main 60 FPS Physics Simulation Loop
  useEffect(() => {
    if (!physicsConfig.enabled) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = () => {
      const now = performance.now();
      const dt = Math.min(32, now - lastTimeRef.current);
      lastTimeRef.current = now;

      const engine = engineRef.current;
      if (engine && physicsConfig.enabled) {
        const patches = engine.update(dt);
        if (patches.size > 0) {
          const currentElements = elementsRef.current;
          let hasChanges = false;

          const updatedElements = currentElements.map((el) => {
            const patch = patches.get(el.id);
            if (patch) {
              if (
                Math.abs(el.x - patch.x) > 0.4 ||
                Math.abs(el.y - patch.y) > 0.4 ||
                Math.abs((el.rotation || 0) - patch.rotation) > 0.4
              ) {
                hasChanges = true;
                return {
                  ...el,
                  x: patch.x,
                  y: patch.y,
                  rotation: patch.rotation,
                };
              }
            }
            return el;
          });

          if (hasChanges) {
            onElementsUpdateLive(updatedElements);
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [physicsConfig.enabled, onElementsUpdateLive]);

  // Toggle Physics Engine Active / Inactive
  const togglePhysics = useCallback(() => {
    setPhysicsConfig((prev) => {
      const nextEnabled = !prev.enabled;
      if (engineRef.current) {
        engineRef.current.setConfig({ enabled: nextEnabled });
        if (nextEnabled) {
          engineRef.current.syncElements(elementsRef.current);
          soundEngine.playPop();
        } else {
          engineRef.current.settleAll();
          onElementsCommit();
        }
      }
      return { ...prev, enabled: nextEnabled };
    });
  }, [onElementsCommit]);

  // Gravity Presets
  const setGravityPreset = useCallback((preset: GravityPreset) => {
    setGravityPresetState(preset);
    let gy = 0.6;
    if (preset === 'zero') gy = 0;
    else if (preset === 'gentle') gy = 0.2;
    else if (preset === 'earth') gy = 0.8;
    else if (preset === 'helium') gy = -0.6;

    setPhysicsConfig((prev) => {
      const updated = { ...prev, gravityY: gy };
      engineRef.current?.setConfig(updated);
      return updated;
    });
  }, []);

  // Bounciness (restitution)
  const setBounciness = useCallback((restitution: number) => {
    setPhysicsConfig((prev) => {
      const updated = { ...prev, bounciness: restitution };
      engineRef.current?.setConfig(updated);
      return updated;
    });
  }, []);

  // Momentum Decay & Friction Presets
  const setFrictionPreset = useCallback((preset: FrictionPreset) => {
    setFrictionPresetState(preset);
    let decay = 0.04;
    let surfaceFric = 0.35;
    if (preset === 'low') {
      decay = 0.015; // Ice/long gliding momentum
      surfaceFric = 0.08;
    } else if (preset === 'medium') {
      decay = 0.04; // Natural fluid desk feel
      surfaceFric = 0.35;
    } else if (preset === 'high') {
      decay = 0.085; // Felt cushion stop
      surfaceFric = 0.55;
    } else if (preset === 'ultra') {
      decay = 0.15; // Heavy drag immediate brake
      surfaceFric = 0.75;
    }

    setPhysicsConfig((prev) => {
      const updated = {
        ...prev,
        momentumDecay: decay,
        surfaceFriction: surfaceFric,
      };
      engineRef.current?.setConfig(updated);
      return updated;
    });
  }, []);

  // Direct numeric momentum decay tuning
  const setMomentumDecay = useCallback((decay: number) => {
    setPhysicsConfig((prev) => {
      const updated = { ...prev, momentumDecay: decay };
      engineRef.current?.setConfig(updated);
      return updated;
    });
  }, []);

  // Floor Barrier Toggle
  const toggleFloorBarrier = useCallback(() => {
    setPhysicsConfig((prev) => {
      const updated = { ...prev, hasFloor: !prev.hasFloor };
      engineRef.current?.setConfig(updated);
      return updated;
    });
  }, []);

  // Spring Stiffness
  const setSpringStiffness = useCallback((stiffness: number) => {
    setPhysicsConfig((prev) => {
      const updated = { ...prev, springStiffness: stiffness };
      engineRef.current?.setConfig(updated);
      return updated;
    });
  }, []);

  // Magnet Mode Toggle
  const toggleMagnet = useCallback(() => {
    setPhysicsConfig((prev) => {
      const updated = { ...prev, isMagnetActive: !prev.isMagnetActive };
      engineRef.current?.setConfig(updated);
      return updated;
    });
  }, []);

  // Shake Board
  const shakeBoard = useCallback(() => {
    if (engineRef.current) {
      soundEngine.playPop();
      engineRef.current.shakeBoard(0.12);
    }
  }, []);

  // Settle All & Freeze
  const settleAndFreeze = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.settleAll();
      onElementsCommit();
    }
  }, [onElementsCommit]);

  // Handle Dragging with Physics Toss
  const handleStartPhysicsDrag = useCallback((id: string, canvasPos: { x: number; y: number }) => {
    if (engineRef.current && physicsConfig.enabled) {
      engineRef.current.onStartDrag(id, canvasPos);
    }
  }, [physicsConfig.enabled]);

  const handleMovePhysicsDrag = useCallback(
    (canvasPos: { x: number; y: number }, width: number, height: number) => {
      if (engineRef.current && physicsConfig.enabled) {
        engineRef.current.onDragMove(canvasPos, width, height);
      }
    },
    [physicsConfig.enabled]
  );

  const handleEndPhysicsDrag = useCallback(() => {
    if (engineRef.current && physicsConfig.enabled) {
      engineRef.current.onEndDrag();
      soundEngine.playSticky();
    }
  }, [physicsConfig.enabled]);

  const handleApplyAttraction = useCallback((targetPos: { x: number; y: number }) => {
    if (engineRef.current && physicsConfig.enabled && physicsConfig.isMagnetActive) {
      engineRef.current.applyAttraction(targetPos, 0.0008);
    }
  }, [physicsConfig.enabled, physicsConfig.isMagnetActive]);

  return {
    physicsConfig,
    isPhysicsActive: physicsConfig.enabled,
    gravityPreset,
    frictionPreset,
    togglePhysics,
    setGravityPreset,
    setFrictionPreset,
    setMomentumDecay,
    setBounciness,
    setSpringStiffness,
    toggleFloorBarrier,
    toggleMagnet,
    shakeBoard,
    settleAndFreeze,
    handleStartPhysicsDrag,
    handleMovePhysicsDrag,
    handleEndPhysicsDrag,
    handleApplyAttraction,
  };
}
