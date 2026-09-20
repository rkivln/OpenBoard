import React, { useState, useRef, useEffect } from 'react';
import {
  CanvasElement,
  ToolType,
  ShapeKind,
  ShapeElement,
  ConnectorKind,
  ConnectorElement,
  TableElement,
  CommentElement,
  CommentReply,
  StickyColor,
} from '../../types.ts';
import {
  MessageSquare,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Star,
  Plus,
  Check,
  Trash2,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
} from 'lucide-react';
import { EditableTableView } from './EditableTableView.tsx';
import { ShapeContextBar } from './ShapeContextBar.tsx';
import type { ResizeHandleDirection } from '../../utils/snapping';

interface CanvasElementViewProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent, id: string) => void;
  onUpdate: (updated: Partial<CanvasElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (id: string) => void;
  zoom: number;
  currentTool: ToolType;
  allElements?: CanvasElement[];
  onQuickConnect?: (sourceId: string, direction: 'top' | 'right' | 'bottom' | 'left') => void;
  onStartConnectionDrag?: (sourceId: string, direction: 'top' | 'right' | 'bottom' | 'left', startClientX: number, startClientY: number) => void;
  onStartResize?: (e: React.MouseEvent, id: string, handle: ResizeHandleDirection) => void;
  autoEditingId?: string | null;
}

export const CanvasElementView: React.FC<CanvasElementViewProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  zoom,
  currentTool,
  allElements,
  onQuickConnect,
  onStartConnectionDrag,
  onStartResize,
  autoEditingId,
}) => {
  const elementText = 'text' in element ? ((element as any).text || '') : '';
  const [isEditingText, setIsEditingText] = useState(false);
  const [editText, setEditText] = useState(elementText);
  const [isReplyingComment, setIsReplyingComment] = useState(false);
  const [replyInput, setReplyInput] = useState('');
  const [activeDirection, setActiveDirection] = useState<'right' | 'bottom' | 'left' | 'top'>('right');
  const [hoveredGhostDirection, setHoveredGhostDirection] = useState<'right' | 'bottom' | 'left' | 'top' | null>(null);
  const textInputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  // Sync external text updates only when not actively editing
  useEffect(() => {
    if (!isEditingText) {
      setEditText(elementText);
    }
  }, [elementText, isEditingText]);

  // Focus and select text when auto-editing is triggered for this element
  useEffect(() => {
    if (autoEditingId === element.id && !isEditingText) {
      setIsEditingText(true);
      const timer = setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
          if ('select' in textInputRef.current) {
            (textInputRef.current as HTMLTextAreaElement).select();
          }
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [autoEditingId, element.id, isEditingText]);

  // Ensure focus when isEditingText transitions to true
  useEffect(() => {
    if (isEditingText && textInputRef.current && document.activeElement !== textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [isEditingText]);

  const handleFinishText = () => {
    setIsEditingText(false);
    onUpdate({ text: editText } as any);
  };

  // Convert points array into SVG path string
  const renderPathData = (points: any[]) => {
    if (!points || points.length === 0) return '';
    const getPt = (p: any): [number, number] =>
      Array.isArray(p) ? [p[0], p[1]] : [p.x, p.y];
    const first = getPt(points[0]);
    if (points.length === 1) {
      return `M ${first[0]} ${first[1]} L ${first[0] + 0.1} ${first[1] + 0.1}`;
    }
    let d = `M ${first[0]} ${first[1]}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = getPt(points[i - 1]);
      const p1 = getPt(points[i]);
      const midX = (p0[0] + p1[0]) / 2;
      const midY = (p0[1] + p1[1]) / 2;
      d += ` Q ${p0[0]} ${p0[1]}, ${midX} ${midY}`;
    }
    const last = getPt(points[points.length - 1]);
    d += ` T ${last[0]} ${last[1]}`;
    return d;
  };

  // 1. FREEHAND STROKES (Pencil, Highlighter, Washi Tape)
  if (element.type === 'path' || element.type === 'stroke') {
    const strokeElem = element as any;
    const isWashi = strokeElem.penSubTool === 'washi-tape' || strokeElem.toolType === 'washi-tape';
    const isHighlighter = strokeElem.penSubTool === 'highlighter' || strokeElem.toolType === 'highlighter';

    return (
      <g
        id={`elem-${element.id}`}
        onMouseDown={(e) => {
          e.stopPropagation();
          onSelect(e, element.id);
        }}
        className="cursor-pointer"
      >
        <path
          d={renderPathData(strokeElem.points || [])}
          fill="none"
          stroke={
            isWashi
              ? `url(#pattern-${strokeElem.washiPattern || strokeElem.pattern || 'purple-grid'})`
              : (strokeElem.strokeColor || strokeElem.color || '#1e293b')
          }
          strokeWidth={strokeElem.strokeWidth || 3}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={isHighlighter ? 0.45 : 1}
          style={
            isSelected
              ? { filter: 'drop-shadow(0 0 3px rgba(139, 92, 246, 0.6))' }
              : undefined
          }
        />
        {/* Invisible wider stroke for easier click detection */}
        <path
          d={renderPathData(strokeElem.points || [])}
          fill="none"
          stroke="transparent"
          strokeWidth={Math.max((strokeElem.strokeWidth || 3) + 12, 16)}
          strokeLinecap="round"
        />
      </g>
    );
  }

  // 2. CONNECTORS & ARROWS (Intelligently bound to shapes or points)
  if (element.type === 'connector') {
    const connElem = element as ConnectorElement;
    let p1: [number, number] = connElem.points?.[0] || [connElem.x, connElem.y];
    let p2: [number, number] = connElem.points?.[1] || [
      connElem.endX ?? (connElem.x + (connElem.width ?? 100)),
      connElem.endY ?? (connElem.y + (connElem.height ?? 100)),
    ];

    // Dynamic point calculation if connected to shapes
    if (allElements && connElem.fromId) {
      const fromEl = allElements.find((e) => e.id === connElem.fromId);
      if (fromEl) {
        const side = connElem.fromSide || 'right';
        const fw = 'width' in fromEl ? (fromEl.width || 120) : 120;
        const fh = 'height' in fromEl ? (fromEl.height || 100) : 100;
        if (side === 'right') p1 = [fromEl.x + fw, fromEl.y + fh / 2];
        else if (side === 'bottom') p1 = [fromEl.x + fw / 2, fromEl.y + fh];
        else if (side === 'left') p1 = [fromEl.x, fromEl.y + fh / 2];
        else p1 = [fromEl.x + fw / 2, fromEl.y];
      }
    }

    if (allElements && connElem.toId) {
      const toEl = allElements.find((e) => e.id === connElem.toId);
      if (toEl) {
        const side = connElem.toSide || 'left';
        const tw = 'width' in toEl ? (toEl.width || 120) : 120;
        const th = 'height' in toEl ? (toEl.height || 100) : 100;
        if (side === 'left') p2 = [toEl.x, toEl.y + th / 2];
        else if (side === 'top') p2 = [toEl.x + tw / 2, toEl.y];
        else if (side === 'right') p2 = [toEl.x + tw, toEl.y + th / 2];
        else p2 = [toEl.x + tw / 2, toEl.y + th];
      }
    }

    let pathD = `M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]}`;
    let angle = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);

    if (element.connectorKind === 'elbow') {
      const isHorizontal = !connElem.fromSide || connElem.fromSide === 'right' || connElem.fromSide === 'left';
      if (isHorizontal) {
        const midX = (p1[0] + p2[0]) / 2;
        pathD = `M ${p1[0]} ${p1[1]} L ${midX} ${p1[1]} L ${midX} ${p2[1]} L ${p2[0]} ${p2[1]}`;
        angle = p2[0] >= midX ? 0 : Math.PI;
      } else {
        const midY = (p1[1] + p2[1]) / 2;
        pathD = `M ${p1[0]} ${p1[1]} L ${p1[0]} ${midY} L ${p2[0]} ${midY} L ${p2[0]} ${p2[1]}`;
        angle = p2[1] >= midY ? Math.PI / 2 : -Math.PI / 2;
      }
    } else if (element.connectorKind === 'curved') {
      const dx = p2[0] - p1[0];
      const dy = p2[1] - p1[1];
      const c1x = p1[0] + dx * 0.5;
      const c1y = p1[1];
      const c2x = p2[0] - dx * 0.5;
      const c2y = p2[1];
      pathD = `M ${p1[0]} ${p1[1]} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
      angle = Math.atan2(p2[1] - c2y, p2[0] - c2x);
    }

    const strokeColor = isSelected ? '#38bdf8' : (element.strokeColor || '#52525b');
    const strokeWidth = element.strokeWidth || 2;
    const arrowSize = 10;

    return (
      <g
        id={`elem-${element.id}`}
        onMouseDown={(e) => {
          e.stopPropagation();
          onSelect(e, element.id);
        }}
        className="cursor-pointer"
      >
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={connElem.strokeDash === 'dashed' ? '5 5' : undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Wider clickable target */}
        <path
          d={pathD}
          fill="none"
          stroke="transparent"
          strokeWidth={16}
          strokeLinecap="round"
        />
        {/* Sharp sleek arrowhead matching Screenshots 2 & 3 */}
        {element.connectorKind !== 'straight' && (
          <polygon
            points={`
              ${p2[0]},${p2[1]}
              ${p2[0] - arrowSize * Math.cos(angle - Math.PI / 6)},${p2[1] - arrowSize * Math.sin(angle - Math.PI / 6)}
              ${p2[0] - arrowSize * Math.cos(angle + Math.PI / 6)},${p2[1] - arrowSize * Math.sin(angle + Math.PI / 6)}
            `}
            fill={strokeColor}
          />
        )}
      </g>
    );
  }

  // 3. SHAPES (Seamless Flowchart & Mindmap nodes with Quick-Connect & Anchors)
  if (element.type === 'shape') {
    const shapeElem = element as ShapeElement;
    const kind = shapeElem.shapeKind || 'rect';
    const w = shapeElem.width;
    const h = shapeElem.height;

    const renderShapeSvg = () => {
      const strokeColor = shapeElem.strokeColor || '#52525b';
      const strokeWidth = shapeElem.strokeWidth || 2;
      const fillColor = shapeElem.fillColor || '#ffffff';
      const strokeDasharray = shapeElem.strokeDash === 'dashed' ? '5 5' : undefined;

      switch (kind) {
        case 'circle':
          return (
            <ellipse
              cx={w / 2}
              cy={h / 2}
              rx={w / 2 - 2}
              ry={h / 2 - 2}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
            />
          );
        case 'diamond':
          return (
            <polygon
              points={`${w / 2},2 ${w - 2},${h / 2} ${w / 2},${h - 2} 2,${h / 2}`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeLinejoin="round"
            />
          );
        case 'triangle':
          return (
            <polygon
              points={`${w / 2},2 ${w - 2},${h - 2} 2,${h - 2}`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeLinejoin="round"
            />
          );
        case 'triangle-down':
          return (
            <polygon
              points={`2,2 ${w - 2},2 ${w / 2},${h - 2}`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeLinejoin="round"
            />
          );
        case 'pill':
          return (
            <rect
              x="2"
              y="2"
              width={w - 4}
              height={h - 4}
              rx={h / 2}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
            />
          );
        case 'cylinder':
          return (
            <g>
              <ellipse
                cx={w / 2}
                cy={14}
                rx={w / 2 - 2}
                ry={10}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
              />
              <path
                d={`M 2 14 L 2 ${h - 14} C 2 ${h} ${w - 2} ${h} ${w - 2} ${h - 14} L ${w - 2} 14`}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
              />
            </g>
          );
        case 'star':
          return (
            <polygon
              points={`
                ${w * 0.5},${h * 0.05}
                ${w * 0.62},${h * 0.35}
                ${w * 0.95},${h * 0.38}
                ${w * 0.7},${h * 0.6}
                ${w * 0.78},${h * 0.92}
                ${w * 0.5},${h * 0.75}
                ${w * 0.22},${h * 0.92}
                ${w * 0.3},${h * 0.6}
                ${w * 0.05},${h * 0.38}
                ${w * 0.38},${h * 0.35}
              `}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeLinejoin="round"
            />
          );
        case 'bubble':
          return (
            <path
              d={`
                M 12 2
                H ${w - 12}
                A 10 10 0 0 1 ${w - 2} 12
                V ${h - 22}
                A 10 10 0 0 1 ${w - 12} ${h - 12}
                H 32
                L 16 ${h - 2}
                L 20 ${h - 12}
                H 12
                A 10 10 0 0 1 2 ${h - 22}
                V 12
                A 10 10 0 0 1 12 2
                Z
              `}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeLinejoin="round"
            />
          );
        case 'rounded-rect':
          return (
            <rect
              x="2"
              y="2"
              width={w - 4}
              height={h - 4}
              rx="12"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
            />
          );
        case 'mindmap':
          return (
            <rect
              x="2"
              y="2"
              width={w - 4}
              height={h - 4}
              rx="8"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
            />
          );
        default:
          return (
            <rect
              x="2"
              y="2"
              width={w - 4}
              height={h - 4}
              rx="6"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
            />
          );
      }
    };

    return (
      <foreignObject
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        onMouseDown={(e) => {
          e.stopPropagation();
          onSelect(e, element.id);
        }}
        className="overflow-visible select-none"
      >
        <div
          id={`elem-${element.id}`}
          className={`relative w-full h-full flex items-center justify-center cursor-move transition-shadow ${
            isSelected ? 'ring-2 ring-[#38bdf8] rounded-md shadow-sm' : ''
          }`}
          style={{ transform: `rotate(${element.rotation || 0}deg)` }}
        >
          {/* Floating Dark Context Toolbar (Screenshots 2 & 3) */}
          {isSelected && (
            <ShapeContextBar
              element={shapeElem}
              zoom={zoom}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          )}

          {/* SVG Shape Geometry */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-2xs">
            {renderShapeSvg()}
          </svg>

          {/* Centered editable text content */}
          <div className="relative z-10 px-3 text-center w-full max-h-full flex items-center justify-center pointer-events-auto">
            {isEditingText ? (
              <textarea
                ref={textInputRef as any}
                value={editText}
                placeholder="Add text"
                onChange={(e) => setEditText(e.target.value)}
                onBlur={handleFinishText}
                onMouseDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleFinishText();
                  }
                }}
                className="w-full text-center bg-transparent border-none outline-none resize-none font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal"
                style={{
                  fontSize: `${shapeElem.fontSize || 14}px`,
                  textAlign: shapeElem.align || 'center',
                  fontWeight: shapeElem.bold ? 700 : 500,
                  textDecoration: shapeElem.strikethrough ? 'line-through' : 'none',
                }}
              />
            ) : (
              <div
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setIsEditingText(true);
                }}
                onClick={(e) => {
                  if (isSelected) {
                    e.stopPropagation();
                    setIsEditingText(true);
                  }
                }}
                className="font-medium text-slate-800 break-words cursor-text line-clamp-3 w-full select-none"
                style={{
                  fontSize: `${shapeElem.fontSize || 14}px`,
                  textAlign: shapeElem.align || 'center',
                  fontWeight: shapeElem.bold ? 700 : 500,
                  textDecoration: shapeElem.strikethrough ? 'line-through' : 'none',
                }}
              >
                {shapeElem.text ? (
                  shapeElem.text
                ) : (
                  <span className="text-slate-400 font-normal">Add text</span>
                )}
              </div>
            )}
          </div>

          {/* Flowchart Anchors & Quick-Add Buttons (Screenshots 2 & 3) */}
          {isSelected && (
            <>
              {/* Top Anchor Dot */}
              <button
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onStartConnectionDrag?.(element.id, 'top', e.clientX, e.clientY);
                }}
                onMouseEnter={() => setActiveDirection('top')}
                className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#38bdf8] border-2 border-white shadow-xs cursor-crosshair z-30 hover:scale-130 transition-transform"
                title="Drag to connect from top"
              />

              {/* Bottom Anchor Dot */}
              <button
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onStartConnectionDrag?.(element.id, 'bottom', e.clientX, e.clientY);
                }}
                onMouseEnter={() => setActiveDirection('bottom')}
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#38bdf8] border-2 border-white shadow-xs cursor-crosshair z-30 hover:scale-130 transition-transform"
                title="Drag to connect from bottom"
              />

              {/* Left Anchor Dot */}
              <button
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onStartConnectionDrag?.(element.id, 'left', e.clientX, e.clientY);
                }}
                onMouseEnter={() => setActiveDirection('left')}
                className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#38bdf8] border-2 border-white shadow-xs cursor-crosshair z-30 hover:scale-130 transition-transform"
                title="Drag to connect from left"
              />

              {/* Right Anchor Dot */}
              <button
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onStartConnectionDrag?.(element.id, 'right', e.clientX, e.clientY);
                }}
                onMouseEnter={() => setActiveDirection('right')}
                className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#38bdf8] border-2 border-white shadow-xs cursor-crosshair z-30 hover:scale-130 transition-transform"
                title="Drag to connect from right"
              />

              {/* Primary Directional Quick-Add Arrow Button (Screenshot 2 right ➔ & Screenshot 3 bottom ↓) */}
              {activeDirection === 'right' && (
                <button
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onQuickConnect?.(element.id, 'right');
                  }}
                  onMouseEnter={() => setHoveredGhostDirection('right')}
                  onMouseLeave={() => setHoveredGhostDirection(null)}
                  className="absolute -right-7.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white flex items-center justify-center shadow-md cursor-pointer hover:scale-115 transition-all z-40"
                  title="Add connected shape to the right (click or press Enter)"
                >
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}

              {activeDirection === 'bottom' && (
                <button
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onQuickConnect?.(element.id, 'bottom');
                  }}
                  onMouseEnter={() => setHoveredGhostDirection('bottom')}
                  onMouseLeave={() => setHoveredGhostDirection(null)}
                  className="absolute -bottom-7.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white flex items-center justify-center shadow-md cursor-pointer hover:scale-115 transition-all z-40"
                  title="Add connected shape below"
                >
                  <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}

              {activeDirection === 'left' && (
                <button
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onQuickConnect?.(element.id, 'left');
                  }}
                  onMouseEnter={() => setHoveredGhostDirection('left')}
                  onMouseLeave={() => setHoveredGhostDirection(null)}
                  className="absolute -left-7.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white flex items-center justify-center shadow-md cursor-pointer hover:scale-115 transition-all z-40"
                  title="Add connected shape to the left"
                >
                  <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}

              {activeDirection === 'top' && (
                <button
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onQuickConnect?.(element.id, 'top');
                  }}
                  onMouseEnter={() => setHoveredGhostDirection('top')}
                  onMouseLeave={() => setHoveredGhostDirection(null)}
                  className="absolute -top-7.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white flex items-center justify-center shadow-md cursor-pointer hover:scale-115 transition-all z-40"
                  title="Add connected shape above"
                >
                  <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}

              {/* Ghost Connector & Shape Preview on Hover (Exact Match to Screenshot 2) */}
              {hoveredGhostDirection === 'right' && (
                <>
                  <svg className="absolute top-0 left-full w-20 h-full overflow-visible pointer-events-none z-20">
                    <line x1="0" y1={h / 2} x2="72" y2={h / 2} stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
                    <polygon points={`72,${h / 2} 64,${h / 2 - 4} 64,${h / 2 + 4}`} fill="#94a3b8" />
                  </svg>
                  <div
                    className="absolute top-0 left-[calc(100%+80px)] pointer-events-none rounded-md border-2 border-dashed border-slate-400 bg-slate-100/60 flex items-center justify-center text-xs text-slate-400 font-medium z-20 shadow-xs"
                    style={{ width: `${w}px`, height: `${h}px` }}
                  >
                    Add text
                  </div>
                </>
              )}

              {hoveredGhostDirection === 'bottom' && (
                <>
                  <svg className="absolute left-0 top-full w-full h-20 overflow-visible pointer-events-none z-20">
                    <line x1={w / 2} y1="0" x2={w / 2} y2="72" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
                    <polygon points={`${w / 2},72 ${w / 2 - 4},64 ${w / 2 + 4},64`} fill="#94a3b8" />
                  </svg>
                  <div
                    className="absolute top-[calc(100%+80px)] left-0 pointer-events-none rounded-md border-2 border-dashed border-slate-400 bg-slate-100/60 flex items-center justify-center text-xs text-slate-400 font-medium z-20 shadow-xs"
                    style={{ width: `${w}px`, height: `${h}px` }}
                  >
                    Add text
                  </div>
                </>
              )}

              {hoveredGhostDirection === 'left' && (
                <>
                  <svg className="absolute top-0 right-full w-20 h-full overflow-visible pointer-events-none z-20">
                    <line x1="0" y1={h / 2} x2="-72" y2={h / 2} stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
                    <polygon points={`-72,${h / 2} -64,${h / 2 - 4} -64,${h / 2 + 4}`} fill="#94a3b8" />
                  </svg>
                  <div
                    className="absolute top-0 right-[calc(100%+80px)] pointer-events-none rounded-md border-2 border-dashed border-slate-400 bg-slate-100/60 flex items-center justify-center text-xs text-slate-400 font-medium z-20 shadow-xs"
                    style={{ width: `${w}px`, height: `${h}px` }}
                  >
                    Add text
                  </div>
                </>
              )}

              {hoveredGhostDirection === 'top' && (
                <>
                  <svg className="absolute left-0 bottom-full w-full h-20 overflow-visible pointer-events-none z-20">
                    <line x1={w / 2} y1="0" x2={w / 2} y2="-72" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
                    <polygon points={`${w / 2},-72 ${w / 2 - 4},-64 ${w / 2 + 4},-64`} fill="#94a3b8" />
                  </svg>
                  <div
                    className="absolute bottom-[calc(100%+80px)] left-0 pointer-events-none rounded-md border-2 border-dashed border-slate-400 bg-slate-100/60 flex items-center justify-center text-xs text-slate-400 font-medium z-20 shadow-xs"
                    style={{ width: `${w}px`, height: `${h}px` }}
                  >
                    Add text
                  </div>
                </>
              )}

              {/* 8 Bounding Box Smart Resize Handles (Four Corners & Four Edges) */}
              {onStartResize && (
                <>
                  {/* Four Corner Handles */}
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onStartResize(e, element.id, 'nw');
                    }}
                    className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#0284c7] rounded-xs shadow-xs cursor-nwse-resize z-50 hover:scale-125 transition-transform"
                    title="Resize Top-Left"
                  />
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onStartResize(e, element.id, 'ne');
                    }}
                    className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#0284c7] rounded-xs shadow-xs cursor-nesw-resize z-50 hover:scale-125 transition-transform"
                    title="Resize Top-Right"
                  />
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onStartResize(e, element.id, 'se');
                    }}
                    className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#0284c7] rounded-xs shadow-xs cursor-nwse-resize z-50 hover:scale-125 transition-transform"
                    title="Resize Bottom-Right"
                  />
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onStartResize(e, element.id, 'sw');
                    }}
                    className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#0284c7] rounded-xs shadow-xs cursor-nesw-resize z-50 hover:scale-125 transition-transform"
                    title="Resize Bottom-Left"
                  />

                  {/* Four Edge Midpoint Handles */}
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onStartResize(e, element.id, 'n');
                    }}
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-2 bg-white border-2 border-[#0284c7] rounded-xs shadow-xs cursor-ns-resize z-40 hover:scale-125 transition-transform opacity-75 hover:opacity-100"
                    title="Resize Top Edge"
                  />
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onStartResize(e, element.id, 's');
                    }}
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-2 bg-white border-2 border-[#0284c7] rounded-xs shadow-xs cursor-ns-resize z-40 hover:scale-125 transition-transform opacity-75 hover:opacity-100"
                    title="Resize Bottom Edge"
                  />
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onStartResize(e, element.id, 'w');
                    }}
                    className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2 h-4 bg-white border-2 border-[#0284c7] rounded-xs shadow-xs cursor-ew-resize z-40 hover:scale-125 transition-transform opacity-75 hover:opacity-100"
                    title="Resize Left Edge"
                  />
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onStartResize(e, element.id, 'e');
                    }}
                    className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2 h-4 bg-white border-2 border-[#0284c7] rounded-xs shadow-xs cursor-ew-resize z-40 hover:scale-125 transition-transform opacity-75 hover:opacity-100"
                    title="Resize Right Edge"
                  />
                </>
              )}
            </>
          )}
        </div>
      </foreignObject>
    );
  }

  // 4. STICKY NOTE (Realistic pastel paper note with rotation, fold, and palette)
  if (element.type === 'sticky') {
    const bgColors: Record<string, string> = {
      yellow: '#fef08a',
      blue: '#bae6fd',
      green: '#bbf7d0',
      pink: '#fbcfe8',
      purple: '#e9d5ff',
    };
    const noteColor = bgColors[element.color || 'yellow'] || element.color || '#fef08a';
    const stickyColors: StickyColor[] = ['yellow', 'blue', 'green', 'pink', 'purple'];

    return (
      <foreignObject
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height + (isSelected ? 42 : 0)}
        onMouseDown={(e) => {
          const target = e.target as HTMLElement;
          if (target.tagName !== 'TEXTAREA' && target.tagName !== 'BUTTON') {
            e.stopPropagation();
            onSelect(e, element.id);
          }
        }}
        className="overflow-visible pointer-events-auto"
      >
        <div className="relative w-full h-full flex flex-col select-text">
          <div
            id={`elem-${element.id}`}
            className="relative w-full rounded-xl shadow-md p-3.5 flex flex-col cursor-move transition-transform duration-100 border border-black/5"
            style={{
              height: `${element.height}px`,
              backgroundColor: noteColor,
              transform: `rotate(${element.rotation || 0}deg)`,
            }}
          >
            {/* Folded paper corner top-right */}
            <div className="absolute top-0 right-0 w-4 h-4 bg-black/5 rounded-bl-sm border-b border-l border-black/10 pointer-events-none" />

            {/* Sticky text body */}
            <div className="flex-1 w-full h-full overflow-hidden">
              <textarea
                value={isEditingText ? editText : (element.text ?? '')}
                onFocus={() => {
                  if (!isSelected) {
                    onSelect({ stopPropagation: () => {} } as any, element.id);
                  }
                  if (!isEditingText) {
                    setIsEditingText(true);
                    setEditText(element.text || '');
                  }
                }}
                onChange={(e) => {
                  setEditText(e.target.value);
                  onUpdate({ text: e.target.value });
                }}
                onBlur={() => {
                  setIsEditingText(false);
                  onUpdate({ text: editText });
                }}
                onMouseDown={(e) => e.stopPropagation()}
                placeholder="Type note..."
                className="w-full h-full bg-transparent border-none outline-none resize-none text-slate-800 placeholder-slate-400/80 font-sans leading-relaxed text-sm selection:bg-black/10 cursor-text select-text"
                style={{ fontSize: `${element.fontSize || 14}px` }}
              />
            </div>

            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute -inset-1 border-2 border-[#8B5CF6] pointer-events-none rounded-xl" />
            )}
          </div>

          {/* Quick Color Picker & Delete Toolbar when selected */}
          {isSelected && (
            <div
              className="mt-1 flex items-center justify-between px-2 py-1 bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200/80 gap-2 w-max self-center"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-1.5">
                {stickyColors.map((col) => (
                  <button
                    key={col}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate({ color: col });
                    }}
                    className={`w-4 h-4 rounded-full border border-black/15 transition-transform hover:scale-125 cursor-pointer ${
                      element.color === col ? 'ring-2 ring-purple-500 ring-offset-1 scale-110' : ''
                    }`}
                    style={{ backgroundColor: bgColors[col] }}
                    title={`${col.charAt(0).toUpperCase() + col.slice(1)} Note`}
                  />
                ))}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(element.id);
                }}
                className="p-0.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                title="Delete note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Sticky Note Bottom-Right Resize Handle */}
          {isSelected && onStartResize && (
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                onStartResize(e, element.id, 'se');
              }}
              className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border-2 border-[#0284c7] rounded-xs shadow-xs cursor-nwse-resize z-50 hover:scale-125 transition-transform"
              title="Resize Note"
            />
          )}
        </div>
      </foreignObject>
    );
  }

  // 5. TEXT ELEMENT
  if (element.type === 'text') {
    return (
      <foreignObject
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        onMouseDown={(e) => {
          e.stopPropagation();
          onSelect(e, element.id);
        }}
        className="overflow-visible select-none"
      >
        <div
          id={`elem-${element.id}`}
          className="relative w-full h-full flex items-center cursor-move p-1"
        >
          {isEditingText ? (
            <textarea
              ref={textInputRef as any}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleFinishText}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full h-full bg-transparent border-none outline-none resize-none font-sans font-medium text-slate-900"
              style={{ fontSize: `${element.fontSize || 18}px` }}
            />
          ) : (
            <div
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditingText(true);
              }}
              className="font-medium text-slate-900 break-words cursor-text"
              style={{ fontSize: `${element.fontSize || 18}px` }}
            >
              {element.text || 'Click to type'}
            </div>
          )}

          {isSelected && (
            <div className="absolute -inset-1 border-2 border-[#8B5CF6] pointer-events-none rounded-xs" />
          )}
        </div>
      </foreignObject>
    );
  }

  // 6. TABLE ELEMENT (Fully interactive & editable, zero mock data)
  if (element.type === 'table') {
    return (
      <EditableTableView
        element={element as TableElement}
        isSelected={isSelected}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
        zoom={zoom}
      />
    );
  }

  // 7. STAMP / REACTION ELEMENT
  if (element.type === 'stamp') {
    const renderStampContent = () => {
      switch (element.stampKind) {
        case 'heart':
          return (
            <div className="w-12 h-12 rounded-full bg-rose-100 border-2 border-rose-300 flex items-center justify-center text-2xl shadow-md transform hover:scale-110 transition-transform">
              ❤️
            </div>
          );
        case 'thumbs-up':
          return (
            <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-2xl shadow-md transform hover:scale-110 transition-transform">
              👍
            </div>
          );
        case 'thumbs-down':
          return (
            <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center text-2xl shadow-md transform hover:scale-110 transition-transform">
              👎
            </div>
          );
        case 'plus-one':
          return (
            <div className="w-12 h-12 rounded-full bg-purple-100 border-2 border-purple-300 flex items-center justify-center font-black text-sm text-purple-700 shadow-md transform hover:scale-110 transition-transform">
              +1
            </div>
          );
        case 'star':
          return (
            <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-2xl shadow-md transform hover:scale-110 transition-transform">
              ⭐
            </div>
          );
        case 'question':
          return (
            <div className="w-12 h-12 rounded-full bg-orange-100 border-2 border-orange-300 flex items-center justify-center font-black text-base text-orange-600 shadow-md transform hover:scale-110 transition-transform">
              ❓
            </div>
          );
        case 'avatar-g':
          return (
            <div className="w-12 h-12 rounded-full bg-[#4a3525] border-2 border-amber-900/40 text-white font-bold text-sm flex items-center justify-center shadow-md transform hover:scale-110 transition-transform">
              G
            </div>
          );
        default:
          return (
            <div className="w-12 h-12 rounded-full bg-purple-50 border-2 border-purple-200 flex items-center justify-center text-2xl shadow-md">
              {(element as any).emoji || (element as any).text || '🔥'}
            </div>
          );
      }
    };

    return (
      <foreignObject
        x={element.x}
        y={element.y}
        width={60}
        height={60}
        onMouseDown={(e) => {
          e.stopPropagation();
          onSelect(e, element.id);
        }}
        className="overflow-visible select-none"
      >
        <div
          id={`elem-${element.id}`}
          className="relative w-full h-full flex items-center justify-center cursor-move"
        >
          {renderStampContent()}
          {isSelected && (
            <div className="absolute -inset-1 border-2 border-[#8B5CF6] pointer-events-none rounded-full" />
          )}
        </div>
      </foreignObject>
    );
  }

  // 8. COMMENT ELEMENT
  if (element.type === 'comment') {
    const commentElem = element as CommentElement;
    const replies = commentElem.commentReplies || commentElem.replies || [];

    return (
      <foreignObject
        x={element.x}
        y={element.y}
        width={240}
        height={180}
        onMouseDown={(e) => {
          e.stopPropagation();
          onSelect(e, element.id);
        }}
        className="overflow-visible select-none"
      >
        <div
          id={`elem-${element.id}`}
          className="relative bg-white rounded-2xl shadow-lg border border-slate-200 p-3 text-xs w-60 cursor-move space-y-2 animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Pin pointer marker */}
          <div className="absolute -top-2 left-4 w-3.5 h-3.5 bg-purple-600 rounded-full border-2 border-white shadow-xs flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full" />
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 pt-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <div className="w-5 h-5 rounded-full bg-[#4a3525] text-white flex items-center justify-center text-[10px] font-bold">
                {commentElem.author?.[0] || 'G'}
              </div>
              <span className="truncate max-w-[120px]">{commentElem.author || 'Guest'}</span>
            </div>
            <span className="text-[10px] text-slate-400">Just now</span>
          </div>

          <div className="text-slate-700 leading-relaxed">{commentElem.text || 'Add comment details...'}</div>

          {/* Replies */}
          {replies.length > 0 && (
            <div className="space-y-1.5 border-t border-slate-100 pt-1.5 max-h-24 overflow-y-auto">
              {replies.map((r: CommentReply) => (
                <div key={r.id} className="bg-slate-50 p-1.5 rounded-lg text-[11px]">
                  <div className="font-semibold text-slate-700">{r.author}</div>
                  <div className="text-slate-600">{r.text}</div>
                </div>
              ))}
            </div>
          )}

          {/* Quick reply input */}
          <div className="flex items-center gap-1 pt-1">
            <input
              type="text"
              placeholder="Reply..."
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && replyInput.trim()) {
                  onUpdate({
                    commentReplies: [
                      ...replies,
                      {
                        id: `r-${Date.now()}`,
                        author: 'You',
                        text: replyInput.trim(),
                        timestamp: Date.now(),
                      },
                    ],
                  } as any);
                  setReplyInput('');
                }
              }}
              className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] outline-none focus:border-purple-400"
            />
          </div>

          {isSelected && (
            <div className="absolute -inset-1 border-2 border-[#8B5CF6] pointer-events-none rounded-2xl" />
          )}
        </div>
      </foreignObject>
    );
  }

  return null;
};
