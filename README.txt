V6 - CAU TRUC DEPLOY

Google Apps Script:
- Code.gs (dan vao Apps Script, Save, chay setup(), Deploy New version)

GitHub/Vercel:
- index.html
- api/sheet.js

Quan trong: GitHub phai giu dung thu muc api/sheet.js.
Sau deploy, mo:
  https://TEN-MIEN-VERCEL/api/sheet?action=alive
Neu JSON {ok:true,...}: proxy va Apps Script da ket noi.
Sau do mo:
  https://TEN-MIEN-VERCEL/api/sheet?action=ping
Neu co studentRows > 0: backend da doc duoc Google Sheet.
