# Hướng dẫn Triển khai (Deploy) CT App

## 📋 Tóm tắt những gì đã xong

✅ Tất cả 7 file đã được sửa/tạo và sao chép vào `T:\CT app`:
- `app.js` - XSS fix + cache version update
- `index.html` - Icon path fix + cache version update
- `schema.sql` - Consolidated schema with scoring fix
- `sw.js` - Cache config fix
- `vercel.json` - Rewrites cleanup
- `manifest.webmanifest` - Single root manifest
- `README.md` - Setup instructions

✅ 5 file cũ sẵn sàng để xóa:
- `backup/` (thư mục)
- `fix_leaderboard.sql`
- `fix_leaderboard_total_score.sql`
- `package-lock.json`
- `public/manifest.webmanifest`

---

## 🚀 Cách triển khai (3 bước)

### Bước 1: Mở VS Code Terminal

1. **Mở VS Code**
2. **Mở folder `T:\CT app`** (File → Open Folder)
3. **Mở Terminal** (Ctrl + `)

Terminal sẽ mở tại `T:\CT app`

---

### Bước 2: Chạy script triển khai

Chạy lệnh này trong PowerShell terminal:

```powershell
.\deploy.ps1
```

**Lưu ý:** Nếu gặp lỗi "cannot be loaded because running scripts is disabled" (Windows bảo mật):
- Chạy lệnh này một lần:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
- Rồi chạy lại `.\deploy.ps1`

---

### Bước 3: Xác minh Vercel Build

1. Chờ ~5 phút để Vercel build tự động
2. Vào https://vercel.com/tp058235-collab xem deployment trạng thái
3. Tìm "Latest Deployments" - nó sẽ show branch `main`

---

## ✅ Kiểm tra sau khi Deploy

### 1. Subjects hiển thị đúng (8/8 thay vì 6/8)
- Vào trang chủ → Chọn môn
- Phải thấy 8 chữ (tất cả các môn)

### 2. Giải thích câu hỏi hiển thị
- Chọn môn Tiếng Anh 1 → Làm bài
- Chọn đáp án → Phải thấy "Giải thích" ở dưới đáp án
- Xác nhận nó không phải HTML mà là plain text (XSS fix)

### 3. Bảng xếp hạng cập nhật
- Chọn môn Chính Trị → Xem BXH
- Điểm người dùng có thể thay đổi vì giờ chỉ tính exam attempts
- Nếu trước đó thấy "Thành Công 140 đúng", giờ có thể sẽ khác (vì chỉ tính thi thử)

---

## 🔧 Nếu gặp vấn đề

### ❌ Git push bị lỗi "Permission denied"
- Kiểm tra SSH key hoặc Personal Access Token (PAT) của GitHub
- Hoặc dùng HTTPS + cache credentials

### ❌ Script báo "fatal: not a git repository"
- Kiểm tra VS Code mở folder đúng: `T:\CT app`
- Dùng `git status` để xác minh

### ❌ Vercel build failed
- Vào https://vercel.com/tp058235-collab → Chọn build lỗi
- Bấm "Build Logs" để xem chi tiết

---

## 📝 Các lệnh Git thủ công (nếu không dùng script)

Nếu không muốn chạy script, bạn có thể chạy lần lượt:

```powershell
cd "T:\CT app"
git status

# Xóa 5 file cũ
git rm -r --ignore-unmatch backup
git rm --ignore-unmatch fix_leaderboard.sql
git rm --ignore-unmatch fix_leaderboard_total_score.sql
git rm --ignore-unmatch package-lock.json
git rm --ignore-unmatch "public/manifest.webmanifest"

# Thêm file mới
git add -A

# Commit
git commit -m "Fix: Restore Supabase project, patch XSS, refactor scoring & cleanup"

# Push
git push origin main
```

---

## 📊 Schema SQL Changes

File `schema.sql` mới bao gồm:

1. **XSS Mitigation**: Thêm `explanation` column vào `get_random_questions_by_lesson`
2. **Leaderboard Scoring**: `SUM(correct_count)` chỉ cho exam attempts (`mode IN ('exam_30', 'exam_70')`)
3. **RLS Fixes**:
   - Thêm `subjects_select_all` policy (app lấy được tất cả 8 môn)
   - Xóa `quiz_attempts UPDATE` policy (users không thể tự sửa điểm)
4. **PostgREST Fix**: Xóa 3 overload của `get_random_questions_by_lesson` (gây PGRST203 error)
5. **Type Fix**: `questions.id` từ `serial` thành `uuid`

---

## 🎯 Tiếp theo sau deploy

- [ ] Chạy `.\deploy.ps1` hoặc manual git commands
- [ ] Chờ Vercel build xong (~5 phút)
- [ ] Test 3 điểm kiểm tra ở trên
- [ ] Cập nhật Supabase schema (chạy `schema.sql` trên SQL Editor nếu chưa done)

---

## 📞 Hỗ trợ

Nếu cần chi tiết thêm, kiểm tra:
- `README.md` trong repository (cập nhật rồi)
- `/mnt/user-data/outputs/` trong Claude session này
