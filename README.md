# LỚP HỌC TƯƠNG TÁC TOÁN & TIN V13

Bản V13 tập trung vào 3 việc: trình chiếu TV rõ hơn, giữ đầy đủ gọi tên/ghi điểm học sinh, và sửa cơ chế game 2 đội.

## 1. Gọi tên + ghi điểm vẫn đầy đủ
- Vòng quay WebGL 3D.
- Nạp học sinh từ Google Sheet hoặc Excel.
- Gọi lại học sinh nhiều lần.
- Mỗi lần gọi có `callNo` riêng.
- Ghi điểm 0–10 và ghi chú theo từng lần gọi.
- Điểm cộng/trừ.
- Sổ điểm cả lớp và nút `Gọi & ghi điểm`.
- Chế độ trình chiếu mới: vòng quay nhỏ hơn trước và bảng ghi điểm vẫn hiển thị bên phải trên màn hình lớn.

## 2. Giao diện V13 sáng và hiện đại hơn
- Nền xanh navy sáng hơn, hiệu ứng kính mờ và gradient cyan/tím.
- Tăng kích thước chữ ở thanh điều hướng, nút, nhãn, tên học sinh và bảng điểm.
- Tối ưu cho màn hình TV / máy chiếu Full HD.

## 3. Game: câu hỏi lớn hơn, sân 3D nhỏ hơn
- Khối câu hỏi nằm trên cùng và được ưu tiên diện tích.
- Hình / bảng số liệu được phóng lớn hơn.
- Bấm trực tiếp vào hình câu hỏi để mở chế độ phóng to toàn màn hình.
- Sân Kéo co / Đua xe chỉ còn là phần minh họa ở giữa bên dưới, cao khoảng 390px ở chế độ thường.
- Khi trình chiếu, câu hỏi tiếp tục được ưu tiên diện tích; sân 3D thu nhỏ hơn.

## 4. Công thức Toán
- MathJax được gọi lại sau mỗi lần đổi câu hỏi và đáp án.
- Có cơ chế chờ MathJax tải xong rồi mới typeset, tránh hiện LaTeX thô.
- Hỗ trợ `$...$`, `$$...$$`, `\\(...\\)`, `\\[...\\]`.
- Có tự nhận diện một số lệnh LaTeX phổ biến như `\\frac`, `\\sqrt`, `\\pi`, `\\times` nếu câu hỏi thiếu dấu bọc toán.

## 5. Luật trả lời 2 đội mới
- Đầu mỗi câu: **cả hai đội đều được quyền chọn đáp án**.
- Đội nào bấm đúng trước: đội đó +1 điểm.
- Đội nào bấm sai: đội đó bị khóa lượt của câu hiện tại; chỉ còn đội kia được trả lời.
- Nếu đội còn lại cũng sai: hiện đáp án đúng.
- Điểm được cập nhật đồng thời ở bảng điểm trên cùng và HUD sân 3D, kèm hiệu ứng phóng số điểm.
- Nút `+ A` / `+ B` vẫn dùng để cộng điểm thủ công.

## 6. Cập nhật GitHub / Vercel
1. Thay `index.html` cũ bằng file `index.html` trong thư mục này.
2. Giữ nguyên `api/sheet.js` hiện đang chạy trên Vercel.
3. Có thể giữ `Code.gs` V12; nếu muốn đồng bộ phiên bản thì dùng `Code.gs` V13 trong gói này.
4. Nếu thay `Code.gs`: Apps Script → Deploy → Manage deployments → Edit → New version → Deploy.
5. Chờ Vercel deploy xong.
6. Mở web và nhấn `Ctrl + F5`.

## 7. Gợi ý nhập công thức Toán
Nên ghi công thức trong JSON / Google Sheet theo một trong các dạng:

- `$\\frac{3}{4}+\\frac{1}{2}$`
- `\\(x^2+2x+1\\)`
- `$$S=\\pi r^2$$`

V13 cũng cố gắng tự xử lý một số lệnh LaTeX chưa có dấu bọc, nhưng dùng dấu `$...$` vẫn là cách ổn định nhất.
