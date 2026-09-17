# Mẫu email Supabase Auth - Quiz App (bản nền tối, cao cấp)

Cách dùng: Supabase Dashboard → project **ChinhTri** → **Authentication** →
**Emails** → chọn từng template bên trái → dán **Subject heading** + **Message
body** tương ứng → **Save**.

Giữ nguyên các biến `{{ .ConfirmationURL }}` / `{{ .Token }}` - chỉ đổi chữ và
giao diện xung quanh, không đổi các biến này.

Phong cách: nền xanh navy tối, viền gradient tím-indigo-xanh dương (đúng màu
thương hiệu Quiz App đang dùng trên web thay vì màu cầu vồng/xanh ngọc không
liên quan), thẻ kính mờ, nút bấm phát sáng - giữ cảm giác "cao cấp" như mẫu
bạn đang có nhưng đồng bộ tên và màu với app hiện tại.

Lưu ý kỹ thuật: Outlook desktop (dùng engine Word) không hỗ trợ
`linear-gradient`/`border-radius`/`box-shadow` nên sẽ hiển thị phẳng hơn (mất
viền gradient, mất bo góc) - Gmail, Outlook web, app di động thì hiển thị đúng
như thiết kế. Đa số người dùng học sinh/sinh viên mở email trên điện thoại
hoặc Gmail nên ảnh hưởng không nhiều.

---

## 1. Confirm signup (xác nhận đăng ký)

**Subject heading:**
```
Xác nhận email đăng ký Quiz App
```

**Message body:**
```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <title>Xác nhận tài khoản</title>
  </head>
  <body style="margin:0; padding:0; background:#06111f; font-family:Tahoma, Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#06111f 0%,#0b1f35 45%,#1e1b3a 100%); padding:36px 12px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; border-radius:28px; background:linear-gradient(135deg,#7c3aed,#6366f1,#22d3ee); padding:2px; box-shadow:0 24px 80px rgba(0,0,0,0.45);">
            <tr>
              <td style="border-radius:26px; background:#0b1226; overflow:hidden;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:34px 28px 30px; text-align:center; background:radial-gradient(circle at top left,rgba(124,58,237,0.28),transparent 40%), radial-gradient(circle at top right,rgba(34,211,238,0.22),transparent 40%), #0b1226;">
                      <p style="margin:0 0 14px; color:#a78bfa; font-size:13px; font-weight:700; line-height:1.5; letter-spacing:1px; text-transform:uppercase;">Ứng dụng trắc nghiệm</p>
                      <img src="https://quiz-chinh-tri-app.vercel.app/public/favicon.png" width="44" height="44" alt="" style="display:inline-block; vertical-align:middle; border-radius:12px;" />
                      <img src="https://quiz-chinh-tri-app.vercel.app/public/2.png" width="119" height="44" alt="Quiz App" style="display:inline-block; vertical-align:middle; margin-left:10px;" />
                      <p style="margin:10px auto 0; max-width:440px; color:#94a3b8; font-size:14px; line-height:1.6;">Ôn tập trắc nghiệm - luyện tập, thi thử và theo dõi kết quả học tập.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:30px 28px; background:#0a1020;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:22px; background:#0e1a33; border:1px solid rgba(124,58,237,0.35); overflow:hidden;">
                        <tr>
                          <td style="padding:28px 24px;">
                            <p style="margin:0 0 14px; color:#a78bfa; font-size:13px; font-weight:700; line-height:1.5; letter-spacing:1px; text-transform:uppercase;">Kích hoạt tài khoản</p>
                            <h2 style="margin:0 0 18px; color:#f8fafc; font-size:24px; line-height:1.35; font-weight:800;">Xác nhận email đăng ký</h2>
                            <p style="margin:0 0 18px; color:#cbd5e1; font-size:15px; line-height:1.75;">Bạn vừa đăng ký tài khoản trên <strong style="color:#ffffff;">Quiz App - Ôn tập trắc nghiệm</strong>.</p>
                            <p style="margin:0 0 26px; color:#cbd5e1; font-size:15px; line-height:1.75;">Bấm nút bên dưới để xác nhận email và kích hoạt tài khoản.</p>
                            <div style="text-align:center; margin:30px 0;">
                              <a href="{{ .ConfirmationURL }}" style="display:inline-block; min-width:210px; text-align:center; padding:15px 26px; border-radius:16px; background:linear-gradient(135deg,#7c3aed,#6366f1); color:#ffffff; text-decoration:none; font-size:15px; font-weight:800; line-height:1.4; box-shadow:0 14px 30px rgba(99,102,241,0.4);">Xác nhận tài khoản</a>
                            </div>
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px; border-radius:16px; background:rgba(15,23,42,0.78); border:1px solid rgba(148,163,184,0.22);">
                              <tr>
                                <td style="padding:16px 18px;">
                                  <p style="margin:0 0 8px; color:#94a3b8; font-size:13px; line-height:1.65;">Nếu nút trên không hoạt động, sao chép liên kết bên dưới và mở trong trình duyệt:</p>
                                  <p style="margin:0; word-break:break-all; color:#7dd3fc; font-size:12px; line-height:1.6;">{{ .ConfirmationURL }}</p>
                                </td>
                              </tr>
                            </table>
                            <p style="margin:22px 0 0; color:#94a3b8; font-size:13px; line-height:1.7;">Nếu bạn không thực hiện đăng ký này, hãy bỏ qua email. Tài khoản sẽ không được kích hoạt nếu chưa xác nhận.</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 28px; text-align:center; background:#070c1a; border-top:1px solid rgba(124,58,237,0.22);">
                      <p style="margin:0 0 6px; color:#94a3b8; font-size:12px; line-height:1.6;">Email này được gửi tự động từ Quiz App.</p>
                      <p style="margin:0; color:#64748b; font-size:11px; line-height:1.6;">Vui lòng không trả lời trực tiếp email này.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

---

## 2. Reset Password (quên mật khẩu)

**Subject heading:**
```
Đặt lại mật khẩu Quiz App
```

**Message body:**
```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <title>Đặt lại mật khẩu</title>
  </head>
  <body style="margin:0; padding:0; background:#06111f; font-family:Tahoma, Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#06111f 0%,#0b1f35 45%,#1e1b3a 100%); padding:36px 12px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; border-radius:28px; background:linear-gradient(135deg,#7c3aed,#6366f1,#22d3ee); padding:2px; box-shadow:0 24px 80px rgba(0,0,0,0.45);">
            <tr>
              <td style="border-radius:26px; background:#0b1226; overflow:hidden;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:34px 28px 30px; text-align:center; background:radial-gradient(circle at top left,rgba(124,58,237,0.28),transparent 40%), radial-gradient(circle at top right,rgba(34,211,238,0.22),transparent 40%), #0b1226;">
                      <p style="margin:0 0 14px; color:#a78bfa; font-size:13px; font-weight:700; line-height:1.5; letter-spacing:1px; text-transform:uppercase;">Ứng dụng trắc nghiệm</p>
                      <img src="https://quiz-chinh-tri-app.vercel.app/public/favicon.png" width="44" height="44" alt="" style="display:inline-block; vertical-align:middle; border-radius:12px;" />
                      <img src="https://quiz-chinh-tri-app.vercel.app/public/2.png" width="119" height="44" alt="Quiz App" style="display:inline-block; vertical-align:middle; margin-left:10px;" />
                      <p style="margin:10px auto 0; max-width:440px; color:#94a3b8; font-size:14px; line-height:1.6;">Ôn tập trắc nghiệm - luyện tập, thi thử và theo dõi kết quả học tập.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:30px 28px; background:#0a1020;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:22px; background:#0e1a33; border:1px solid rgba(124,58,237,0.35); overflow:hidden;">
                        <tr>
                          <td style="padding:28px 24px;">
                            <p style="margin:0 0 14px; color:#a78bfa; font-size:13px; font-weight:700; line-height:1.5; letter-spacing:1px; text-transform:uppercase;">Bảo mật tài khoản</p>
                            <h2 style="margin:0 0 18px; color:#f8fafc; font-size:24px; line-height:1.35; font-weight:800;">Yêu cầu đặt lại mật khẩu</h2>
                            <p style="margin:0 0 26px; color:#cbd5e1; font-size:15px; line-height:1.75;">Có yêu cầu đặt lại mật khẩu cho tài khoản <strong style="color:#ffffff;">Quiz App</strong> gắn với email này. Bấm nút bên dưới để tạo mật khẩu mới.</p>
                            <div style="text-align:center; margin:30px 0;">
                              <a href="{{ .ConfirmationURL }}" style="display:inline-block; min-width:210px; text-align:center; padding:15px 26px; border-radius:16px; background:linear-gradient(135deg,#7c3aed,#6366f1); color:#ffffff; text-decoration:none; font-size:15px; font-weight:800; line-height:1.4; box-shadow:0 14px 30px rgba(99,102,241,0.4);">Đặt lại mật khẩu</a>
                            </div>
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px; border-radius:16px; background:rgba(15,23,42,0.78); border:1px solid rgba(148,163,184,0.22);">
                              <tr>
                                <td style="padding:16px 18px;">
                                  <p style="margin:0 0 8px; color:#94a3b8; font-size:13px; line-height:1.65;">Nếu nút trên không hoạt động, sao chép liên kết bên dưới và mở trong trình duyệt:</p>
                                  <p style="margin:0; word-break:break-all; color:#7dd3fc; font-size:12px; line-height:1.6;">{{ .ConfirmationURL }}</p>
                                </td>
                              </tr>
                            </table>
                            <p style="margin:22px 0 0; color:#94a3b8; font-size:13px; line-height:1.7;">Nếu bạn không yêu cầu đổi mật khẩu, hãy bỏ qua email này - mật khẩu hiện tại vẫn an toàn và không bị thay đổi.</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 28px; text-align:center; background:#070c1a; border-top:1px solid rgba(124,58,237,0.22);">
                      <p style="margin:0 0 6px; color:#94a3b8; font-size:12px; line-height:1.6;">Email này được gửi tự động từ Quiz App.</p>
                      <p style="margin:0; color:#64748b; font-size:11px; line-height:1.6;">Vui lòng không trả lời trực tiếp email này.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

---

## 3. Magic Link (đăng nhập bằng liên kết)

**Subject heading:**
```
Liên kết đăng nhập Quiz App
```

**Message body:**
```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <title>Đăng nhập</title>
  </head>
  <body style="margin:0; padding:0; background:#06111f; font-family:Tahoma, Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#06111f 0%,#0b1f35 45%,#1e1b3a 100%); padding:36px 12px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; border-radius:28px; background:linear-gradient(135deg,#7c3aed,#6366f1,#22d3ee); padding:2px; box-shadow:0 24px 80px rgba(0,0,0,0.45);">
            <tr>
              <td style="border-radius:26px; background:#0b1226; overflow:hidden;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:34px 28px 30px; text-align:center; background:radial-gradient(circle at top left,rgba(124,58,237,0.28),transparent 40%), radial-gradient(circle at top right,rgba(34,211,238,0.22),transparent 40%), #0b1226;">
                      <p style="margin:0 0 14px; color:#a78bfa; font-size:13px; font-weight:700; line-height:1.5; letter-spacing:1px; text-transform:uppercase;">Ứng dụng trắc nghiệm</p>
                      <img src="https://quiz-chinh-tri-app.vercel.app/public/favicon.png" width="44" height="44" alt="" style="display:inline-block; vertical-align:middle; border-radius:12px;" />
                      <img src="https://quiz-chinh-tri-app.vercel.app/public/2.png" width="119" height="44" alt="Quiz App" style="display:inline-block; vertical-align:middle; margin-left:10px;" />
                      <p style="margin:10px auto 0; max-width:440px; color:#94a3b8; font-size:14px; line-height:1.6;">Ôn tập trắc nghiệm - luyện tập, thi thử và theo dõi kết quả học tập.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:30px 28px; background:#0a1020;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:22px; background:#0e1a33; border:1px solid rgba(124,58,237,0.35); overflow:hidden;">
                        <tr>
                          <td style="padding:28px 24px;">
                            <p style="margin:0 0 14px; color:#a78bfa; font-size:13px; font-weight:700; line-height:1.5; letter-spacing:1px; text-transform:uppercase;">Đăng nhập nhanh</p>
                            <h2 style="margin:0 0 18px; color:#f8fafc; font-size:24px; line-height:1.35; font-weight:800;">Liên kết đăng nhập của bạn</h2>
                            <p style="margin:0 0 26px; color:#cbd5e1; font-size:15px; line-height:1.75;">Bấm nút bên dưới để đăng nhập <strong style="color:#ffffff;">Quiz App</strong> ngay, không cần nhập mật khẩu.</p>
                            <div style="text-align:center; margin:30px 0;">
                              <a href="{{ .ConfirmationURL }}" style="display:inline-block; min-width:210px; text-align:center; padding:15px 26px; border-radius:16px; background:linear-gradient(135deg,#7c3aed,#6366f1); color:#ffffff; text-decoration:none; font-size:15px; font-weight:800; line-height:1.4; box-shadow:0 14px 30px rgba(99,102,241,0.4);">Đăng nhập ngay</a>
                            </div>
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px; border-radius:16px; background:rgba(15,23,42,0.78); border:1px solid rgba(148,163,184,0.22);">
                              <tr>
                                <td style="padding:16px 18px;">
                                  <p style="margin:0 0 8px; color:#94a3b8; font-size:13px; line-height:1.65;">Nếu nút trên không hoạt động, sao chép liên kết bên dưới và mở trong trình duyệt:</p>
                                  <p style="margin:0; word-break:break-all; color:#7dd3fc; font-size:12px; line-height:1.6;">{{ .ConfirmationURL }}</p>
                                </td>
                              </tr>
                            </table>
                            <p style="margin:22px 0 0; color:#94a3b8; font-size:13px; line-height:1.7;">Nếu bạn không yêu cầu đăng nhập, hãy bỏ qua email này.</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 28px; text-align:center; background:#070c1a; border-top:1px solid rgba(124,58,237,0.22);">
                      <p style="margin:0 0 6px; color:#94a3b8; font-size:12px; line-height:1.6;">Email này được gửi tự động từ Quiz App.</p>
                      <p style="margin:0; color:#64748b; font-size:11px; line-height:1.6;">Vui lòng không trả lời trực tiếp email này.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

---

## 4. Invite user (mời tạo tài khoản)

**Subject heading:**
```
Bạn được mời tham gia Quiz App
```

**Message body:**
```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <title>Lời mời tham gia</title>
  </head>
  <body style="margin:0; padding:0; background:#06111f; font-family:Tahoma, Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#06111f 0%,#0b1f35 45%,#1e1b3a 100%); padding:36px 12px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; border-radius:28px; background:linear-gradient(135deg,#7c3aed,#6366f1,#22d3ee); padding:2px; box-shadow:0 24px 80px rgba(0,0,0,0.45);">
            <tr>
              <td style="border-radius:26px; background:#0b1226; overflow:hidden;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:34px 28px 30px; text-align:center; background:radial-gradient(circle at top left,rgba(124,58,237,0.28),transparent 40%), radial-gradient(circle at top right,rgba(34,211,238,0.22),transparent 40%), #0b1226;">
                      <p style="margin:0 0 14px; color:#a78bfa; font-size:13px; font-weight:700; line-height:1.5; letter-spacing:1px; text-transform:uppercase;">Ứng dụng trắc nghiệm</p>
                      <img src="https://quiz-chinh-tri-app.vercel.app/public/favicon.png" width="44" height="44" alt="" style="display:inline-block; vertical-align:middle; border-radius:12px;" />
                      <img src="https://quiz-chinh-tri-app.vercel.app/public/2.png" width="119" height="44" alt="Quiz App" style="display:inline-block; vertical-align:middle; margin-left:10px;" />
                      <p style="margin:10px auto 0; max-width:440px; color:#94a3b8; font-size:14px; line-height:1.6;">Ôn tập trắc nghiệm - luyện tập, thi thử và theo dõi kết quả học tập.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:30px 28px; background:#0a1020;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:22px; background:#0e1a33; border:1px solid rgba(124,58,237,0.35); overflow:hidden;">
                        <tr>
                          <td style="padding:28px 24px;">
                            <p style="margin:0 0 14px; color:#a78bfa; font-size:13px; font-weight:700; line-height:1.5; letter-spacing:1px; text-transform:uppercase;">Lời mời tham gia</p>
                            <h2 style="margin:0 0 18px; color:#f8fafc; font-size:24px; line-height:1.35; font-weight:800;">Bạn được mời tham gia Quiz App</h2>
                            <p style="margin:0 0 26px; color:#cbd5e1; font-size:15px; line-height:1.75;">Ai đó vừa mời bạn tạo tài khoản trên <strong style="color:#ffffff;">Quiz App - Ôn tập trắc nghiệm</strong>. Bấm nút bên dưới để chấp nhận và tạo tài khoản.</p>
                            <div style="text-align:center; margin:30px 0;">
                              <a href="{{ .ConfirmationURL }}" style="display:inline-block; min-width:210px; text-align:center; padding:15px 26px; border-radius:16px; background:linear-gradient(135deg,#7c3aed,#6366f1); color:#ffffff; text-decoration:none; font-size:15px; font-weight:800; line-height:1.4; box-shadow:0 14px 30px rgba(99,102,241,0.4);">Chấp nhận lời mời</a>
                            </div>
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px; border-radius:16px; background:rgba(15,23,42,0.78); border:1px solid rgba(148,163,184,0.22);">
                              <tr>
                                <td style="padding:16px 18px;">
                                  <p style="margin:0 0 8px; color:#94a3b8; font-size:13px; line-height:1.65;">Nếu nút trên không hoạt động, sao chép liên kết bên dưới và mở trong trình duyệt:</p>
                                  <p style="margin:0; word-break:break-all; color:#7dd3fc; font-size:12px; line-height:1.6;">{{ .ConfirmationURL }}</p>
                                </td>
                              </tr>
                            </table>
                            <p style="margin:22px 0 0; color:#94a3b8; font-size:13px; line-height:1.7;">Nếu bạn không mong đợi lời mời này, hãy bỏ qua email.</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 28px; text-align:center; background:#070c1a; border-top:1px solid rgba(124,58,237,0.22);">
                      <p style="margin:0 0 6px; color:#94a3b8; font-size:12px; line-height:1.6;">Email này được gửi tự động từ Quiz App.</p>
                      <p style="margin:0; color:#64748b; font-size:11px; line-height:1.6;">Vui lòng không trả lời trực tiếp email này.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

---

## 5. Change Email Address (xác nhận đổi email)

**Subject heading:**
```
Xác nhận đổi email Quiz App
```

**Message body:**
```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <title>Xác nhận email mới</title>
  </head>
  <body style="margin:0; padding:0; background:#06111f; font-family:Tahoma, Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#06111f 0%,#0b1f35 45%,#1e1b3a 100%); padding:36px 12px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; border-radius:28px; background:linear-gradient(135deg,#7c3aed,#6366f1,#22d3ee); padding:2px; box-shadow:0 24px 80px rgba(0,0,0,0.45);">
            <tr>
              <td style="border-radius:26px; background:#0b1226; overflow:hidden;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:34px 28px 30px; text-align:center; background:radial-gradient(circle at top left,rgba(124,58,237,0.28),transparent 40%), radial-gradient(circle at top right,rgba(34,211,238,0.22),transparent 40%), #0b1226;">
                      <p style="margin:0 0 14px; color:#a78bfa; font-size:13px; font-weight:700; line-height:1.5; letter-spacing:1px; text-transform:uppercase;">Ứng dụng trắc nghiệm</p>
                      <img src="https://quiz-chinh-tri-app.vercel.app/public/favicon.png" width="44" height="44" alt="" style="display:inline-block; vertical-align:middle; border-radius:12px;" />
                      <img src="https://quiz-chinh-tri-app.vercel.app/public/2.png" width="119" height="44" alt="Quiz App" style="display:inline-block; vertical-align:middle; margin-left:10px;" />
                      <p style="margin:10px auto 0; max-width:440px; color:#94a3b8; font-size:14px; line-height:1.6;">Ôn tập trắc nghiệm - luyện tập, thi thử và theo dõi kết quả học tập.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:30px 28px; background:#0a1020;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:22px; background:#0e1a33; border:1px solid rgba(124,58,237,0.35); overflow:hidden;">
                        <tr>
                          <td style="padding:28px 24px;">
                            <p style="margin:0 0 14px; color:#a78bfa; font-size:13px; font-weight:700; line-height:1.5; letter-spacing:1px; text-transform:uppercase;">Bảo mật tài khoản</p>
                            <h2 style="margin:0 0 18px; color:#f8fafc; font-size:24px; line-height:1.35; font-weight:800;">Xác nhận email mới</h2>
                            <p style="margin:0 0 26px; color:#cbd5e1; font-size:15px; line-height:1.75;">Có yêu cầu đổi email đăng nhập <strong style="color:#ffffff;">Quiz App</strong> sang địa chỉ email này. Bấm nút bên dưới để xác nhận.</p>
                            <div style="text-align:center; margin:30px 0;">
                              <a href="{{ .ConfirmationURL }}" style="display:inline-block; min-width:210px; text-align:center; padding:15px 26px; border-radius:16px; background:linear-gradient(135deg,#7c3aed,#6366f1); color:#ffffff; text-decoration:none; font-size:15px; font-weight:800; line-height:1.4; box-shadow:0 14px 30px rgba(99,102,241,0.4);">Xác nhận email mới</a>
                            </div>
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px; border-radius:16px; background:rgba(15,23,42,0.78); border:1px solid rgba(148,163,184,0.22);">
                              <tr>
                                <td style="padding:16px 18px;">
                                  <p style="margin:0 0 8px; color:#94a3b8; font-size:13px; line-height:1.65;">Nếu nút trên không hoạt động, sao chép liên kết bên dưới và mở trong trình duyệt:</p>
                                  <p style="margin:0; word-break:break-all; color:#7dd3fc; font-size:12px; line-height:1.6;">{{ .ConfirmationURL }}</p>
                                </td>
                              </tr>
                            </table>
                            <p style="margin:22px 0 0; color:#94a3b8; font-size:13px; line-height:1.7;">Nếu bạn không yêu cầu đổi email, hãy bỏ qua thư này - email đăng nhập hiện tại của bạn vẫn không đổi.</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 28px; text-align:center; background:#070c1a; border-top:1px solid rgba(124,58,237,0.22);">
                      <p style="margin:0 0 6px; color:#94a3b8; font-size:12px; line-height:1.6;">Email này được gửi tự động từ Quiz App.</p>
                      <p style="margin:0; color:#64748b; font-size:11px; line-height:1.6;">Vui lòng không trả lời trực tiếp email này.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

---

## 6. Reauthentication (mã xác thực thao tác nhạy cảm)

**Subject heading:**
```
Mã xác thực Quiz App: {{ .Token }}
```

**Message body:**
```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <title>Mã xác thực</title>
  </head>
  <body style="margin:0; padding:0; background:#06111f; font-family:Tahoma, Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#06111f 0%,#0b1f35 45%,#1e1b3a 100%); padding:36px 12px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; border-radius:28px; background:linear-gradient(135deg,#7c3aed,#6366f1,#22d3ee); padding:2px; box-shadow:0 24px 80px rgba(0,0,0,0.45);">
            <tr>
              <td style="border-radius:26px; background:#0b1226; overflow:hidden;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:34px 28px 30px; text-align:center; background:radial-gradient(circle at top left,rgba(124,58,237,0.28),transparent 40%), radial-gradient(circle at top right,rgba(34,211,238,0.22),transparent 40%), #0b1226;">
                      <p style="margin:0 0 14px; color:#a78bfa; font-size:13px; font-weight:700; line-height:1.5; letter-spacing:1px; text-transform:uppercase;">Ứng dụng trắc nghiệm</p>
                      <img src="https://quiz-chinh-tri-app.vercel.app/public/favicon.png" width="44" height="44" alt="" style="display:inline-block; vertical-align:middle; border-radius:12px;" />
                      <img src="https://quiz-chinh-tri-app.vercel.app/public/2.png" width="119" height="44" alt="Quiz App" style="display:inline-block; vertical-align:middle; margin-left:10px;" />
                      <p style="margin:10px auto 0; max-width:440px; color:#94a3b8; font-size:14px; line-height:1.6;">Ôn tập trắc nghiệm - luyện tập, thi thử và theo dõi kết quả học tập.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:30px 28px; background:#0a1020;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:22px; background:#0e1a33; border:1px solid rgba(124,58,237,0.35); overflow:hidden;">
                        <tr>
                          <td style="padding:28px 24px; text-align:center;">
                            <p style="margin:0 0 14px; color:#a78bfa; font-size:13px; font-weight:700; line-height:1.5; letter-spacing:1px; text-transform:uppercase;">Xác thực bảo mật</p>
                            <h2 style="margin:0 0 18px; color:#f8fafc; font-size:24px; line-height:1.35; font-weight:800;">Mã xác thực của bạn</h2>
                            <p style="margin:0 0 20px; color:#cbd5e1; font-size:15px; line-height:1.75;">Nhập mã bên dưới để xác thực thao tác quan trọng trong tài khoản Quiz App:</p>
                            <p style="margin:0 0 24px; font-size:34px; font-weight:800; letter-spacing:8px; color:#a78bfa;">{{ .Token }}</p>
                            <p style="margin:0; color:#94a3b8; font-size:13px; line-height:1.7; text-align:left;">Không chia sẻ mã này với bất kỳ ai. Nếu bạn không yêu cầu mã này, hãy bỏ qua email và cân nhắc đổi mật khẩu.</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 28px; text-align:center; background:#070c1a; border-top:1px solid rgba(124,58,237,0.22);">
                      <p style="margin:0 0 6px; color:#94a3b8; font-size:12px; line-height:1.6;">Email này được gửi tự động từ Quiz App.</p>
                      <p style="margin:0; color:#64748b; font-size:11px; line-height:1.6;">Vui lòng không trả lời trực tiếp email này.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

---

## Việc bạn cần làm

1. Supabase Dashboard → project ChinhTri → **Authentication** → **Emails**.
2. Với mỗi mục trong 6 mẫu trên: chọn template tương ứng, dán Subject
   heading, xoá nội dung mặc định trong Message body rồi dán đoạn HTML
   tương ứng, bấm **Save**.
3. Gửi thử lại (bấm "Quên mật khẩu" hoặc đăng ký tài khoản test) để xem có
   đúng ý không.

Muốn chỉnh màu, chữ, hay layout gì thêm cứ nói, tôi sửa lại ngay.
