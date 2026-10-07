const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwuo8HxCrO1yWcUwXtdqRxMlfkHb_XNh6LWi5JjlUb9EkUKEOtBnZrnmhJKsRJDaGTC/exec';

export default async function handler(req, res) {
  try {
    if (!APPS_SCRIPT_URL) return res.status(500).json({ ok:false, error:'Chưa cấu hình APPS_SCRIPT_URL.' });
    const url = new URL(APPS_SCRIPT_URL);
    if (req.method === 'GET') {
      Object.entries(req.query || {}).forEach(([k,v]) => {
        if (Array.isArray(v)) v.forEach(x => url.searchParams.append(k, x));
        else if (v !== undefined) url.searchParams.set(k, String(v));
      });
      const r = await fetch(url.toString(), { method:'GET', redirect:'follow', headers:{'Accept':'application/json'} });
      const text = await r.text();
      res.setHeader('Cache-Control','no-store');
      res.setHeader('Content-Type','application/json; charset=utf-8');
      return res.status(r.ok ? 200 : r.status).send(text);
    }
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
      const r = await fetch(url.toString(), { method:'POST', redirect:'follow', headers:{'Content-Type':'application/json','Accept':'application/json'}, body });
      const text = await r.text();
      res.setHeader('Cache-Control','no-store');
      res.setHeader('Content-Type','application/json; charset=utf-8');
      return res.status(r.ok ? 200 : r.status).send(text);
    }
    res.setHeader('Allow','GET, POST');
    return res.status(405).json({ ok:false, error:'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ ok:false, error:String(err?.message || err) });
  }
}
