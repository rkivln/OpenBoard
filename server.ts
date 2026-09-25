import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

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
      elements: [],
      activeVote: null,
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

// AI & Smart Diagram Generator
app.post('/api/ai/generate-diagram', async (req, res) => {
  const { prompt = '', template = '' } = req.body;
  const userPrompt = (prompt || template || 'Project Workflow').trim();

  // Helper for dynamic offline fallback
  const getFallbackDiagram = (query: string) => {
    const q = query.toLowerCase();
    if (q.includes('auth') || q.includes('login') || q.includes('signup')) {
      return {
        title: 'Authentication & Authorization Flow',
        nodes: [
          { id: 'n1', text: 'User Enters Credentials', shapeKind: 'pill', colorTheme: 'blue' },
          { id: 'n2', text: 'Validate Format & Rate Limit', shapeKind: 'rounded-rect', colorTheme: 'purple' },
          { id: 'n3', text: 'Credentials Valid?', shapeKind: 'diamond', colorTheme: 'amber' },
          { id: 'n4', text: 'Generate JWT & Session', shapeKind: 'rounded-rect', colorTheme: 'emerald' },
          { id: 'n5', text: 'Redirect to Dashboard', shapeKind: 'pill', colorTheme: 'emerald' },
          { id: 'n6', text: 'Return 401 & Increment Failures', shapeKind: 'rounded-rect', colorTheme: 'rose' },
        ],
        connections: [
          { from: 'n1', to: 'n2', kind: 'arrow', label: 'Submit' },
          { from: 'n2', to: 'n3', kind: 'arrow' },
          { from: 'n3', to: 'n4', kind: 'elbow', label: 'Yes' },
          { from: 'n3', to: 'n6', kind: 'elbow', label: 'No' },
          { from: 'n4', to: 'n5', kind: 'arrow' },
        ],
        stickyNotes: [
          { text: '🔒 Security Note: Enforce Argon2 hashing and HTTP-only cookies', color: 'yellow' },
          { text: '⚡ Add Redis rate limiter: 5 attempts / min', color: 'blue' },
        ],
      };
    }

    if (q.includes('shop') || q.includes('cart') || q.includes('checkout') || q.includes('order')) {
      return {
        title: 'E-Commerce Checkout & Order Funnel',
        nodes: [
          { id: 'n1', text: 'View Shopping Cart', shapeKind: 'pill', colorTheme: 'blue' },
          { id: 'n2', text: 'Enter Shipping Info', shapeKind: 'rounded-rect', colorTheme: 'purple' },
          { id: 'n3', text: 'Select Payment Method', shapeKind: 'rounded-rect', colorTheme: 'purple' },
          { id: 'n4', text: 'Payment Processed?', shapeKind: 'diamond', colorTheme: 'amber' },
          { id: 'n5', text: 'Dispatch Warehouse Order', shapeKind: 'cylinder', colorTheme: 'emerald' },
          { id: 'n6', text: 'Send Confirmation Email', shapeKind: 'pill', colorTheme: 'emerald' },
          { id: 'n7', text: 'Display Payment Error', shapeKind: 'rounded-rect', colorTheme: 'rose' },
        ],
        connections: [
          { from: 'n1', to: 'n2', kind: 'arrow' },
          { from: 'n2', to: 'n3', kind: 'arrow' },
          { from: 'n3', to: 'n4', kind: 'arrow' },
          { from: 'n4', to: 'n5', kind: 'elbow', label: 'Success' },
          { from: 'n4', to: 'n7', kind: 'elbow', label: 'Failed' },
          { from: 'n5', to: 'n6', kind: 'arrow' },
        ],
        stickyNotes: [
          { text: '💡 1-Click checkout increases mobile conversion by ~24%', color: 'yellow' },
          { text: '🚚 Integrate live shipping calculation API', color: 'green' },
        ],
      };
    }

    // Default universal intelligent workflow
    const words = userPrompt.split(/\s+/).slice(0, 4).join(' ');
    return {
      title: `${words.charAt(0).toUpperCase() + words.slice(1)} Process`,
      nodes: [
        { id: 'n1', text: `Initiate: ${words}`, shapeKind: 'pill', colorTheme: 'purple' },
        { id: 'n2', text: 'Analyze Requirements & Scope', shapeKind: 'rounded-rect', colorTheme: 'blue' },
        { id: 'n3', text: 'Verification & Quality Gate', shapeKind: 'diamond', colorTheme: 'amber' },
        { id: 'n4', text: 'Execute Core Deliverables', shapeKind: 'rounded-rect', colorTheme: 'emerald' },
        { id: 'n5', text: 'Final Outcome & Launch', shapeKind: 'pill', colorTheme: 'emerald' },
      ],
      connections: [
        { from: 'n1', to: 'n2', kind: 'arrow' },
        { from: 'n2', to: 'n3', kind: 'arrow' },
        { from: 'n3', to: 'n4', kind: 'arrow', label: 'Approved' },
        { from: 'n4', to: 'n5', kind: 'arrow', label: 'Complete' },
      ],
      stickyNotes: [
        { text: `🎯 Target Goal: High fidelity execution for "${userPrompt}"`, color: 'yellow' },
        { text: '👥 Team Review: Ensure cross-functional stakeholder alignment', color: 'purple' },
      ],
    };
  };

  try {
    if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an expert system designer. Generate a clean visual diagram for: "${userPrompt}".
Return valid JSON matching this schema:
{
  "title": "Short title",
  "nodes": [
    { "id": "n1", "text": "Step Title", "shapeKind": "pill"|"rounded-rect"|"diamond"|"cylinder", "colorTheme": "purple"|"blue"|"emerald"|"amber"|"rose" }
  ],
  "connections": [
    { "from": "n1", "to": "n2", "label": "optional label", "kind": "arrow"|"elbow"|"curved" }
  ],
  "stickyNotes": [
    { "text": "Insightful note or idea", "color": "yellow"|"pink"|"blue"|"green"|"purple" }
  ]
}`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json(parsed);
      }
    }
  } catch (err) {
    console.warn('Gemini diagram generation error, using fallback:', err);
  }

  // Graceful fallback
  res.json(getFallbackDiagram(userPrompt));
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
