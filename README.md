# Đấu trường Toán & Tin V2

Bản tách file hoàn chỉnh để up lên GitHub/Vercel. Chỉ tập trung **Toán** và **Tin học**.

## Tính năng chính
- 2 game: **Kéo co kiến thức** và **Đua xe kiến thức**.
- Câu hỏi chỉ hiển thị **1 lần ở giữa**.
- Hai đội có **bảng đáp án riêng**, mỗi bên 2 cột.
- Đội mở lượt trả lời sai → tự chuyển quyền cho đội còn lại.
- Đúng → cộng điểm + hiệu ứng + âm thanh thật `.wav`.
- Đồng hồ đếm ngược 10/15/20/30 giây.
- Công thức Toán hiển thị bằng MathJax.
- Có thể nạp ngân hàng JSON riêng.
- 4 chủ đề màu:
  1. Toán • Neon
  2. Toán • Bảng xanh
  3. Tin • Cyber
  4. Tin • Terminal

## Cấu trúc thư mục
```text
math_it_game_v2/
├── index.html
├── questions-math.json
├── questions-it.json
├── README.md
├── css/
│   ├── base.css
│   ├── themes.css
│   └── games.css
├── js/
│   ├── app.js
│   ├── tug.js
│   └── race.js
└── assets/
    ├── images/
    │   ├── bg-math-neon.svg
    │   ├── bg-math-board.svg
    │   ├── bg-it-cyber.svg
    │   ├── bg-it-terminal.svg
    │   ├── tug-poster.svg
    │   ├── race-poster.svg
    │   ├── math-grid.svg
    │   └── it-flowchart.svg
    └── sounds/
        ├── correct.wav
        ├── wrong.wav
        ├── tick.wav
        ├── start.wav
        ├── win.wav
        └── engine.wav
```

## Cách upload GitHub / Vercel
1. Giữ nguyên toàn bộ cấu trúc thư mục.
2. Upload tất cả file vào repository.
3. Vercel có thể deploy trực tiếp như web tĩnh.
4. Mở `index.html` làm trang chính.
5. Sau khi deploy, nhấn Ctrl+F5 để tải bản mới.

## Định dạng JSON câu hỏi riêng
```json
[
  {
    "id": "M1",
    "subject": "Toán",
    "grade": "7",
    "topic": "Số hữu tỉ",
    "question": "Tính $\\frac{3}{4}+\\frac{5}{8}$.",
    "image": "./assets/images/ten-anh.svg",
    "options": ["A", "B", "C", "D"],
    "correct": 1,
    "explain": "Giải thích ngắn"
  }
]
```

`correct` dùng số thứ tự bắt đầu từ 0:
- 0 = A
- 1 = B
- 2 = C
- 3 = D

## Gợi ý tích hợp với web lớp học hiện tại
Có thể giữ trang gọi tên / sổ điểm hiện tại, sau đó:
- copy thư mục `css/`, `js/`, `assets/` vào project chính;
- chuyển phần game từ `index.html` này vào tab Trò chơi;
- dùng lại ngân hàng câu hỏi Google Sheet của web hiện tại thay cho JSON cục bộ.
