# LỚP HỌC TƯƠNG TÁC TOÁN & TIN V15

Bản V15 là bản gom hoàn chỉnh để triển khai lên GitHub/Vercel.

## Cấu trúc
- `index.html`: giao diện gọi tên + ghi điểm + trò chơi.
- `Code.gs`: backend Google Apps Script.
- `api/sheet.js`: proxy Vercel kết nối Apps Script.
- `assets/`: hình kéo co đã làm rõ từ ảnh người dùng cung cấp.

## V15 nổi bật
- Gọi tên 3D, ghi điểm theo từng lần gọi, sổ điểm cả lớp.
- Chế độ trình chiếu vòng quay thu nhỏ chiếc nón để vẫn thấy bảng điều khiển.
- Game Kéo co/Đua xe nằm trong một mục Trò chơi.
- Hình/bảng câu hỏi lớn hơn, câu hỏi và đáp án lớn hơn để chiếu TV.
- Sân game được thu gọn để không chiếm chỗ nội dung.
- MathJax xử lý cả LaTeX bị escape hai lần như `$\\dfrac{11}{10}$`.
- Cả hai đội cùng được quyền bấm đầu câu; đội sai bị khóa, quyền còn lại chuyển sang đội kia.
- Đúng: cộng 1 điểm + hiệu ứng xanh + banner lớn. Sai: rung/đỏ + banner lớn.
- Đồ họa kéo co sử dụng hình minh họa đã làm rõ, có chuyển động theo điểm.

## Cập nhật
1. Upload `index.html`, thư mục `assets/` và `api/` lên GitHub.
2. Nếu đang dùng `api/sheet.js` cũ hoạt động tốt, có thể giữ file cũ; file V15 đã kèm sẵn proxy tương thích.
3. Trong Google Sheet > Extensions > Apps Script, thay `Code.gs` bằng bản V15.
4. Chạy `setup()` một lần nếu chưa từng chạy hoặc muốn kiểm tra cấu trúc Sheet.
5. Deploy Apps Script bằng `Manage deployments > Edit > New version > Deploy`.
6. Chờ Vercel deploy, sau đó nhấn `Ctrl + F5`.

## Lưu ý MathJax
Trong JSON/Sheet có thể viết `$\frac{3}{4}$`, `\frac{3}{4}`, `$x^2+1$` hoặc `\sqrt{144}`. V15 tự xử lý các trường hợp phổ biến trước khi MathJax render.
