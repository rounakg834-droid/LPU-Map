import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function campusSyncPlugin(): Plugin {
  const DB_FILE = path.resolve(__dirname, '.campus_events_db.json');

  function getDB() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
        if (!data.shares) data.shares = [];
        return data;
      }
    } catch (e) {
      console.warn('Error reading .campus_events_db.json:', e);
    }
    return { events: [], metadata: [], reports: [], closures: [], shares: [] };
  }

  function saveDB(data: any) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Error saving .campus_events_db.json:', e);
    }
  }

  const sseClients = new Set<any>();

  function broadcastSSE(type: string, payload: any) {
    const msg = `data: ${JSON.stringify({ type, payload, timestamp: Date.now() })}\n\n`;
    for (const res of Array.from(sseClients)) {
      try {
        res.write(msg);
      } catch {
        sseClients.delete(res);
      }
    }
  }

  return {
    name: 'campus-sync-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';

        // Handle CORS Preflight
        if (req.method === 'OPTIONS') {
          res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          });
          res.end();
          return;
        }

        // 1. SSE Stream: /api/events/stream
        if (url === '/api/events/stream') {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
          });
          res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: Date.now() })}\n\n`);
          sseClients.add(res);

          req.on('close', () => {
            sseClients.delete(res);
          });
          return;
        }

        // 2. GET /api/events
        if (url.startsWith('/api/events') && req.method === 'GET') {
          const db = getDB();
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify(db));
          return;
        }

        // 3. POST /api/events (Create Event)
        if (url === '/api/events' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const { event, metadata } = JSON.parse(body);
              const db = getDB();
              db.events = (db.events || []).filter((e: any) => e.id !== event.id);
              db.events.unshift(event);
              if (metadata) {
                db.metadata = (db.metadata || []).filter((m: any) => m.eventId !== event.id);
                db.metadata.unshift(metadata);
              }
              saveDB(db);
              broadcastSSE('EVENT_MUTATION', { action: 'create', event });
              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify({ success: true, event }));
            } catch (err: any) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        // 4. POST /api/events/remove (Admin Remove Event)
        if (url === '/api/events/remove' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const { eventId, reason, removedBy } = JSON.parse(body);
              const db = getDB();
              const nowIso = new Date().toISOString();
              let targetFound = false;

              db.events = (db.events || []).map((e: any) => {
                if (e.id === eventId) {
                  targetFound = true;
                  return {
                    ...e,
                    status: 'removed_by_admin',
                    updatedAt: nowIso,
                    removedAt: nowIso,
                    moderationReason: reason,
                    removedBy: removedBy || 'University Administrator'
                  };
                }
                return e;
              });

              if (!targetFound) {
                db.events.unshift({
                  id: eventId,
                  status: 'removed_by_admin',
                  title: 'Removed Event',
                  updatedAt: nowIso,
                  removedAt: nowIso,
                  moderationReason: reason,
                  removedBy: removedBy || 'University Administrator'
                });
              }

              saveDB(db);
              broadcastSSE('EVENT_MUTATION', {
                action: 'remove',
                eventId,
                status: 'removed_by_admin',
                removedAt: nowIso,
                moderationReason: reason
              });

              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify({ success: true, eventId, status: 'removed_by_admin' }));
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        // 5. POST /api/events/report
        if (url === '/api/events/report' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const report = JSON.parse(body);
              const db = getDB();
              db.reports = db.reports || [];
              db.reports.unshift(report);
              db.events = (db.events || []).map((e: any) => {
                if (e.id === report.eventId) {
                  return { ...e, reportCount: (e.reportCount || 0) + 1 };
                }
                return e;
              });
              saveDB(db);
              broadcastSSE('EVENT_MUTATION', { action: 'report', report });
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true }));
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        // 6. GET /api/shares (Get Location Share by token or list)
        if (url.startsWith('/api/shares') && req.method === 'GET') {
          const parsedUrl = new URL(url, 'http://localhost');
          const token = parsedUrl.searchParams.get('token');
          const db = getDB();
          if (token) {
            const found = (db.shares || []).find((s: any) => s.token === token);
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ success: true, share: found || null }));
            return;
          }
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ success: true, shares: db.shares || [] }));
          return;
        }

        // 7. POST /api/shares (Create Location Share)
        if (url === '/api/shares' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const { share } = JSON.parse(body);
              const db = getDB();
              db.shares = (db.shares || []).filter((s: any) => s.token !== share.token);
              db.shares.unshift(share);
              saveDB(db);
              broadcastSSE('SHARE_MUTATION', { action: 'create', share });
              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify({ success: true, share }));
            } catch (err: any) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        // 8. POST /api/shares/coords (Update Live Coordinates)
        if (url === '/api/shares/coords' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const { token, coords } = JSON.parse(body);
              const db = getDB();
              let updatedShare = null;
              db.shares = (db.shares || []).map((s: any) => {
                if (s.token === token) {
                  updatedShare = { ...s, coords };
                  return updatedShare;
                }
                return s;
              });
              if (updatedShare) {
                saveDB(db);
                broadcastSSE('SHARE_MUTATION', { action: 'update_coords', token, coords });
              }
              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify({ success: true, updated: Boolean(updatedShare) }));
            } catch (err: any) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        // 9. POST /api/shares/revoke (Stop/Revoke Location Share)
        if (url === '/api/shares/revoke' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const { token } = JSON.parse(body);
              const db = getDB();
              db.shares = (db.shares || []).map((s: any) => {
                if (s.token === token) {
                  return { ...s, revoked: true };
                }
                return s;
              });
              saveDB(db);
              broadcastSSE('SHARE_MUTATION', { action: 'revoke', token });
              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify({ success: true, revoked: true }));
            } catch (err: any) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), campusSyncPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});
