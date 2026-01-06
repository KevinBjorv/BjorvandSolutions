const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const MAILERLITE_BASE_URL = 'https://connect.mailerlite.com/api';
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MAX = 10; // max requests per IP per window

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return this.handleOptions(request);
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    const clientIp = request.headers.get('cf-connecting-ip') || 'unknown';
    const rateLimited = await isRateLimited(clientIp);
    if (rateLimited) {
      return jsonResponse({ error: 'Rate limit exceeded' }, 429);
    }

    let payload;
    try {
      payload = await request.json();
    } catch (error) {
      return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    const { email, token } = payload || {};
    if (!email || !token) {
      return jsonResponse({ error: 'Missing email or Turnstile token' }, 400);
    }

    const turnstileValid = await verifyTurnstile(token, env.TURNSTILE_SECRET, clientIp);
    if (!turnstileValid) {
      return jsonResponse({ error: 'Bot verification failed' }, 400);
    }

    const subscribeResult = await subscribeToMailerLite(email, env.MAILERLITE_API_KEY, env.GROUP_ID);
    if (!subscribeResult.ok) {
      const status = subscribeResult.status === 429 ? 429 : 502;
      return jsonResponse({ error: subscribeResult.message }, status);
    }

    return jsonResponse({ message: 'Subscribed' }, 200);
  },

  handleOptions(request) {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      }
    });
  }
};

async function verifyTurnstile(token, secret, remoteIp) {
  if (!secret) return false;

  const formData = new FormData();
  formData.append('secret', secret);
  formData.append('response', token);
  if (remoteIp) {
    formData.append('remoteip', remoteIp);
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) return false;

  const data = await response.json();
  return Boolean(data.success);
}

async function subscribeToMailerLite(email, apiKey, groupId) {
  if (!apiKey) {
    return { ok: false, status: 500, message: 'Missing MailerLite API key' };
  }

  const payload = { email };
  if (groupId) {
    payload.groups = [groupId];
  }

  const response = await fetch(`${MAILERLITE_BASE_URL}/subscribers`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const detail = await safeReadText(response);
    return {
      ok: false,
      status: response.status,
      message: detail || 'MailerLite rejected the request'
    };
  }

  return { ok: true, status: response.status };
}

async function isRateLimited(ip) {
  const cache = caches.default;
  const cacheKey = new Request(`https://turnstile-rate-limit/${ip}`);
  const now = Date.now();
  const cached = await cache.match(cacheKey);
  let record = { count: 0, reset: now + RATE_LIMIT_WINDOW_MS };

  if (cached) {
    try {
      record = await cached.json();
    } catch (error) {
      record = { count: 0, reset: now + RATE_LIMIT_WINDOW_MS };
    }
  }

  if (record.reset < now) {
    record = { count: 0, reset: now + RATE_LIMIT_WINDOW_MS };
  }

  record.count += 1;

  const ttlSeconds = Math.ceil((record.reset - now) / 1000);
  await cache.put(cacheKey, new Response(JSON.stringify(record), {
    headers: { 'Cache-Control': `max-age=${ttlSeconds}` }
  }));

  return record.count > RATE_LIMIT_MAX;
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

async function safeReadText(response) {
  try {
    return await response.text();
  } catch (error) {
    return '';
  }
}
