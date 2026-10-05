# LỚP HỌC TƯƠNG TÁC TOÁN & TIN V12

Bản V12 khôi phục đầy đủ phần gọi tên / ghi điểm học sinh và hợp nhất trò chơi vào đúng một mục trên thanh điều hướng.

## 1. Gọi tên + ghi điểm
- Vòng quay WebGL 3D chiếm phần lớn màn hình.
- Có chế độ trình chiếu toàn màn hình.
- Nạp danh sách học sinh từ Google Sheet hoặc Excel.
- Cho phép gọi lại học sinh nhiều lần.
- Mỗi lần gọi có `callNo` riêng và có thể ghi điểm 0-10 + ghi chú.
- Sổ điểm cả lớp luôn hiển thị bên cạnh vòng quay.
- Có thể bấm `Gọi & ghi điểm` ngay từ sổ điểm.
- Có điểm cộng / trừ và lịch sử đầy đủ.

## 2. Trò chơi là MỘT mục duy nhất
Trong tab `🎮 Trò chơi`, giáo viên chọn:
- Môn: Toán / Tin (theo dữ liệu ngân hàng)
- Khối
- Chương
- Bài / chủ đề
- Loại game: Kéo co 3D hoặc Đua xe 3D
- Tên hai đội
- Điểm thắng
- Thời gian trả lời mỗi lượt

Không tạo thêm tab riêng cho Kéo co hay Đua xe.

## 3. Bố cục game dành cho TV
- Câu hỏi chỉ hiển thị MỘT lần ở chính giữa phía trên.
- Nếu có hình ảnh / bảng số liệu, ảnh nằm bên trái nội dung câu hỏi.
- Nội dung câu hỏi dùng cỡ chữ lớn, tự co giãn theo độ dài.
- Công thức Toán dùng MathJax.
- Bên trái: bảng đáp án Đội A.
- Chính giữa: sân 3D.
- Bên phải: bảng đáp án Đội B.
- Đội trả lời sai -> tự chuyển quyền sang đội còn lại.
- Đội đúng -> cộng 1 điểm + sân 3D chuyển động.
- Có đồng hồ 10 / 15 / 20 / 30 giây hoặc không giới hạn.
- Nếu hết giờ -> tự chuyển lượt.

## 4. QuestionBank V12 hỗ trợ ảnh
Code.gs V12 tự nâng cấp sheet `QuestionBank` từ cấu trúc cũ sang cấu trúc có thêm cột `image`:

`id | type | level | grade | subject | chapter | topic | question | image | optionsJson | correctAnswer | explain | sourceFile | updatedAt`

Dữ liệu cũ được giữ nguyên; hệ thống chèn cột `image` sau `question`.

## 5. Cập nhật lên GitHub / Vercel
1. Thay file `index.html` cũ bằng file `index.html` trong thư mục này.
2. Giữ nguyên `api/sheet.js` hiện tại trên GitHub/Vercel.
3. Trong Google Sheet -> Extensions -> Apps Script: thay `Code.gs` bằng file mới.
4. Chọn hàm `setup` -> Run một lần để tự kiểm tra / nâng cấp cấu trúc sheet.
5. Deploy -> Manage deployments -> Edit -> New version -> Deploy.
6. Chờ Vercel deploy xong.
7. Mở web và nhấn `Ctrl + F5`.

## 6. Lưu ý
- URL Apps Script trong `index.html` đang giữ theo file mà giáo viên gửi.
- Nếu Apps Script được deploy ra URL `/exec` mới, cần cập nhật URL theo hệ thống hiện tại của website / proxy.
- `api/sheet.js` không có trong gói này vì nên giữ đúng file proxy đang chạy trên Vercel hiện tại.
