import Matter from 'matter-js';
import { CanvasElement, ShapeElement, StickyElement, ConnectorElement } from '../types.ts';
import { soundEngine } from './audio.ts';

const { Engine, World, Bodies, Body, Constraint, Composite, Vector, Events } = Matter;

export type FrictionPreset = 'low' | 'medium' | 'high' | 'ultra';

export interface PhysicsConfig {
  enabled: boolean;
  gravityY: number; // 0 for zero-G, 0.2 for gentle, 0.8 for earth, -0.6 for helium
  gravityX: number;
  bounciness: number; // 0 to 1 (restitution)
  momentumDecay: number; // air drag / linear damping
  surfaceFriction: number; // sliding contact friction
  springStiffness: number; // 0.01 to 0.2
  springDamping: number; // 0.01 to 0.2
  hasFloor: boolean; // Virtual desk floor barrier
  isMagnetActive: boolean;
}

export const DEFAULT_PHYSICS_CONFIG: PhysicsConfig = {
  enabled: false,
  gravityY: 0.8, // Natural Earth gravity
  gravityX: 0,
  bounciness: 0.35, // Natural paper & cardboard elasticity
  momentumDecay: 0.04, // Smooth fluid deceleration
  surfaceFriction: 0.35, // Natural desk friction
  springStiffness: 0.05,
  springDamping: 0.08,
  hasFloor: true,
  isMagnetActive: false,
};

export class WhiteboardPhysicsEngine {
  private engine: Matter.Engine;
  private bodyMap = new Map<string, Matter.Body>();
  private constraintMap = new Map<string, Matter.Constraint>();
  private config: PhysicsConfig = { ...DEFAULT_PHYSICS_CONFIG };

  // Virtual Floor & Desk boundaries
  private floorBody: Matter.Body | null = null;
  private leftWallBody: Matter.Body | null = null;
  private rightWallBody: Matter.Body | null = null;
  private ceilingBody: Matter.Body | null = null;

  // Elastic drag constraint for real physical contact while dragging
  private dragConstraint: Matter.Constraint | null = null;
  private activeDraggedId: string | null = null;
  private dragHistory: { x: number; y: number; time: number }[] = [];

  constructor() {
    this.engine = Engine.create({
      gravity: {
        x: 0,
        y: this.config.gravityY,
        scale: 0.001,
      },
      constraintIterations: 6,
      positionIterations: 10,
      velocityIterations: 8,
    });

    // Realistic acoustic tap on physical collisions
    Events.on(this.engine, 'collisionStart', (event) => {
      if (!this.config.enabled) return;
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;
        if (bodyA.isStatic && bodyB.isStatic) return;

        const relVelX = bodyA.velocity.x - bodyB.velocity.x;
        const relVelY = bodyA.velocity.y - bodyB.velocity.y;
        const relSpeed = Math.hypot(relVelX, relVelY);

        if (relSpeed > 1.8) {
          soundEngine.playImpact(Math.min(1.5, relSpeed / 5));
        }
      });
    });
  }

  public setConfig(newConfig: Partial<PhysicsConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.engine.gravity.y = this.config.gravityY;
    this.engine.gravity.x = this.config.gravityX;

    // Update material properties across all active physical bodies
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

    // Update boundaries
    this.updateDeskBoundaries();
  }

  public getConfig(): PhysicsConfig {
    return { ...this.config };
  }

  // Update virtual desk floor and side barriers based on current element layout
  private updateDeskBoundaries() {
    const world = this.engine.world;

    if (!this.config.hasFloor || !this.config.enabled) {
      if (this.floorBody) {
        Composite.remove(world, this.floorBody);
        this.floorBody = null;
      }
      if (this.leftWallBody) {
        Composite.remove(world, this.leftWallBody);
        this.leftWallBody = null;
      }
      if (this.rightWallBody) {
        Composite.remove(world, this.rightWallBody);
        this.rightWallBody = null;
      }
      if (this.ceilingBody) {
        Composite.remove(world, this.ceilingBody);
        this.ceilingBody = null;
      }
      return;
    }

    let minX = 0;
    let maxX = 2500;
    let minY = -500;
    let maxY = 1800;

    if (this.bodyMap.size > 0) {
      this.bodyMap.forEach((body) => {
        if (!body.isStatic) {
          minX = Math.min(minX, body.position.x - 600);
          maxX = Math.max(maxX, body.position.x + 600);
          minY = Math.min(minY, body.position.y - 600);
          maxY = Math.max(maxY, body.position.y + 600);
        }
      });
    }

    const deskWidth = Math.max(4000, (maxX - minX) * 1.5);
    const centerX = (minX + maxX) / 2;
    const floorY = maxY + 150;
    const ceilingY = minY - 300;

    // Create or position solid desk floor
    if (!this.floorBody) {
      this.floorBody = Bodies.rectangle(centerX, floorY, deskWidth, 200, {
        isStatic: true,
        friction: 0.45,
        restitution: Math.min(0.3, this.config.bounciness * 0.5),
        label: 'floor-barrier',
      });
      Composite.add(world, this.floorBody);
    } else {
      Body.setPosition(this.floorBody, { x: centerX, y: floorY });
    }

    // Ceiling barrier for helium gravity
    if (this.config.gravityY < -0.1) {
      if (!this.ceilingBody) {
        this.ceilingBody = Bodies.rectangle(centerX, ceilingY, deskWidth, 200, {
          isStatic: true,
          friction: 0.4,
          restitution: 0.2,
          label: 'ceiling-barrier',
        });
        Composite.add(world, this.ceilingBody);
      } else {
        Body.setPosition(this.ceilingBody, { x: centerX, y: ceilingY });
      }
    } else if (this.ceilingBody) {
      Composite.remove(world, this.ceilingBody);
      this.ceilingBody = null;
    }
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

    // Remove obsolete spring constraints
    this.constraintMap.forEach((constraint, id) => {
      if (!currentIds.has(id)) {
        Composite.remove(world, constraint);
        this.constraintMap.delete(id);
      }
    });

    // Create or update bodies with realistic mass and material density
    elements.forEach((el) => {
      // Freehand paths or stamps without rigid physics bounds are skipped
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
        // Material specs by element type
        let density = 0.002;
        let friction = this.config.surfaceFriction;
        let frictionAir = this.config.momentumDecay;
        let restitution = this.config.bounciness;

        if (el.type === 'sticky') {
          density = 0.0012; // Lightweight paper
          friction = 0.38;
          restitution = Math.min(0.25, this.config.bounciness);
        } else if (el.type === 'table' || el.type === 'frame') {
          density = 0.008; // Heavy structure
          friction = 0.55;
          restitution = 0.15;
        }

        // Create geometry based on shape kind
        if (el.type === 'shape' && (el as ShapeElement).shapeKind === 'circle') {
          const radius = Math.max(w, h) / 2;
          body = Bodies.circle(cx, cy, radius, {
            id: Number(el.id.replace(/\D/g, '').slice(-8)) || Math.floor(Math.random() * 1000000),
            restitution: Math.min(0.75, this.config.bounciness * 1.3),
            friction: 0.15,
            frictionAir: frictionAir * 0.75, // Circles roll smoothly
            density,
            isStatic,
            angle: rotRad,
          });
        } else if (el.type === 'shape' && (el as ShapeElement).shapeKind === 'triangle') {
          body = Bodies.polygon(cx, cy, 3, Math.max(w, h) / 2, {
            id: Number(el.id.replace(/\D/g, '').slice(-8)) || Math.floor(Math.random() * 1000000),
            restitution,
            friction,
            frictionAir,
            density,
            isStatic,
            angle: rotRad,
          });
        } else if (el.type === 'shape' && (el as ShapeElement).shapeKind === 'diamond') {
          body = Bodies.polygon(cx, cy, 4, Math.max(w, h) / 2, {
            id: Number(el.id.replace(/\D/g, '').slice(-8)) || Math.floor(Math.random() * 1000000),
            restitution,
            friction,
            frictionAir,
            density,
            isStatic,
            angle: rotRad + Math.PI / 4,
          });
        } else {
          // Sticky notes & rectangular shapes
          body = Bodies.rectangle(cx, cy, w, h, {
            id: Number(el.id.replace(/\D/g, '').slice(-8)) || Math.floor(Math.random() * 1000000),
            restitution,
            friction,
            frictionAir,
            chamfer: { radius: el.type === 'sticky' ? 6 : 4 },
            density,
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

    this.updateDeskBoundaries();
  }

  // Handle True Physics Drag Start (attaches physical mouse spring)
  public onStartDrag(elementId: string, canvasPos: { x: number; y: number }) {
    this.activeDraggedId = elementId;
    const body = this.bodyMap.get(elementId);
    this.dragHistory = [{ x: canvasPos.x, y: canvasPos.y, time: performance.now() }];

    if (body && !body.isStatic) {
      const localPoint = {
        x: canvasPos.x - body.position.x,
        y: canvasPos.y - body.position.y,
      };

      if (this.dragConstraint) {
        Composite.remove(this.engine.world, this.dragConstraint);
      }

      this.dragConstraint = Constraint.create({
        bodyA: body,
        pointA: localPoint,
        pointB: { x: canvasPos.x, y: canvasPos.y },
        stiffness: 0.16,
        damping: 0.08,
      });

      Composite.add(this.engine.world, this.dragConstraint);
    }
  }

  // Handle Drag Motion (updates physical mouse spring anchor and stores velocity buffer)
  public onDragMove(canvasPos: { x: number; y: number }, _elementWidth: number, _elementHeight: number) {
    if (!this.activeDraggedId) return;
    const now = performance.now();

    this.dragHistory.push({ x: canvasPos.x, y: canvasPos.y, time: now });
    if (this.dragHistory.length > 6) {
      this.dragHistory.shift();
    }

    if (this.dragConstraint) {
      this.dragConstraint.pointB = { x: canvasPos.x, y: canvasPos.y };
    }
  }

  // Handle Drag End with true momentum toss release
  public onEndDrag() {
    if (this.dragConstraint) {
      Composite.remove(this.engine.world, this.dragConstraint);
      this.dragConstraint = null;
    }

    if (!this.activeDraggedId) return;
    const body = this.bodyMap.get(this.activeDraggedId);

    if (body && !body.isStatic && this.dragHistory.length >= 2) {
      const firstSample = this.dragHistory[0];
      const lastSample = this.dragHistory[this.dragHistory.length - 1];
      const dt = Math.max(10, lastSample.time - firstSample.time);

      const vx = ((lastSample.x - firstSample.x) / dt) * 16;
      const vy = ((lastSample.y - firstSample.y) / dt) * 16;

      // Realistic fling launch with torque
      const flingScale = Math.max(0.6, Math.min(1.15, 0.9 + (0.04 - this.config.momentumDecay) * 2));
      const finalVx = Math.max(-30, Math.min(30, vx * flingScale));
      const finalVy = Math.max(-30, Math.min(30, vy * flingScale));

      Body.setVelocity(body, { x: finalVx, y: finalVy });
      Body.setAngularVelocity(body, (finalVx - finalVy) * 0.0035);
    }

    this.activeDraggedId = null;
    this.dragHistory = [];
  }

  // Magnetic attraction toward mouse
  public applyAttraction(target: { x: number; y: number }, strength: number = 0.0006) {
    this.bodyMap.forEach((body) => {
      if (body.isStatic || (body as any).canvasElementId === this.activeDraggedId) return;
      const forceVector = Vector.sub(target, body.position);
      const distance = Vector.magnitude(forceVector);
      if (distance > 20 && distance < 1200) {
        const normalized = Vector.normalise(forceVector);
        const forceMagnitude = Math.min(0.04, (strength * body.mass * 800) / (distance + 120));
        Body.applyForce(body, body.position, Vector.mult(normalized, forceMagnitude));
      }
    });
  }

  // Shake / Agitate all objects with explosive impulse
  public shakeBoard(intensity: number = 0.08) {
    this.bodyMap.forEach((body) => {
      if (body.isStatic) return;
      const angle = Math.random() * Math.PI * 2;
      const magnitude = (intensity * (0.6 + Math.random() * 0.4) * body.mass) / 14;
      const force = {
        x: Math.cos(angle) * magnitude,
        y: (Math.sin(angle) - 0.7) * magnitude * 1.6, // Natural upwards pop
      };
      Body.applyForce(body, body.position, force);
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.2);
    });
  }

  // Step physics and return updated element transform patches
  public update(deltaTimeMs: number = 16.66): Map<string, { x: number; y: number; rotation: number }> {
    Engine.update(this.engine, Math.min(32, deltaTimeMs));

    const results = new Map<string, { x: number; y: number; rotation: number }>();

    this.bodyMap.forEach((body, id) => {
      // Gentle settling on resting contact to eliminate jitter
      const speedSq = body.velocity.x * body.velocity.x + body.velocity.y * body.velocity.y;
      if (speedSq < 0.03 && Math.abs(body.angularVelocity) < 0.004) {
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
    if (this.dragConstraint) {
      Composite.remove(this.engine.world, this.dragConstraint);
      this.dragConstraint = null;
    }
    this.bodyMap.forEach((body) => {
      if (!body.isStatic) {
        Body.setVelocity(body, { x: 0, y: 0 });
        Body.setAngularVelocity(body, 0);
      }
    });
  }

  public clear() {
    if (this.dragConstraint) {
      Composite.remove(this.engine.world, this.dragConstraint);
      this.dragConstraint = null;
    }
    World.clear(this.engine.world, false);
    this.constraintMap.clear();
    this.bodyMap.clear();
    this.floorBody = null;
    this.ceilingBody = null;
    this.leftWallBody = null;
    this.rightWallBody = null;
  }
}
