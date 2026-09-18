import React, { useState, useRef, useEffect } from 'react';
import {
  CanvasElement,
  ToolType,
  ShapeKind,
  ConnectorKind,
  ConnectorElement,
  TableElement,
  CommentElement,
  CommentReply,
  StickyColor,
} from '../../types.ts';
import { MessageSquare, Heart, ThumbsUp, ThumbsDown, Star, Plus, Check, Trash2 } from 'lucide-react';
import { EditableTableView } from './EditableTableView.tsx';

interface CanvasElementViewProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent, id: string) => void;
  onUpdate: (updated: Partial<CanvasElement>) => void;
  onDelete: (id: string) => void;
  zoom: number;
  currentTool: ToolType;
}

export const CanvasElementView: React.FC<CanvasElementViewProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  zoom,
  currentTool,
}) => {
  const initialText = 'text' in element ? ((element as any).text || '') : '';
  const [isEditingText, setIsEditingText] = useState(false);
  const [editText, setEditText] = useState(initialText);
  const [isReplyingComment, setIsReplyingComment] = useState(false);
  const [replyInput, setReplyInput] = useState('');
  const textInputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => {
    setEditText('text' in element ? ((element as any).text || '') : '');
  }, [element]);

  useEffect(() => {
    if (isEditingText && textInputRef.current) {
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

  // 2. CONNECTORS & ARROWS
  if (element.type === 'connector') {
    const connElem = element as ConnectorElement;
    const p1 = connElem.points?.[0] || [connElem.x, connElem.y];
    const p2 = connElem.points?.[1] || [
      connElem.endX ?? (connElem.x + (connElem.width ?? 100)),
      connElem.endY ?? (connElem.y + (connElem.height ?? 100)),
    ];

    let pathD = `M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]}`;
    if (element.connectorKind === 'elbow') {
      const midX = (p1[0] + p2[0]) / 2;
      pathD = `M ${p1[0]} ${p1[1]} L ${midX} ${p1[1]} L ${midX} ${p2[1]} L ${p2[0]} ${p2[1]}`;
    } else if (element.connectorKind === 'curved') {
      const dx = p2[0] - p1[0];
      pathD = `M ${p1[0]} ${p1[1]} C ${p1[0] + dx / 2} ${p1[1]}, ${p2[0] - dx / 2} ${p2[1]}, ${p2[0]} ${p2[1]}`;
    }

    const angle = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
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
          stroke={isSelected ? '#8B5CF6' : element.strokeColor}
          strokeWidth={element.strokeWidth || 2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Invisible wider stroke for easy click */}
        <path
          d={pathD}
          fill="none"
          stroke="transparent"
          strokeWidth={16}
          strokeLinecap="round"
        />
        {/* Arrow head */}
        {element.connectorKind !== 'straight' && (
          <polygon
            points={`
              ${p2[0]},${p2[1]}
              ${p2[0] - arrowSize * Math.cos(angle - Math.PI / 6)},${p2[1] - arrowSize * Math.sin(angle - Math.PI / 6)}
              ${p2[0] - arrowSize * Math.cos(angle + Math.PI / 6)},${p2[1] - arrowSize * Math.sin(angle + Math.PI / 6)}
            `}
            fill={isSelected ? '#8B5CF6' : element.strokeColor}
          />
        )}
      </g>
    );
  }

  // 3. SHAPES (Rectangle, Circle, Diamond, Triangle, Cylinder, Mindmap, Bubble, Star)
  if (element.type === 'shape') {
    const kind = element.shapeKind || 'rect';
    const w = element.width;
    const h = element.height;

    const renderShapeSvg = () => {
      switch (kind) {
        case 'circle':
          return (
            <ellipse
              cx={w / 2}
              cy={h / 2}
              rx={w / 2 - 2}
              ry={h / 2 - 2}
              fill={element.fillColor || 'white'}
              stroke={element.strokeColor || '#334155'}
              strokeWidth={element.strokeWidth || 2}
            />
          );
        case 'diamond':
          return (
            <polygon
              points={`${w / 2},2 ${w - 2},${h / 2} ${w / 2},${h - 2} 2,${h / 2}`}
              fill={element.fillColor || 'white'}
              stroke={element.strokeColor || '#334155'}
              strokeWidth={element.strokeWidth || 2}
              strokeLinejoin="round"
            />
          );
        case 'triangle':
          return (
            <polygon
              points={`${w / 2},2 ${w - 2},${h - 2} 2,${h - 2}`}
              fill={element.fillColor || 'white'}
              stroke={element.strokeColor || '#334155'}
              strokeWidth={element.strokeWidth || 2}
              strokeLinejoin="round"
            />
          );
        case 'triangle-down':
          return (
            <polygon
              points={`2,2 ${w - 2},2 ${w / 2},${h - 2}`}
              fill={element.fillColor || 'white'}
              stroke={element.strokeColor || '#334155'}
              strokeWidth={element.strokeWidth || 2}
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
              fill={element.fillColor || 'white'}
              stroke={element.strokeColor || '#334155'}
              strokeWidth={element.strokeWidth || 2}
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
                fill={element.fillColor || 'white'}
                stroke={element.strokeColor || '#334155'}
                strokeWidth={element.strokeWidth || 2}
              />
              <path
                d={`M 2 14 L 2 ${h - 14} C 2 ${h} ${w - 2} ${h} ${w - 2} ${h - 14} L ${w - 2} 14`}
                fill={element.fillColor || 'white'}
                stroke={element.strokeColor || '#334155'}
                strokeWidth={element.strokeWidth || 2}
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
              fill={element.fillColor || 'white'}
              stroke={element.strokeColor || '#334155'}
              strokeWidth={element.strokeWidth || 2}
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
              fill={element.fillColor || 'white'}
              stroke={element.strokeColor || '#334155'}
              strokeWidth={element.strokeWidth || 2}
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
              fill={element.fillColor || 'white'}
              stroke={element.strokeColor || '#334155'}
              strokeWidth={element.strokeWidth || 2}
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
              fill={element.fillColor || '#f8fafc'}
              stroke={element.strokeColor || '#8b5cf6'}
              strokeWidth={element.strokeWidth || 2}
            />
          );
        default:
          return (
            <rect
              x="2"
              y="2"
              width={w - 4}
              height={h - 4}
              rx="4"
              fill={element.fillColor || 'white'}
              stroke={element.strokeColor || '#334155'}
              strokeWidth={element.strokeWidth || 2}
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
          className="relative w-full h-full flex items-center justify-center cursor-move"
          style={{ transform: `rotate(${element.rotation || 0}deg)` }}
        >
          {/* SVG Shape Geometry */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-2xs">
            {renderShapeSvg()}
          </svg>

          {/* Centered editable text content */}
          <div className="relative z-10 px-3 text-center w-full max-h-full flex items-center justify-center">
            {isEditingText ? (
              <textarea
                ref={textInputRef as any}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={handleFinishText}
                onMouseDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleFinishText();
                  }
                }}
                className="w-full text-center bg-transparent border-none outline-none resize-none font-medium text-slate-800"
                style={{ fontSize: `${element.fontSize || 14}px` }}
              />
            ) : (
              <div
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setIsEditingText(true);
                }}
                className="font-medium text-slate-800 break-words cursor-text line-clamp-3"
                style={{ fontSize: `${element.fontSize || 14}px` }}
              >
                {element.text || <span className="opacity-0">Text</span>}
              </div>
            )}
          </div>

          {/* Selection Box & Resize Handles */}
          {isSelected && (
            <div className="absolute -inset-1 border-2 border-[#8B5CF6] pointer-events-none rounded-sm">
              <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#8B5CF6] rounded-xs" />
              <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#8B5CF6] rounded-xs" />
              <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#8B5CF6] rounded-xs" />
              <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#8B5CF6] rounded-xs" />
            </div>
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
          e.stopPropagation();
          onSelect(e, element.id);
        }}
        className="overflow-visible select-none"
      >
        <div className="relative w-full h-full flex flex-col">
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
                  setIsEditingText(true);
                  setEditText(element.text || '');
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
                className="w-full h-full bg-transparent border-none outline-none resize-none text-slate-800 placeholder-slate-400/80 font-sans leading-relaxed text-sm selection:bg-black/10"
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
