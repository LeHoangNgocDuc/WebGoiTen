/**
 * LỚP HỌC TƯƠNG TÁC V21 - VERCEL API PROXY (/api/sheet.js)
 * Nhiệm vụ:
 * 1) Trung gian kết nối trình duyệt -> Google Apps Script, xử lý triệt để CORS & Redirect 302 của Google.
 * 2) Bảo mật URL Apps Script và khóa bí mật (API_SECRET) ở phía server thông qua biến môi trường Vercel.
 * 3) Kiểm tra tính hợp lệ của JSON trả về và thông báo lỗi tiếng Việt rõ ràng.
 */

const DEFAULT_APPS_SCRIPT_URL =
  process.env.APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbxU532MYjcMKYAr4Ocb8FKYI9G1J10LawQPcPQZI_IMeG4ExbS9UeuLPoAZctMsbVUU/exec';

const SERVER_API_SECRET = process.env.CLASSROOM_API_SECRET || '';
const TEACHER_PASSCODE = process.env.TEACHER_PASSCODE || '';
const REQUEST_TIMEOUT_MS = 18000;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, X-Classroom-Passcode, X-Apps-Script-Url');
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Phương thức HTTP không được hỗ trợ: ' + req.method
    });
  }

  // Nếu trường học cấu hình TEACHER_PASSCODE trên Vercel, kiểm tra mã xác thực cho thao tác ghi
  const clientPasscode = String(req.headers['x-classroom-passcode'] || req.query?.passcode || '').trim();
  if (TEACHER_PASSCODE && req.method === 'POST' && clientPasscode !== TEACHER_PASSCODE) {
    return res.status(401).json({
      ok: false,
      error: 'Mã xác thực giáo viên không đúng hoặc chưa được nhập trong mục Cài đặt.'
    });
  }

  // Ưu tiên biến môi trường APPS_SCRIPT_URL trên Vercel; cho phép header override hợp lệ nếu đang test
  let targetBaseUrl = String(DEFAULT_APPS_SCRIPT_URL || '').trim();
  const headerOverride = String(req.headers['x-apps-script-url'] || '').trim();
  if (!process.env.APPS_SCRIPT_URL && isValidAppsScriptUrl(headerOverride)) {
    targetBaseUrl = headerOverride;
  }

  if (!isValidAppsScriptUrl(targetBaseUrl)) {
    return res.status(500).json({
      ok: false,
      error: 'Chưa cấu hình APPS_SCRIPT_URL hợp lệ (phải là link https://script.google.com/macros/s/.../exec).'
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    let response;

    if (req.method === 'GET') {
      const url = new URL(targetBaseUrl);
      Object.entries(req.query || {}).forEach(([k, v]) => {
        if (v !== undefined && v !== null && k !== 'passcode') {
          url.searchParams.set(k, String(v));
        }
      });
      if (SERVER_API_SECRET) {
        url.searchParams.set('secret', SERVER_API_SECRET);
      }

      response = await fetch(url.toString(), {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          Accept: 'application/json, text/plain, */*'
        }
      });
    } else {
      let bodyObj = {};
      if (typeof req.body === 'string' && req.body.trim()) {
        try {
          bodyObj = JSON.parse(req.body);
        } catch (_) {
          return res.status(400).json({ ok: false, error: 'Dữ liệu POST gửi lên không phải JSON hợp lệ.' });
        }
      } else if (req.body && typeof req.body === 'object') {
        bodyObj = { ...req.body };
      }

      if (SERVER_API_SECRET) {
        bodyObj.secret = SERVER_API_SECRET;
      }

      response = await fetch(targetBaseUrl, {
        method: 'POST',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
          Accept: 'application/json, text/plain, */*'
        },
        body: JSON.stringify(bodyObj)
      });
    }

    const rawText = await response.text();
    let parsed = null;
    try {
      parsed = JSON.parse(rawText);
    } catch (_) {
      const isHtml = /<!doctype html>|<html/i.test(rawText);
      const hint = isHtml
        ? 'Google Apps Script trả về trang HTML (thường do chưa chọn "Who has access: Anyone" khi Deploy hoặc tài khoản trường chặn truy cập công khai).'
        : 'Phản hồi không phải định dạng JSON: ' + rawText.slice(0, 180);
      return res.status(502).json({
        ok: false,
        error: hint,
        httpStatus: response.status
      });
    }

    return res.status(response.ok ? 200 : response.status).json(parsed);
  } catch (err) {
    const isAbort = err && err.name === 'AbortError';
    return res.status(504).json({
      ok: false,
      error: isAbort
        ? 'Quá thời gian chờ phản hồi từ Google Sheets (18 giây). Vui lòng kiểm tra mạng hoặc thử lại.'
        : 'Lỗi kết nối tới Google Apps Script: ' + String(err && err.message ? err.message : err)
    });
  } finally {
    clearTimeout(timer);
  }
}

function isValidAppsScriptUrl(url) {
  return /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec(?:\?.*)?$/.test(String(url || '').trim());
}