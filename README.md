# LỚP HỌC TƯƠNG TÁC TOÁN & TIN – V20 CLEAN

## Mục tiêu V20
V20 chuyển giao diện sang TV-first: câu hỏi, hình/biểu đồ và đáp án là nội dung chính; sân 3D chỉ đóng vai trò tạo cảm xúc. Frontend vẫn tương thích ngân hàng câu hỏi MC / TF / SA và cấu trúc Google Sheet của V19.

## Chức năng mới chính
- Smart Font theo độ dài câu hỏi; đáp án vẫn tự co theo vùng riêng.
- Smart Image Fit: nền trắng, không crop, click ảnh hoặc phím `Z` để phóng toàn màn hình.
- Quy trình: hiện câu hỏi → hiện đáp án → chạy timer → chấm / giải thích. Có tùy chọn tự động hiện đáp án.
- Presenter controls: Tập trung câu hỏi, Ẩn/Hiện 3D, Hình toàn màn hình, Đọc câu hỏi, Màn đen, Pause/Resume timer, Reset timer.
- Phím tắt: `Space` hiện đáp án/câu tiếp, `Enter` pause/resume timer, `F` fullscreen, `Z` zoom ảnh, `M` mute, `B` black screen, `R` reset timer, `A/D` cộng điểm đội A/B, `Esc` thoát trình chiếu/zoom.
- Preflight trước trận: kiểm tra số câu, preload ảnh, MathJax, WebGL, âm thanh và kích thước màn hình.
- Dashboard cuối trận: tỉ số, số câu, số câu đúng từng đội, thời gian trả lời trung bình, danh sách câu cần ôn.
- Offline app-shell bằng `sw.js`; dữ liệu câu hỏi/học sinh/điểm vẫn dùng localStorage khi đã tải.
- GLB/PBR tùy chọn: nếu có model trong `assets/models/`, V20 tự tải; nếu thiếu model thì game fallback hiện tại vẫn chạy.

## Model GLB tùy chọn
Đặt các file sau nếu muốn thay fallback bằng model 3D PBR:

```text
assets/models/kart_blue.glb
assets/models/kart_red.glb
assets/models/tug_team_blue.glb
assets/models/tug_team_red.glb
```

## Cập nhật
1. Đổi tên `index_v20_clean.html` thành `index.html` khi upload lên GitHub/Vercel.
2. Thay `Code.gs` bằng `Code_v20.gs` nếu muốn backend báo version 20.0.0; cấu trúc Sheet không đổi.
3. Upload thêm `sw.js` ở cùng cấp với `index.html`.
4. Giữ thư mục `api/` và `assets/` hiện có.
5. Nếu dùng model GLB, thêm các file vào `assets/models/` theo tên ở trên.
6. Apps Script: Deploy > Manage deployments > Edit > New version > Deploy.
7. Vercel/GitHub: push code, chờ deploy, sau đó `Ctrl + F5`.

## Lưu ý
- `sw.js` không cache `/api/*`; API luôn ưu tiên dữ liệu mới từ mạng.
- Text-to-Speech bỏ qua phần lớn biểu thức LaTeX để tránh đọc sai công thức.
- Model GLB là tùy chọn. Không có model, V20 vẫn dùng đồ họa Three.js/ảnh kéo co hiện tại.
