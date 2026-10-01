// VERCEL SERVERLESS PROXY - V7
// -----------------------------------------------------------------------------
// 🔴🔴🔴 APPS SCRIPT URL: nếu Google cấp URL /exec mới, sửa đúng dòng dưới đây.
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwJGI14qSGHWHJWVi75tMzKcir_uU8OoxajKt2VDbPLtz4krl-uJWbgSjABX81r6yOE/exec';
// -----------------------------------------------------------------------------

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Chỉ hỗ trợ GET/POST.' });
  }

  try {
    if (!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(APPS_SCRIPT_URL)) {
      return res.status(500).json({ ok: false, error: 'APPS_SCRIPT_URL trong api/sheet.js chưa hợp lệ.' });
    }

    let target = APPS_SCRIPT_URL;
    const options = {
      method: req.method,
      redirect: 'follow',
      headers: {
        'Accept': 'application/json,text/plain,*/*',
        'User-Agent': 'Classroom-Vercel-Proxy/7.0'
      }
    };

    if (req.method === 'GET') {
      const u = new URL(APPS_SCRIPT_URL);
      const source = req.query || {};
      for (const [key, value] of Object.entries(source)) {
        if (key === '_') continue;
        if (Array.isArray(value)) value.forEach(v => u.searchParams.append(key, String(v)));
        else if (value !== undefined && value !== null) u.searchParams.set(key, String(value));
      }
      if (!u.searchParams.has('action')) u.searchParams.set('action', 'ping');
      target = u.toString();
    } else {
      options.headers['Content-Type'] = 'text/plain;charset=UTF-8';
      const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
      options.body = body;
    }

    const upstream = await fetch(target, options);
    const text = await upstream.text();
    const contentType = upstream.headers.get('content-type') || '';
    const compact = text.replace(/\s+/g, ' ').trim();

    // Nếu Apps Script chưa public, Google thường trả HTML đăng nhập/quyền truy cập.
    if (contentType.includes('text/html') || /^<!doctype html/i.test(compact) || /^<html/i.test(compact)) {
      return res.status(502).json({
        ok: false,
        error: 'Apps Script trả về trang HTML/đăng nhập thay vì JSON. Deployment chưa cho truy cập ẩn danh hoặc tài khoản Workspace đang chặn quyền "Anyone".',
        upstreamStatus: upstream.status,
        finalUrl: upstream.url,
        preview: compact.slice(0, 240)
      });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      return res.status(502).json({
        ok: false,
        error: 'Apps Script không trả về JSON hợp lệ.',
        upstreamStatus: upstream.status,
        finalUrl: upstream.url,
        preview: compact.slice(0, 300)
      });
    }

    if (!upstream.ok) {
      return res.status(502).json({ ok: false, error: data.error || `Apps Script HTTP ${upstream.status}`, upstream: data });
    }
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ ok: false, error: 'Proxy không gọi được Apps Script: ' + String(err && err.message ? err.message : err) });
  }
};
