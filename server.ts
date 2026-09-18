import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initial starter elements for OpenBoard
const initialElements = [
  {
    id: 'welcome-sticky',
    type: 'sticky',
    x: 120,
    y: 120,
    width: 260,
    height: 240,
    color: 'yellow',
    text: 'Welcome to OpenBoard! ✨\n\n• Think, Create, Collaborate\n• Draw with Pencil, Highlighter & Washi tape\n• Click Stamp for the circular reaction wheel\n• Open Timer, Music & Voting in top right',
    author: 'Gokulan',
    fontSize: 15,
    zIndex: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'step-1-shape',
    type: 'shape',
    shapeKind: 'rounded-rect',
    x: 440,
    y: 140,
    width: 190,
    height: 80,
    strokeColor: '#8b5cf6',
    fillColor: '#f5f3ff',
    strokeWidth: 2,
    text: '1. Brainstorm Ideas',
    textColor: '#5b21b6',
    fontSize: 16,
    zIndex: 2,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'conn-1',
    type: 'connector',
    connectorKind: 'arrow',
    x: 630,
    y: 180,
    endX: 730,
    endY: 180,
    strokeColor: '#8b5cf6',
    strokeWidth: 2.5,
    zIndex: 3,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'step-2-shape',
    type: 'shape',
    shapeKind: 'diamond',
    x: 730,
    y: 110,
    width: 150,
    height: 140,
    strokeColor: '#3b82f6',
    fillColor: '#eff6ff',
    strokeWidth: 2,
    text: 'Team Review\n& Vote?',
    textColor: '#1e40af',
    fontSize: 14,
    zIndex: 4,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'conn-2',
    type: 'connector',
    connectorKind: 'arrow',
    x: 880,
    y: 180,
    endX: 980,
    endY: 180,
    strokeColor: '#10b981',
    strokeWidth: 2.5,
    zIndex: 5,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'step-3-shape',
    type: 'shape',
    shapeKind: 'pill',
    x: 980,
    y: 145,
    width: 180,
    height: 70,
    strokeColor: '#10b981',
    fillColor: '#ecfdf5',
    strokeWidth: 2,
    text: '🚀 Ship & Share',
    textColor: '#065f46',
    fontSize: 16,
    zIndex: 6,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'stamp-star',
    type: 'stamp',
    stampKind: 'star',
    x: 350,
    y: 90,
    width: 54,
    height: 54,
    zIndex: 7,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'stamp-plusone',
    type: 'stamp',
    stampKind: 'plus-one',
    x: 840,
    y: 80,
    width: 52,
    height: 52,
    zIndex: 8,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'sprint-table',
    type: 'table',
    x: 440,
    y: 300,
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
    zIndex: 9,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'comment-1',
    type: 'comment',
    number: 1,
    x: 1060,
    y: 250,
    author: 'Gokulan',
    authorAvatar: 'G',
    text: 'Looks awesome! Let’s add audio ambience to our sprint session.',
    timestamp: Date.now() - 360000,
    resolved: false,
    replies: [
      {
        id: 'reply-1',
        author: 'Alex M.',
        authorAvatar: 'A',
        text: 'Agreed, the Lo-fi and Acoustic ambient tracks are super relaxing.',
        timestamp: Date.now() - 180000,
      },
    ],
    zIndex: 10,
    createdAt: Date.now() - 360000,
    updatedAt: Date.now(),
  },
];

// In-memory Board store
interface BoardRoom {
  id: string;
  title: string;
  elements: any[];
  activeVote: any | null;
  clients: Set<WebSocket>;
  users: Map<string, any>;
}

const rooms = new Map<string, BoardRoom>();

function getOrCreateRoom(roomId: string = 'main'): BoardRoom {
  let room = rooms.get(roomId);
  if (!room) {
    room = {
      id: roomId,
      title: 'Untitled',
      elements: [...initialElements],
      activeVote: {
        id: 'vote-initial',
        question: 'Which theme should we use for the next design review?',
        options: [
          { id: 'opt-1', text: 'Purple Luxe Minimal', votes: ['user-1', 'user-2'] },
          { id: 'opt-2', text: 'Classic Dotted Canvas', votes: ['user-3'] },
          { id: 'opt-3', text: 'Vibrant Washi Tape', votes: [] },
        ],
        createdAt: Date.now(),
        durationSeconds: 300,
        remainingSeconds: 240,
        isActive: true,
        creator: 'Gokulan',
      },
      clients: new Set(),
      users: new Map(),
    };
    rooms.set(roomId, room);
  }
  return room;
}

// REST API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/board/:id', (req, res) => {
  const room = getOrCreateRoom(req.params.id);
  res.json({
    id: room.id,
    title: room.title,
    elements: room.elements,
    activeVote: room.activeVote,
  });
});

app.post('/api/board/:id', (req, res) => {
  const room = getOrCreateRoom(req.params.id);
  if (req.body.title) room.title = req.body.title;
  if (Array.isArray(req.body.elements)) room.elements = req.body.elements;
  if (req.body.activeVote !== undefined) room.activeVote = req.body.activeVote;
  res.json({ status: 'saved', count: room.elements.length });
});

// Setup WebSockets
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket) => {
  let currentRoomId = 'main';
  let currentUser: any = null;

  ws.on('message', (data: string) => {
    try {
      const msg = JSON.parse(data.toString());
      const room = getOrCreateRoom(msg.boardId || currentRoomId);

      switch (msg.type) {
        case 'join': {
          currentRoomId = msg.boardId || 'main';
          currentUser = msg.user;
          room.clients.add(ws);
          if (currentUser?.id) {
            room.users.set(currentUser.id, currentUser);
          }

          // Send current state to newly joined client
          ws.send(
            JSON.stringify({
              type: 'init',
              boardId: room.id,
              title: room.title,
              elements: room.elements,
              activeVote: room.activeVote,
              users: Array.from(room.users.values()),
            })
          );

          // Broadcast user join to other clients
          const joinPayload = JSON.stringify({
            type: 'user:joined',
            user: currentUser,
            users: Array.from(room.users.values()),
          });
          room.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(joinPayload);
            }
          });
          break;
        }

        case 'cursor': {
          if (!currentUser) break;
          currentUser.cursor = { x: msg.x, y: msg.y };
          const cursorPayload = JSON.stringify({
            type: 'cursor:moved',
            userId: currentUser.id,
            cursor: { x: msg.x, y: msg.y },
          });
          room.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(cursorPayload);
            }
          });
          break;
        }

        case 'element:upsert': {
          const el = msg.element;
          const idx = room.elements.findIndex((e) => e.id === el.id);
          if (idx >= 0) {
            room.elements[idx] = el;
          } else {
            room.elements.push(el);
          }
          // Broadcast to other clients
          const upsertPayload = JSON.stringify({
            type: 'element:upserted',
            element: el,
          });
          room.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(upsertPayload);
            }
          });
          break;
        }

        case 'element:delete': {
          const id = msg.id;
          room.elements = room.elements.filter((e) => e.id !== id);
          const delPayload = JSON.stringify({
            type: 'element:deleted',
            id,
          });
          room.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(delPayload);
            }
          });
          break;
        }

        case 'elements:batch': {
          if (Array.isArray(msg.elements)) {
            room.elements = msg.elements;
          }
          const batchPayload = JSON.stringify({
            type: 'elements:batched',
            elements: room.elements,
          });
          room.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(batchPayload);
            }
          });
          break;
        }

        case 'vote:update': {
          room.activeVote = msg.vote;
          const votePayload = JSON.stringify({
            type: 'vote:updated',
            vote: room.activeVote,
          });
          room.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(votePayload);
            }
          });
          break;
        }

        case 'board:rename': {
          room.title = msg.title;
          const titlePayload = JSON.stringify({
            type: 'board:renamed',
            title: room.title,
          });
          room.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(titlePayload);
            }
          });
          break;
        }
      }
    } catch (e) {
      console.error('WebSocket message error:', e);
    }
  });

  ws.on('close', () => {
    const room = rooms.get(currentRoomId);
    if (room) {
      room.clients.delete(ws);
      if (currentUser?.id) {
        room.users.delete(currentUser.id);
        const leavePayload = JSON.stringify({
          type: 'user:left',
          userId: currentUser.id,
          users: Array.from(room.users.values()),
        });
        room.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(leavePayload);
          }
        });
      }
    }
  });
});

// Mount Vite or static server
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`OpenBoard server running on http://0.0.0.0:${PORT}`);
  });
}

start();
