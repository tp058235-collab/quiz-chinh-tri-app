# Quiz App - Ôn tập trắc nghiệm

Ứng dụng web trắc nghiệm nhiều môn, dùng Supabase (Auth + Postgres + RPC).
Không có bước build: toàn bộ là file tĩnh, deploy thẳng lên Vercel.

## Cấu trúc file

Chỉ những file dưới đây là cần thiết để chạy ứng dụng:

| File | Vai trò |
|------|---------|
| `index.html` | Trang chính (đăng nhập, chọn môn, làm bài, lịch sử, BXH) |
| `app.js` | Toàn bộ logic ứng dụng (ES module) |
| `config.js` | Supabase URL + publishable key |
| `style.css` | Giao diện nền |
| `style-final-fix.css` | Lớp ghi đè giao diện, nạp sau `style.css` |
| `reset-password.html` / `reset-password.js` | Trang đặt lại mật khẩu từ email |
| `sw.js` | Service worker (PWA, cache offline) |
| `manifest.webmanifest` | Khai báo PWA (tên, icon, theme) |
| `vercel.json` | Rewrite `/reset-password`, header cache |
| `schema.sql` | Toàn bộ schema + RLS + RPC của Supabase |
| `public/favicon.png` | Icon ứng dụng (512x512) |
| `public/2.png` | Ảnh chữ thương hiệu trên header |
| `package.json` | Khai báo project tĩnh, không có dependency |

## Cài đặt

### 1. Supabase

1. Tạo project trên [supabase.com](https://supabase.com).
2. Mở **SQL Editor**, dán toàn bộ `schema.sql` và Run.
   File này chạy lại được nhiều lần, không xoá bảng và không xoá dữ liệu cũ.
3. Thêm dữ liệu vào bảng `subjects` và `questions` (Table Editor hoặc import CSV).
   Nhớ gán `questions.subject_slug` khớp với `subjects.slug`, nếu không câu hỏi
   sẽ không hiện ra khi chọn môn.
4. Vào **Authentication → URL Configuration**, thêm URL trang đặt lại mật khẩu
   vào Redirect URLs, ví dụ `https://<ten-mien>/reset-password.html`.
5. Copy Project URL và publishable key (`sb_publishable_...`) vào `config.js`.

> Publishable key được thiết kế để công khai phía client. Bảo mật dữ liệu dựa
> vào RLS trong `schema.sql`, tuyệt đối không dùng `service_role` key ở frontend.

### 2. Chạy ở máy

Mở `index.html` bằng Live Server (hoặc bất kỳ static server nào).
Service worker tự động tắt khi chạy trên `localhost` / `127.0.0.1` để không
phục vụ bản cache cũ trong lúc phát triển.

### 3. Deploy

Đẩy code lên Git rồi import vào Vercel. Không cần cấu hình build
(Framework Preset: Other, Build Command: để trống). `vercel.json` lo phần còn lại.

## Tính năng

- Đăng ký / đăng nhập / đăng xuất, đổi tên hiển thị, đổi mật khẩu, quên mật khẩu
- Chọn môn học, lọc theo bài/phần
- Luyện tập (không giới hạn thời gian) và thi thử 30 câu/20 phút hoặc 70 câu/60 phút
- Hiện đúng/sai ngay khi chọn đáp án, kèm giải thích nếu câu hỏi có cột `explanation`
- Tự lưu bài đang làm dở theo từng tài khoản + từng môn, cho phép tạm dừng và làm tiếp
- Làm lại các câu sai gần nhất
- Lịch sử ôn tập và bảng xếp hạng cá nhân
- Cài được như app (PWA), dùng lại được khi mất mạng
- **Lớp học (kiểm tra theo lớp)**: tạo lớp, mời thành viên bằng mã lớp/link,
  giáo viên tạo bài kiểm tra từ ngân hàng câu hỏi, học sinh làm bài (đáp án
  không lộ trước khi nộp), hệ thống tự chấm và tổng hợp kết quả tập trung.
  Xem chi tiết ở mục riêng bên dưới.

## Lớp học (kiểm tra theo lớp)

Vào sidebar **"Lớp học"** sau khi đăng nhập.

- **Giáo viên/người tạo lớp** (vai trò `admin`): tạo lớp → nhận mã lớp 6 ký
  tự + link mời (`?join=MÃ`) → quản lý thành viên (nâng/hạ quyền quản trị,
  xoá thành viên) → tạo bài kiểm tra (chọn môn/bài, số câu, thời gian làm
  bài, số lượt tối đa) → xem bảng tổng kết real-time (ai đã nộp, điểm bao
  nhiêu, điểm trung bình lớp).
- **Học sinh** (vai trò `member`): tham gia lớp bằng mã hoặc bấm link mời →
  làm bài kiểm tra (chọn đáp án, có thể đổi ý trước khi nộp, không thấy
  đúng/sai cho tới khi nộp) → xem lại chi tiết bài làm + giải thích sau khi
  nộp.

Toàn bộ logic nằm trong khối `LỚP HỌC (KIỂM TRA THEO LỚP)` ở `app.js` (UI,
render động vào `#classContent`) và mục `5. LỚP HỌC` trong `schema.sql`
(bảng + RLS + 17 hàm RPC). Chi tiết thiết kế đầy đủ (roadmap Phase 2/3, các
ý tưởng mở rộng) xem file `CLASS_FEATURE_DESIGN.md`.

**Giới hạn đã biết của bản Phase 1 này** (không phải lỗi, là phạm vi MVP có
chủ đích, dự kiến bổ sung ở Phase 2/3):
- Không lưu nháp câu trả lời giữa chừng: nếu thoát app khi đang làm bài rồi
  quay lại "Tiếp tục làm", các câu đã chọn trước đó sẽ bị mất (chỉ mất lựa
  chọn, không mất lượt làm bài - đồng hồ đếm ngược vẫn tính đúng từ lúc bắt
  đầu thật, không bị "làm mới").
- Giới hạn thời gian làm bài chỉ được ép buộc phía client (tự nộp khi hết
  giờ); chưa có cơ chế chặn cứng phía server nếu học sinh submit trễ bằng
  cách gọi RPC trực tiếp.
- Chưa có: QR code dạng ảnh (mới có mã + link text), email thông báo, chống
  gian lận nâng cao (nhiều tab, đổi thiết bị), export Excel/PDF.

## Ghi chú kỹ thuật

- **Cách tính điểm bảng xếp hạng**: đang cộng dồn số câu đúng của tất cả các lượt
  (`sum`). Muốn đổi sang "điểm cao nhất của một lượt" hoặc chỉ tính bài thi thử,
  xem phần 3.4 trong `schema.sql` - đã ghi sẵn hướng dẫn.
- **Lịch sử làm bài**: `app.js` truy vấn `quiz_attempts` không kèm bộ lọc
  `user_id`, việc mỗi người chỉ thấy lịch sử của mình phụ thuộc hoàn toàn vào
  policy RLS. Đừng tắt RLS trên bảng này.
- **RLS liên bảng cho Lớp học**: `classes` và `class_members` cần kiểm tra
  chéo lẫn nhau (ai là chủ lớp / ai là thành viên). Nếu viết policy bằng
  subquery trực tiếp vào bảng kia sẽ bị Postgres báo lỗi "infinite recursion
  detected in policy". Cách khắc phục đã áp dụng: 2 hàm `is_class_owner()` /
  `is_class_member()` (SECURITY DEFINER) dùng trong policy thay vì subquery
  thô. Nếu sau này sửa policy 2 bảng này, giữ nguyên cách dùng hàm để tránh
  lỗi tái diễn.
- **Cache**: `style-final-fix.css` và `app.js` được nạp kèm tham số `?v=...`
  trong `index.html`. Sau mỗi lần sửa 2 file đó, nhớ tăng số phiên bản này,
  nếu không trình duyệt cũ sẽ dùng lại bản cũ.
- **Icon**: dùng chung `public/favicon.png` (512x512) cho mọi kích thước.

## Việc còn lại

- [ ] Gộp `style.css` và `style-final-fix.css`, giảm bớt `!important`.
- [ ] Lớp học Phase 2: QR code ảnh, email mời, feedback từng câu của giáo
      viên, export Excel/PDF bảng tổng kết (xem `CLASS_FEATURE_DESIGN.md`).
- [ ] Lớp học Phase 3: chống gian lận nâng cao, lưu nháp câu trả lời giữa
      chừng, chặn nộp bài trễ ở phía server.
