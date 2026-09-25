export type ToolType =
  | 'select'
  | 'hand'
  | 'pen'
  | 'highlighter'
  | 'washi-tape'
  | 'eraser'
  | 'shape'
  | 'connector'
  | 'text'
  | 'sticky'
  | 'table'
  | 'stamp'
  | 'comment'
  | 'laser'
  | 'frame'
  | 'more';

export type PenSubTool = 'pencil' | 'highlighter' | 'washi-tape' | 'eraser';

export type ShapeKind =
  | 'rect'
  | 'rounded-rect'
  | 'circle'
  | 'diamond'
  | 'triangle'
  | 'triangle-down'
  | 'pill'
  | 'cylinder'
  | 'mindmap'
  | 'star'
  | 'cloud'
  | 'bubble';

export type ConnectorKind = 'straight' | 'arrow' | 'curved' | 'elbow';

export type WashiPattern =
  | 'purple-grid'
  | 'confetti'
  | 'checker'
  | 'stars'
  | 'hazard'
  | 'floral'
  | 'galaxy'
  | 'botanical';

export type StampKind =
  | 'heart'
  | 'thumbs-up'
  | 'plus-one'
  | 'star'
  | 'question'
  | 'thumbs-down'
  | 'circle-badge'
  | 'avatar-g'
  | 'emoji-laugh'
  | 'emoji-pray'
  | 'emoji-ok'
  | 'emoji-eyes'
  | 'emoji-fire';

export type StickyColor = 'yellow' | 'pink' | 'blue' | 'green' | 'purple' | 'peach' | string;

export interface Point {
  x: number;
  y: number;
}

export interface StrokePoint extends Point {
  pressure?: number;
}

export interface BaseElement {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation?: number;
  opacity?: number;
  locked?: boolean;
  zIndex: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface StrokeElement extends BaseElement {
  type: 'stroke' | 'path';
  points: [number, number][] | StrokePoint[];
  color?: string;
  strokeColor?: string;
  strokeWidth: number;
  toolType?: PenSubTool;
  penSubTool?: PenSubTool;
  pattern?: WashiPattern;
  washiPattern?: WashiPattern;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeKind: ShapeKind;
  width: number;
  height: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  strokeDash?: 'solid' | 'dashed';
  text?: string;
  textColor?: string;
  fontSize?: number;
  bold?: boolean;
  strikethrough?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface ConnectorElement extends BaseElement {
  type: 'connector';
  connectorKind: ConnectorKind;
  fromId?: string;
  toId?: string;
  fromSide?: 'top' | 'right' | 'bottom' | 'left';
  toSide?: 'top' | 'right' | 'bottom' | 'left';
  endX?: number;
  endY?: number;
  width?: number;
  height?: number;
  points?: [number, number][];
  strokeColor: string;
  strokeWidth: number;
  strokeDash?: 'solid' | 'dashed';
  text?: string;
}

export interface StickyElement extends BaseElement {
  type: 'sticky';
  width: number;
  height: number;
  color: StickyColor;
  text: string;
  author?: string;
  fontSize?: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  width: number;
  height: number;
  text: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  strokeColor?: string;
  bold?: boolean;
  italic?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface TableElement extends BaseElement {
  type: 'table';
  width?: number;
  height?: number;
  rows?: number;
  cols?: number;
  data?: string[][];
  tableData?: {
    headers: string[];
    rows: string[][];
  };
  colWidths?: number[];
  rowHeights?: number[];
  borderColor?: string;
  headerBgColor?: string;
}

export interface StampElement extends BaseElement {
  type: 'stamp';
  stampKind: StampKind;
  width: number;
  height: number;
  emoji?: string;
  text?: string;
  badgeLabel?: string;
  badgeBg?: string;
  badgeColor?: string;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  url: string;
  width: number;
  height: number;
  caption?: string;
  borderRadius?: number;
  aspectRatio?: number;
}

export interface FrameElement extends BaseElement {
  type: 'frame';
  title: string;
  width: number;
  height: number;
  strokeColor?: string;
  fillColor?: string;
  themeColor?: string;
}

export interface CodeElement extends BaseElement {
  type: 'code';
  code: string;
  language: string;
  title?: string;
  width: number;
  height: number;
}

export interface CommentReply {
  id: string;
  author: string;
  authorAvatar?: string;
  text: string;
  timestamp: number;
}

export interface CommentElement extends BaseElement {
  type: 'comment';
  number?: number;
  author?: string;
  authorAvatar?: string;
  text: string;
  timestamp?: number;
  resolved?: boolean;
  replies?: CommentReply[];
  commentReplies?: CommentReply[];
  width?: number;
  height?: number;
}

export type CanvasElement =
  | StrokeElement
  | ShapeElement
  | ConnectorElement
  | StickyElement
  | TextElement
  | TableElement
  | StampElement
  | CommentElement
  | ImageElement
  | FrameElement
  | CodeElement;

export interface BoardMetadata {
  id: string;
  title: string;
  lastSaved: number;
}

export interface UserPresence {
  id: string;
  name: string;
  avatar: string;
  color: string;
  cursor?: { x: number; y: number };
  activeTool?: ToolType;
  lastSeen: number;
}

export interface VotingOption {
  id: string;
  text: string;
  votes: string[]; // user IDs who voted
}

export interface ActiveVote {
  id: string;
  question: string;
  options: VotingOption[];
  createdAt: number;
  durationSeconds: number;
  remainingSeconds: number;
  isActive: boolean;
  creator: string;
}

export interface GridConfig {
  type: 'dots' | 'lines' | 'blank';
  size: number; // e.g. 24
  opacity: number; // 0 to 1
  dotColor: string;
  bgColor: string;
}
