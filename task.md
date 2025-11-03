# 🏠 E-Motel Backend Task List

## I. Quản lý người dùng (User Management)
- [ ] Đăng ký tài khoản (qua email / OTP)
- [ ] Đăng nhập (JWT Access + Refresh Token)
- [ ] Quên mật khẩu (gửi OTP qua email)
- [ ] Phân quyền người dùng:
  - [ ] Admin hệ thống
  - [ ] Chủ trọ
  - [ ] Người thuê
- [ ] Hồ sơ cá nhân (CRUD thông tin, CCCD, số điện thoại, avatar)
- [ ] Đổi mật khẩu
- [ ] Đăng xuất & thu hồi token

---

## II. Quản lý nhà trọ (Motel Management)
- [ ] CRUD nhà trọ (tạo / chỉnh sửa / xóa)
- [ ] Thông tin nhà trọ:
  - [ ] Tên, địa chỉ, mô tả, số lượng phòng
  - [ ] Gắn logo, hình ảnh
  - [ ] Lưu vị trí bản đồ (Google Maps API)
- [ ] Một tài khoản chủ có thể quản lý nhiều nhà trọ

---

## III. Quản lý phòng (Room Management)
- [ ] Danh sách phòng:
  - [ ] Tên phòng, diện tích, giá thuê, tình trạng
- [ ] Quản lý trạng thái phòng:
  - [ ] Trống / Đang thuê / Bảo trì
- [ ] Ghi chú thiết bị trong phòng (TV, máy lạnh, tủ lạnh,...)
- [ ] Upload hình ảnh phòng (Cloudinary)

---

## IV. Quản lý hợp đồng thuê (Contract Management)
- [ ] Tạo hợp đồng giữa chủ & người thuê
- [ ] Thông tin hợp đồng:
  - [ ] Ngày bắt đầu, thời hạn, tiền cọc, kỳ thanh toán
- [ ] Đính kèm file PDF hợp đồng
- [ ] Cảnh báo sắp hết hạn hợp đồng (cronjob hoặc scheduler)

---

## V. Quản lý hóa đơn (Billing Management)
- [ ] Tự động tạo hóa đơn hàng tháng (theo hợp đồng)
- [ ] Ghi chỉ số điện, nước theo tháng
- [ ] Tính tổng tiền: phòng + điện + nước + dịch vụ
- [ ] Xuất hóa đơn PDF
- [ ] Gửi mail thông báo hóa đơn
- [ ] Trạng thái thanh toán:
  - [ ] Chưa thanh toán / Đã thanh toán

---

## VI. Thanh toán (Payment Integration)
- [ ] Tích hợp thanh toán online (Momo, ZaloPay, VietQR,…)
- [ ] Lưu lịch sử thanh toán
- [ ] Gửi thông báo xác nhận tự động

---

## VII. Phản ánh & bảo trì (Feedback / Maintenance)
- [ ] Người thuê gửi yêu cầu sửa chữa
- [ ] Chủ trọ nhận thông báo & cập nhật trạng thái:
  - [ ] Đang xử lý / Hoàn thành
- [ ] Upload ảnh minh họa sự cố

---

## VIII. Thông báo & nhắc nhở (Notification System)
- [ ] Gửi thông báo đến app/web/email khi:
  - [ ] Sắp đến hạn thanh toán
  - [ ] Hợp đồng sắp hết hạn
  - [ ] Phản ánh được cập nhật
- [ ] Realtime notification (WebSocket / Firebase Cloud Messaging)
- [ ] Cron job gửi email nhắc tự động

---

## IX. Báo cáo & thống kê (Report / Analytics)
- [ ] Doanh thu theo tháng / năm
- [ ] Tỉ lệ phòng trống
- [ ] Lịch sử thanh toán
- [ ] Xuất báo cáo Excel / PDF

---

## III. Kiến trúc hệ thống

### 🧩 Frontend – Next.js
- Framework: **Next.js 15+ (App Router)**
- UI: **TailwindCSS + ShadCN UI**
- State: **Zustand**
- Form: **React Hook Form + Zod**
- Auth: **NextAuth.js (JWT)**
- HTTP: **Axios + TanStack Query**
- Charts: **Recharts / Chart.js**
- Upload: **Cloudinary / Firebase Storage**

### ⚙️ Backend – NestJS
- Framework: **NestJS 10+**
- ORM: **Prisma ORM** hoặc **TypeORM**
- Database: **PostgreSQL**
- Auth: **JWT + Refresh Token**
- API: **RESTful**
- Upload file: **Cloudinary**
- Notification: **Firebase Admin SDK**
- Validation: **class-validator + class-transformer**
- Scheduling: **@nestjs/schedule** cho các tác vụ định kỳ
- Logging: **Winston / Pino**

---

## 🗂 Dự kiến module backend
| Module | Mô tả ngắn | Liên quan |
|---------|-------------|-----------|
| `auth` | Xác thực & phân quyền | User |
| `users` | Quản lý người dùng | Auth |
| `motels` | Quản lý nhà trọ | User (chủ trọ) |
| `rooms` | Quản lý phòng | Motel |
| `contracts` | Hợp đồng thuê | User, Room |
| `bills` | Hóa đơn hàng tháng | Contract |
| `payments` | Thanh toán online | Bill |
| `feedback` | Phản ánh / bảo trì | User, Room |
| `notifications` | Thông báo realtime | Firebase |
| `reports` | Thống kê & xuất dữ liệu | Admin |

---

## ✅ Ưu tiên triển khai theo phase
**Phase 1:** Auth, User, Motel, Room  
**Phase 2:** Contract, Billing, Payment  
**Phase 3:** Feedback, Notification, Report  

---

