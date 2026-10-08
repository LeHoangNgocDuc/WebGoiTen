# LỚP HỌC TƯƠNG TÁC TOÁN & TIN – V20.1 TV + AUDIO

## Thay đổi trọng tâm
V20.1 giữ nguyên dữ liệu và cách đọc ngân hàng câu hỏi MC / TF / SA của V20, nhưng thiết kế lại chế độ trình chiếu toàn màn hình theo nguyên tắc **câu hỏi là nội dung chính**.

### Fullscreen mới
- HUD điểm + timer gọn ở trên cùng.
- Câu hỏi tự chiếm phần lớn chiều cao còn lại; câu ngắn có thể đạt khoảng 72–96 px trên TV Full HD.
- Khi có hình/biểu đồ: hình và câu hỏi chia khoảng 56/44 trong vùng câu hỏi; ảnh luôn `object-fit: contain`, không crop.
- Khu vực trả lời hai đội thu nhỏ xuống phía dưới; đáp án MC tự giảm font riêng theo độ dài từng đáp án.
- Sân 3D nằm giữa hai bảng trả lời và nhỏ hơn trước; HUD trùng lặp trong sân được ẩn khi fullscreen.
- Dòng hướng dẫn dài của hai đội được ẩn trong fullscreen để nhường diện tích.
- Màn chiến thắng chuyển thành overlay toàn màn hình.

### Quy trình phản hồi
1. Học sinh trả lời.
2. Web báo **ĐÚNG / SAI** và chạy animation/âm thanh.
3. Đúng: cộng điểm + animation kéo co/boost xe.
4. Sai: chuyển quyền cho đội còn lại nếu còn lượt.
5. **Không tự bung lời giải.** Giáo viên bấm `💡 HIỆN GIẢI THÍCH` khi muốn chữa bài.

### Hệ thống âm thanh mới
Âm thanh được tổng hợp trực tiếp bằng Web Audio, không bắt buộc tải file MP3:
- Hiện câu hỏi: whoosh nhẹ.
- Đúng: chime + impact; Kéo co thêm rope/impact, Đua xe thêm engine/boost.
- Sai: low bump nhẹ.
- Chuyển quyền: swoosh ngắn.
- 5 giây cuối: tick; 3 giây cuối tick mạnh hơn.
- Hết giờ: buzzer.
- Chiến thắng: fanfare + crowd/noise layer + hiệu ứng riêng theo game.

Trong `Cài đặt > Âm thanh trò chơi V20.1` có:
- âm lượng tổng;
- hiệu ứng;
- nhạc/chiến thắng;
- bật/tắt riêng âm thanh đúng, sai, timer, game 3D và chiến thắng;
- nút nghe thử.

### Chế độ TẬP TRUNG
Khi bật `🔎 TẬP TRUNG`, sân game mờ, animation 3D tạm dừng và âm thanh game bị duck xuống rất thấp; câu hỏi phóng lớn.

## Cập nhật web
1. Sao lưu `index.html` đang chạy.
2. Thay bằng `index.html` trong gói này.
3. Thay `sw.js` để cache cũ V20 bị loại bỏ.
4. `Code.gs` chỉ đổi version thành 20.1.0; cấu trúc Sheet không đổi. Nếu backend hiện tại V20 đang ổn, có thể giữ nguyên Code.gs cũ.
5. Giữ nguyên thư mục `api/` và `assets/` hiện có.
6. Push GitHub/Vercel, chờ deploy hoàn tất rồi nhấn `Ctrl + F5`.

## Model 3D tùy chọn
Vẫn hỗ trợ:
```text
assets/models/kart_blue.glb
assets/models/kart_red.glb
assets/models/tug_team_blue.glb
assets/models/tug_team_red.glb
```
Nếu không có GLB, đồ họa fallback hiện tại vẫn chạy.
