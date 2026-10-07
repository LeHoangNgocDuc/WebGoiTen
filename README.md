# LỚP HỌC TƯƠNG TÁC TOÁN & TIN – V19

## Nâng cấp V19

### 1. Fullscreen 16:9 ưu tiên câu hỏi và biểu đồ
- Khi câu hỏi có hình/biểu đồ/bảng, vùng hình tự được ưu tiên diện tích lớn hơn.
- Trong chế độ trình chiếu, hình có thể chiếm khoảng 40–46% chiều cao màn hình tùy tỉ lệ màn hình.
- Bấm trực tiếp vào hình để mở chế độ phóng to toàn màn hình.
- Câu hỏi không có hình tự dùng toàn bộ vùng trung tâm để tăng cỡ chữ.

### 2. Kéo co thể hiện đội dẫn điểm rõ hơn
- Khi Đội A dẫn, toàn bộ dây/cờ/nhân vật kéo lệch rõ về phía Đội A.
- Khi Đội B dẫn, hiệu ứng lệch về phía Đội B.
- Mức lệch phụ thuộc chênh lệch điểm, không chỉ nhúc nhích ở cờ.

### 3. JSON nhiều loại câu hỏi
V19 hỗ trợ trực tiếp:
- `MC`: trắc nghiệm nhiều lựa chọn.
- `TF`: đúng/sai nhiều ý.
- `SA`: trả lời ngắn.

#### TF – Đúng/Sai
- Nội dung từng ý a, b, c, d hiển thị ở vùng câu hỏi chung.
- Mỗi đội có bảng nút ĐÚNG / SAI riêng.
- Chọn đủ các ý rồi bấm GỬI ĐÁP ÁN.
- Web tự chấm theo `CorrectAnswer`, ví dụ `DDSD`.
- Nếu đội đầu sai, quyền trả lời chuyển cho đội còn lại.

#### SA – Trả lời ngắn
- Mỗi đội có ô nhập đáp án riêng.
- Nhấn Enter hoặc GỬI ĐÁP ÁN để chấm.
- Web tự so sánh với `CorrectAnswer`.
- Giá trị số được chuẩn hóa: ví dụ `0001` và `1` được xem là tương đương.

### 4. Hiện đáp án
- Với TF và SA có nút `HIỆN ĐÁP ÁN`.
- Sau khi hiện đáp án, web hiển thị đáp án và phần giải thích từ trường `Explain`.

## Cấu trúc gói
- `index.html`: frontend V19.
- `Code.gs`: backend Apps Script V19; chức năng lưu QuestionBank vẫn tương thích MC/TF/SA.
- `README.md`: hướng dẫn này.
- `examples/Exam_D6C6B24.json`: file JSON mẫu đã dùng để kiểm tra cấu trúc nhiều dạng câu hỏi.

## Cập nhật lên web
1. Thay `index.html` cũ bằng `index.html` V19.
2. Nếu Apps Script hiện tại đang chạy ổn, có thể giữ nguyên; nếu muốn đồng bộ phiên bản thì thay bằng `Code.gs` V19 và Deploy > New version.
3. Giữ nguyên thư mục `assets/` chứa hình kéo co và `api/sheet.js` đang hoạt động trên dự án của bạn.
4. Push GitHub/Vercel.
5. Chờ deploy hoàn tất rồi nhấn `Ctrl + F5`.

## Lưu ý
V19 không thay đổi cấu trúc dữ liệu Google Sheet so với V17/V18. Phần chính thay đổi nằm ở giao diện và logic chơi câu hỏi.
