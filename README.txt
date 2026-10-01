LOP HOC TUONG TAC 3D V7.0
=========================

FILES
- index.html           : giao dien, chiec non goi ten 3D, cham diem, game
- api/sheet.js         : Vercel proxy goi Google Apps Script
- Code.gs              : backend dat trong Apps Script cua Google Sheet

CAP NHAT TU V6
1. Thay index.html tren GitHub.
2. Thay Code.gs trong Google Apps Script.
3. Chay setup() 1 lan. V7 se tu nang cap sheet Scores thanh:
   timestamp | className | studentId | studentName | callNo | score | note
   Du lieu Scores cu duoc giu lai.
4. Deploy > Manage deployments > Edit > New version > Deploy.
5. api/sheet.js giu nguyen URL Apps Script hien tai. Neu URL /exec thay doi, sua bien APPS_SCRIPT_URL trong file nay.
6. Cho Vercel deploy xong, bam Ctrl+F5.

GOI TEN V7
- Vong quay 3D WebGL hien hoc sinh cua lop dang chon.
- Neu bat "Khong goi lai", hoc sinh da duoc goi se bi loai o lan quay tiep theo.
- Am thanh tick duoc tao bang WebAudio, khong can file mp3.
- Khi dung, hoc sinh duoc ghi CALL vao History va tang callCount.

DIEM THEO LAN GOI
- Sau khi quay xong, ben phai hien "Lan goi #N".
- Nhap diem 0-10, ghi chu, bam LUU DIEM LAN GOI NAY.
- Scores luu callNo, nen moi lan goi co diem rieng.
- Neu sua diem cua cung hoc sinh/cung callNo, V7 cap nhat dong cu thay vi tao dong trung.
