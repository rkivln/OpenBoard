import React, { useState, useEffect, useCallback } from 'react';
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
import { AddToolsPopover } from './components/toolbar/popovers/AddToolsPopover.tsx';
import { BottomRightControls } from './components/footer/BottomRightControls.tsx';
import { Canvas } from './components/canvas/Canvas.tsx';
import { ShareModal } from './components/modals/ShareModal.tsx';
import { HelpModal } from './components/modals/HelpModal.tsx';
import { MoreShapesModal } from './components/modals/MoreShapesModal.tsx';

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
    (templateType: 'kanban' | 'mindmap' | 'retro') => {
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
      }
    },
    [addElement, pan, zoom, elements.length]
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

      {/* Add / Templates Popover */}
      {activePopover === 'more' && (
        <AddToolsPopover
          onInsertTemplate={handleInsertTemplate}
          onClose={() => setActivePopover('none')}
        />
      )}

      {/* 6. PRIMARY BOTTOM TOOLBAR (Screenshots 1, 2, 3, 4, 6) */}
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

      {/* 7. BOTTOM-RIGHT ZOOM & SHORTCUT CONTROLS (Screenshots 5 & 6) */}
      <BottomRightControls
        zoom={zoom}
        onZoomIn={() => setZoom(Math.min(zoom * 1.15, 3))}
        onZoomOut={() => setZoom(Math.max(zoom * 0.85, 0.2))}
        onResetZoom={() => setZoom(1)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
      />

      {/* 8. MODALS */}
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
