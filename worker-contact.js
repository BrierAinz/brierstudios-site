/* BrierStudios Contact Worker — receives form data and forwards to email */
export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': 'https://brierstudios.com',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const data = await request.json();
      const { name, email, subject, message } = data;

      // Validate required fields
      if (!name || !email || !message) {
        return new Response(JSON.stringify({ error: 'Name, email, and message are required.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Basic email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return new Response(JSON.stringify({ error: 'Invalid email address.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Rate limiting via Cloudflare's built-in
      // Forward to Mailchannels (free on CF) or store in KV
      // For now, store in KV with timestamp
      const id = crypto.randomUUID();
      const entry = {
        id,
        name: String(name).slice(0, 200),
        email: String(email).slice(0, 200),
        subject: String(subject || '').slice(0, 500),
        message: String(message).slice(0, 5000),
        timestamp: new Date().toISOString(),
        ip: request.headers.get('CF-Connecting-IP') || 'unknown',
      };

      // Store in KV if available
      if (env.CONTACTS) {
        await env.CONTACTS.put(`contact:${id}`, JSON.stringify(entry), {
          expirationTtl: 90 * 24 * 60 * 60, // 90 days
        });
      }

      return new Response(JSON.stringify({ success: true, id }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://brierstudios.com',
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid request.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};