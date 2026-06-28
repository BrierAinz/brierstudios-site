/* BrierStudios Contact Worker — receives form data + serves admin panel + email forwarding */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': origin.endsWith('brierstudios.com') ? origin : 'https://brierstudios.com',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Admin routes (require ADMIN_TOKEN)
    if (url.pathname === '/admin' || url.pathname === '/admin/') {
      if (request.method !== 'GET') return new Response('Method not allowed', { status: 405 });
      return new Response(ADMIN_HTML, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    if (url.pathname === '/admin/api/messages') {
      return handleListMessages(request, env);
    }

    if (url.pathname === '/admin/api/delete' && request.method === 'POST') {
      return handleDelete(request, env);
    }

    if (url.pathname === '/newsletter' && request.method === 'POST') {
      return handleNewsletter(request, env);
    }

    if (url.pathname === '/vitals' && request.method === 'POST') {
      return handleVitals(request, env);
    }

    if (url.pathname === '/status') {
          return handleStatus(request, env);
        }

        if (url.pathname === '/admin/vitals') {
          return handleVitalsDashboard(request, env);
        }

        if (url.pathname === '/admin/api/export' && request.method === 'GET') {
          return handleExport(request, env);
        }

        if (url.pathname === '/__cron/backup' && request.method === 'POST') {
          return handleCronBackup(request, env);
        }

        // Public contact form endpoint
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    if (url.pathname !== '/' && url.pathname !== '') {
      return new Response('Not found', { status: 404 });
    }

    return handleContactPost(request, env);
  },
};

async function handleContactPost(request, env) {
  const origin = request.headers.get('Origin') || '';
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin.endsWith('brierstudios.com') ? origin : 'https://brierstudios.com',
    'Content-Type': 'application/json',
  };

  try {
    const data = await request.json();
    const { name, email, subject, message, 'cf-turnstile-response': turnstileToken } = data;

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Name, email, and message are required.' }), {
        status: 400, headers: corsHeaders,
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address.' }), {
        status: 400, headers: corsHeaders,
      });
    }

    if (env.TURNSTILE_SECRET) {
      if (!turnstileToken) {
        return new Response(JSON.stringify({ error: 'Verification token missing.' }), {
          status: 400, headers: corsHeaders,
        });
      }
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${encodeURIComponent(env.TURNSTILE_SECRET)}&response=${encodeURIComponent(turnstileToken)}`,
      });
      const verifyResult = await verifyRes.json();
      if (!verifyResult.success) {
        return new Response(JSON.stringify({ error: 'Verification failed.' }), {
          status: 403, headers: corsHeaders,
        });
      }
      if (verifyResult.hostname && !verifyResult.hostname.endsWith('brierstudios.com')) {
        return new Response(JSON.stringify({ error: 'Verification hostname mismatch.' }), {
          status: 403, headers: corsHeaders,
        });
      }
    }

    // Rate limit: max 5 messages per IP per hour
    const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (env.CONTACTS && clientIp !== 'unknown') {
      const rateKey = `ratelimit:${clientIp}`;
      const current = await env.CONTACTS.get(rateKey);
      const count = parseInt(current || '0', 10);
      if (count >= 5) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again in an hour.' }), {
          status: 429, headers: corsHeaders,
        });
      }
      await env.CONTACTS.put(rateKey, String(count + 1), {
        expirationTtl: 3600,
      });
    }

    const id = crypto.randomUUID();
    const entry = {
      id,
      name: String(name).slice(0, 200),
      email: String(email).slice(0, 200),
      subject: String(subject || '').slice(0, 500),
      message: String(message).slice(0, 5000),
      timestamp: new Date().toISOString(),
      ip: clientIp,
    };

    if (env.CONTACTS) {
      await env.CONTACTS.put(`contact:${id}`, JSON.stringify(entry), {
        expirationTtl: 90 * 24 * 60 * 60,
      });
    }

    // Forward to email via MailChannels (free for CF Workers on your own domain)
    if (env.MAIL_TO) {
      try {
        await sendEmail(entry, env);
      } catch (err) {
        console.error('Email send failed:', err && err.message);
      }
    }

    // Notify Discord webhook (optional)
    if (env.DISCORD_WEBHOOK_URL) {
      try {
        await notifyDiscord(entry, env);
      } catch (err) {
        console.error('Discord notify failed:', err && err.message);
      }
    }

    return new Response(JSON.stringify({ success: true, id }), {
      status: 200, headers: corsHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid request.' }), {
      status: 400, headers: corsHeaders,
    });
  }
}

async function sendEmail(entry, env) {
  const fromAddr = env.MAIL_FROM || 'noreply@brierstudios.com';
  const toAddr = env.MAIL_TO;
  const subjectText = entry.subject || `Contact from ${entry.name}`;
  const textBody = [
    `New contact form submission`,
    ``,
    `From: ${entry.name} <${entry.email}>`,
    `Subject: ${entry.subject || '(none)'}`,
    `Time: ${entry.timestamp}`,
    `IP: ${entry.ip}`,
    ``,
    `Message:`,
    entry.message,
    ``,
    `---`,
    `ID: ${entry.id}`,
  ].join('\n');

  const mcBody = {
    personalizations: [{ to: [{ email: toAddr }] }],
    from: { email: fromAddr, name: 'BrierStudios Contact' },
    subject: subjectText,
    content: [
      { type: 'text/plain', value: textBody },
      { type: 'text/html', value: textBody.replace(/\n/g, '<br>') },
    ],
  };

  const res = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mcBody),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`MailChannels ${res.status}: ${errText.slice(0, 200)}`);
  }
}

async function notifyDiscord(entry, env) {
  const discordMsg = {
    username: 'BrierStudios Bot',
    embeds: [{
      title: `New contact from ${entry.name}`,
      color: 0xc8a23e,
      fields: [
        { name: 'Email', value: entry.email, inline: true },
        { name: 'Subject', value: entry.subject || '(none)', inline: true },
        { name: 'Message', value: (entry.message || '').slice(0, 1000) || '(empty)', inline: false },
        { name: 'IP', value: entry.ip || 'unknown', inline: true },
      ],
      timestamp: entry.timestamp,
      footer: { text: `ID: ${entry.id}` },
    }],
  };

  const res = await fetch(env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(discordMsg),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Discord ${res.status}: ${t.slice(0, 200)}`);
  }
}

async function checkAuth(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  return Boolean(env.ADMIN_TOKEN) && Boolean(token) && token === env.ADMIN_TOKEN;
}

async function handleListMessages(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': request.headers.get('Origin') || 'https://brierstudios.com',
    'Content-Type': 'application/json',
  };

  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }
  if (!(await checkAuth(request, env))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: corsHeaders,
    });
  }

  if (!env.CONTACTS) {
    return new Response(JSON.stringify({ error: 'KV not configured' }), {
      status: 500, headers: corsHeaders,
    });
  }

  const list = await env.CONTACTS.list({ prefix: 'contact:', limit: 100 });
  const messages = await Promise.all(
    list.keys.map(async (k) => {
      const raw = await env.CONTACTS.get(k.name);
      try {
        return JSON.parse(raw);
      } catch {
        return { id: k.name.replace('contact:', ''), error: 'parse failed' };
      }
    })
  );

  messages.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));

  return new Response(JSON.stringify({ messages, count: messages.length }), {
    status: 200, headers: corsHeaders,
  });
}

async function handleDelete(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': request.headers.get('Origin') || 'https://brierstudios.com',
    'Content-Type': 'application/json',
  };

  if (!(await checkAuth(request, env))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: corsHeaders,
    });
  }

  try {
    const { id } = await request.json();
    if (!id || !id.startsWith('contact:')) {
      return new Response(JSON.stringify({ error: 'Invalid id' }), {
        status: 400, headers: corsHeaders,
      });
    }
    if (env.CONTACTS) {
      await env.CONTACTS.delete(id);
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: corsHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400, headers: corsHeaders,
    });
  }
}

async function handleNewsletter(request, env) {
  const origin = request.headers.get('Origin') || '';
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin.endsWith('brierstudios.com') ? origin : 'https://brierstudios.com',
    'Content-Type': 'application/json',
  };

  try {
    const { email } = await request.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400, headers: corsHeaders,
      });
    }

    // Honeypot-like check: simple rate limit per email
    if (env.SUBSCRIBERS) {
      const key = `sub:${email.toLowerCase()}`;
      const existing = await env.SUBSCRIBERS.get(key);
      if (existing) {
        return new Response(JSON.stringify({ success: true, already: true }), {
          status: 200, headers: corsHeaders,
        });
      }
      await env.SUBSCRIBERS.put(key, JSON.stringify({
        email: email.toLowerCase(),
        timestamp: new Date().toISOString(),
        ip: request.headers.get('CF-Connecting-IP') || 'unknown',
      }), { expirationTtl: 365 * 24 * 60 * 60 });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: corsHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400, headers: corsHeaders,
    });
  }
}

async function handleVitals(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const data = await request.json();
    // Best-effort store; small KV TTL
    if (env.VITALS) {
      const id = `vital:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
      await env.VITALS.put(id, JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
        ip: request.headers.get('CF-Connecting-IP') || 'unknown',
      }), { expirationTtl: 30 * 24 * 60 * 60 }); // 30 days
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: corsHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid' }), {
      status: 400, headers: corsHeaders,
    });
  }
}

async function handleStatus(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  };

  const checks = {
    worker: 'up',
    kv: 'unknown',
    lastMessage: null,
    uptime: Math.floor(Date.now() / 1000),
  };

  try {
    if (env.CONTACTS) {
      // List with limit 1 to test KV reachability
      const list = await env.CONTACTS.list({ prefix: 'contact:', limit: 1 });
      checks.kv = 'up';
      checks.messageCount = list.keys.length > 0 ? '(>=1)' : '0';
      // Try to get last message timestamp via full list (cap at 100)
      const full = await env.CONTACTS.list({ prefix: 'contact:', limit: 100 });
      if (full.keys.length > 0) {
        const newest = await env.CONTACTS.get(full.keys[0].name);
        if (newest) {
          try {
            const parsed = JSON.parse(newest);
            checks.lastMessage = parsed.timestamp;
          } catch {}
        }
      }
    } else {
      checks.kv = 'not-configured';
    }
  } catch (err) {
    checks.kv = 'down';
    checks.kvError = err && err.message;
  }

  const status = checks.kv === 'up' && checks.worker === 'up' ? 'operational' : 'degraded';
  return new Response(JSON.stringify({
    status,
    checks,
    version: '4.1',
    timestamp: new Date().toISOString(),
  }, 2), {
    status: 200, headers: corsHeaders,
  });
}

async function handleVitalsDashboard(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': request.headers.get('Origin') || 'https://brierstudios.com',
    'Content-Type': 'application/json',
  };

  if (!(await checkAuth(request, env))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: corsHeaders,
    });
  }

  if (!env.VITALS) {
    return new Response(JSON.stringify({ error: 'VITALS KV not configured' }), {
      status: 500, headers: corsHeaders,
    });
  }

  // Aggregate metrics from VITALS KV
  const list = await env.VITALS.list({ prefix: 'vital:', limit: 500 });
  const values = await Promise.all(list.keys.map(k => env.VITALS.get(k.name)));
  const entries = values.filter(Boolean).map(v => { try { return JSON.parse(v); } catch { return null; } }).filter(Boolean);

  const byMetric = {};
  for (const e of entries) {
    if (!e.metric) continue;
    if (!byMetric[e.metric]) byMetric[e.metric] = [];
    byMetric[e.metric].push(e.value);
  }

  const stats = {};
  for (const [metric, vals] of Object.entries(byMetric)) {
    const sorted = vals.slice().sort((a, b) => a - b);
    const sum = vals.reduce((a, b) => a + b, 0);
    stats[metric] = {
      count: vals.length,
      avg: Math.round(sum / vals.length * 100) / 100,
      p50: sorted[Math.floor(sorted.length * 0.5)] || 0,
      p95: sorted[Math.floor(sorted.length * 0.95)] || 0,
      min: sorted[0] || 0,
      max: sorted[sorted.length - 1] || 0,
    };
  }

  // Top pages
  const byUrl = {};
  for (const e of entries) {
    const u = e.url || 'unknown';
    if (!byUrl[u]) byUrl[u] = { views: 0, lcp: [], cls: [], inp: [] };
    byUrl[u].views++;
    if (e.metric === 'LCP') byUrl[u].lcp.push(e.value);
    if (e.metric === 'CLS') byUrl[u].cls.push(e.value);
    if (e.metric === 'INP') byUrl[u].inp.push(e.value);
  }

  return new Response(JSON.stringify({
    samples: entries.length,
    timeRange: entries.length ? {
      from: entries.map(e => e.timestamp).sort()[0],
      to: entries.map(e => e.timestamp).sort().slice(-1)[0],
    } : null,
    stats,
    pages: Object.entries(byUrl).map(([url, d]) => ({
      url,
      views: d.views,
      lcp: d.lcp.length ? Math.round(d.lcp.reduce((a, b) => a + b, 0) / d.lcp.length * 100) / 100 : null,
    })).sort((a, b) => b.views - a.views).slice(0, 10),
  }, 2), { status: 200, headers: corsHeaders });
}

async function handleExport(request, env) {
  if (!(await checkAuth(request, env))) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!env.CONTACTS) {
    return new Response('KV not configured', { status: 500 });
  }

  const list = await env.CONTACTS.list({ prefix: 'contact:', limit: 1000 });
  const items = await Promise.all(list.keys.map(async (k) => {
    const raw = await env.CONTACTS.get(k.name);
    try { return JSON.parse(raw); } catch { return null; }
  }));
  const messages = items.filter(Boolean).sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));

  const csv = [
    'id,timestamp,name,email,subject,message,ip',
    ...messages.map(m =>
      [m.id, m.timestamp, JSON.stringify(m.name || ''), JSON.stringify(m.email || ''),
       JSON.stringify(m.subject || ''), JSON.stringify(m.message || '').replace(/\n/g, ' '),
       m.ip || ''].join(',')
    ),
  ].join('\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="contacts-' + new Date().toISOString().slice(0, 10) + '.csv"',
    },
  });
}

async function handleCronBackup(request, env) {
  // Backup CONTACTS KV to R2 if bound
  if (!env.R2 || !env.CONTACTS) {
    return new Response(JSON.stringify({ error: 'R2 or KV not bound' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  const date = new Date().toISOString().slice(0, 10);
  const list = await env.CONTACTS.list({ prefix: 'contact:', limit: 1000 });
  const items = await Promise.all(list.keys.map(async (k) => {
    const raw = await env.CONTACTS.get(k.name);
    return raw ? { key: k.name, value: JSON.parse(raw) } : null;
  }));
  const messages = items.filter(Boolean);

  const key = `backups/contacts-${date}.json`;
  await env.R2.put(key, JSON.stringify({ date, count: messages.length, messages }, null, 2));

  return new Response(JSON.stringify({ ok: true, key, count: messages.length }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
}

const ADMIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>BrierStudios Admin</title>
<style>
:root { --bg:#060810; --card:#1a1b26; --gold:#c8a23e; --text:#e2e8f0; --muted:#7a8599; --border:#2a2c3a; --danger:#c026d3; }
* { box-sizing: border-box; }
body { margin:0; background:var(--bg); color:var(--text); font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; padding:2rem; }
h1 { color:var(--gold); font-weight:600; letter-spacing:.05em; margin:0; }
.login { max-width:24rem; margin:4rem auto; background:var(--card); border:1px solid var(--border); border-radius:8px; padding:2rem; }
.login p { color:var(--muted); }
.login input { width:100%; padding:.75rem; background:var(--bg); color:var(--text); border:1px solid var(--border); border-radius:4px; font-size:1rem; margin-bottom:1rem; font-family:inherit; }
.login button { width:100%; padding:.75rem; background:var(--gold); color:#060810; border:0; border-radius:4px; font-weight:600; cursor:pointer; font-size:1rem; }
.login button:hover { background:#d4b04a; }
.hidden { display:none; }
.messages { display:grid; gap:1rem; max-width:48rem; margin:2rem auto; }
.msg { background:var(--card); border:1px solid var(--border); border-radius:8px; padding:1.25rem; }
.msg-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:.75rem; padding-bottom:.75rem; border-bottom:1px solid var(--border); gap:1rem; }
.msg-name { color:var(--gold); font-weight:600; }
.msg-email { color:var(--muted); font-size:.875rem; }
.msg-time { color:var(--muted); font-size:.875rem; white-space:nowrap; }
.msg-subject { color:var(--muted); margin-bottom:.5rem; }
.msg-body { white-space:pre-wrap; line-height:1.6; word-wrap:break-word; }
.msg-meta { color:var(--muted); font-size:.75rem; margin-top:.75rem; }
.msg-actions { margin-top:1rem; display:flex; gap:.5rem; }
.msg-actions button { padding:.4rem .8rem; background:transparent; color:var(--text); border:1px solid var(--border); border-radius:4px; cursor:pointer; font-size:.875rem; font-family:inherit; }
.msg-actions button:hover { border-color:var(--gold); color:var(--gold); }
.msg-actions button.danger:hover { border-color:var(--danger); color:var(--danger); }
.toolbar { max-width:48rem; margin:0 auto; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; }
.toolbar-actions { display:flex; gap:.5rem; align-items:center; }
.toolbar button { padding:.5rem 1rem; background:transparent; color:var(--muted); border:1px solid var(--border); border-radius:4px; cursor:pointer; font-size:.875rem; font-family:inherit; }
.toolbar button:hover { border-color:var(--gold); color:var(--gold); }
.count-label { color:var(--muted); margin-right:.5rem; }
.empty { text-align:center; color:var(--muted); padding:4rem 0; }
.err { color:var(--danger); padding:1rem; background:rgba(192,38,211,.1); border:1px solid var(--danger); border-radius:4px; margin-bottom:1rem; }
</style>
</head>
<body>
<div id="login" class="login">
  <h1>Admin</h1>
  <p>Enter your admin token to view contact messages.</p>
  <input type="password" id="tokenInput" placeholder="Admin token" autofocus>
  <button id="loginBtn">Unlock</button>
  <div id="loginErr" class="err hidden"></div>
</div>

<div id="panel" class="hidden">
  <div class="toolbar">
    <h1>Contact Messages</h1>
    <div class="toolbar-actions">
      <span class="count-label" id="count"></span>
      <button id="refreshBtn">Refresh</button>
      <a href="/vitals.html" style="text-decoration:none;"><button>Vitals</button></a>
      <button id="exportBtn">Export CSV</button>
      <button id="logoutBtn">Logout</button>
    </div>
  </div>
  <div id="messages" class="messages"></div>
</div>

<script>
var sessionKey = 'bs_admin';
var currentToken = sessionStorage.getItem(sessionKey) || '';

function getInputValue() {
  var el = document.getElementById('tokenInput');
  return el ? el.value : '';
}

function setCurrentToken(v) {
  currentToken = v;
}

function doLogin() {
  var v = getInputValue();
  if (!v) return;
  var input = document.getElementById('tokenInput');
  if (input) input.value = '';
  setCurrentToken(v);
  sessionStorage.setItem(sessionKey, v);
  document.getElementById('login').classList.add('hidden');
  document.getElementById('panel').classList.remove('hidden');
  loadMessages();
}

function doLogout() {
  setCurrentToken('');
  sessionStorage.removeItem(sessionKey);
  document.getElementById('login').classList.remove('hidden');
  document.getElementById('panel').classList.add('hidden');
}

async function loadMessages() {
  var saved = sessionStorage.getItem(sessionKey) || '';
  if (saved) setCurrentToken(saved);
  if (!currentToken) { doLogout(); return; }

  try {
    var res = await fetch(location.origin + '/admin/api/messages', {
      headers: { 'Authorization': 'Bearer ' + currentToken },
    });
    if (res.status === 401) { doLogout(); return; }
    var data = await res.json();
    var n = data.count || 0;
    var label = n + ' message' + (n === 1 ? '' : 's');
    document.getElementById('count').textContent = label;
    renderMessages(data.messages || []);
  } catch (err) {
    showLoginErr('Network error: ' + err.message);
  }
}

async function deleteMsg(id) {
  if (!confirm('Delete this message?')) return;
  await fetch(location.origin + '/admin/api/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + currentToken },
    body: JSON.stringify({ id: id }),
  });
  loadMessages();
}

function escAttr(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

function renderMessages(messages) {
  var c = document.getElementById('messages');
  if (!messages.length) {
    c.innerHTML = '<div class="empty">No messages yet.</div>';
    return;
  }
  var html = '';
  for (var i = 0; i < messages.length; i++) {
    var m = messages[i];
    var msgId = 'contact:' + escAttr(m.id);
    html += '<div class="msg">';
    html += '<div class="msg-header">';
    html += '<div><div class="msg-name">' + escAttr(m.name) + '</div>';
    html += '<div class="msg-email">' + escAttr(m.email) + '</div></div>';
    html += '<div class="msg-time">' + escAttr(m.timestamp || '') + '</div>';
    html += '</div>';
    if (m.subject) {
      html += '<div class="msg-subject"><strong>Subject:</strong> ' + escAttr(m.subject) + '</div>';
    }
    html += '<div class="msg-body">' + escAttr(m.message) + '</div>';
    html += '<div class="msg-meta">IP: ' + escAttr(m.ip || 'unknown') + '</div>';
    html += '<div class="msg-actions">';
    html += '<button class="danger" data-del-id="' + msgId + '">Delete</button>';
    html += '</div></div>';
  }
  c.innerHTML = html;
  var btns = c.querySelectorAll('button[data-del-id]');
  for (var j = 0; j < btns.length; j++) {
    btns[j].addEventListener('click', function(e) {
      deleteMsg(e.currentTarget.getAttribute('data-del-id'));
    });
  }
}

function showLoginErr(msg) {
  var el = document.getElementById('loginErr');
  el.textContent = msg;
  el.classList.remove('hidden');
}

document.getElementById('loginBtn').addEventListener('click', doLogin);
document.getElementById('refreshBtn').addEventListener('click', loadMessages);
document.getElementById('logoutBtn').addEventListener('click', doLogout);
var exportBtn = document.getElementById('exportBtn');
if (exportBtn) {
  exportBtn.addEventListener('click', function() {
    var a = document.createElement('a');
    a.href = location.origin.replace('contact.', 'contact.') + '/admin/api/export';
    a.download = 'contacts.csv';
    // Need to set Authorization header on download — use fetch+blob instead
    fetch('https://contact.brierstudios.com/admin/api/export', { headers: { 'Authorization': 'Bearer ' + currentToken }})
      .then(function(r) { return r.blob(); })
      .then(function(b) {
        var url = URL.createObjectURL(b);
        var a2 = document.createElement('a');
        a2.href = url;
        a2.download = 'contacts-' + new Date().toISOString().slice(0,10) + '.csv';
        document.body.appendChild(a2);
        a2.click();
        document.body.removeChild(a2);
        URL.revokeObjectURL(url);
      });
  });
}
document.getElementById('tokenInput').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') doLogin();
});

if (currentToken) {
  document.getElementById('login').classList.add('hidden');
  document.getElementById('panel').classList.remove('hidden');
  loadMessages();
}
</script>
</body>
</html>`;