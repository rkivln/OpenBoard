import React, { useRef, useState, useEffect } from 'react';
import {
  CanvasElement,
  ToolType,
  PenSubTool,
  ShapeKind,
  ConnectorKind,
  StampKind,
  WashiPattern,
  StickyColor,
  GridConfig,
  UserPresence,
} from '../../types.ts';
import { PatternDefs } from '../../utils/patterns.tsx';
import { CanvasElementView } from './CanvasElementView.tsx';
import confetti from 'canvas-confetti';
import { Copy, Trash2, X } from 'lucide-react';

interface DraggedElementSnapshot {
  id: string;
  type: string;
  origX: number;
  origY: number;
  origPoints?: [number, number][];
  origEndX?: number;
  origEndY?: number;
}

interface CanvasProps {
  elements: CanvasElement[];
  selectedElementIds: string[];
  currentTool: ToolType;
  penSubTool: PenSubTool;
  strokeWidth: number;
  strokeColor: string;
  washiPattern: WashiPattern;
  selectedShape: ShapeKind;
  selectedConnector: ConnectorKind;
  selectedStamp: StampKind;
  stampEmoji?: string;
  gridConfig: GridConfig;
  zoom: number;
  pan: { x: number; y: number };
  currentUser: UserPresence;
  remoteUsers: UserPresence[];

  onSelectElement: (id: string | null, isMulti?: boolean) => void;
  onSelectElements?: (ids: string[]) => void;
  onAddElement: (element: CanvasElement) => void;
  onUpdateElement: (id: string, updated: Partial<CanvasElement>) => void;
  onBatchUpdateElements?: (updates: { id: string; partial: Partial<CanvasElement> }[]) => void;
  onDeleteElement: (id: string) => void;
  onDeleteElements?: (ids: string[]) => void;
  onDuplicateElements?: (ids: string[]) => void;
  onPanChange: (pan: { x: number; y: number }) => void;
  onZoomChange: (zoom: number, originX?: number, originY?: number) => void;
  onCursorMove: (x: number, y: number) => void;
  onToolChange?: (tool: ToolType) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  elements,
  selectedElementIds,
  currentTool,
  penSubTool,
  strokeWidth,
  strokeColor,
  washiPattern,
  selectedShape,
  selectedConnector,
  selectedStamp,
  stampEmoji,
  gridConfig,
  zoom,
  pan,
  currentUser,
  remoteUsers,
  onSelectElement,
  onSelectElements,
  onAddElement,
  onUpdateElement,
  onBatchUpdateElements,
  onDeleteElement,
  onDeleteElements,
  onDuplicateElements,
  onPanChange,
  onZoomChange,
  onCursorMove,
  onToolChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Interaction State
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Marquee Box Selection State
  const [isSelectingBox, setIsSelectingBox] = useState(false);
  const [selectionBoxStart, setSelectionBoxStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectionBoxCurrent, setSelectionBoxCurrent] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialSelectedBeforeBox, setInitialSelectedBeforeBox] = useState<string[]>([]);

  // Multi-element Dragging State
  const [isDraggingElements, setIsDraggingElements] = useState(false);
  const [draggedSnapshots, setDraggedSnapshots] = useState<Map<string, DraggedElementSnapshot>>(new Map());

  // Drawing Freehand Path
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPathPoints, setCurrentPathPoints] = useState<[number, number][]>([]);

  // Shape / Connector creation preview
  const [isCreatingShape, setIsCreatingShape] = useState(false);
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [shapeCurrent, setShapeCurrent] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Convert Screen Coordinates -> Canvas World Coordinates
  const getCanvasCoords = (clientX: number, clientY: number): { x: number; y: number } => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    };
  };

  // Helper to get element bounds
  const getElementBounds = (el: CanvasElement): { x: number; y: number; width: number; height: number } => {
    if (el.type === 'path' || el.type === 'stroke') {
      const pts = (el as any).points || [];
      if (pts.length === 0) return { x: el.x, y: el.y, width: 20, height: 20 };
      let minPx = Infinity, maxPx = -Infinity, minPy = Infinity, maxPy = -Infinity;
      for (const p of pts) {
        const px = Array.isArray(p) ? p[0] : p.x;
        const py = Array.isArray(p) ? p[1] : p.y;
        if (px < minPx) minPx = px;
        if (px > maxPx) maxPx = px;
        if (py < minPy) minPy = py;
        if (py > maxPy) maxPy = py;
      }
      return {
        x: minPx,
        y: minPy,
        width: Math.max(maxPx - minPx, 10),
        height: Math.max(maxPy - minPy, 10),
      };
    }
    if (el.type === 'connector') {
      const pts = (el as any).points;
      if (pts && pts.length >= 2) {
        const x1 = pts[0][0], y1 = pts[0][1], x2 = pts[1][0], y2 = pts[1][1];
        return {
          x: Math.min(x1, x2),
          y: Math.min(y1, y2),
          width: Math.max(Math.abs(x2 - x1), 16),
          height: Math.max(Math.abs(y2 - y1), 16),
        };
      }
      const endX = (el as any).endX ?? (el.x + 100);
      const endY = (el as any).endY ?? (el.y + 100);
      return {
        x: Math.min(el.x, endX),
        y: Math.min(el.y, endY),
        width: Math.max(Math.abs(endX - el.x), 16),
        height: Math.max(Math.abs(endY - el.y), 16),
      };
    }
    const w = (el as any).width || (el.type === 'sticky' ? 180 : el.type === 'table' ? 340 : el.type === 'comment' ? 240 : el.type === 'stamp' ? 60 : 120);
    const h = (el as any).height || (el.type === 'sticky' ? 180 : el.type === 'table' ? 180 : el.type === 'comment' ? 180 : el.type === 'stamp' ? 60 : 80);
    return { x: el.x, y: el.y, width: w, height: h };
  };

  // Keyboard shortcuts (Space for pan, Backspace/Delete to remove, Ctrl+D to duplicate, Ctrl+A to select all, Esc to deselect)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable;

      if (e.code === 'Space' && !isSpacePressed && !isInput) {
        setIsSpacePressed(true);
      }

      if (!isInput) {
        // Delete or Backspace
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementIds.length > 0) {
          e.preventDefault();
          if (onDeleteElements) {
            onDeleteElements(selectedElementIds);
          } else {
            selectedElementIds.forEach((id) => onDeleteElement(id));
          }
          onSelectElement(null);
        }

        // Duplicate (Ctrl/Cmd + D)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D') && selectedElementIds.length > 0) {
          e.preventDefault();
          onDuplicateElements?.(selectedElementIds);
        }

        // Select All (Ctrl/Cmd + A)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
          e.preventDefault();
          const allIds = elements.map((el) => el.id);
          if (onSelectElements) {
            onSelectElements(allIds);
          }
        }

        // Escape (Deselect)
        if (e.key === 'Escape') {
          onSelectElement(null);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed, selectedElementIds, elements, onDeleteElements, onDeleteElement, onDuplicateElements, onSelectElements, onSelectElement]);

  // Handle Mouse Wheel Zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.2), 3);
      onZoomChange(newZoom, e.clientX, e.clientY);
    } else {
      // Pan with trackpad
      onPanChange({
        x: pan.x - e.deltaX,
        y: pan.y - e.deltaY,
      });
    }
  };

  // Mouse Down on Canvas Background
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || isSpacePressed || currentTool === 'hand') {
      // Middle click or hand tool -> Pan
      setIsPanning(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (e.button !== 0) return; // Only primary left click

    const canvasPos = getCanvasCoords(e.clientX, e.clientY);

    // SELECT TOOL: Initiate Marquee Box Selection on background
    if (currentTool === 'select') {
      setIsSelectingBox(true);
      setSelectionBoxStart(canvasPos);
      setSelectionBoxCurrent(canvasPos);
      if (e.shiftKey) {
        setInitialSelectedBeforeBox(selectedElementIds);
      } else {
        setInitialSelectedBeforeBox([]);
        onSelectElement(null);
      }
      return;
    }

    // PEN TOOL: Start drawing freehand stroke
    if (currentTool === 'pen') {
      setIsDrawing(true);
      setCurrentPathPoints([[canvasPos.x, canvasPos.y]]);
      return;
    }

    // SHAPE TOOL: Start dragging shape preview
    if (currentTool === 'shape') {
      setIsCreatingShape(true);
      setShapeStart(canvasPos);
      setShapeCurrent(canvasPos);
      return;
    }

    // CONNECTOR TOOL: Start dragging connector
    if (currentTool === 'connector') {
      setIsCreatingShape(true);
      setShapeStart(canvasPos);
      setShapeCurrent(canvasPos);
      return;
    }

    // STICKY NOTE: Place a single sticky note and switch back to select mode
    if (currentTool === 'sticky') {
      const colors: StickyColor[] = ['yellow', 'blue', 'green', 'pink', 'purple'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const newSticky: CanvasElement = {
        id: `sticky-${Date.now()}`,
        type: 'sticky',
        x: canvasPos.x - 90,
        y: canvasPos.y - 90,
        width: 180,
        height: 180,
        color: randomColor,
        text: '',
        rotation: (Math.random() - 0.5) * 4,
        zIndex: elements.length + 1,
      };
      onAddElement(newSticky);
      onSelectElement(newSticky.id);
      onToolChange?.('select');
      return;
    }

    // TABLE TOOL: Place a single clean editable table and switch back to select mode
    if (currentTool === 'table') {
      const newTable: CanvasElement = {
        id: `table-${Date.now()}`,
        type: 'table',
        x: canvasPos.x - 190,
        y: canvasPos.y - 90,
        width: 380,
        height: 180,
        tableData: {
          headers: ['Column 1', 'Column 2', 'Column 3'],
          rows: [
            ['', '', ''],
            ['', '', ''],
          ],
        },
        borderColor: '#e2e8f0',
        headerBgColor: '#f8fafc',
        zIndex: elements.length + 1,
      };
      onAddElement(newTable);
      onSelectElement(newTable.id);
      onToolChange?.('select');
      return;
    }

    // TEXT TOOL: Quick drop text box and switch back to select mode
    if (currentTool === 'text') {
      const newText: CanvasElement = {
        id: `text-${Date.now()}`,
        type: 'text',
        x: canvasPos.x,
        y: canvasPos.y,
        width: 200,
        height: 40,
        text: '',
        fontSize: 18,
        color: strokeColor || '#0f172a',
        zIndex: elements.length + 1,
      };
      onAddElement(newText);
      onSelectElement(newText.id);
      onToolChange?.('select');
      return;
    }

    // STAMP TOOL: Drop cheerful stamp with confetti!
    if (currentTool === 'stamp') {
      const newStamp: CanvasElement = {
        id: `stamp-${Date.now()}`,
        type: 'stamp',
        x: canvasPos.x - 30,
        y: canvasPos.y - 30,
        width: 60,
        height: 60,
        stampKind: selectedStamp,
        emoji: stampEmoji,
        zIndex: elements.length + 1,
      };
      onAddElement(newStamp);
      confetti({
        particleCount: 15,
        spread: 30,
        origin: {
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight,
        },
      });
      return;
    }

    // COMMENT TOOL: Drop comment pin and switch back to select mode
    if (currentTool === 'comment') {
      const newComment: CanvasElement = {
        id: `comment-${Date.now()}`,
        type: 'comment',
        x: canvasPos.x,
        y: canvasPos.y,
        width: 240,
        height: 140,
        author: currentUser.name,
        text: '',
        replies: [],
        zIndex: elements.length + 1,
      };
      onAddElement(newComment);
      onSelectElement(newComment.id);
      onToolChange?.('select');
      return;
    }
  };

  // Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    const canvasPos = getCanvasCoords(e.clientX, e.clientY);
    onCursorMove(canvasPos.x, canvasPos.y);

    // Pan motion
    if (isPanning) {
      onPanChange({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    // Marquee Box Selection drag
    if (isSelectingBox) {
      setSelectionBoxCurrent(canvasPos);
      const minX = Math.min(selectionBoxStart.x, canvasPos.x);
      const maxX = Math.max(selectionBoxStart.x, canvasPos.x);
      const minY = Math.min(selectionBoxStart.y, canvasPos.y);
      const maxY = Math.max(selectionBoxStart.y, canvasPos.y);
      const width = maxX - minX;
      const height = maxY - minY;

      if (width > 3 || height > 3) {
        const newlySelectedIds: string[] = [];
        elements.forEach((el) => {
          const b = getElementBounds(el);
          const intersects = !(
            b.x > maxX ||
            b.x + b.width < minX ||
            b.y > maxY ||
            b.y + b.height < minY
          );
          if (intersects) {
            newlySelectedIds.push(el.id);
          }
        });

        const combined = Array.from(new Set([...initialSelectedBeforeBox, ...newlySelectedIds]));
        if (onSelectElements) {
          onSelectElements(combined);
        }
      }
      return;
    }

    // Multi-element Dragging motion
    if (isDraggingElements && draggedSnapshots.size > 0) {
      const dx = canvasPos.x - dragStart.x;
      const dy = canvasPos.y - dragStart.y;

      draggedSnapshots.forEach((snap) => {
        if (snap.origPoints) {
          const updatedPoints = snap.origPoints.map(
            (p) => [Math.round(p[0] + dx), Math.round(p[1] + dy)] as [number, number]
          );
          onUpdateElement(snap.id, {
            x: Math.round(snap.origX + dx),
            y: Math.round(snap.origY + dy),
            points: updatedPoints,
          } as any);
        } else if (snap.origEndX !== undefined && snap.origEndY !== undefined) {
          onUpdateElement(snap.id, {
            x: Math.round(snap.origX + dx),
            y: Math.round(snap.origY + dy),
            endX: Math.round(snap.origEndX + dx),
            endY: Math.round(snap.origEndY + dy),
          } as any);
        } else {
          onUpdateElement(snap.id, {
            x: Math.round(snap.origX + dx),
            y: Math.round(snap.origY + dy),
          });
        }
      });
      return;
    }

    // Drawing motion
    if (isDrawing) {
      setCurrentPathPoints((prev) => [...prev, [canvasPos.x, canvasPos.y]]);
      return;
    }

    // Shape sizing motion
    if (isCreatingShape) {
      setShapeCurrent(canvasPos);
      return;
    }
  };

  // Mouse Up
  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }

    // Finish Box Selection
    if (isSelectingBox) {
      setIsSelectingBox(false);
      const width = Math.abs(selectionBoxCurrent.x - selectionBoxStart.x);
      const height = Math.abs(selectionBoxCurrent.y - selectionBoxStart.y);
      // If was just a stationary click with no drag, deselect
      if (width <= 4 && height <= 4 && !initialSelectedBeforeBox.length) {
        onSelectElement(null);
      }
    }

    // Finish Multi-element Dragging
    if (isDraggingElements) {
      setIsDraggingElements(false);
      setDraggedSnapshots(new Map());
    }

    // Finish freehand drawing
    if (isDrawing) {
      setIsDrawing(false);
      if (currentPathPoints.length > 1) {
        if (penSubTool === 'eraser') {
          // Erase nearby elements
          const lastPt = currentPathPoints[currentPathPoints.length - 1];
          const hit = elements.find((el) => {
            const dist = Math.hypot(el.x - lastPt[0], el.y - lastPt[1]);
            return dist < 40;
          });
          if (hit) {
            onDeleteElement(hit.id);
          }
        } else {
          const newPath: CanvasElement = {
            id: `path-${Date.now()}`,
            type: 'path',
            x: currentPathPoints[0][0],
            y: currentPathPoints[0][1],
            points: currentPathPoints,
            strokeColor: strokeColor,
            strokeWidth: strokeWidth,
            penSubTool: penSubTool,
            washiPattern: washiPattern,
            zIndex: elements.length + 1,
          };
          onAddElement(newPath);
        }
      }
      setCurrentPathPoints([]);
    }

    // Finish shape / connector creation
    if (isCreatingShape) {
      setIsCreatingShape(false);
      const minX = Math.min(shapeStart.x, shapeCurrent.x);
      const minY = Math.min(shapeStart.y, shapeCurrent.y);
      const width = Math.max(Math.abs(shapeCurrent.x - shapeStart.x), 50);
      const height = Math.max(Math.abs(shapeCurrent.y - shapeStart.y), 50);

      if (currentTool === 'shape') {
        const newShape: CanvasElement = {
          id: `shape-${Date.now()}`,
          type: 'shape',
          shapeKind: selectedShape,
          x: minX,
          y: minY,
          width,
          height,
          strokeColor: strokeColor || '#334155',
          fillColor: '#ffffff',
          strokeWidth: 2,
          text: '',
          zIndex: elements.length + 1,
        };
        onAddElement(newShape);
        onSelectElement(newShape.id);
        onToolChange?.('select');
      } else if (currentTool === 'connector') {
        const newConn: CanvasElement = {
          id: `conn-${Date.now()}`,
          type: 'connector',
          connectorKind: selectedConnector,
          x: minX,
          y: minY,
          width,
          height,
          points: [
            [shapeStart.x, shapeStart.y],
            [shapeCurrent.x, shapeCurrent.y],
          ],
          strokeColor: strokeColor || '#8B5CF6',
          strokeWidth: 2.5,
          zIndex: elements.length + 1,
        };
        onAddElement(newConn);
        onSelectElement(newConn.id);
        onToolChange?.('select');
      }
    }
  };

  // Element Selection & Drag Start (supports multi-selection drag)
  const handleElementSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (currentTool !== 'select') return;

    let nextSelected = [...selectedElementIds];
    if (e.shiftKey) {
      if (nextSelected.includes(id)) {
        nextSelected = nextSelected.filter((i) => i !== id);
      } else {
        nextSelected.push(id);
      }
    } else {
      if (!nextSelected.includes(id)) {
        nextSelected = [id];
      }
    }

    if (onSelectElements) {
      onSelectElements(nextSelected);
    } else {
      onSelectElement(id, e.shiftKey);
    }

    // Initialize multi-element drag
    const canvasPos = getCanvasCoords(e.clientX, e.clientY);
    setDragStart(canvasPos);
    setIsDraggingElements(true);

    const snapshots = new Map<string, DraggedElementSnapshot>();
    nextSelected.forEach((selId) => {
      const el = elements.find((item) => item.id === selId);
      if (el) {
        snapshots.set(selId, {
          id: el.id,
          type: el.type,
          origX: el.x,
          origY: el.y,
          origPoints: (el as any).points ? JSON.parse(JSON.stringify((el as any).points)) : undefined,
          origEndX: (el as any).endX,
          origEndY: (el as any).endY,
        });
      }
    });
    setDraggedSnapshots(snapshots);
  };

  // Calculate Group Bounding Box for multi-selected elements
  const selectedElements = elements.filter((el) => selectedElementIds.includes(el.id));
  let selectionUnionBox: { x: number; y: number; width: number; height: number } | null = null;
  if (selectedElements.length > 1) {
    let uMinX = Infinity, uMinY = Infinity, uMaxX = -Infinity, uMaxY = -Infinity;
    selectedElements.forEach((el) => {
      const b = getElementBounds(el);
      uMinX = Math.min(uMinX, b.x);
      uMinY = Math.min(uMinY, b.y);
      uMaxX = Math.max(uMaxX, b.x + b.width);
      uMaxY = Math.max(uMaxY, b.y + b.height);
    });
    selectionUnionBox = {
      x: uMinX - 8,
      y: uMinY - 8,
      width: uMaxX - uMinX + 16,
      height: uMaxY - uMinY + 16,
    };
  }

  // Marquee Box Dimensions
  const marqueeBoxX = Math.min(selectionBoxStart.x, selectionBoxCurrent.x);
  const marqueeBoxY = Math.min(selectionBoxStart.y, selectionBoxCurrent.y);
  const marqueeBoxW = Math.abs(selectionBoxCurrent.x - selectionBoxStart.x);
  const marqueeBoxH = Math.abs(selectionBoxCurrent.y - selectionBoxStart.y);

  return (
    <div
      ref={containerRef}
      id="openboard-infinite-canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className={`absolute inset-0 w-full h-full overflow-hidden select-none ${
        currentTool === 'hand' || isSpacePressed
          ? 'cursor-grab active:cursor-grabbing'
          : currentTool === 'pen'
          ? 'cursor-crosshair'
          : currentTool === 'select'
          ? isSelectingBox
            ? 'cursor-crosshair'
            : 'cursor-default'
          : 'cursor-crosshair'
      }`}
      style={{
        backgroundColor: '#f8fafc',
      }}
    >
      {/* SVG Canvas Workspace */}
      <svg
        className="w-full h-full pointer-events-none"
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <defs>
          {/* Include Washi Tape SVG Patterns */}
          <PatternDefs />

          {/* Dotted Grid Pattern */}
          <pattern
            id="canvas-grid-dots"
            x={pan.x % (gridConfig.size * zoom)}
            y={pan.y % (gridConfig.size * zoom)}
            width={gridConfig.size * zoom}
            height={gridConfig.size * zoom}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={(gridConfig.size * zoom) / 2}
              cy={(gridConfig.size * zoom) / 2}
              r={1.2 * Math.min(zoom, 1.5)}
              fill="#cbd5e1"
              opacity={gridConfig.opacity}
            />
          </pattern>

          {/* Lines Grid Pattern */}
          <pattern
            id="canvas-grid-lines"
            x={pan.x % (gridConfig.size * zoom)}
            y={pan.y % (gridConfig.size * zoom)}
            width={gridConfig.size * zoom}
            height={gridConfig.size * zoom}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridConfig.size * zoom} 0 L 0 0 0 ${gridConfig.size * zoom}`}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
              opacity={gridConfig.opacity}
            />
          </pattern>
        </defs>

        {/* Dynamic Infinite Grid Background */}
        {gridConfig.type !== 'blank' && (
          <rect
            width="100%"
            height="100%"
            fill={`url(#canvas-grid-${gridConfig.type})`}
            className="pointer-events-none"
          />
        )}

        {/* Transformed Canvas Container (Pan + Zoom) */}
        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          className="pointer-events-auto"
        >
          {/* Render All Board Elements */}
          {elements.map((el) => (
            <CanvasElementView
              key={el.id}
              element={el}
              isSelected={selectedElementIds.includes(el.id)}
              onSelect={handleElementSelect}
              onUpdate={(updated) => onUpdateElement(el.id, updated)}
              onDelete={onDeleteElement}
              zoom={zoom}
              currentTool={currentTool}
            />
          ))}

          {/* Group Multi-Selection Bounding Box Outline */}
          {selectionUnionBox && (
            <g className="pointer-events-none">
              <rect
                x={selectionUnionBox.x}
                y={selectionUnionBox.y}
                width={selectionUnionBox.width}
                height={selectionUnionBox.height}
                fill="none"
                stroke="#8B5CF6"
                strokeWidth={1.5 / zoom}
                strokeDasharray={`${6 / zoom} ${4 / zoom}`}
                rx={6 / zoom}
              />
              {/* Corner Handles */}
              <rect
                x={selectionUnionBox.x - 4 / zoom}
                y={selectionUnionBox.y - 4 / zoom}
                width={8 / zoom}
                height={8 / zoom}
                fill="#ffffff"
                stroke="#8B5CF6"
                strokeWidth={1.5 / zoom}
              />
              <rect
                x={selectionUnionBox.x + selectionUnionBox.width - 4 / zoom}
                y={selectionUnionBox.y - 4 / zoom}
                width={8 / zoom}
                height={8 / zoom}
                fill="#ffffff"
                stroke="#8B5CF6"
                strokeWidth={1.5 / zoom}
              />
              <rect
                x={selectionUnionBox.x - 4 / zoom}
                y={selectionUnionBox.y + selectionUnionBox.height - 4 / zoom}
                width={8 / zoom}
                height={8 / zoom}
                fill="#ffffff"
                stroke="#8B5CF6"
                strokeWidth={1.5 / zoom}
              />
              <rect
                x={selectionUnionBox.x + selectionUnionBox.width - 4 / zoom}
                y={selectionUnionBox.y + selectionUnionBox.height - 4 / zoom}
                width={8 / zoom}
                height={8 / zoom}
                fill="#ffffff"
                stroke="#8B5CF6"
                strokeWidth={1.5 / zoom}
              />
            </g>
          )}

          {/* Floating Context Action Bar for Multi-Selection */}
          {selectionUnionBox && (
            <foreignObject
              x={selectionUnionBox.x}
              y={selectionUnionBox.y - 42 / zoom}
              width={Math.max(selectionUnionBox.width, 240 / zoom)}
              height={36 / zoom}
              className="overflow-visible pointer-events-auto"
            >
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-purple-200/90 text-xs text-slate-800 select-none w-max"
                style={{
                  transform: `scale(${1 / zoom})`,
                  transformOrigin: 'top left',
                }}
              >
                <span className="font-semibold text-purple-700 bg-purple-100/90 px-2 py-0.5 rounded-md text-[11px]">
                  {selectedElementIds.length} items
                </span>
                <button
                  onClick={() => onDuplicateElements?.(selectedElementIds)}
                  className="px-2 py-1 hover:bg-purple-50 text-slate-700 hover:text-purple-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-medium"
                  title="Duplicate selected (Ctrl+D)"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    if (onDeleteElements) {
                      onDeleteElements(selectedElementIds);
                    } else {
                      selectedElementIds.forEach((id) => onDeleteElement(id));
                    }
                    onSelectElement(null);
                  }}
                  className="px-2 py-1 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-medium"
                  title="Delete selected (Backspace)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
                <button
                  onClick={() => onSelectElement(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
                  title="Deselect (Esc)"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </foreignObject>
          )}

          {/* Interactive Marquee Drag Box with Cursor */}
          {isSelectingBox && (marqueeBoxW > 3 || marqueeBoxH > 3) && (
            <g className="pointer-events-none">
              <rect
                x={marqueeBoxX}
                y={marqueeBoxY}
                width={marqueeBoxW}
                height={marqueeBoxH}
                fill="rgba(139, 92, 246, 0.12)"
                stroke="#8B5CF6"
                strokeWidth={1.5 / zoom}
                strokeDasharray={`${5 / zoom} ${3 / zoom}`}
                rx={4 / zoom}
              />
            </g>
          )}

          {/* Live Drawing Preview Stroke */}
          {isDrawing && currentPathPoints.length > 1 && (
            <path
              d={(() => {
                let d = `M ${currentPathPoints[0][0]} ${currentPathPoints[0][1]}`;
                for (let i = 1; i < currentPathPoints.length; i++) {
                  d += ` L ${currentPathPoints[i][0]} ${currentPathPoints[i][1]}`;
                }
                return d;
              })()}
              fill="none"
              stroke={
                penSubTool === 'washi-tape'
                  ? `url(#pattern-${washiPattern})`
                  : strokeColor
              }
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={penSubTool === 'highlighter' ? 0.45 : 1}
            />
          )}

          {/* Live Shape Creation Drag Preview */}
          {isCreatingShape && currentTool === 'shape' && (
            <rect
              x={Math.min(shapeStart.x, shapeCurrent.x)}
              y={Math.min(shapeStart.y, shapeCurrent.y)}
              width={Math.abs(shapeCurrent.x - shapeStart.x)}
              height={Math.abs(shapeCurrent.y - shapeStart.y)}
              fill="rgba(139, 92, 246, 0.08)"
              stroke="#8B5CF6"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          )}

          {/* Live Connector Creation Drag Preview */}
          {isCreatingShape && currentTool === 'connector' && (
            <line
              x1={shapeStart.x}
              y1={shapeStart.y}
              x2={shapeCurrent.x}
              y2={shapeCurrent.y}
              stroke="#8B5CF6"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          )}

          {/* Remote Real-time Collaborator Cursors */}
          {remoteUsers.map((user) => {
            if (!user.cursor) return null;
            return (
              <g
                key={user.id}
                transform={`translate(${user.cursor.x}, ${user.cursor.y})`}
                className="pointer-events-none transition-transform duration-75"
              >
                {/* Cursor Pointer */}
                <svg
                  viewBox="0 0 16 16"
                  fill={user.color}
                  className="w-5 h-5 drop-shadow-md transform -rotate-12"
                >
                  <path d="M 0 0 L 14 6 L 8 8 L 6 14 Z" />
                </svg>

                {/* User Name Badge Pill */}
                <foreignObject x={12} y={12} width={120} height={30}>
                  <div
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-[10px] font-bold shadow-md truncate"
                    style={{ backgroundColor: user.color }}
                  >
                    <span>{user.avatar}</span>
                    <span className="truncate">{user.name}</span>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
