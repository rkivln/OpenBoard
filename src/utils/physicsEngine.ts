import Matter from 'matter-js';
import { CanvasElement, ShapeElement, StickyElement, ConnectorElement } from '../types.ts';

const { Engine, World, Bodies, Body, Constraint, Composite, Vector } = Matter;

export type FrictionPreset = 'low' | 'medium' | 'high' | 'ultra';

export interface PhysicsConfig {
  enabled: boolean;
  gravityY: number; // 0 for zero-G, 0.8 for earth, -0.6 for helium
  gravityX: number;
  bounciness: number; // 0 to 1 (restitution)
  momentumDecay: number; // 0.005 to 0.15 (air resistance/kinetic friction decay)
  surfaceFriction: number; // 0.05 to 0.8 (collision surface friction)
  springStiffness: number; // 0.01 to 0.2
  springDamping: number; // 0.01 to 0.2
  isMagnetActive: boolean;
}

export const DEFAULT_PHYSICS_CONFIG: PhysicsConfig = {
  enabled: false,
  gravityY: 0.6,
  gravityX: 0,
  bounciness: 0.7,
  momentumDecay: 0.038, // Natural fluid deceleration
  surfaceFriction: 0.2,
  springStiffness: 0.04,
  springDamping: 0.08,
  isMagnetActive: false,
};

export class WhiteboardPhysicsEngine {
  private engine: Matter.Engine;
  private bodyMap = new Map<string, Matter.Body>();
  private constraintMap = new Map<string, Matter.Constraint>();
  private config: PhysicsConfig = { ...DEFAULT_PHYSICS_CONFIG };
  private activeDraggedId: string | null = null;
  private lastDragPos: { x: number; y: number } | null = null;
  private dragVelocity: { vx: number; vy: number } = { vx: 0, vy: 0 };
  private lastDragTime: number = 0;

  constructor() {
    this.engine = Engine.create({
      gravity: {
        x: 0,
        y: this.config.gravityY,
        scale: 0.001,
      },
      constraintIterations: 4,
      positionIterations: 6,
      velocityIterations: 4,
    });
  }

  public setConfig(newConfig: Partial<PhysicsConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.engine.gravity.y = this.config.gravityY;
    this.engine.gravity.x = this.config.gravityX;

    // Update restitution, air friction (momentum decay), and surface friction across active bodies
    this.bodyMap.forEach((body) => {
      if (!body.isStatic) {
        body.restitution = this.config.bounciness;
        body.frictionAir = this.config.momentumDecay;
        body.friction = this.config.surfaceFriction;
      }
    });

    // Update spring constraints
    this.constraintMap.forEach((constraint) => {
      constraint.stiffness = this.config.springStiffness;
      constraint.damping = this.config.springDamping;
    });
  }

  public getConfig(): PhysicsConfig {
    return { ...this.config };
  }

  // Sync elements into Matter.js world
  public syncElements(elements: CanvasElement[]) {
    const world = this.engine.world;
    const currentIds = new Set(elements.map((e) => e.id));

    // Remove bodies for deleted elements
    this.bodyMap.forEach((body, id) => {
      if (!currentIds.has(id)) {
        Composite.remove(world, body);
        this.bodyMap.delete(id);
      }
    });

    // Remove obsolete constraints
    this.constraintMap.forEach((constraint, id) => {
      if (!currentIds.has(id)) {
        Composite.remove(world, constraint);
        this.constraintMap.delete(id);
      }
    });

    // Create or update bodies
    elements.forEach((el) => {
      // Freehand paths or frames without bounds are skipped
      if (el.type === 'path' || el.type === 'comment' || el.type === 'stamp') {
        return;
      }

      const w = 'width' in el ? (el.width || 120) : 120;
      const h = 'height' in el ? (el.height || 60) : 60;
      const cx = el.x + w / 2;
      const cy = el.y + h / 2;
      const rotRad = ((el.rotation || 0) * Math.PI) / 180;
      const isStatic = !!el.locked;

      let body = this.bodyMap.get(el.id);

      if (!body) {
        // Create new body based on element type with configured momentum decay & friction
        if (el.type === 'shape' && (el as ShapeElement).shapeKind === 'circle') {
          const radius = Math.max(w, h) / 2;
          body = Bodies.circle(cx, cy, radius, {
            id: Number(el.id.replace(/\D/g, '').slice(-8)) || Math.floor(Math.random() * 1000000),
            restitution: this.config.bounciness,
            friction: this.config.surfaceFriction,
            frictionAir: this.config.momentumDecay,
            isStatic,
            angle: rotRad,
          });
        } else if (el.type === 'shape' && (el as ShapeElement).shapeKind === 'triangle') {
          body = Bodies.polygon(cx, cy, 3, Math.max(w, h) / 2, {
            id: Number(el.id.replace(/\D/g, '').slice(-8)) || Math.floor(Math.random() * 1000000),
            restitution: this.config.bounciness,
            friction: this.config.surfaceFriction,
            frictionAir: this.config.momentumDecay,
            isStatic,
            angle: rotRad,
          });
        } else if (el.type === 'shape' && (el as ShapeElement).shapeKind === 'diamond') {
          body = Bodies.polygon(cx, cy, 4, Math.max(w, h) / 2, {
            id: Number(el.id.replace(/\D/g, '').slice(-8)) || Math.floor(Math.random() * 1000000),
            restitution: this.config.bounciness,
            friction: this.config.surfaceFriction,
            frictionAir: this.config.momentumDecay,
            isStatic,
            angle: rotRad + Math.PI / 4,
          });
        } else {
          // Sticky, Table, Rect Shape, Card, Frame
          body = Bodies.rectangle(cx, cy, w, h, {
            id: Number(el.id.replace(/\D/g, '').slice(-8)) || Math.floor(Math.random() * 1000000),
            restitution: this.config.bounciness,
            friction: this.config.surfaceFriction,
            frictionAir: this.config.momentumDecay,
            chamfer: { radius: el.type === 'sticky' ? 6 : 4 },
            isStatic,
            angle: rotRad,
          });
        }

        (body as any).canvasElementId = el.id;
        (body as any).origWidth = w;
        (body as any).origHeight = h;

        this.bodyMap.set(el.id, body);
        Composite.add(world, body);
      } else {
        // Update static state
        if (body.isStatic !== isStatic) {
          Body.setStatic(body, isStatic);
        }
        (body as any).origWidth = w;
        (body as any).origHeight = h;
      }
    });

    // Create or update Spring Constraints for Connectors
    elements.forEach((el) => {
      if (el.type === 'connector') {
        const conn = el as ConnectorElement;
        if (conn.fromId && conn.toId && conn.fromId !== conn.toId) {
          const bodyA = this.bodyMap.get(conn.fromId);
          const bodyB = this.bodyMap.get(conn.toId);

          if (bodyA && bodyB) {
            let constraint = this.constraintMap.get(conn.id);
            if (!constraint) {
              const currentDist = Vector.magnitude(Vector.sub(bodyA.position, bodyB.position));
              constraint = Constraint.create({
                bodyA,
                bodyB,
                stiffness: this.config.springStiffness,
                damping: this.config.springDamping,
                length: Math.max(80, Math.min(currentDist, 350)),
              });
              this.constraintMap.set(conn.id, constraint);
              Composite.add(world, constraint);
            }
          }
        }
      }
    });
  }

  // Handle Drag Start
  public onStartDrag(elementId: string, canvasPos: { x: number; y: number }) {
    this.activeDraggedId = elementId;
    this.lastDragPos = { ...canvasPos };
    this.lastDragTime = performance.now();
    this.dragVelocity = { vx: 0, vy: 0 };

    const body = this.bodyMap.get(elementId);
    if (body && !body.isStatic) {
      Body.setVelocity(body, { x: 0, y: 0 });
      Body.setAngularVelocity(body, 0);
    }
  }

  // Handle Drag Motion (update position and record fling velocity)
  public onDragMove(canvasPos: { x: number; y: number }, elementWidth: number, elementHeight: number) {
    if (!this.activeDraggedId) return;

    const body = this.bodyMap.get(this.activeDraggedId);
    const now = performance.now();
    const dt = Math.max(1, now - this.lastDragTime);

    if (this.lastDragPos) {
      const dx = canvasPos.x - this.lastDragPos.x;
      const dy = canvasPos.y - this.lastDragPos.y;
      // Exponential moving average velocity
      this.dragVelocity = {
        vx: this.dragVelocity.vx * 0.35 + (dx / dt) * 16 * 0.65,
        vy: this.dragVelocity.vy * 0.35 + (dy / dt) * 16 * 0.65,
      };
    }

    this.lastDragPos = { ...canvasPos };
    this.lastDragTime = now;

    if (body) {
      const targetCenter = {
        x: canvasPos.x + elementWidth / 2,
        y: canvasPos.y + elementHeight / 2,
      };
      Body.setPosition(body, targetCenter);
      Body.setVelocity(body, {
        x: Math.max(-28, Math.min(28, this.dragVelocity.vx * 0.5)),
        y: Math.max(-28, Math.min(28, this.dragVelocity.vy * 0.5)),
      });
    }
  }

  // Handle Drag End with Momentum Toss Fling impulse
  public onEndDrag() {
    if (!this.activeDraggedId) return;
    const body = this.bodyMap.get(this.activeDraggedId);

    if (body && !body.isStatic) {
      // Apply momentum throw fling velocity adjusted for decay response
      const flingScale = Math.max(0.6, Math.min(1.1, 0.85 + (0.04 - this.config.momentumDecay) * 2));
      const flingX = Math.max(-32, Math.min(32, this.dragVelocity.vx * flingScale));
      const flingY = Math.max(-32, Math.min(32, this.dragVelocity.vy * flingScale));
      Body.setVelocity(body, { x: flingX, y: flingY });
      Body.setAngularVelocity(body, (flingX - flingY) * 0.0045);
    }

    this.activeDraggedId = null;
    this.lastDragPos = null;
  }

  // Apply Magnet attraction towards a point (e.g. mouse cursor)
  public applyAttraction(target: { x: number; y: number }, strength: number = 0.0006) {
    this.bodyMap.forEach((body) => {
      if (body.isStatic || (body as any).canvasElementId === this.activeDraggedId) return;
      const forceVector = Vector.sub(target, body.position);
      const distance = Vector.magnitude(forceVector);
      if (distance > 10 && distance < 1200) {
        const normalized = Vector.normalise(forceVector);
        const forceMagnitude = Math.min(0.05, (strength * body.mass * 800) / (distance + 100));
        Body.applyForce(body, body.position, Vector.mult(normalized, forceMagnitude));
      }
    });
  }

  // Shake / Agitate all objects with explosive impulse
  public shakeBoard(intensity: number = 0.08) {
    this.bodyMap.forEach((body) => {
      if (body.isStatic) return;
      const angle = Math.random() * Math.PI * 2;
      const magnitude = (intensity * (0.5 + Math.random() * 0.5) * body.mass) / 15;
      const force = {
        x: Math.cos(angle) * magnitude,
        y: (Math.sin(angle) - 0.5) * magnitude * 1.5, // Pop upwards
      };
      Body.applyForce(body, body.position, force);
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.25);
    });
  }

  // Step physics and return updated element transform patches
  public update(deltaTimeMs: number = 16.66): Map<string, { x: number; y: number; rotation: number }> {
    Engine.update(this.engine, Math.min(32, deltaTimeMs));

    const results = new Map<string, { x: number; y: number; rotation: number }>();

    this.bodyMap.forEach((body, id) => {
      if (id === this.activeDraggedId) return; // Currently dragged by user

      // Gentle low-speed settling to prevent micro-jitter
      const speedSq = body.velocity.x * body.velocity.x + body.velocity.y * body.velocity.y;
      if (speedSq < 0.02 && Math.abs(body.angularVelocity) < 0.003 && Math.abs(this.config.gravityY) < 0.05) {
        Body.setVelocity(body, { x: 0, y: 0 });
        Body.setAngularVelocity(body, 0);
      }

      const w = (body as any).origWidth || 120;
      const h = (body as any).origHeight || 60;
      const topLeftX = Math.round(body.position.x - w / 2);
      const topLeftY = Math.round(body.position.y - h / 2);
      const rotDeg = Math.round(((body.angle * 180) / Math.PI) * 10) / 10;

      results.set(id, {
        x: topLeftX,
        y: topLeftY,
        rotation: rotDeg,
      });
    });

    return results;
  }

  // Settle & Freeze: stop all velocities
  public settleAll() {
    this.bodyMap.forEach((body) => {
      if (!body.isStatic) {
        Body.setVelocity(body, { x: 0, y: 0 });
        Body.setAngularVelocity(body, 0);
      }
    });
  }

  public clear() {
    World.clear(this.engine.world, false);
    this.constraintMap.clear();
    this.bodyMap.clear();
  }
}
