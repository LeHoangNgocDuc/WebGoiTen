/**
 * LOP HOC TUONG TAC - BACKEND V21.0.0 (TV-FIRST & SAFE SYNC)
 * Google Apps Script bound to Google Sheet.
 *
 * HƯỚNG DẪN CÀI ĐẶT LẦN ĐẦU HOẶC NÂNG CẤP TỪ V20.1:
 * 1) Mở Google Sheet của lớp -> Extensions (Tiện ích mở rộng) -> Apps Script.
 * 2) Dán toàn bộ mã này vào Code.gs và nhấn Save (Ctrl+S).
 * 3) Chọn hàm setup -> Nhấn Run (Chạy) 1 lần để liên kết Sheet và nâng cấp cấu trúc an toàn.
 * 4) Vào Deploy -> Manage deployments -> Edit (biểu tượng bút chì) -> Version: New version -> Deploy.
 */

const APP = {
  VERSION: '21.0.0',
  DB_KEY: 'CLASSROOM_DB_ID',
  SECRET_KEY: 'CLASSROOM_API_SECRET',
  SCHEMA_KEY: 'CLASSROOM_SCHEMA_V21_READY',
  CACHE_TTL_SEC: 90,
  SHEETS: {
    STUDENTS: 'Students',
    HISTORY: 'History',
    SCORES: 'Scores',
    QUESTIONS: 'QuestionBank'
  }
};

// TÙY CHỌN: Có thể dán toàn bộ đường link Google Sheet hoặc ID vào giữa cặp dấu nháy dưới đây.
// Nếu để trống, chỉ cần mở Apps Script từ trong Google Sheet và chạy hàm setup() 1 lần.
const SPREADSHEET_URL_OR_ID = '';

function setup() {
  const ss = resolveSpreadsheetForSetup_();
  PropertiesService.getScriptProperties().setProperty(APP.DB_KEY, ss.getId());

  ensureSheets_(ss, true);
  repairStudentClassColumn_(ss);
  PropertiesService.getScriptProperties().setProperty(APP.SCHEMA_KEY, APP.VERSION);
  invalidateCache_();
  SpreadsheetApp.flush();

  const stuSheet = ss.getSheetByName(APP.SHEETS.STUDENTS);
  return {
    ok: true,
    version: APP.VERSION,
    spreadsheetName: ss.getName(),
    studentRows: stuSheet ? Math.max(0, stuSheet.getLastRow() - 1) : 0,
    message: 'Đã liên kết và kiểm tra cấu trúc dữ liệu V21 thành công.'
  };
}

function backupDatabase() {
  const ss = db_();
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmm');
  const backupName = 'Backup_V21_' + stamp;
  const results = [];
  Object.keys(APP.SHEETS).forEach(k => {
    const name = APP.SHEETS[k];
    const sh = ss.getSheetByName(name);
    if (sh) {
      const copy = sh.copyTo(ss);
      copy.setName(name + '_' + stamp);
      results.push(copy.getName());
    }
  });
  return { ok: true, backupName: backupName, copiedSheets: results };
}

function onOpen() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) {
      PropertiesService.getScriptProperties().setProperty(APP.DB_KEY, ss.getId());
      SpreadsheetApp.getUi()
        .createMenu('Web gọi tên V21')
        .addItem('1. Kiểm tra / Nâng cấp cấu trúc V21 (setup)', 'setup')
        .addItem('2. Tạo bản sao lưu các Sheet hiện tại', 'backupDatabase')
        .addItem('3. Xóa bộ nhớ đệm (Cache)', 'invalidateCache_')
        .addToUi();
    }
  } catch (_) {}
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  const action = String(p.action || 'ping').trim();
  const callback = String(p.prefix || p.callback || '').trim();

  try {
    if (action === 'alive') {
      return output_({
        ok: true,
        version: APP.VERSION,
        serverTime: new Date().toISOString(),
        message: 'Apps Script Web App V21 is reachable.'
      }, callback);
    }

    verifySecretIfConfigured_(p.secret);
    const ss = db_();
    ensureSheetsQuick_(ss);
    let result;

    if (action === 'ping') result = ping_(ss);
    else if (action === 'students') result = getStudents_(ss, String(p.className || '').trim(), p.nocache === '1');
    else if (action === 'history') result = getHistory_(ss);
    else if (action === 'scores') result = getScores_(ss, String(p.className || '').trim());
    else if (action === 'questions') result = getQuestions_(ss, p);
    else if (action === 'debug') result = debug_(ss);
    else result = { ok: false, error: 'Hành động GET không hợp lệ: ' + action, version: APP.VERSION };

    return output_(result, callback);
  } catch (err) {
    return output_({
      ok: false,
      error: errorText_(err),
      version: APP.VERSION,
      hint: 'Mở Google Sheet > Extensions > Apps Script > chạy hàm setup() một lần, sau đó Deploy New version.'
    }, callback);
  }
}

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    verifySecretIfConfigured_(payload.secret);

    const ss = db_();
    ensureSheetsQuick_(ss);
    const action = String(payload.action || '').trim();
    let result;

    if (action === 'saveStudents') result = saveStudents_(ss, payload.students || []);
    else if (action === 'addHistory') result = addHistory_(ss, payload.entry || payload);
    else if (action === 'saveScore') result = saveScore_(ss, payload.entry || payload);
    else if (action === 'deleteScore') result = deleteScore_(ss, payload.entry || payload);
    else if (action === 'batchSync') result = batchSync_(ss, payload.items || []);
    else if (action === 'saveQuestions') result = saveQuestions_(ss, payload.questions || []);
    else if (action === 'clearQuestionBank') result = clearQuestionBank_(ss);
    else result = { ok: false, error: 'Hành động POST không hợp lệ: ' + action };

    result.version = APP.VERSION;
    result.serverTime = new Date().toISOString();
    return jsonOutput_(result);
  } catch (err) {
    return jsonOutput_({
      ok: false,
      error: errorText_(err),
      version: APP.VERSION
    });
  }
}

function verifySecretIfConfigured_(clientSecret) {
  const configured = String(PropertiesService.getScriptProperties().getProperty(APP.SECRET_KEY) || '').trim();
  if (configured && String(clientSecret || '').trim() !== configured) {
    throw new Error('Từ chối truy cập: Khóa bảo mật API (CLASSROOM_API_SECRET) không khớp.');
  }
}

function extractSpreadsheetId_(raw) {
  const s = String(raw || '').trim();
  if (!s) return '';
  const match = s.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) return match[1];
  if (/^[a-zA-Z0-9-_]{20,}$/.test(s)) return s;
  return '';
}

function resolveSpreadsheetForSetup_() {
  const fromConst = extractSpreadsheetId_(SPREADSHEET_URL_OR_ID);
  if (fromConst) return SpreadsheetApp.openById(fromConst);
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  const saved = extractSpreadsheetId_(PropertiesService.getScriptProperties().getProperty(APP.DB_KEY));
  if (saved) return SpreadsheetApp.openById(saved);
  throw new Error('Không tìm thấy Google Sheet. Hãy mở Apps Script từ Google Sheet hoặc dán link vào SPREADSHEET_URL_OR_ID.');
}

function db_() {
  let id = extractSpreadsheetId_(SPREADSHEET_URL_OR_ID);
  if (!id) {
    id = extractSpreadsheetId_(PropertiesService.getScriptProperties().getProperty(APP.DB_KEY));
  }
  if (!id) {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) {
      id = active.getId();
      PropertiesService.getScriptProperties().setProperty(APP.DB_KEY, id);
    }
  }
  if (!id) {
    throw new Error('Chưa liên kết Google Sheet. Hãy chạy hàm setup() một lần trong Apps Script editor.');
  }
  return SpreadsheetApp.openById(id);
}

function ensureSheetsQuick_(ss) {
  const schemaVer = PropertiesService.getScriptProperties().getProperty(APP.SCHEMA_KEY);
  const hasAll =
    ss.getSheetByName(APP.SHEETS.STUDENTS) &&
    ss.getSheetByName(APP.SHEETS.HISTORY) &&
    ss.getSheetByName(APP.SHEETS.SCORES) &&
    ss.getSheetByName(APP.SHEETS.QUESTIONS);
  if (schemaVer === APP.VERSION && hasAll) return;
  ensureSheets_(ss, false);
  PropertiesService.getScriptProperties().setProperty(APP.SCHEMA_KEY, APP.VERSION);
}

function ensureSheets_(ss, fullFormat) {
  ensureSheet_(ss, APP.SHEETS.STUDENTS, ['id', 'stt', 'name', 'className', 'totalPoint', 'callCount', 'lastCalled', 'active'], fullFormat);
  ensureSheet_(ss, APP.SHEETS.HISTORY, ['timestamp', 'className', 'studentId', 'studentName', 'action', 'value', 'note', 'recordId'], fullFormat);
  ensureScoresSheet_(ss, fullFormat);
  ensureQuestionSheet_(ss, fullFormat);
}

function ensureSheet_(ss, name, headers, fullFormat) {
  let sh = ss.getSheetByName(name);
  let created = false;
  if (!sh) {
    sh = ss.insertSheet(name);
    created = true;
  }
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    created = true;
  } else if (fullFormat) {
    const width = Math.max(headers.length, sh.getLastColumn());
    const existing = sh.getRange(1, 1, 1, width).getDisplayValues()[0];
    if (existing.every(v => !String(v || '').trim())) {
      sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    } else if (sh.getLastColumn() < headers.length) {
      sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }
  if (created || fullFormat) {
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sh;
}

function ensureScoresSheet_(ss, fullFormat) {
  const headers = ['timestamp', 'className', 'studentId', 'studentName', 'callNo', 'score', 'note', 'recordId'];
  let sh = ss.getSheetByName(APP.SHEETS.SCORES);
  let created = false;
  if (!sh) {
    sh = ss.insertSheet(APP.SHEETS.SCORES);
    created = true;
  }

  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    created = true;
  } else if (fullFormat || sh.getLastColumn() < 7) {
    const width = Math.max(8, sh.getLastColumn());
    const h = sh.getRange(1, 1, 1, width).getDisplayValues()[0].map(normalizeHeader_);
    const hasCallNo = h.indexOf('callno') >= 0 || h.indexOf('lan goi') >= 0;
    const scoreAtE = h[4] === 'score' || h[4] === 'diem';
    if (!hasCallNo && scoreAtE) {
      sh.insertColumnAfter(4);
    }
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  if (created || fullFormat) {
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sh;
}

function ensureQuestionSheet_(ss, fullFormat) {
  const headers = [
    'id', 'type', 'level', 'grade', 'subject', 'chapter', 'topic', 'question', 'image',
    'optionsJson', 'correctAnswer', 'explain', 'sourceFile', 'updatedAt'
  ];
  let sh = ss.getSheetByName(APP.SHEETS.QUESTIONS);
  let created = false;
  if (!sh) {
    sh = ss.insertSheet(APP.SHEETS.QUESTIONS);
    created = true;
  }

  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    created = true;
  } else if (fullFormat || sh.getLastColumn() < 14) {
    const width = Math.max(headers.length, sh.getLastColumn());
    const current = sh.getRange(1, 1, 1, width).getDisplayValues()[0].map(normalizeHeader_);
    const hasImage = current.indexOf('image') >= 0 || current.indexOf('hinh') >= 0 || current.indexOf('hinhanh') >= 0;
    const optionsAtI = current[8] === 'optionsjson' || current[8] === 'options';
    if (!hasImage && optionsAtI) {
      sh.insertColumnAfter(8);
    }
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  if (created || fullFormat) {
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sh;
}

function repairStudentClassColumn_(ss) {
  const sh = ss.getSheetByName(APP.SHEETS.STUDENTS);
  if (!sh || sh.getLastRow() <= 1) return;

  const n = sh.getLastRow() - 1;
  const range = sh.getRange(2, 4, n, 1);
  const raw = range.getValues();
  const display = range.getDisplayValues();
  const out = [];
  let needsWrite = false;

  for (let i = 0; i < n; i++) {
    let value = String(display[i][0] || '').trim();
    if (raw[i][0] instanceof Date) {
      value = value || Utilities.formatDate(raw[i][0], Session.getScriptTimeZone(), 'd/M');
      needsWrite = true;
    }
    out.push([value]);
  }

  range.setNumberFormat('@');
  if (needsWrite) range.setValues(out);
}

function invalidateCache_() {
  try {
    const cache = CacheService.getScriptCache();
    cache.removeAll(['v21_students_all', 'v21_questions_all', 'v21_ping']);
  } catch (_) {}
}

function ping_(ss) {
  const sh = ss.getSheetByName(APP.SHEETS.STUDENTS);
  const q = ss.getSheetByName(APP.SHEETS.QUESTIONS);
  const sc = ss.getSheetByName(APP.SHEETS.SCORES);
  const headers = sh.getLastColumn() ? sh.getRange(1, 1, 1, sh.getLastColumn()).getDisplayValues()[0] : [];
  return {
    ok: true,
    version: APP.VERSION,
    spreadsheetName: ss.getName(),
    studentRows: Math.max(0, sh.getLastRow() - 1),
    questionRows: Math.max(0, q.getLastRow() - 1),
    scoreRows: Math.max(0, sc.getLastRow() - 1),
    studentHeaders: headers,
    timeZone: Session.getScriptTimeZone(),
    serverTime: new Date().toISOString()
  };
}

function debug_(ss) {
  return {
    ok: true,
    version: APP.VERSION,
    spreadsheetName: ss.getName(),
    sheetNames: ss.getSheets().map(s => s.getName()),
    studentsSample: getStudents_(ss, '', true).students.slice(0, 5),
    ping: ping_(ss)
  };
}

function getStudents_(ss, classFilter, skipCache) {
  let students = null;
  const cache = CacheService.getScriptCache();
  if (!skipCache) {
    try {
      const cached = cache.get('v21_students_all');
      if (cached) students = JSON.parse(cached);
    } catch (_) {}
  }

  if (!students) {
    const sh = ss.getSheetByName(APP.SHEETS.STUDENTS);
    const lastRow = sh.getLastRow();
    if (lastRow <= 1) {
      students = [];
    } else {
      const width = Math.max(8, sh.getLastColumn());
      const range = sh.getRange(1, 1, lastRow, width);
      const raw = range.getValues();
      const display = range.getDisplayValues();
      const map = headerMap_(display[0]);
      students = [];

      for (let i = 1; i < raw.length; i++) {
        const r = raw[i], d = display[i];
        const name = textAt_(r, d, map, ['name', 'ho va ten', 'ho ten', 'ten'], 2);
        if (!name) continue;
        const cls = classAt_(r, d, map, 3);
        const stt = numberAt_(r, d, map, ['stt', 'so thu tu'], 1, i);
        const rawId = textAt_(r, d, map, ['id', 'ma hoc sinh', 'mahs'], 0);
        const stableId = rawId || (cls ? cls + '_' + stt : String(i));

        students.push({
          id: stableId,
          stt: stt,
          name: name,
          className: cls,
          totalPoint: numberAt_(r, d, map, ['totalpoint', 'diem +/-'], 4, 0),
          callCount: numberAt_(r, d, map, ['callcount', 'so lan goi'], 5, 0),
          lastCalled: isoAt_(r, map, ['lastcalled'], 6),
          active: boolAt_(r, d, map, ['active'], 7, true)
        });
      }
    }
    try {
      cache.put('v21_students_all', JSON.stringify(students), APP.CACHE_TTL_SEC);
    } catch (_) {}
  }

  const filtered = classFilter
    ? students.filter(s => String(s.className || '').trim() === classFilter)
    : students;

  return {
    ok: true,
    students: filtered,
    totalStudents: students.length,
    syncedAt: new Date().toISOString(),
    version: APP.VERSION
  };
}

function saveStudents_(ss, students) {
  if (!Array.isArray(students) || !students.length) {
    throw new Error('Danh sách học sinh trống. Không ghi đè Sheet Students.');
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = ss.getSheetByName(APP.SHEETS.STUDENTS);
    const rows = students
      .filter(s => String((s && s.name) || '').trim())
      .map((s, i) => {
        const cls = String(s.className || '').trim();
        const stt = Number(s.stt || i + 1);
        const id = String(s.id || (cls ? cls + '_' + stt : i + 1)).trim();
        return [
          id,
          stt,
          String(s.name || '').trim(),
          cls,
          Number(s.totalPoint || 0),
          Number(s.callCount || 0),
          s.lastCalled ? new Date(s.lastCalled) : '',
          s.active !== false
        ];
      });

    if (!rows.length) throw new Error('Không có học sinh hợp lệ để lưu.');
    if (sh.getLastRow() > 1) {
      sh.getRange(2, 1, sh.getLastRow() - 1, Math.max(8, sh.getLastColumn())).clearContent();
    }
    sh.getRange(2, 4, rows.length, 1).setNumberFormat('@');
    sh.getRange(2, 1, rows.length, 8).setValues(rows);
    invalidateCache_();
    SpreadsheetApp.flush();
    return { ok: true, saved: rows.length };
  } finally {
    lock.releaseLock();
  }
}

function getHistory_(ss) {
  const sh = ss.getSheetByName(APP.SHEETS.HISTORY);
  if (sh.getLastRow() <= 1) return { ok: true, history: [], version: APP.VERSION };
  const width = Math.max(8, sh.getLastColumn());
  const v = sh.getRange(2, 1, sh.getLastRow() - 1, width).getValues();
  const rows = [];
  for (let i = 0; i < v.length; i++) {
    if (!v[i][0] && !v[i][3]) continue;
    rows.push({
      timestamp: toIso_(v[i][0]),
      className: String(v[i][1] || ''),
      studentId: String(v[i][2] || ''),
      studentName: String(v[i][3] || ''),
      action: String(v[i][4] || ''),
      value: v[i][5],
      note: String(v[i][6] || ''),
      recordId: String(v[i][7] || '')
    });
  }
  return { ok: true, history: rows.slice(-1000), version: APP.VERSION };
}

function getScores_(ss, classFilter) {
  const sh = ss.getSheetByName(APP.SHEETS.SCORES);
  if (!sh || sh.getLastRow() <= 1) return { ok: true, scores: [], version: APP.VERSION };
  const width = Math.max(8, sh.getLastColumn());
  const v = sh.getRange(2, 1, sh.getLastRow() - 1, width).getValues();
  const rows = [];
  for (let i = 0; i < v.length; i++) {
    if (!v[i][0] && !v[i][3]) continue;
    const cls = String(v[i][1] || '').trim();
    if (classFilter && cls !== classFilter) continue;
    rows.push({
      timestamp: toIso_(v[i][0]),
      className: cls,
      studentId: String(v[i][2] || ''),
      studentName: String(v[i][3] || ''),
      callNo: Number(v[i][4] || 0),
      score: Number(v[i][5] || 0),
      note: String(v[i][6] || ''),
      recordId: String(v[i][7] || '')
    });
  }
  rows.reverse();
  return { ok: true, scores: rows.slice(0, 1500), version: APP.VERSION };
}

function addHistory_(ss, entry, skipLock) {
  const lock = skipLock ? null : LockService.getScriptLock();
  if (lock) lock.waitLock(15000);
  try {
    const sh = ss.getSheetByName(APP.SHEETS.HISTORY);
    const recId = String(entry.recordId || '').trim();

    if (recId && sh.getLastRow() > 1) {
      const checkRows = Math.min(250, sh.getLastRow() - 1);
      const startRow = sh.getLastRow() - checkRows + 1;
      const recentIds = sh.getRange(startRow, 8, checkRows, 1).getDisplayValues();
      for (let i = 0; i < recentIds.length; i++) {
        if (String(recentIds[i][0] || '').trim() === recId) {
          return { ok: true, duplicate: true, recordId: recId };
        }
      }
    }

    sh.appendRow([
      entry.timestamp ? new Date(entry.timestamp) : new Date(),
      String(entry.className || ''),
      String(entry.studentId || ''),
      String(entry.studentName || ''),
      String(entry.action || ''),
      entry.value === undefined ? '' : entry.value,
      String(entry.note || ''),
      recId
    ]);
    updateStudentStats_(ss, entry);
    invalidateCache_();
    SpreadsheetApp.flush();
    return { ok: true, recordId: recId };
  } finally {
    if (lock) lock.releaseLock();
  }
}

function saveScore_(ss, entry, skipLock) {
  const score = Number(entry.score);
  if (!Number.isFinite(score) || score < 0 || score > 10) {
    throw new Error('Điểm phải nằm trong khoảng từ 0 đến 10.');
  }
  const lock = skipLock ? null : LockService.getScriptLock();
  if (lock) lock.waitLock(20000);
  try {
    const callNo = Math.max(0, Number(entry.callNo || 0));
    const recId = String(entry.recordId || '').trim();
    const sh = ss.getSheetByName(APP.SHEETS.SCORES);
    const row = [
      entry.timestamp ? new Date(entry.timestamp) : new Date(),
      String(entry.className || ''),
      String(entry.studentId || ''),
      String(entry.studentName || ''),
      callNo,
      score,
      String(entry.note || ''),
      recId
    ];

    let target = -1;
    if (sh.getLastRow() > 1) {
      const width = Math.max(8, sh.getLastColumn());
      const data = sh.getRange(2, 1, sh.getLastRow() - 1, width).getDisplayValues();
      const sid = String(entry.studentId || '').trim();
      const sname = String(entry.studentName || '').trim();
      const cls = String(entry.className || '').trim();

      for (let i = data.length - 1; i >= 0; i--) {
        const rowRecId = String(data[i][7] || '').trim();
        if (recId && rowRecId === recId) {
          target = i + 2;
          break;
        }
        if (callNo > 0) {
          const sameId = sid && String(data[i][2] || '').trim() === sid;
          const sameFallback = !sameId && sname && String(data[i][3] || '').trim() === sname && String(data[i][1] || '').trim() === cls;
          if ((sameId || sameFallback) && Number(data[i][4] || 0) === callNo) {
            target = i + 2;
            break;
          }
        }
      }
    }

    if (target > 0) {
      sh.getRange(target, 1, 1, 8).setValues([row]);
    } else {
      sh.appendRow(row);
    }

    addHistory_(ss, {
      timestamp: entry.timestamp || new Date().toISOString(),
      className: entry.className,
      studentId: entry.studentId,
      studentName: entry.studentName,
      action: target > 0 ? 'SCORE_UPDATE' : 'SCORE',
      value: score,
      note: (callNo ? ('Lần gọi #' + callNo + ' - ') : '') + String(entry.note || ''),
      recordId: recId ? (recId + '_H') : ''
    }, true);

    invalidateCache_();
    SpreadsheetApp.flush();
    return {
      ok: true,
      updated: target > 0,
      callNo: callNo,
      score: score,
      recordId: recId
    };
  } finally {
    if (lock) lock.releaseLock();
  }
}

function deleteScore_(ss, entry) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = ss.getSheetByName(APP.SHEETS.SCORES);
    if (!sh || sh.getLastRow() <= 1) return { ok: true, deleted: false };

    const width = Math.max(8, sh.getLastColumn());
    const data = sh.getRange(2, 1, sh.getLastRow() - 1, width).getDisplayValues();
    const recId = String(entry.recordId || '').trim();
    const sid = String(entry.studentId || '').trim();
    const callNo = Number(entry.callNo || 0);
    let target = -1;

    for (let i = data.length - 1; i >= 0; i--) {
      const rowRecId = String(data[i][7] || '').trim();
      const sameId = sid && String(data[i][2] || '').trim() === sid && Number(data[i][4] || 0) === callNo;
      if ((recId && rowRecId === recId) || sameId) {
        target = i + 2;
        break;
      }
    }

    if (target > 0) {
      sh.deleteRow(target);
      addHistory_(ss, {
        timestamp: new Date().toISOString(),
        className: entry.className || '',
        studentId: sid,
        studentName: entry.studentName || '',
        action: 'SCORE_DELETE',
        value: '',
        note: 'Hủy điểm lần gọi #' + callNo + (entry.reason ? (' (' + entry.reason + ')') : ''),
        recordId: recId ? (recId + '_DEL') : ''
      }, true);
    }

    invalidateCache_();
    SpreadsheetApp.flush();
    return { ok: true, deleted: target > 0, recordId: recId };
  } finally {
    lock.releaseLock();
  }
}

function batchSync_(ss, items) {
  if (!Array.isArray(items) || !items.length) return { ok: true, processed: 0 };
  const lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    const results = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i] || {};
      const type = String(item.action || '').trim();
      const payload = item.entry || item;
      if (type === 'saveScore') {
        results.push(saveScore_(ss, payload, true));
      } else if (type === 'addHistory') {
        results.push(addHistory_(ss, payload, true));
      }
    }
    return { ok: true, processed: results.length, results: results };
  } finally {
    lock.releaseLock();
  }
}

function updateStudentStats_(ss, entry) {
  const sh = ss.getSheetByName(APP.SHEETS.STUDENTS);
  const last = sh.getLastRow();
  if (last <= 1) return;

  const data = sh.getRange(2, 1, last - 1, 8).getValues();
  const disp = sh.getRange(2, 1, last - 1, 8).getDisplayValues();
  const id = String(entry.studentId || '').trim();
  const name = String(entry.studentName || '').trim();
  const cls = String(entry.className || '').trim();
  let target = -1;

  for (let i = 0; i < data.length; i++) {
    const rowId = String(disp[i][0] || data[i][0] || '').trim();
    const rowName = String(disp[i][2] || data[i][2] || '').trim();
    const rowClass = classCellText_(data[i][3], disp[i][3]);
    const idMatch = id && rowId === id;
    const fallbackMatch = !idMatch && name && rowName === name && rowClass === cls;
    if (idMatch || fallbackMatch) {
      target = i + 2;
      break;
    }
  }
  if (target < 0) return;

  const action = String(entry.action || '');
  if (action === 'CALL') {
    const old = Number(sh.getRange(target, 6).getValue() || 0);
    sh.getRange(target, 6).setValue(old + 1);
    sh.getRange(target, 7).setValue(entry.timestamp ? new Date(entry.timestamp) : new Date());
  } else if (action === 'PLUS' || action === 'MINUS') {
    const old = Number(sh.getRange(target, 5).getValue() || 0);
    sh.getRange(target, 5).setValue(old + Number(entry.value || 0));
  }
}

function getQuestions_(ss, filterParams) {
  filterParams = filterParams || {};
  const sh = ss.getSheetByName(APP.SHEETS.QUESTIONS);
  const last = sh.getLastRow();
  if (last <= 1) return { ok: true, questions: [], version: APP.VERSION };

  const raw = sh.getRange(2, 1, last - 1, 14).getValues();
  const disp = sh.getRange(2, 1, last - 1, 14).getDisplayValues();
  const fSubject = String(filterParams.subject || '').trim();
  const fGrade = String(filterParams.grade || '').trim();
  const fChapter = String(filterParams.chapter || '').trim();
  const fTopic = String(filterParams.topic || '').trim();
  const fLevel = String(filterParams.level || '').trim();

  const out = [];
  for (let i = 0; i < raw.length; i++) {
    if (!raw[i][0] && !raw[i][7]) continue;
    const subject = String(disp[i][4] || raw[i][4] || '').trim();
    const grade = String(disp[i][3] || raw[i][3] || '').trim();
    const chapter = String(disp[i][5] || raw[i][5] || '').trim();
    const topic = String(disp[i][6] || raw[i][6] || '').trim();
    const level = String(disp[i][2] || raw[i][2] || '').trim();

    if (fSubject && subject !== fSubject) continue;
    if (fGrade && grade !== fGrade) continue;
    if (fChapter && chapter !== fChapter) continue;
    if (fTopic && topic !== fTopic) continue;
    if (fLevel && level !== fLevel) continue;

    let options = [];
    try {
      options = JSON.parse(String(raw[i][9] || '[]'));
    } catch (_) {
      options = [];
    }

    out.push({
      id: String(disp[i][0] || raw[i][0] || ''),
      type: String(disp[i][1] || raw[i][1] || 'MC'),
      level: level,
      grade: grade,
      subject: subject,
      chapter: chapter,
      topic: topic,
      question: String(raw[i][7] || ''),
      image: String(raw[i][8] || ''),
      options: options,
      answer: String(disp[i][10] || raw[i][10] || ''),
      explanation: String(raw[i][11] || ''),
      sourceFile: String(disp[i][12] || raw[i][12] || ''),
      updatedAt: toIso_(raw[i][13])
    });
  }
  return { ok: true, questions: out, version: APP.VERSION };
}

function saveQuestions_(ss, questions) {
  if (!Array.isArray(questions) || !questions.length) {
    throw new Error('Không có câu hỏi để lưu.');
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    const sh = ss.getSheetByName(APP.SHEETS.QUESTIONS);
    const existing = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 14).getValues() : [];
    const order = [];
    const byKey = {};

    existing.forEach(row => {
      const id = String(row[0] || '').trim();
      if (!id) return;
      const dedupeKey = id + '|' + String(row[3] || '').trim() + '|' + String(row[5] || '').trim();
      byKey[dedupeKey] = row;
      order.push(dedupeKey);
    });

    let inserted = 0, updated = 0;
    questions.forEach((q, i) => {
      const questionText = String(q.question || '').trim();
      if (!questionText) return;
      const id = String(q.id || ('Q_' + Date.now() + '_' + i)).trim();
      const grade = String(q.grade || '').trim();
      const chapter = String(q.chapter || '').trim();
      const dedupeKey = id + '|' + grade + '|' + chapter;

      const row = [
        id,
        String(q.type || 'MC').trim().toUpperCase(),
        String(q.level || '').trim(),
        grade,
        String(q.subject || '').trim(),
        chapter,
        String(q.topic || '').trim(),
        questionText,
        String(q.image || q.Image || '').trim(),
        JSON.stringify(q.options || []),
        String(q.answer !== undefined ? q.answer : (q.correctAnswer || '')),
        String(q.explanation || q.explain || ''),
        String(q.sourceFile || ''),
        new Date()
      ];

      if (byKey[dedupeKey]) {
        byKey[dedupeKey] = row;
        updated++;
      } else {
        byKey[dedupeKey] = row;
        order.push(dedupeKey);
        inserted++;
      }
    });

    const rows = order.map(k => byKey[k]);
    if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 14).clearContent();
    if (rows.length) sh.getRange(2, 1, rows.length, 14).setValues(rows);
    invalidateCache_();
    SpreadsheetApp.flush();
    return { ok: true, inserted: inserted, updated: updated, total: rows.length };
  } finally {
    lock.releaseLock();
  }
}

function clearQuestionBank_(ss) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh = ss.getSheetByName(APP.SHEETS.QUESTIONS);
    if (sh && sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 14).clearContent();
    invalidateCache_();
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function output_(data, callback) {
  const json = JSON.stringify(data);
  const cb = String(callback || '');
  if (cb && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(cb)) {
    return ContentService.createTextOutput(cb + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return jsonOutput_(data);
}

function jsonOutput_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function parsePayload_(e) {
  if (e && e.postData && e.postData.contents) {
    try { return JSON.parse(e.postData.contents); } catch (_) {}
  }
  return (e && e.parameter) || {};
}

function headerMap_(headers) {
  const map = {};
  headers.forEach((h, i) => { map[normalizeHeader_(h)] = i; });
  return map;
}

function normalizeHeader_(v) {
  let s = String(v || '').trim().toLowerCase();
  try {
    s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
  } catch (_) {}
  return s;
}

function findIndex_(map, names, fallback) {
  for (let i = 0; i < names.length; i++) {
    const k = normalizeHeader_(names[i]);
    if (Object.prototype.hasOwnProperty.call(map, k)) return map[k];
  }
  return fallback;
}

function textAt_(raw, display, map, names, fallback) {
  const i = findIndex_(map, names, fallback);
  return String((display && display[i]) || raw[i] || '').trim();
}

function classAt_(raw, display, map, fallback) {
  const i = findIndex_(map, ['classname', 'lop', 'class'], fallback);
  return classCellText_(raw[i], display[i]);
}

function classCellText_(rawValue, displayValue) {
  if (rawValue instanceof Date) {
    const shown = String(displayValue || '').trim();
    if (shown) return shown;
    return Utilities.formatDate(rawValue, Session.getScriptTimeZone(), 'd/M');
  }
  return String(displayValue || rawValue || '').trim();
}

function numberAt_(raw, display, map, names, fallback, defaultValue) {
  const i = findIndex_(map, names, fallback);
  const n = Number(raw[i] !== '' ? raw[i] : display[i]);
  return Number.isFinite(n) ? n : defaultValue;
}

function boolAt_(raw, display, map, names, fallback, defaultValue) {
  const i = findIndex_(map, names, fallback);
  const v = raw[i] !== '' ? raw[i] : display[i];
  if (v === '' || v === null || v === undefined) return defaultValue;
  if (typeof v === 'boolean') return v;
  const s = String(v).trim().toLowerCase();
  if (['false', '0', 'no', 'off', 'khong'].indexOf(normalizeHeader_(s)) >= 0) return false;
  if (['true', '1', 'yes', 'on', 'co'].indexOf(normalizeHeader_(s)) >= 0) return true;
  return defaultValue;
}

function isoAt_(raw, map, names, fallback) {
  const i = findIndex_(map, names, fallback);
  return toIso_(raw[i]);
}

function toIso_(v) {
  if (!v) return '';
  try {
    const d = v instanceof Date ? v : new Date(v);
    return isNaN(d.getTime()) ? '' : d.toISOString();
  } catch (_) { return ''; }
}

function errorText_(err) {
  return String(err && err.message ? err.message : err);
}