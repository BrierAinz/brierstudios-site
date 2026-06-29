/* Live admin feed — Durable Object that holds WebSocket connections.
   When new contact messages arrive, all connected admins get notified in real time. */
export class AdminLiveFeed {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = [];
  }

  async fetch(request) {
    const url = new URL(request.url);

    // WebSocket upgrade
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 400 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    server.accept();
    this.sessions.push(server);

    server.addEventListener('close', () => {
      this.sessions = this.sessions.filter(s => s !== server);
    });

    server.addEventListener('message', (event) => {
      // Admin can send commands like { type: 'ping' }
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'ping') {
          server.send(JSON.stringify({ type: 'pong', t: Date.now() }));
        }
      } catch (e) {}
    });

    // Send hello
    server.send(JSON.stringify({
      type: 'hello',
      sessions: this.sessions.length,
      timestamp: new Date().toISOString(),
    }));

    return new Response(null, { status: 101, webSocket: client });
  }

  async broadcast(payload) {
    const msg = JSON.stringify(payload);
    const promises = this.sessions.map(s => {
      try {
        s.send(msg);
      } catch (e) {}
    });
    await Promise.allSettled(promises);
  }
}