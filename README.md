# Quiz Chinh Tri App

Ứng dụng web trắc nghiệm sử dụng Supabase Auth, RPC và lưu kết quả vào bảng `quiz_attempts`.

## Cách chạy

1. Cập nhật Supabase URL và anon key trong `config.js`.
2. Chạy file `supabase.sql` trong Supabase SQL Editor để tạo bảng câu hỏi, bảng `quiz_attempts` và RPC `get_random_questions`.
3. Mở `index.html` bằng trình duyệt hoặc chạy máy chủ tĩnh.

## Tính năng chính

- Đăng ký / đăng nhập / đăng xuất bằng email và mật khẩu
- Chọn chế độ 30 câu / 20 phút hoặc 70 câu / 60 phút
- Lấy câu hỏi ngẫu nhiên từ Supabase RPC
- Hiển thị đúng/sai ngay khi chọn đáp án
- Đồng hồ đếm ngược và tự động nộp bài khi hết giờ
- Lưu lịch sử kết quả lên Supabase
- Chỉ hiển thị lịch sử của tài khoản đang đăng nhập

## Lưu ý

- Ứng dụng đọc Supabase URL và anon key từ `config.js`.
- Không hiển thị trường nhập URL/anon key trên giao diện.
- Mọi dữ liệu lịch sử được lưu lên server qua Supabase, không dùng localStorage.
