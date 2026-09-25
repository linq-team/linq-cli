import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'node:http';

const app = express();
app.use(express.json({
  verify(req, _res, body) {
    req.rawBody = body.toString('utf8');
  },
}));

const server = createServer(app);

// connectionId → WebSocket client
const connections = new Map();
let nextConnId = 1;

app.get('/health', (_req, res) => res.sendStatus(200));

// Webhook receiver — Synapse (or curl) POSTs here
app.post('/relay/:id', (req, res) => {
  const ws = connections.get(req.params.id);
  if (ws) {
    ws.send(JSON.stringify({
      payload: req.rawBody,
      headers: {
        'webhook-id': req.get('webhook-id'),
        'webhook-timestamp': req.get('webhook-timestamp'),
        'webhook-signature': req.get('webhook-signature'),
      },
    }));
    console.log(`[relay]  Forwarded to ${req.params.id}`);
  } else {
    console.log(`[relay]  No connection for ${req.params.id}`);
  }
  res.sendStatus(200);
});

// WebSocket server — CLI connects here
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');

  if (!token) {
    console.log('[ws] Rejected: no token');
    ws.close(4001, 'Unauthorized');
    return;
  }

  // For local testing, accept any non-empty token.
  console.log(`[ws] Client connected (token: ${token.slice(0, 8)}...)`);

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.action === 'init') {
        const connectionId = `local-${nextConnId++}`;
        connections.set(connectionId, ws);
        ws.send(JSON.stringify({ connectionId }));
        console.log(`[ws] Assigned connectionId: ${connectionId} (active: ${connections.size})`);

        ws.on('close', () => {
          connections.delete(connectionId);
          console.log(`[ws] Client disconnected: ${connectionId} (active: ${connections.size})`);
        });
      }
    } catch {
      // Ignore malformed messages
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Relay server listening on http://localhost:${PORT}`);
  console.log('');
  console.log('Test with:');
  console.log(`  LINQ_RELAY_WS_URL=ws://localhost:${PORT}/ws LINQ_RELAY_URL=http://localhost:${PORT} linq webhooks listen`);
  console.log('');
  console.log('Send a signed webhook delivery to /relay/<CONNECTION_ID> to test forwarding.');
});
