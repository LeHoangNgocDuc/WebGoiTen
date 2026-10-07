# LỚP HỌC TƯƠNG TÁC TOÁN & TIN V17

Bản V17 được hoàn thiện trực tiếp từ V16, giữ nguyên toàn bộ chức năng gọi tên, ghi điểm nhiều lần, ngân hàng câu hỏi và trò chơi; bổ sung giao diện full màn hình tối ưu cho TV/máy chiếu.

## Cấu trúc
- `index.html`: giao diện hoàn chỉnh V17.
- `Code.gs`: backend Google Apps Script V17.
- Giữ nguyên `api/sheet.js` đang hoạt động trên dự án Vercel.
- Giữ nguyên thư mục `assets/`, đặc biệt `assets/tug_left_enhanced.png` và `assets/tug_right_enhanced.png`.

## V17 nổi bật
- Giao diện thường bỏ giới hạn chiều rộng, tận dụng toàn bộ màn hình trình duyệt.
- Nhấn **QUAY NÓN** tự chuyển sang chế độ trình chiếu/toàn màn hình.
- Ở màn hình lớn, vòng quay và bảng điều khiển/sổ điểm cùng hiển thị, tận dụng hết chiều ngang.
- Ở màn hình hẹp, bảng điều khiển tự chuyển thành drawer để vòng quay vẫn đủ lớn.
- Nhấn **BẮT ĐẦU TRÒ CHƠI** tự chuyển sang chế độ trò chơi toàn màn hình.
- Game được dàn lại theo 16:9: bảng điểm + câu hỏi + hình/bảng + hai bảng đáp án + sân 3D + phản hồi đều nằm gọn trên một màn hình.
- Ghi đè các breakpoint cũ để Chrome Zoom 110%/125% không làm game ngang tự rơi thành bố cục 1 cột.
- Có nút **✕ THOÁT TRÌNH CHIẾU**; phím `Esc` cũng thoát.
- Nút **Toàn màn hình** trên thanh menu tự chọn đúng chế độ theo màn hình hiện tại.
- Giữ nguyên: số câu chơi, giới hạn thời gian, MathJax/LaTeX, chấm điểm theo từng lần gọi, cộng điểm hai đội và hiệu ứng đúng/sai.

## Cập nhật lên GitHub/Vercel
1. Thay file `index.html` bằng bản V17.
2. Có thể thay `Code.gs` bằng bản V17 rồi Deploy Apps Script `New version`; logic backend tương thích V16.
3. Giữ nguyên thư mục `api/` và `assets/` đang có.
4. Chờ Vercel báo Ready.
5. Mở trang và nhấn `Ctrl + F5`.

## Phím nhanh
- `Space`: quay nón khi đang ở màn Gọi tên.
- `F`: bật/tắt trình chiếu ở màn Gọi tên hoặc khi đang chơi game.
- `Esc`: thoát trình chiếu/toàn màn hình.

## Lưu ý
Trình duyệt chỉ cho phép tự bật Fullscreen từ thao tác người dùng. Vì vậy V17 yêu cầu Fullscreen ngay trong cú bấm **QUAY NÓN** hoặc **BẮT ĐẦU TRÒ CHƠI**. Nếu trình duyệt chặn Fullscreen, bố cục trình chiếu vẫn được áp dụng trong vùng trang hiện tại.
