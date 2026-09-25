import { useState, useEffect, useRef, useCallback } from 'react';
import {
  CanvasElement,
  ToolType,
  PenSubTool,
  ShapeKind,
  ConnectorKind,
  WashiPattern,
  StampKind,
  StickyColor,
  UserPresence,
  ActiveVote,
  GridConfig,
} from '../types.ts';
import { soundEngine } from '../utils/audio.ts';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'openboard_canvas_v2';

export function useBoardState() {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tool, setTool] = useState<ToolType>('select');
  const [penSubTool, setPenSubTool] = useState<PenSubTool>('pencil');
  const [strokeColor, setStrokeColor] = useState<string>('#1e293b');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [washiPattern, setWashiPattern] = useState<WashiPattern>('purple-grid');
  const [selectedShape, setSelectedShape] = useState<ShapeKind>('circle');
  const [selectedConnector, setSelectedConnector] = useState<ConnectorKind>('arrow');
  const [selectedStickyColor, setSelectedStickyColor] = useState<StickyColor>('yellow');
  const [selectedStamp, setSelectedStamp] = useState<StampKind>('star');

  const [activePopover, setActivePopover] = useState<'pen' | 'shapes' | 'reaction-wheel' | 'grid' | 'more' | 'none'>('none');
  const [isMoreShapesOpen, setIsMoreShapesOpen] = useState<boolean>(false);
  const [isTimerPanelOpen, setIsTimerPanelOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);

  const [boardTitle, setBoardTitle] = useState<string>('Untitled');
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1.0);

  const [gridConfig, setGridConfigState] = useState<GridConfig>({
    type: 'dots',
    size: 24,
    opacity: 0.6,
    dotColor: '#cbd5e1',
    bgColor: '#ffffff',
  });

  const setGridConfig = useCallback((partial: Partial<GridConfig>) => {
    setGridConfigState((prev) => ({ ...prev, ...partial }));
  }, []);

  // User presence & collaboration
  const [currentUser] = useState<UserPresence>(() => {
    const names = ['Gokulan', 'Alex', 'Taylor', 'Sam', 'Jordan'];
    const colors = ['#8b5cf6', '#3b82f6', '#ec4899', '#10b981', '#f59e0b'];
    const idx = Math.floor(Math.random() * names.length);
    return {
      id: 'user-' + Math.random().toString(36).substring(2, 9),
      name: names[0], // primary user 'Gokulan'
      avatar: 'G',
      color: colors[0],
      lastSeen: Date.now(),
    };
  });

  const [remoteUsers, setRemoteUsers] = useState<UserPresence[]>([]);
  const [activeVote, setActiveVote] = useState<ActiveVote | null>(null);

  // Audio state
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioVolume, setAudioVolume] = useState<number>(0.7);
  const [audioCategory, setAudioCategory] = useState<string>('Acoustic ambient');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

  // Timer state
  const [timerTotalSec, setTimerTotalSec] = useState<number>(180); // 3 minutes default
  const [timerRemainingSec, setTimerRemainingSec] = useState<number>(180);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const isRemoteSyncRef = useRef<boolean>(false);
  const elementsRef = useRef<CanvasElement[]>(elements);
  elementsRef.current = elements;
  const historyIndexRef = useRef<number>(historyIndex);
  historyIndexRef.current = historyIndex;
  const boardTitleRef = useRef<string>(boardTitle);
  boardTitleRef.current = boardTitle;

  // Save to localStorage & push history without nested setState in updaters
  const commitElements = useCallback(
    (updater: CanvasElement[] | ((prev: CanvasElement[]) => CanvasElement[]), skipHistory: boolean = false) => {
      const current = elementsRef.current;
      const next = typeof updater === 'function' ? updater(current) : updater;

      setElements(next);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ elements: next, title: boardTitleRef.current }));
      } catch (e) {
        // ignore quota error
      }

      if (!skipHistory) {
        setHistory((prev) => {
          const trimmed = prev.slice(0, historyIndexRef.current + 1);
          return [...trimmed, next];
        });
        setHistoryIndex((prev) => prev + 1);
      }
    },
    []
  );

  // Connect WebSocket for real-time collaboration
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: number;

    function connect() {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          ws?.send(
            JSON.stringify({
              type: 'join',
              boardId: 'main',
              user: currentUser,
            })
          );
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            isRemoteSyncRef.current = true;

            switch (data.type) {
              case 'init': {
                if (data.elements && Array.isArray(data.elements)) {
                  setElements(data.elements);
                  setHistory([data.elements]);
                  setHistoryIndex(0);
                }
                if (data.title) setBoardTitle(data.title);
                if (data.activeVote) setActiveVote(data.activeVote);
                if (data.users) {
                  setRemoteUsers(data.users.filter((u: UserPresence) => u.id !== currentUser.id));
                }
                break;
              }

              case 'cursor:moved': {
                setRemoteUsers((prev) =>
                  prev.map((u) => (u.id === data.userId ? { ...u, cursor: data.cursor, lastSeen: Date.now() } : u))
                );
                break;
              }

              case 'user:joined': {
                if (data.user && data.user.id !== currentUser.id) {
                  setRemoteUsers((prev) => {
                    if (prev.some((u) => u.id === data.user.id)) return prev;
                    return [...prev, data.user];
                  });
                }
                break;
              }

              case 'user:left': {
                setRemoteUsers((prev) => prev.filter((u) => u.id !== data.userId));
                break;
              }

              case 'element:upserted': {
                setElements((prev) => {
                  const idx = prev.findIndex((e) => e.id === data.element.id);
                  if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = data.element;
                    return next;
                  }
                  return [...prev, data.element];
                });
                break;
              }

              case 'element:deleted': {
                setElements((prev) => prev.filter((e) => e.id !== data.id));
                break;
              }

              case 'elements:batched': {
                if (Array.isArray(data.elements)) {
                  setElements(data.elements);
                }
                break;
              }

              case 'vote:updated': {
                setActiveVote(data.vote);
                break;
              }

              case 'board:renamed': {
                setBoardTitle(data.title);
                break;
              }
            }
          } catch (err) {
            console.error('WS message error', err);
          } finally {
            isRemoteSyncRef.current = false;
          }
        };

        ws.onclose = () => {
          reconnectTimeout = window.setTimeout(connect, 3000);
        };
      } catch (e) {
        console.warn('WebSocket connection not available; using local state');
      }
    }

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [currentUser]);

  // Load from local storage or server initial fetch
  useEffect(() => {
    try {
      localStorage.removeItem('openboard_state_v1');
    } catch {
      // ignore
    }

    fetch('/api/board/main')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.elements)) {
          setElements(data.elements);
          setHistory([data.elements]);
          setHistoryIndex(0);
          if (data.title) setBoardTitle(data.title);
          if (data.activeVote !== undefined) setActiveVote(data.activeVote);
        } else {
          // fallback to localStorage
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (parsed.elements && Array.isArray(parsed.elements)) {
                setElements(parsed.elements);
                setHistory([parsed.elements]);
                setHistoryIndex(0);
              }
              if (parsed.title) setBoardTitle(parsed.title);
            } catch (e) {
              // ignore
            }
          }
        }
      })
      .catch(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.elements && Array.isArray(parsed.elements)) {
              setElements(parsed.elements);
              setHistory([parsed.elements]);
              setHistoryIndex(0);
            }
          } catch (e) {
            // ignore
          }
        }
      });
  }, []);

  // Timer countdown loop
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = window.setInterval(() => {
      setTimerRemainingSec((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          soundEngine.playTimerChime();
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.2, x: 0.85 },
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // WebSocket broadcast helpers
  const sendWs = useCallback((msg: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  // Public Actions
  const addElement = useCallback(
    (el: CanvasElement) => {
      commitElements((prev) => [...prev, el]);
      sendWs({ type: 'element:upsert', element: el });
    },
    [commitElements, sendWs]
  );

  const updateElement = useCallback(
    (id: string, partial: Partial<CanvasElement>) => {
      commitElements((prev) =>
        prev.map((el) => {
          if (el.id === id) {
            const updated = { ...el, ...partial, updatedAt: Date.now() } as CanvasElement;
            sendWs({ type: 'element:upsert', element: updated });
            return updated;
          }
          return el;
        })
      );
    },
    [commitElements, sendWs]
  );

  const batchUpdateElements = useCallback(
    (updates: { id: string; partial: Partial<CanvasElement> }[]) => {
      if (updates.length === 0) return;
      const map = new Map(updates.map((u) => [u.id, u.partial]));
      commitElements((prev) =>
        prev.map((el) => {
          const patch = map.get(el.id);
          if (patch) {
            const updated = { ...el, ...patch, updatedAt: Date.now() } as CanvasElement;
            sendWs({ type: 'element:upsert', element: updated });
            return updated;
          }
          return el;
        })
      );
    },
    [commitElements, sendWs]
  );

  // Fast direct state update for 60fps physics loop without bloating undo history
  const updateElementsLive = useCallback((newElements: CanvasElement[]) => {
    setElements(newElements);
    elementsRef.current = newElements;
  }, []);

  const commitLiveElements = useCallback(() => {
    commitElements(elementsRef.current);
    sendWs({ type: 'elements:batch', elements: elementsRef.current });
  }, [commitElements, sendWs]);

  const deleteElements = useCallback(
    (ids: string[]) => {
      commitElements((prev) => prev.filter((el) => !ids.includes(el.id)));
      ids.forEach((id) => sendWs({ type: 'element:delete', id }));
      setSelectedIds([]);
    },
    [commitElements, sendWs]
  );

  const duplicateElements = useCallback(
    (ids: string[]) => {
      const targets = elements.filter((e) => ids.includes(e.id));
      if (targets.length === 0) return;

      const duplicates: CanvasElement[] = targets.map((el) => ({
        ...el,
        id: 'dup-' + Math.random().toString(36).substring(2, 9),
        x: el.x + 30,
        y: el.y + 30,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));

      commitElements((prev) => [...prev, ...duplicates]);
      duplicates.forEach((d) => sendWs({ type: 'element:upsert', element: d }));
      setSelectedIds(duplicates.map((d) => d.id));
    },
    [elements, commitElements, sendWs]
  );

  const bringForward = useCallback(
    (ids: string[]) => {
      commitElements((prev) => {
        const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
        sorted.forEach((el) => {
          if (ids.includes(el.id)) {
            el.zIndex += 10;
          }
        });
        sendWs({ type: 'elements:batch', elements: sorted });
        return sorted;
      });
    },
    [commitElements, sendWs]
  );

  const sendBackward = useCallback(
    (ids: string[]) => {
      commitElements((prev) => {
        const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
        sorted.forEach((el) => {
          if (ids.includes(el.id)) {
            el.zIndex = Math.max(0, el.zIndex - 10);
          }
        });
        sendWs({ type: 'elements:batch', elements: sorted });
        return sorted;
      });
    },
    [commitElements, sendWs]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const prevElements = history[prevIdx];
      setHistoryIndex(prevIdx);
      setElements(prevElements);
      sendWs({ type: 'elements:batch', elements: prevElements });
    }
  }, [historyIndex, history, sendWs]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const nextElements = history[nextIdx];
      setHistoryIndex(nextIdx);
      setElements(nextElements);
      sendWs({ type: 'elements:batch', elements: nextElements });
    }
  }, [historyIndex, history, sendWs]);

  const clearCanvas = useCallback(() => {
    commitElements([]);
    setSelectedIds([]);
    sendWs({ type: 'elements:batch', elements: [] });
  }, [commitElements, sendWs]);

  const renameBoard = useCallback(
    (newTitle: string) => {
      setBoardTitle(newTitle);
      sendWs({ type: 'board:rename', title: newTitle });
    },
    [sendWs]
  );

  // Voting
  const castVote = useCallback(
    (optionId: string) => {
      if (!activeVote || !activeVote.isActive) return;
      const updatedOptions = activeVote.options.map((opt) => {
        // Toggle vote
        const userHasVoted = opt.votes.includes(currentUser.id);
        const filtered = opt.votes.filter((uid) => uid !== currentUser.id);
        if (opt.id === optionId) {
          return {
            ...opt,
            votes: userHasVoted ? filtered : [...filtered, currentUser.id],
          };
        }
        return {
          ...opt,
          votes: filtered, // single choice vote
        };
      });

      const updatedVote: ActiveVote = {
        ...activeVote,
        options: updatedOptions,
      };
      setActiveVote(updatedVote);
      sendWs({ type: 'vote:update', vote: updatedVote });
      confetti({
        particleCount: 25,
        spread: 40,
        origin: { y: 0.7, x: 0.85 },
      });
    },
    [activeVote, currentUser.id, sendWs]
  );

  const createVote = useCallback(
    (question: string, optionTexts: string[], durationSec: number = 300) => {
      const newVote: ActiveVote = {
        id: 'vote-' + Math.random().toString(36).substring(2, 8),
        question,
        options: optionTexts.map((text, i) => ({
          id: 'opt-' + (i + 1),
          text,
          votes: [],
        })),
        createdAt: Date.now(),
        durationSeconds: durationSec,
        remainingSeconds: durationSec,
        isActive: true,
        creator: currentUser.name,
      };
      setActiveVote(newVote);
      sendWs({ type: 'vote:update', vote: newVote });
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6, x: 0.85 } });
    },
    [currentUser.name, sendWs]
  );

  const endVote = useCallback(() => {
    if (!activeVote) return;
    const endedVote: ActiveVote = { ...activeVote, isActive: false };
    setActiveVote(endedVote);
    sendWs({ type: 'vote:update', vote: endedVote });
  }, [activeVote, sendWs]);

  // Audio controls
  const toggleAudio = useCallback(() => {
    if (isPlayingAudio) {
      soundEngine.stop();
      setIsPlayingAudio(false);
    } else {
      soundEngine.play(audioCategory);
      setIsPlayingAudio(true);
    }
  }, [isPlayingAudio, audioCategory]);

  const changeAudioCategory = useCallback((category: string) => {
    setAudioCategory(category);
    if (soundEngine.isAudioPlaying()) {
      soundEngine.play(category);
    }
  }, []);

  const changeAudioVolume = useCallback((val: number) => {
    setAudioVolume(val);
    soundEngine.setVolume(val);
  }, []);

  const toggleMute = useCallback(() => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  }, [isAudioMuted]);

  // Timer controls
  const toggleTimer = useCallback(() => {
    setIsTimerRunning((prev) => !prev);
  }, []);

  const addOneMinute = useCallback(() => {
    setTimerRemainingSec((prev) => prev + 60);
    setTimerTotalSec((prev) => prev + 60);
  }, []);

  const resetTimer = useCallback(() => {
    setIsTimerRunning(false);
    setTimerRemainingSec(timerTotalSec);
  }, [timerTotalSec]);

  // Cursor broadcast
  const broadcastCursor = useCallback(
    (x: number, y: number) => {
      sendWs({ type: 'cursor', x, y });
    },
    [sendWs]
  );

  const selectElement = useCallback((id: string | null, isMulti?: boolean) => {
    if (!id) {
      setSelectedIds([]);
    } else if (isMulti) {
      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    } else {
      setSelectedIds([id]);
    }
  }, []);

  const selectElements = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  const deleteElement = useCallback(
    (id: string) => {
      deleteElements([id]);
    },
    [deleteElements]
  );

  const duplicateBoard = useCallback(() => {
    duplicateElements(elementsRef.current.map((e) => e.id));
  }, [duplicateElements]);

  const newBoard = useCallback(() => {
    clearCanvas();
    renameBoard('Untitled');
  }, [clearCanvas, renameBoard]);

  const exportBoard = useCallback((format: 'png' | 'svg' | 'json') => {
    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(elementsRef.current, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `${boardTitleRef.current.toLowerCase().replace(/\s+/g, '-')}-export.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      window.print();
    }
  }, []);

  return {
    elements,
    selectedIds,
    tool,
    penSubTool,
    strokeColor,
    strokeWidth,
    washiPattern,
    selectedShape,
    selectedConnector,
    selectedStickyColor,
    selectedStamp,
    activePopover,
    isMoreShapesOpen,
    isTimerPanelOpen,
    isShareModalOpen,
    isHelpModalOpen,
    boardTitle,
    pan,
    zoom,
    gridConfig,
    currentUser,
    remoteUsers,
    activeVote,
    isPlayingAudio,
    audioVolume,
    audioCategory,
    isAudioMuted,
    timerTotalSec,
    timerRemainingSec,
    isTimerRunning,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,

    // Setters
    setTool,
    setPenSubTool,
    setStrokeColor,
    setStrokeWidth,
    setWashiPattern,
    setSelectedShape,
    setSelectedConnector,
    setSelectedStickyColor,
    setSelectedStamp,
    setActivePopover,
    setIsMoreShapesOpen,
    setIsTimerPanelOpen,
    setIsShareModalOpen,
    setIsHelpModalOpen,
    setSelectedIds,
    setPan,
    setZoom,
    setGridConfig,

    // Aliases & Conveniences
    selectedElementIds: selectedIds,
    isConnected: true,
    selectElement,
    selectElements,
    batchUpdateElements,
    deleteElement,
    updateBoardTitle: renameBoard,
    duplicateBoard,
    newBoard,
    clearBoard: clearCanvas,
    exportBoard,
    updateCursor: broadcastCursor,
    setAudioCategory: changeAudioCategory,
    setAudioVolume: changeAudioVolume,
    toggleAudioMute: toggleMute,
    addOneMinuteToTimer: addOneMinute,
    updateElementsLive,
    commitLiveElements,

    // Actions
    addElement,
    updateElement,
    deleteElements,
    duplicateElements,
    bringForward,
    sendBackward,
    undo,
    redo,
    clearCanvas,
    renameBoard,
    castVote,
    createVote,
    endVote,
    toggleAudio,
    changeAudioCategory,
    changeAudioVolume,
    toggleMute,
    toggleTimer,
    addOneMinute,
    resetTimer,
    broadcastCursor,
  };
}
