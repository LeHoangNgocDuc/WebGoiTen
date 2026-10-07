/**
 * LOP HOC TUONG TAC - BACKEND V17.0
 * Google Apps Script bound to the Google Sheet.
 *
 * FIRST USE:
 * 1) Open the Google Sheet > Extensions > Apps Script.
 * 2) Paste this entire file into Code.gs and Save.
 * 3) Select function setup > Run once > grant permissions.
 * 4) Deploy > Manage deployments > Edit > New version > Deploy.
 */

const APP = {
  VERSION: '17.0.0',
  DB_KEY: 'CLASSROOM_DB_ID',
  SHEETS: {
    STUDENTS: 'Students',
    HISTORY: 'History',
    SCORES: 'Scores',
    QUESTIONS: 'QuestionBank'
  }
};

// OPTIONAL FALLBACK.
// Normally leave blank and run setup() once.
// If setup() is impossible, paste the Google Sheet ID between the quotes.
// Example Sheet URL: https://docs.google.com/spreadsheets/d/SHEET_ID/edit
// 🔴 CÓ THỂ DÁN ID GOOGLE SHEET VÀO ĐÂY ĐỂ KHÔNG PHỤ THUỘC setup().
// Nếu để trống, hãy chạy setup() một lần trong Apps Script editor.
const SPREADSHEET_ID = ''; // ví dụ: 1AbC...XYZ

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('Khong tim thay Google Sheet dang mo. Hay mo Sheet > Extensions > Apps Script, sau do chay setup() lai.');
  }
  PropertiesService.getScriptProperties().setProperty(APP.DB_KEY, ss.getId());
  ensureSheets_(ss);
  repairStudentClassColumn_(ss);
  SpreadsheetApp.flush();
  return {
    ok: true,
    version: APP.VERSION,
    spreadsheetId: ss.getId(),
    spreadsheetName: ss.getName(),
    studentRows: Math.max(0, ss.getSheetByName(APP.SHEETS.STUDENTS).getLastRow() - 1),
    message: 'Da lien ket Web App voi Google Sheet nay.'
  };
}

function onOpen() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) {
      PropertiesService.getScriptProperties().setProperty(APP.DB_KEY, ss.getId());
      ensureSheets_(ss);
      SpreadsheetApp.getUi()
        .createMenu('Web goi ten')
        .addItem('Kiem tra / sua cau truc du lieu', 'setup')
        .addToUi();
    }
  } catch (_) {}
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  const action = String(p.action || 'ping');
  const callback = String(p.prefix || p.callback || '');

  try {
    // alive KHÔNG truy cập Spreadsheet. Dùng để kiểm tra deployment / quyền truy cập trước.
    if (action === 'alive') {
      return output_({ ok: true, version: APP.VERSION, message: 'Apps Script Web App is reachable.' }, callback);
    }

    const ss = db_();
    ensureSheets_(ss);
    let result;

    if (action === 'ping') result = ping_(ss);
    else if (action === 'students') result = getStudents_(ss);
    else if (action === 'history') result = getHistory_(ss);
    else if (action === 'scores') result = getScores_(ss);
    else if (action === 'questions') result = getQuestions_(ss);
    else if (action === 'debug') result = debug_(ss);
    else result = { ok: false, error: 'Unknown GET action: ' + action, version: APP.VERSION };

    return output_(result, callback);
  } catch (err) {
    return output_({
      ok: false,
      error: errorText_(err),
      version: APP.VERSION,
      hint: 'Mo Google Sheet > Extensions > Apps Script > chay setup() mot lan, sau do Deploy New version.'
    }, callback);
  }
}

function doPost(e) {
  try {
    const ss = db_();
    ensureSheets_(ss);
    const payload = parsePayload_(e);
    const action = String(payload.action || '');
    let result;

    if (action === 'saveStudents') result = saveStudents_(ss, payload.students || []);
    else if (action === 'addHistory') result = addHistory_(ss, payload.entry || payload);
    else if (action === 'saveScore') result = saveScore_(ss, payload.entry || payload);
    else if (action === 'saveQuestions') result = saveQuestions_(ss, payload.questions || []);
    else if (action === 'clearQuestionBank') result = clearQuestionBank_(ss);
    else result = { ok: false, error: 'Unknown POST action: ' + action };

    result.version = APP.VERSION;
    return jsonOutput_(result);
  } catch (err) {
    return jsonOutput_({ ok: false, error: errorText_(err), version: APP.VERSION });
  }
}

function db_() {
  let id = String(SPREADSHEET_ID || '').trim();
  let source = id ? 'constant' : '';

  if (!id) {
    id = String(PropertiesService.getScriptProperties().getProperty(APP.DB_KEY) || '').trim();
    if (id) source = 'script-property';
  }

  if (!id) {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) {
      id = active.getId();
      source = 'active-spreadsheet';
      PropertiesService.getScriptProperties().setProperty(APP.DB_KEY, id);
    }
  }

  if (!id) {
    throw new Error('Chua lien ket Google Sheet. Chay ham setup() mot lan trong Apps Script editor.');
  }

  return SpreadsheetApp.openById(id);
}

function ensureSheets_(ss) {
  ensureSheet_(ss, APP.SHEETS.STUDENTS, ['id', 'stt', 'name', 'className', 'totalPoint', 'callCount', 'lastCalled', 'active']);
  ensureSheet_(ss, APP.SHEETS.HISTORY, ['timestamp', 'className', 'studentId', 'studentName', 'action', 'value', 'note']);
  ensureScoresSheet_(ss);
  ensureQuestionSheet_(ss);
}

function ensureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    const width = Math.max(headers.length, sh.getLastColumn());
    const existing = sh.getRange(1, 1, 1, width).getDisplayValues()[0];
    if (existing.every(v => !String(v || '').trim())) {
      sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  return sh;
}


/**
 * V7: Scores lưu rõ điểm theo từng lần gọi.
 * Cấu trúc mới: timestamp | className | studentId | studentName | callNo | score | note
 * Nếu sheet Scores cũ chỉ có 6 cột, tự chèn cột callNo tại E mà không mất dữ liệu cũ.
 */
function ensureScoresSheet_(ss) {
  const headers = ['timestamp', 'className', 'studentId', 'studentName', 'callNo', 'score', 'note'];
  let sh = ss.getSheetByName(APP.SHEETS.SCORES);
  if (!sh) sh = ss.insertSheet(APP.SHEETS.SCORES);

  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    const width = Math.max(7, sh.getLastColumn());
    const h = sh.getRange(1, 1, 1, width).getDisplayValues()[0].map(normalizeHeader_);
    const hasCallNo = h.indexOf('callno') >= 0 || h.indexOf('lan goi') >= 0;
    const scoreAtE = h[4] === 'score' || h[4] === 'diem';
    if (!hasCallNo && scoreAtE) {
      sh.insertColumnAfter(4);
    }
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  return sh;
}


/**
 * V13: QuestionBank hỗ trợ ảnh minh họa riêng cho từng câu hỏi.
 * Cấu trúc: id | type | level | grade | subject | chapter | topic | question | image |
 * optionsJson | correctAnswer | explain | sourceFile | updatedAt
 * Nếu sheet V7/V9 cũ chưa có cột image, tự chèn sau cột question mà không mất dữ liệu.
 */
function ensureQuestionSheet_(ss) {
  const headers = [
    'id', 'type', 'level', 'grade', 'subject', 'chapter', 'topic', 'question', 'image',
    'optionsJson', 'correctAnswer', 'explain', 'sourceFile', 'updatedAt'
  ];
  let sh = ss.getSheetByName(APP.SHEETS.QUESTIONS);
  if (!sh) sh = ss.insertSheet(APP.SHEETS.QUESTIONS);

  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    const width = Math.max(headers.length, sh.getLastColumn());
    const current = sh.getRange(1, 1, 1, width).getDisplayValues()[0].map(normalizeHeader_);
    const hasImage = current.indexOf('image') >= 0 || current.indexOf('hinh') >= 0 || current.indexOf('hinhanh') >= 0;
    const optionsAtI = current[8] === 'optionsjson' || current[8] === 'options';
    if (!hasImage && optionsAtI) {
      sh.insertColumnAfter(8);
    }
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  return sh;
}

/**
 * Excel/Google Sheets often interprets class names such as 7/2 as dates.
 * This converts the visible value in column D back to plain text once.
 */
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
      // Preserve what the teacher sees (e.g. 7/2), not the date serial value.
      value = value || Utilities.formatDate(raw[i][0], Session.getScriptTimeZone(), 'd/M');
      needsWrite = true;
    }
    out.push([value]);
  }

  range.setNumberFormat('@');
  if (needsWrite) range.setValues(out);
}

function ping_(ss) {
  const sh = ss.getSheetByName(APP.SHEETS.STUDENTS);
  const q = ss.getSheetByName(APP.SHEETS.QUESTIONS);
  const sc = ss.getSheetByName(APP.SHEETS.SCORES);
  const headers = sh.getLastColumn() ? sh.getRange(1, 1, 1, sh.getLastColumn()).getDisplayValues()[0] : [];
  return {
    ok: true,
    version: APP.VERSION,
    spreadsheetId: ss.getId(),
    spreadsheetName: ss.getName(),
    studentRows: Math.max(0, sh.getLastRow() - 1),
    questionRows: Math.max(0, q.getLastRow() - 1),
    scoreRows: Math.max(0, sc.getLastRow() - 1),
    studentHeaders: headers,
    timeZone: Session.getScriptTimeZone()
  };
}

function debug_(ss) {
  return {
    ok: true,
    version: APP.VERSION,
    spreadsheetId: ss.getId(),
    spreadsheetName: ss.getName(),
    sheetNames: ss.getSheets().map(s => s.getName()),
    students: getStudents_(ss).students.slice(0, 5),
    ping: ping_(ss)
  };
}

function getStudents_(ss) {
  const sh = ss.getSheetByName(APP.SHEETS.STUDENTS);
  const lastRow = sh.getLastRow();
  if (lastRow <= 1) return { ok: true, students: [], version: APP.VERSION };

  const width = Math.max(8, sh.getLastColumn());
  const range = sh.getRange(1, 1, lastRow, width);
  const raw = range.getValues();
  const display = range.getDisplayValues();
  const map = headerMap_(display[0]);
  const students = [];

  for (let i = 1; i < raw.length; i++) {
    const r = raw[i], d = display[i];
    const name = textAt_(r, d, map, ['name', 'ho va ten', 'ho ten', 'ten'], 2);
    if (!name) continue;

    students.push({
      id: textAt_(r, d, map, ['id'], 0) || String(i),
      stt: numberAt_(r, d, map, ['stt', 'so thu tu'], 1, i),
      name: name,
      className: classAt_(r, d, map, 3),
      totalPoint: numberAt_(r, d, map, ['totalpoint', 'diem +/-'], 4, 0),
      callCount: numberAt_(r, d, map, ['callcount', 'so lan goi'], 5, 0),
      lastCalled: isoAt_(r, map, ['lastcalled'], 6),
      active: boolAt_(r, d, map, ['active'], 7, true)
    });
  }
  return { ok: true, students: students, version: APP.VERSION };
}

function saveStudents_(ss, students) {
  if (!Array.isArray(students) || !students.length) throw new Error('Danh sach hoc sinh trong. Khong ghi de Students.');
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = ss.getSheetByName(APP.SHEETS.STUDENTS);
    const rows = students
      .filter(s => String(s && s.name || '').trim())
      .map((s, i) => [
        String(s.id || i + 1),
        Number(s.stt || i + 1),
        String(s.name || '').trim(),
        String(s.className || '').trim(),
        Number(s.totalPoint || 0),
        Number(s.callCount || 0),
        s.lastCalled ? new Date(s.lastCalled) : '',
        s.active !== false
      ]);

    if (!rows.length) throw new Error('Khong co hoc sinh hop le de luu.');
    if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, Math.max(8, sh.getLastColumn())).clearContent();
    sh.getRange(2, 4, rows.length, 1).setNumberFormat('@');
    sh.getRange(2, 1, rows.length, 8).setValues(rows);
    SpreadsheetApp.flush();
    return { ok: true, saved: rows.length };
  } finally {
    lock.releaseLock();
  }
}

function getHistory_(ss) {
  const sh = ss.getSheetByName(APP.SHEETS.HISTORY);
  const v = sh.getDataRange().getValues();
  const rows = [];
  for (let i = 1; i < v.length; i++) {
    if (!v[i][0]) continue;
    rows.push({
      timestamp: toIso_(v[i][0]),
      className: String(v[i][1] || ''),
      studentId: String(v[i][2] || ''),
      studentName: String(v[i][3] || ''),
      action: String(v[i][4] || ''),
      value: v[i][5],
      note: String(v[i][6] || '')
    });
  }
  return { ok: true, history: rows.slice(-1000), version: APP.VERSION };
}

function getScores_(ss) {
  const sh = ensureScoresSheet_(ss);
  const v = sh.getDataRange().getValues();
  const rows = [];
  for (let i = 1; i < v.length; i++) {
    if (!v[i][0] && !v[i][3]) continue;
    rows.push({
      timestamp: toIso_(v[i][0]),
      className: String(v[i][1] || ''),
      studentId: String(v[i][2] || ''),
      studentName: String(v[i][3] || ''),
      callNo: Number(v[i][4] || 0),
      score: Number(v[i][5] || 0),
      note: String(v[i][6] || '')
    });
  }
  rows.reverse();
  return { ok: true, scores: rows.slice(0, 1500), version: APP.VERSION };
}

function addHistory_(ss, entry) {
  const sh = ss.getSheetByName(APP.SHEETS.HISTORY);
  sh.appendRow([
    entry.timestamp ? new Date(entry.timestamp) : new Date(),
    String(entry.className || ''),
    String(entry.studentId || ''),
    String(entry.studentName || ''),
    String(entry.action || ''),
    entry.value === undefined ? '' : entry.value,
    String(entry.note || '')
  ]);
  updateStudentStats_(ss, entry);
  SpreadsheetApp.flush();
  return { ok: true };
}

function saveScore_(ss, entry) {
  const score = Number(entry.score);
  if (!Number.isFinite(score) || score < 0 || score > 10) throw new Error('Diem phai tu 0 den 10.');
  const callNo = Math.max(0, Number(entry.callNo || 0));
  const sh = ensureScoresSheet_(ss);
  const row = [
    entry.timestamp ? new Date(entry.timestamp) : new Date(),
    String(entry.className || ''),
    String(entry.studentId || ''),
    String(entry.studentName || ''),
    callNo,
    score,
    String(entry.note || '')
  ];

  // Nếu cùng học sinh + cùng lần gọi đã có điểm thì cập nhật, không tạo bản sao.
  let target = -1;
  if (callNo > 0 && sh.getLastRow() > 1) {
    const data = sh.getRange(2, 1, sh.getLastRow() - 1, 7).getDisplayValues();
    const sid = String(entry.studentId || '').trim();
    const sname = String(entry.studentName || '').trim();
    const cls = String(entry.className || '').trim();
    for (let i = 0; i < data.length; i++) {
      const sameId = sid && String(data[i][2] || '').trim() === sid;
      const sameFallback = !sameId && sname && String(data[i][3] || '').trim() === sname && String(data[i][1] || '').trim() === cls;
      if ((sameId || sameFallback) && Number(data[i][4] || 0) === callNo) { target = i + 2; break; }
    }
  }
  if (target > 0) sh.getRange(target, 1, 1, 7).setValues([row]);
  else sh.appendRow(row);

  addHistory_(ss, {
    timestamp: entry.timestamp || new Date().toISOString(),
    className: entry.className,
    studentId: entry.studentId,
    studentName: entry.studentName,
    action: 'SCORE',
    value: score,
    note: (callNo ? ('Lan goi #' + callNo + ' - ') : '') + String(entry.note || '')
  });
  SpreadsheetApp.flush();
  return { ok: true, updated: target > 0, callNo: callNo, score: score };
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
    if (idMatch || fallbackMatch) { target = i + 2; break; }
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

function getQuestions_(ss) {
  const sh = ensureQuestionSheet_(ss);
  const last = sh.getLastRow();
  if (last <= 1) return { ok: true, questions: [], version: APP.VERSION };

  const raw = sh.getRange(2, 1, last - 1, 14).getValues();
  const disp = sh.getRange(2, 1, last - 1, 14).getDisplayValues();
  const out = [];

  for (let i = 0; i < raw.length; i++) {
    if (!raw[i][0] && !raw[i][7]) continue;
    let options = [];
    try { options = JSON.parse(String(raw[i][9] || '[]')); } catch (_) { options = []; }
    out.push({
      id: String(disp[i][0] || raw[i][0] || ''),
      type: String(disp[i][1] || raw[i][1] || ''),
      level: String(disp[i][2] || raw[i][2] || ''),
      grade: String(disp[i][3] || raw[i][3] || ''),
      subject: String(disp[i][4] || raw[i][4] || ''),
      chapter: String(disp[i][5] || raw[i][5] || ''),
      topic: String(disp[i][6] || raw[i][6] || ''),
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
  if (!Array.isArray(questions) || !questions.length) throw new Error('Khong co cau hoi de luu.');
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = ensureQuestionSheet_(ss);
    const existing = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 14).getValues() : [];
    const order = [];
    const byId = {};

    existing.forEach(row => {
      const id = String(row[0] || '').trim();
      if (!id) return;
      byId[id] = row;
      order.push(id);
    });

    let inserted = 0, updated = 0;
    questions.forEach((q, i) => {
      const id = String(q.id || ('Q_' + Date.now() + '_' + i)).trim();
      const row = [
        id,
        String(q.type || ''),
        String(q.level || ''),
        String(q.grade || ''),
        String(q.subject || ''),
        String(q.chapter || ''),
        String(q.topic || ''),
        String(q.question || ''),
        String(q.image || q.Image || ''),
        JSON.stringify(q.options || []),
        String(q.answer !== undefined ? q.answer : (q.correctAnswer || '')),
        String(q.explanation || q.explain || ''),
        String(q.sourceFile || ''),
        new Date()
      ];
      if (byId[id]) { byId[id] = row; updated++; }
      else { byId[id] = row; order.push(id); inserted++; }
    });

    const rows = order.map(id => byId[id]);
    if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 14).clearContent();
    if (rows.length) sh.getRange(2, 1, rows.length, 14).setValues(rows);
    SpreadsheetApp.flush();
    return { ok: true, inserted: inserted, updated: updated, total: rows.length };
  } finally {
    lock.releaseLock();
  }
}

function clearQuestionBank_(ss) {
  const sh = ensureQuestionSheet_(ss);
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 14).clearContent();
  return { ok: true };
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
