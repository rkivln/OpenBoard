import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useBoardState } from './hooks/useBoardState.ts';
import {
  ToolType,
  PenSubTool,
  ShapeKind,
  ConnectorKind,
  StampKind,
  WashiPattern,
  CanvasElement,
} from './types.ts';
import { TopLeftControl } from './components/header/TopLeftControl.tsx';
import { TopRightControl } from './components/header/TopRightControl.tsx';
import { TimerMusicVotingPanel } from './components/panels/TimerMusicVotingPanel.tsx';
import { BottomToolbar } from './components/toolbar/BottomToolbar.tsx';
import { PenPopover } from './components/toolbar/popovers/PenPopover.tsx';
import { ShapePickerPopover } from './components/toolbar/popovers/ShapePickerPopover.tsx';
import { ReactionWheel } from './components/toolbar/popovers/ReactionWheel.tsx';
import { GridPopover } from './components/toolbar/popovers/GridPopover.tsx';
import { CreativeHubPopover } from './components/toolbar/popovers/CreativeHubPopover.tsx';
import { BottomRightControls } from './components/footer/BottomRightControls.tsx';
import { Canvas } from './components/canvas/Canvas.tsx';
import { ShareModal } from './components/modals/ShareModal.tsx';
import { HelpModal } from './components/modals/HelpModal.tsx';
import { MoreShapesModal } from './components/modals/MoreShapesModal.tsx';
import { MinimapRadar } from './components/canvas/MinimapRadar.tsx';
import { PresentationModeOverlay } from './components/canvas/PresentationModeOverlay.tsx';
import { PhysicsPanel } from './components/toolbar/PhysicsPanel.tsx';
import { usePhysics } from './hooks/usePhysics.ts';
import { soundEngine } from './utils/audio.ts';

export default function App() {
  const {
    elements,
    selectedElementIds,
    boardTitle,
    isConnected,
    currentUser,
    remoteUsers,
    isPlayingAudio,
    audioVolume,
    audioCategory,
    isAudioMuted,
    timerRemainingSec,
    isTimerRunning,
    activeVote,
    gridConfig,
    zoom,
    pan,
    updateElementsLive,
    commitLiveElements,
    addElement,
    updateElement,
    batchUpdateElements,
    deleteElement,
    deleteElements,
    duplicateElements,
    selectElement,
    selectElements,
    updateBoardTitle,
    duplicateBoard,
    newBoard,
    clearBoard,
    exportBoard,
    setPan,
    setZoom,
    updateCursor,
    toggleAudio,
    setAudioCategory,
    setAudioVolume,
    toggleAudioMute,
    toggleTimer,
    addOneMinuteToTimer,
    resetTimer,
    createVote,
    castVote,
    endVote,
    setGridConfig,
    undo,
    redo,
  } = useBoardState();

  // Physics Engine hook
  const [isPhysicsPanelOpen, setIsPhysicsPanelOpen] = useState(false);
  const {
    physicsConfig,
    isPhysicsActive,
    gravityPreset,
    frictionPreset,
    togglePhysics,
    setGravityPreset,
    setFrictionPreset,
    setMomentumDecay,
    setBounciness,
    toggleFloorBarrier,
    toggleMagnet,
    shakeBoard,
    settleAndFreeze,
    handleStartPhysicsDrag,
    handleMovePhysicsDrag,
    handleEndPhysicsDrag,
    handleApplyAttraction,
  } = usePhysics({
    elements,
    onElementsUpdateLive: updateElementsLive,
    onElementsCommit: commitLiveElements,
  });

  // Active Tooling State
  const [tool, setTool] = useState<ToolType>('select');
  const [penSubTool, setPenSubTool] = useState<PenSubTool>('pencil');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [strokeColor, setStrokeColor] = useState<string>('#1e293b');
  const [washiPattern, setWashiPattern] = useState<WashiPattern>('purple-grid');

  const [selectedShape, setSelectedShape] = useState<ShapeKind>('circle');
  const [selectedConnector, setSelectedConnector] = useState<ConnectorKind>('arrow');
  const [shapePickerActiveType, setShapePickerActiveType] = useState<'shape' | 'connector'>('shape');

  const [selectedStamp, setSelectedStamp] = useState<StampKind>('thumbs-up');
  const [stampEmoji, setStampEmoji] = useState<string>('🔥');

  // Popovers & Modals
  const [activePopover, setActivePopover] = useState<
    'pen' | 'shapes' | 'reaction-wheel' | 'grid' | 'more' | 'none'
  >('none');
  const [isTimerPanelOpen, setIsTimerPanelOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isMoreShapesOpen, setIsMoreShapesOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [isMinimapOpen, setIsMinimapOpen] = useState(false);
  const [spotlightMode, setSpotlightMode] = useState(false);
  const [isLaserActive, setIsLaserActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      // Delete selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementIds.length > 0) {
          e.preventDefault();
          selectedElementIds.forEach((id) => deleteElement(id));
        }
        return;
      }

      // Quick Tool Keys
      switch (e.key.toLowerCase()) {
        case 'v':
          setTool('select');
          setActivePopover('none');
          break;
        case 'h':
          setTool('hand');
          setActivePopover('none');
          break;
        case 'p':
          setTool('pen');
          setActivePopover('pen');
          break;
        case 's':
          setTool('sticky');
          setActivePopover('none');
          break;
        case 't':
          setTool('text');
          setActivePopover('none');
          break;
        case 'c':
          setTool('comment');
          setActivePopover('none');
          break;
        case 'l':
          setTool((prev) => (prev === 'laser' ? 'select' : 'laser'));
          setActivePopover('none');
          break;
        case 'm':
          setIsMinimapOpen((prev) => !prev);
          break;
        case 'f':
          setTool('frame');
          setActivePopover('none');
          break;
        case 'r':
          setTool('shape');
          setSelectedShape('rect');
          setShapePickerActiveType('shape');
          break;
        case 'o':
          setTool('shape');
          setSelectedShape('circle');
          setShapePickerActiveType('shape');
          break;
        case 'escape':
          setActivePopover('none');
          selectElement(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementIds, undo, redo, deleteElement, selectElement]);

  // Quick Add Sticky Note (Button in toolbar)
  const handleQuickAddSticky = useCallback(() => {
    const centerCanvasX = (window.innerWidth / 2 - pan.x) / zoom;
    const centerCanvasY = (window.innerHeight / 2 - pan.y) / zoom;
    const newSticky: CanvasElement = {
      id: `sticky-${Date.now()}`,
      type: 'sticky',
      x: centerCanvasX - 90,
      y: centerCanvasY - 90,
      width: 180,
      height: 180,
      color: 'yellow',
      text: '',
      rotation: (Math.random() - 0.5) * 4,
      zIndex: elements.length + 1,
    };
    addElement(newSticky);
    selectElement(newSticky.id);
    setTool('select');
  }, [addElement, selectElement, setTool, pan, zoom, elements.length]);

  // Quick Add Table (Clean editable table without mock data)
  const handleQuickAddTable = useCallback(() => {
    const centerCanvasX = (window.innerWidth / 2 - pan.x) / zoom;
    const centerCanvasY = (window.innerHeight / 2 - pan.y) / zoom;
    const newTable: CanvasElement = {
      id: `table-${Date.now()}`,
      type: 'table',
      x: centerCanvasX - 190,
      y: centerCanvasY - 90,
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
    addElement(newTable);
    selectElement(newTable.id);
    setTool('select');
  }, [addElement, selectElement, setTool, pan, zoom, elements.length]);

  // Insert Templates
  const handleInsertTemplate = useCallback(
    (templateType: 'kanban' | 'mindmap' | 'retro' | 'swot' | 'funnel') => {
      const centerX = (window.innerWidth / 2 - pan.x) / zoom;
      const centerY = (window.innerHeight / 2 - pan.y) / zoom;

      if (templateType === 'kanban') {
        // 3 Kanban columns
        const cols = ['TO DO', 'IN PROGRESS', 'COMPLETED'];
        const colors = ['#fef08a', '#bae6fd', '#bbf7d0'];
        cols.forEach((colName, idx) => {
          const colX = centerX - 300 + idx * 220;
          // Column Header Box
          addElement({
            id: `k-col-${Date.now()}-${idx}`,
            type: 'shape',
            shapeKind: 'rounded-rect',
            x: colX,
            y: centerY - 160,
            width: 200,
            height: 340,
            fillColor: '#f8fafc',
            strokeColor: '#cbd5e1',
            strokeWidth: 2,
            text: colName,
            fontSize: 14,
            zIndex: elements.length + idx,
          });
          // Sticky card inside column
          addElement({
            id: `k-card-${Date.now()}-${idx}`,
            type: 'sticky',
            x: colX + 15,
            y: centerY - 90,
            width: 170,
            height: 120,
            color: colors[idx],
            text: `Card for ${colName}`,
            rotation: (Math.random() - 0.5) * 3,
            zIndex: elements.length + 10 + idx,
          });
        });
      } else if (templateType === 'mindmap') {
        // Central Node
        const centralId = `mindmap-center-${Date.now()}`;
        addElement({
          id: centralId,
          type: 'shape',
          shapeKind: 'pill',
          x: centerX - 80,
          y: centerY - 25,
          width: 160,
          height: 50,
          fillColor: '#ede9fe',
          strokeColor: '#8b5cf6',
          strokeWidth: 2.5,
          text: 'Core Objective',
          fontSize: 15,
          zIndex: elements.length + 1,
        });

        // 3 Branch Nodes
        const branches = ['Strategy', 'Execution', 'Metrics'];
        branches.forEach((branch, i) => {
          const angle = (i * 2 * Math.PI) / branches.length;
          const branchX = centerX + 180 * Math.cos(angle) - 60;
          const branchY = centerY + 140 * Math.sin(angle) - 20;

          addElement({
            id: `branch-${Date.now()}-${i}`,
            type: 'shape',
            shapeKind: 'rounded-rect',
            x: branchX,
            y: branchY,
            width: 120,
            height: 40,
            fillColor: '#ffffff',
            strokeColor: '#a78bfa',
            strokeWidth: 2,
            text: branch,
            fontSize: 13,
            zIndex: elements.length + 2 + i,
          });

          // Connecting line
          addElement({
            id: `branch-conn-${Date.now()}-${i}`,
            type: 'connector',
            connectorKind: 'curved',
            x: Math.min(centerX, branchX + 60),
            y: Math.min(centerY, branchY + 20),
            width: Math.abs(centerX - (branchX + 60)),
            height: Math.abs(centerY - (branchY + 20)),
            points: [
              [centerX, centerY],
              [branchX + 60, branchY + 20],
            ],
            strokeColor: '#c4b5fd',
            strokeWidth: 2,
            zIndex: elements.length + 10 + i,
          });
        });
      } else if (templateType === 'retro') {
        const sections = [
          { title: 'What Went Well 🚀', color: '#bbf7d0', x: centerX - 260 },
          { title: 'To Improve ⚠️', color: '#fef08a', x: centerX - 40 },
          { title: 'Action Items ✅', color: '#bae6fd', x: centerX + 180 },
        ];
        sections.forEach((sec, idx) => {
          addElement({
            id: `retro-bg-${Date.now()}-${idx}`,
            type: 'shape',
            shapeKind: 'rounded-rect',
            x: sec.x,
            y: centerY - 140,
            width: 200,
            height: 300,
            fillColor: '#ffffff',
            strokeColor: '#e2e8f0',
            strokeWidth: 2,
            text: sec.title,
            fontSize: 14,
            zIndex: elements.length + idx,
          });
          addElement({
            id: `retro-note-${Date.now()}-${idx}`,
            type: 'sticky',
            x: sec.x + 20,
            y: centerY - 70,
            width: 160,
            height: 120,
            color: sec.color,
            text: 'Add reflection note...',
            rotation: (Math.random() - 0.5) * 2,
            zIndex: elements.length + 10 + idx,
          });
        });
      } else if (templateType === 'swot') {
        const quadrants = [
          { title: 'Strengths 💪', color: '#bbf7d0', x: centerX - 210, y: centerY - 150 },
          { title: 'Weaknesses 🔍', color: '#fef08a', x: centerX + 10, y: centerY - 150 },
          { title: 'Opportunities 🚀', color: '#bae6fd', x: centerX - 210, y: centerY + 30 },
          { title: 'Threats 🛡️', color: '#fbcfe8', x: centerX + 10, y: centerY + 30 },
        ];
        quadrants.forEach((q, idx) => {
          addElement({
            id: `swot-card-${Date.now()}-${idx}`,
            type: 'shape',
            shapeKind: 'rounded-rect',
            x: q.x,
            y: q.y,
            width: 200,
            height: 160,
            fillColor: '#ffffff',
            strokeColor: '#cbd5e1',
            strokeWidth: 2,
            text: q.title,
            fontSize: 13,
            zIndex: elements.length + idx,
          });
          addElement({
            id: `swot-note-${Date.now()}-${idx}`,
            type: 'sticky',
            x: q.x + 20,
            y: q.y + 40,
            width: 160,
            height: 100,
            color: q.color,
            text: `Note for ${q.title}...`,
            zIndex: elements.length + 10 + idx,
          });
        });
      }
    },
    [addElement, pan, zoom, elements.length]
  );

  // Creative Hub: Insert Frames / Artboards
  const handleInsertFrame = useCallback(
    (frameType: 'desktop' | 'mobile' | 'square' | 'sprint') => {
      const centerCanvasX = (window.innerWidth / 2 - pan.x) / zoom;
      const centerCanvasY = (window.innerHeight / 2 - pan.y) / zoom;

      const dims = {
        desktop: { w: 1200, h: 750, title: 'Desktop Screen 1440' },
        mobile: { w: 380, h: 680, title: 'Mobile View 390' },
        sprint: { w: 800, h: 500, title: 'Sprint 1 Section' },
        square: { w: 600, h: 600, title: 'Moodboard Artboard' },
      }[frameType] || { w: 800, h: 500, title: 'Frame' };

      const newFrame: CanvasElement = {
        id: `frame-${Date.now()}`,
        type: 'frame',
        title: dims.title,
        x: Math.round(centerCanvasX - dims.w / 2),
        y: Math.round(centerCanvasY - dims.h / 2),
        width: dims.w,
        height: dims.h,
        strokeColor: '#8b5cf6',
        zIndex: 1,
      };
      addElement(newFrame);
      selectElement(newFrame.id);
      setTool('select');
    },
    [addElement, selectElement, pan, zoom]
  );

  // Creative Hub: Insert Interactive Code Cards
  const handleInsertCodeCard = useCallback(
    (language: string) => {
      const centerCanvasX = (window.innerWidth / 2 - pan.x) / zoom;
      const centerCanvasY = (window.innerHeight / 2 - pan.y) / zoom;

      const defaultSnippets: Record<string, string> = {
        typescript: `// TypeScript Interface\ninterface PipelineConfig {\n  endpoint: string;\n  retryAttempts: number;\n  timeoutMs: number;\n  enableLogging: boolean;\n}\n\nexport const execute = async (cfg: PipelineConfig) => {\n  console.log("Starting pipeline:", cfg.endpoint);\n};`,
        python: `# Python API Handler\nimport asyncio\n\nasync def process_batch(items: list[dict]) -> dict:\n    results = [item["id"] for item in items if item.get("valid")]\n    return {"processed": len(results), "ids": results}`,
        javascript: `// Modern Async Pipeline\nexport async function fetchMetrics(boardId) {\n  const res = await fetch(\`/api/metrics/\${boardId}\`);\n  const { nodes, throughput } = await res.json();\n  return { count: nodes.length, throughput };\n}`,
        sql: `-- Transactional Query\nSELECT \n  user_id,\n  COUNT(action_id) as total_events,\n  MAX(created_at) as last_seen\nFROM events_stream\nGROUP BY user_id\nHAVING COUNT(action_id) > 10;`,
        html: `<!-- Canvas Widget Component -->\n<div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl">\n  <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />\n  <span className="font-semibold text-xs">Live Active Session</span>\n</div>`,
        css: `/* Modern Frosted Glass Aesthetic */\n.glass-panel {\n  background: rgba(255, 255, 255, 0.85);\n  backdrop-filter: blur(16px);\n  border: 1px solid rgba(226, 232, 240, 0.8);\n  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);\n}`,
      };

      const newCode: CanvasElement = {
        id: `code-${Date.now()}`,
        type: 'code',
        title: `${language.toUpperCase()} Snippet`,
        language,
        code: defaultSnippets[language] || `// ${language} code block`,
        x: Math.round(centerCanvasX - 190),
        y: Math.round(centerCanvasY - 110),
        width: 380,
        height: 220,
        zIndex: elements.length + 1,
      };
      addElement(newCode);
      selectElement(newCode.id);
      setTool('select');
    },
    [addElement, selectElement, pan, zoom, elements.length]
  );

  // Creative Hub: Insert Vector Stickers & Status Badges
  const handleInsertSticker = useCallback(
    (label: string, emoji: string, bg: string, color: string) => {
      const centerCanvasX = (window.innerWidth / 2 - pan.x) / zoom;
      const centerCanvasY = (window.innerHeight / 2 - pan.y) / zoom;

      const newSticker: CanvasElement = {
        id: `sticker-${Date.now()}`,
        type: 'stamp',
        stampKind: 'circle-badge',
        badgeLabel: label,
        badgeBg: bg,
        badgeColor: color,
        emoji,
        x: Math.round(centerCanvasX - 70),
        y: Math.round(centerCanvasY - 20),
        width: 140,
        height: 40,
        zIndex: elements.length + 2,
      };
      addElement(newSticker);
      selectElement(newSticker.id);
      setTool('select');
    },
    [addElement, selectElement, pan, zoom, elements.length]
  );

  // Creative Hub: AI & Smart Diagram Generation
  const handleGenerateAiDiagram = useCallback(
    async (promptText: string) => {
      try {
        const res = await fetch('/api/ai/generate-diagram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptText }),
        });
        const data = await res.json();
        if (!data || !data.nodes) return;

        const centerCanvasX = (window.innerWidth / 2 - pan.x) / zoom;
        const centerCanvasY = (window.innerHeight / 2 - pan.y) / zoom;

        const nodes = data.nodes || [];
        const connections = data.connections || [];
        const notes = data.stickyNotes || [];

        const nodeSpacingX = 220;
        const totalW = nodes.length * nodeSpacingX;
        const startX = centerCanvasX - totalW / 2;

        const idMap = new Map<string, string>();
        const nodeCoords = new Map<string, { x: number; y: number; w: number; h: number }>();

        // 1. Boundary Frame
        const frameId = `frame-${Date.now()}`;
        const frameW = Math.max(totalW + 160, 800);
        const frameH = 460;
        const frameX = Math.round(startX - 80);
        const frameY = Math.round(centerCanvasY - 180);

        addElement({
          id: frameId,
          type: 'frame',
          title: data.title || promptText,
          x: frameX,
          y: frameY,
          width: frameW,
          height: frameH,
          strokeColor: '#8b5cf6',
          zIndex: elements.length + 1,
        });

        // 2. Nodes
        const colorPalette: Record<string, { fill: string; stroke: string }> = {
          purple: { fill: '#f5f3ff', stroke: '#8b5cf6' },
          blue: { fill: '#eff6ff', stroke: '#3b82f6' },
          emerald: { fill: '#ecfdf5', stroke: '#10b981' },
          amber: { fill: '#fffbeb', stroke: '#f59e0b' },
          rose: { fill: '#fff1f2', stroke: '#f43f5e' },
        };

        nodes.forEach((n: any, idx: number) => {
          const actualId = `ai-node-${Date.now()}-${idx}`;
          idMap.set(n.id, actualId);

          const colorScheme = colorPalette[n.colorTheme] || colorPalette.purple;
          const nx = Math.round(startX + idx * nodeSpacingX);
          const ny = Math.round(centerCanvasY - 30);
          const nw = 150;
          const nh = 65;

          nodeCoords.set(actualId, { x: nx, y: ny, w: nw, h: nh });

          addElement({
            id: actualId,
            type: 'shape',
            shapeKind: (n.shapeKind || 'rounded-rect') as any,
            x: nx,
            y: ny,
            width: nw,
            height: nh,
            fillColor: colorScheme.fill,
            strokeColor: colorScheme.stroke,
            strokeWidth: 2,
            text: n.text,
            fontSize: 13,
            bold: true,
            zIndex: elements.length + 10 + idx,
          });
        });

        // 3. Connectors
        connections.forEach((c: any, idx: number) => {
          const fromActual = idMap.get(c.from);
          const toActual = idMap.get(c.to);
          if (fromActual && toActual) {
            const fromBox = nodeCoords.get(fromActual);
            const toBox = nodeCoords.get(toActual);
            if (fromBox && toBox) {
              const p1: [number, number] = [fromBox.x + fromBox.w, fromBox.y + fromBox.h / 2];
              const p2: [number, number] = [toBox.x, toBox.y + toBox.h / 2];

              addElement({
                id: `ai-conn-${Date.now()}-${idx}`,
                type: 'connector',
                connectorKind: (c.kind || 'arrow') as any,
                fromId: fromActual,
                toId: toActual,
                fromSide: 'right',
                toSide: 'left',
                x: p1[0],
                y: p1[1],
                endX: p2[0],
                endY: p2[1],
                points: [p1, p2],
                strokeColor: '#64748b',
                strokeWidth: 2,
                text: c.label || '',
                zIndex: elements.length + 50 + idx,
              });
            }
          }
        });

        // 4. Sticky reflections
        notes.forEach((note: any, idx: number) => {
          addElement({
            id: `ai-note-${Date.now()}-${idx}`,
            type: 'sticky',
            color: note.color || 'yellow',
            text: note.text,
            x: Math.round(startX + idx * 260 + 20),
            y: Math.round(centerCanvasY + 100),
            width: 170,
            height: 120,
            rotation: (Math.random() - 0.5) * 3,
            zIndex: elements.length + 80 + idx,
          });
        });

        soundEngine.playPop();
      } catch (err) {
        console.error('Failed to generate AI diagram:', err);
      }
    },
    [addElement, pan, zoom, elements.length]
  );

  // File picker handler for images
  const handleTriggerImageUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const url = evt.target?.result as string;
          const img = new Image();
          img.onload = () => {
            const maxDim = 420;
            let w = img.naturalWidth || 320;
            let h = img.naturalHeight || 240;
            if (w > maxDim || h > maxDim) {
              const ratio = Math.min(maxDim / w, maxDim / h);
              w = Math.round(w * ratio);
              h = Math.round(h * ratio);
            }
            const centerCanvasX = (window.innerWidth / 2 - pan.x) / zoom;
            const centerCanvasY = (window.innerHeight / 2 - pan.y) / zoom;
            const newImg: CanvasElement = {
              id: `img-${Date.now()}`,
              type: 'image',
              x: Math.round(centerCanvasX - w / 2),
              y: Math.round(centerCanvasY - h / 2),
              width: w,
              height: h,
              url,
              zIndex: elements.length + 1,
            };
            soundEngine.playPop();
            addElement(newImg);
            selectElement(newImg.id);
          };
          img.src = url;
        };
        reader.readAsDataURL(file);
      }
      e.target.value = '';
    },
    [pan, zoom, elements.length, addElement, selectElement]
  );

  // Navigate Camera to a Box (Presentation Slide transition)
  const handleNavigateToBox = useCallback(
    (x: number, y: number, width: number, height: number) => {
      const pad = 100;
      const availW = window.innerWidth - pad * 2;
      const availH = window.innerHeight - pad * 2;

      const targetZoom = Math.min(availW / width, availH / height, 1.6);
      const centerX = x + width / 2;
      const centerY = y + height / 2;

      const targetPanX = window.innerWidth / 2 - centerX * targetZoom;
      const targetPanY = window.innerHeight / 2 - centerY * targetZoom;

      setZoom(targetZoom);
      setPan({ x: targetPanX, y: targetPanY });
    },
    [setZoom, setPan]
  );

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-50 font-sans select-none">
      {/* 1. TOP-LEFT FLOATING WORKSPACE CONTROL (Screenshots 5 & 6) */}
      <TopLeftControl
        boardTitle={boardTitle}
        onRename={updateBoardTitle}
        onDuplicate={duplicateBoard}
        onNewBoard={newBoard}
        onExport={exportBoard}
        onClear={clearBoard}
        onOpenHelp={() => setIsHelpModalOpen(true)}
      />

      {/* 2. TOP-RIGHT FLOATING CONTROLS (Screenshots 5 & 6) */}
      <TopRightControl
        currentUser={currentUser}
        remoteUsers={remoteUsers}
        timerRemainingSec={timerRemainingSec}
        isTimerRunning={isTimerRunning}
        isPlayingAudio={isPlayingAudio}
        isTimerPanelOpen={isTimerPanelOpen}
        onToggleTimerPanel={() => setIsTimerPanelOpen(!isTimerPanelOpen)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        gridConfig={gridConfig}
        onToggleGrid={() =>
          setGridConfig({
            type:
              gridConfig.type === 'dots'
                ? 'lines'
                : gridConfig.type === 'lines'
                ? 'blank'
                : 'dots',
          })
        }
        onStartPresentation={() => setIsPresentationOpen(true)}
        isPhysicsActive={isPhysicsActive}
        isPhysicsPanelOpen={isPhysicsPanelOpen}
        onTogglePhysicsPanel={() => setIsPhysicsPanelOpen(!isPhysicsPanelOpen)}
      />

      {/* Physics Sandbox Control Panel */}
      <PhysicsPanel
        isOpen={isPhysicsPanelOpen}
        onClose={() => setIsPhysicsPanelOpen(false)}
        isPhysicsActive={isPhysicsActive}
        onTogglePhysics={togglePhysics}
        gravityPreset={gravityPreset}
        onSelectGravityPreset={setGravityPreset}
        frictionPreset={frictionPreset}
        onSelectFrictionPreset={setFrictionPreset}
        onSelectMomentumDecay={setMomentumDecay}
        physicsConfig={physicsConfig}
        onSelectBounciness={setBounciness}
        onToggleFloorBarrier={toggleFloorBarrier}
        onToggleMagnet={toggleMagnet}
        onShakeBoard={shakeBoard}
        onSettleAndFreeze={settleAndFreeze}
      />

      {/* 3. FLOATING TIMER, MUSIC, AND VOTING PANEL (Screenshot 5) */}
      <TimerMusicVotingPanel
        isOpen={isTimerPanelOpen}
        onClose={() => setIsTimerPanelOpen(false)}
        isPlayingAudio={isPlayingAudio}
        audioVolume={audioVolume}
        audioCategory={audioCategory}
        isAudioMuted={isAudioMuted}
        onToggleAudio={toggleAudio}
        onChangeAudioCategory={setAudioCategory}
        onChangeAudioVolume={setAudioVolume}
        onToggleMute={toggleAudioMute}
        timerRemainingSec={timerRemainingSec}
        isTimerRunning={isTimerRunning}
        onToggleTimer={toggleTimer}
        onAddOneMinute={addOneMinuteToTimer}
        onResetTimer={resetTimer}
        activeVote={activeVote}
        currentUser={currentUser}
        onCastVote={castVote}
        onCreateVote={createVote}
        onEndVote={endVote}
      />

      {/* 4. INFINITE WHITEBOARD CANVAS */}
      <Canvas
        elements={elements}
        selectedElementIds={selectedElementIds}
        currentTool={tool}
        penSubTool={penSubTool}
        strokeWidth={strokeWidth}
        strokeColor={strokeColor}
        washiPattern={washiPattern}
        selectedShape={selectedShape}
        selectedConnector={selectedConnector}
        selectedStamp={selectedStamp}
        stampEmoji={stampEmoji}
        gridConfig={gridConfig}
        zoom={zoom}
        pan={pan}
        currentUser={currentUser}
        remoteUsers={remoteUsers}
        onSelectElement={selectElement}
        onSelectElements={selectElements}
        onAddElement={addElement}
        onUpdateElement={updateElement}
        onBatchUpdateElements={batchUpdateElements}
        onDeleteElement={deleteElement}
        onDeleteElements={deleteElements}
        onDuplicateElements={duplicateElements}
        onPanChange={setPan}
        onZoomChange={setZoom}
        onCursorMove={updateCursor}
        onToolChange={setTool}
        spotlightMode={spotlightMode}
        isLaserActive={tool === 'laser' || isLaserActive}
        isPhysicsActive={isPhysicsActive}
        onStartPhysicsDrag={handleStartPhysicsDrag}
        onMovePhysicsDrag={handleMovePhysicsDrag}
        onEndPhysicsDrag={handleEndPhysicsDrag}
        onApplyAttraction={handleApplyAttraction}
      />

      {/* 5. CONTEXTUAL TOOL POPOVERS (Floating directly above toolbar) */}

      {/* Pen Options Popover (Screenshots 2 & 3) */}
      {activePopover === 'pen' && (
        <PenPopover
          penSubTool={penSubTool}
          onSelectSubTool={(sub) => {
            setPenSubTool(sub);
            setTool('pen');
          }}
          strokeWidth={strokeWidth}
          onSelectStrokeWidth={setStrokeWidth}
          strokeColor={strokeColor}
          onSelectColor={setStrokeColor}
          washiPattern={washiPattern}
          onSelectPattern={setWashiPattern}
        />
      )}

      {/* Shape Picker Popover (Screenshot 1) */}
      {activePopover === 'shapes' && (
        <ShapePickerPopover
          selectedShape={selectedShape}
          onSelectShape={(shape) => {
            setSelectedShape(shape);
            setTool('shape');
          }}
          selectedConnector={selectedConnector}
          onSelectConnector={(conn) => {
            setSelectedConnector(conn);
            setTool('connector');
          }}
          onOpenMoreShapes={() => {
            setIsMoreShapesOpen(true);
            setActivePopover('none');
          }}
          activeType={shapePickerActiveType}
          setActiveType={(type) => {
            setShapePickerActiveType(type);
            setTool(type);
          }}
        />
      )}

      {/* Circular Reaction Wheel (Screenshot 4) */}
      <ReactionWheel
        isOpen={activePopover === 'reaction-wheel'}
        onClose={() => setActivePopover('none')}
        onSelectStamp={(kind, emoji) => {
          setSelectedStamp(kind);
          if (emoji) setStampEmoji(emoji);
          setTool('stamp');
        }}
        selectedStamp={selectedStamp}
      />

      {/* Grid Settings Popover */}
      {activePopover === 'grid' && (
        <GridPopover
          gridConfig={gridConfig}
          onChangeGrid={setGridConfig}
          onClose={() => setActivePopover('none')}
        />
      )}

      {/* Creative Studio & AI Templates Popover */}
      {activePopover === 'more' && (
        <CreativeHubPopover
          onInsertTemplate={handleInsertTemplate}
          onInsertFrame={handleInsertFrame}
          onInsertCodeCard={handleInsertCodeCard}
          onInsertSticker={handleInsertSticker}
          onGenerateAiDiagram={handleGenerateAiDiagram}
          onTriggerImageUpload={handleTriggerImageUpload}
          onClose={() => setActivePopover('none')}
        />
      )}

      {/* 6. PRIMARY BOTTOM TOOLBAR */}
      <BottomToolbar
        tool={tool}
        onSelectTool={(t) => {
          setTool(t);
          if (t === 'shape') setShapePickerActiveType('shape');
          if (t === 'connector') setShapePickerActiveType('connector');
        }}
        penSubTool={penSubTool}
        washiPattern={washiPattern}
        activePopover={activePopover}
        onTogglePopover={setActivePopover}
        onQuickAddTable={handleQuickAddTable}
        onQuickAddSticky={handleQuickAddSticky}
      />

      {/* 7. BOTTOM-RIGHT ZOOM & SHORTCUT CONTROLS */}
      <BottomRightControls
        zoom={zoom}
        onZoomIn={() => setZoom(Math.min(zoom * 1.15, 3))}
        onZoomOut={() => setZoom(Math.max(zoom * 0.85, 0.2))}
        onResetZoom={() => setZoom(1)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        isMinimapOpen={isMinimapOpen}
        onToggleMinimap={() => setIsMinimapOpen(!isMinimapOpen)}
      />

      {/* 8. RADAR MINIMAP */}
      <MinimapRadar
        elements={elements}
        zoom={zoom}
        pan={pan}
        onNavigatePan={setPan}
        isOpen={isMinimapOpen}
        onToggle={() => setIsMinimapOpen(!isMinimapOpen)}
      />

      {/* 9. PRESENTATION SLIDESHOW MODE */}
      <PresentationModeOverlay
        isOpen={isPresentationOpen}
        elements={elements}
        onClose={() => setIsPresentationOpen(false)}
        onNavigateToBox={handleNavigateToBox}
        spotlightMode={spotlightMode}
        onToggleSpotlight={() => setSpotlightMode(!spotlightMode)}
        isLaserActive={tool === 'laser' || isLaserActive}
        onToggleLaser={() => {
          setIsLaserActive((prev) => !prev);
          setTool((prev) => (prev === 'laser' ? 'select' : 'laser'));
        }}
      />

      {/* Hidden File Input for Image Uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* 10. MODALS */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        boardTitle={boardTitle}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <MoreShapesModal
        isOpen={isMoreShapesOpen}
        onClose={() => setIsMoreShapesOpen(false)}
        onSelectShape={(shape) => {
          setSelectedShape(shape);
          setShapePickerActiveType('shape');
          setTool('shape');
        }}
      />
    </div>
  );
}
