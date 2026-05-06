# Huong dan chay va test ELC System

Tai lieu nay dung cho moi truong Windows PowerShell. He thong co 5 role:

- `MANAGER`
- `TEACHER`
- `STUDENT`
- `ACCOUNTANT`
- `LEAD`

## 1. Yeu cau truoc khi chay

Can co san:

- Java 21+ hoac Java version dang dung duoc voi project
- Node.js + npm
- Supabase PostgreSQL da tao database/schema/data
- Backend port mac dinh: `8080`
- Frontend port mac dinh: `5173`

## 2. Chay backend voi Supabase

Mo PowerShell tai thu muc repo:

```powershell
cd "D:\DaiHoc\Nam3\LT WEB\elc-system"
```

Set bien moi truong ket noi Supabase. Thay cac gia tri ben duoi bang thong tin Supabase cua ban:

```powershell
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://<SUPABASE_HOST>:5432/postgres?sslmode=require"
$env:SPRING_DATASOURCE_USERNAME="postgres"
$env:SPRING_DATASOURCE_PASSWORD="<SUPABASE_DB_PASSWORD>"
```

Chay backend:

```powershell
.\backend\mvnw.cmd -f .\backend\pom.xml spring-boot:run
```

Backend thanh cong khi log co dang:

```text
Started SystemApplication
Tomcat started on port 8080
```

Kiem tra nhanh backend:

```powershell
Invoke-WebRequest -UseBasicParsing "http://localhost:8080/api/courses"
```

Neu API public tra ve `200` hoac JSON list thi backend da len.

## 3. Chay frontend

Mo PowerShell moi tai repo:

```powershell
cd "D:\DaiHoc\Nam3\LT WEB\elc-system"
```

Neu chi mo frontend tren chinh may dang chay backend bang `http://127.0.0.1:5173` thi khong can set gi them.

Neu mo frontend bang IP LAN/Hamachi/VPN, vi du `http://26.150.15.154:3000`, khong duoc de API mac dinh la `localhost`. Voi trinh duyet cua nguoi dung, `localhost` la may dang mo trinh duyet, khong chac la may dang chay backend. Hay set API base sang IP backend:

```powershell
$env:VITE_API_BASE_URL="http://26.150.15.154:8080/api"
```

Chay frontend:

```powershell
npm --prefix ".\frontend" run dev -- --host 127.0.0.1 --port 5173
```

Mo trinh duyet:

```text
http://127.0.0.1:5173
```

Neu muon may khac truy cap frontend qua IP, chay:

```powershell
$env:VITE_API_BASE_URL="http://26.150.15.154:8080/api"
npm --prefix ".\frontend" run dev -- --host 0.0.0.0 --port 3000
```

Sau do mo:

```text
http://26.150.15.154:3000
```

Luc nay request login phai la:

```text
http://26.150.15.154:8080/api/auth/login
```

Neu van thay request la `http://localhost:8080/api/auth/login`, hay dung server frontend cu, stop terminal frontend va chay lai lenh tren.

## 4. Kiem tra build/test nhanh

Frontend build:

```powershell
npm --prefix ".\frontend" run build
```

Backend test:

```powershell
.\backend\mvnw.cmd -f .\backend\pom.xml test
```

Ky vong hien tai:

- Frontend build pass
- Backend test pass `9/9`

Luu y: backend test dung H2 nen co the co warning ve `JSONB`; neu test van `BUILD SUCCESS` thi khong anh huong Supabase/PostgreSQL.

## 5. Tai khoan test

Can co user trong Supabase cho cac role:

- Manager: dung de quan ly users, classes, leads
- Teacher: dung de xem lop, lich day, diem danh, bai tap
- Student: dung de xem khoa hoc, bang diem, hoc phi
- Accountant: dung de xem dashboard tai chinh
- Lead: dung de xem profile sau khi dang ky public

Neu chua co user, dung Manager tao trong man hinh `Quan ly nguoi dung`, hoac insert truc tiep vao Supabase voi password da ma hoa dung BCrypt. Cach de nhanh nhat la dung API/register de tao `LEAD`, sau do Manager doi role trong UI.

## 6. Checklist test public

### Trang chu va khoa hoc

1. Mo `/`.
2. Vao `/courses`.
3. Kiem tra danh sach khoa hoc load tu API.
4. Tim kiem khoa hoc.
5. Loc theo level.
6. Bam vao mot khoa hoc de vao `/courses/:id`.

Ket qua mong doi:

- Khong loi console/network.
- Khoa hoc hien ten, level, gia, mo ta.

### Lien he

1. Vao `/contact`.
2. Nhap ho ten, email, so dien thoai, tieu de, noi dung.
3. Bam `Gui tin nhan`.
4. Dang nhap Manager, vao CRM & Leads.

Ket qua mong doi:

- Form gui thanh cong.
- Lead moi xuat hien trong CRM voi source `WEBSITE_FORM`.

### Dang ky / dang nhap

1. Vao `/register`.
2. Dang ky user moi.
3. Dang nhap bang email/password vua tao.

Ket qua mong doi:

- User moi co role `LEAD`.
- Sau login duoc dieu huong theo role.

## 7. Checklist Manager

Dang nhap bang account `MANAGER`.

### Dashboard

1. Vao `/admin/dashboard`.
2. Kiem tra tong doanh thu, lop, hoc vien, bieu do.

Ket qua mong doi:

- Page load khong loi.
- So lieu API hien thi neu backend co data.

### Quan ly nguoi dung

1. Vao `/admin/users`.
2. Tao user moi role `TEACHER`.
3. Tao user moi role `STUDENT`.
4. Tao user moi role `ACCOUNTANT`.
5. Sua thong tin user.
6. Vo hieu hoa user.

Ket qua mong doi:

- Role dropdown chi co `MANAGER`, `TEACHER`, `STUDENT`, `ACCOUNTANT`, `LEAD`.
- Khong con role `ADMIN`.

### CRM & Leads

1. Vao `/admin/leads`.
2. Tao lead moi.
3. Chuyen lead qua cac stage.
4. Kiem tra lead public tu form contact co hien thi.

Ket qua mong doi:

- Lead list load dung.
- Update status thanh cong.

### Quan ly lop hoc

1. Vao `/admin/classes`.
2. Bam tao lop moi.
3. Chon khoa hoc, giao vien, phong hoc, chi nhanh bang dropdown.
4. Nhap ngay bat dau/ket thuc, si so, status.
5. Tao lop.
6. Bam them lich.
7. Chon ngay trong tuan, gio bat dau, gio ket thuc.
8. Chuyen status lop: `ACCEPTING -> UPCOMING -> ONGOING -> COMPLETED`.

Ket qua mong doi:

- Khong phai nhap ID thu cong.
- Lich hoc hien tren bang.
- Update status thanh cong.

## 8. Checklist Teacher

Dang nhap bang account `TEACHER`.

### Lich day

1. Vao `/teacher/schedule`.
2. Kiem tra lich theo ngay trong tuan.

Ket qua mong doi:

- Chi hien lop co `teacherId` la user dang dang nhap.

### Lop hoc cua toi

1. Vao `/teacher/classes`.
2. Xem cac lop dang day.
3. Bam `Xem hoc vien`.

Ket qua mong doi:

- Hien si so theo enrollment.
- Hien danh sach hoc vien cua lop.

### Diem danh

1. Vao `/teacher/attendance`.
2. Chon lop.
3. Chon ngay.
4. Doi trang thai hoc vien: co mat, vang, muon, co phep.
5. Bam luu diem danh.

Ket qua mong doi:

- Tao/cap nhat attendance thanh cong.
- Refresh trang khong gay loi.

### Bai tap

1. Vao `/teacher/assignments`.
2. Tao bai tap moi cho lop.
3. Mo `Bai nop & cham diem`.
4. Neu co submission, bam icon cham diem.
5. Nhap diem va nhan xet.

Ket qua mong doi:

- Bai tap tao thanh cong.
- Diem gui dung API `/submissions/{id}/grade`.

## 9. Checklist Student

Dang nhap bang account `STUDENT`.

### Khoa hoc cua toi

1. Vao `/student/courses`.
2. Kiem tra khoa/lop dang hoc.

Ket qua mong doi:

- Lay enrollment theo student dang dang nhap.

### Bang diem

1. Vao `/student/grades`.
2. Kiem tra diem giua ky, cuoi ky, final grade, comments.

Ket qua mong doi:

- Lay result theo enrollment.
- Neu chua co diem thi hien `Chua co`, khong crash.

### Hoc phi

1. Vao `/student/payments`.
2. Kiem tra invoice list.

Ket qua mong doi:

- Invoice backend field `finalAmount`, `className`, `UNPAID/PARTIAL/PAID` duoc map dung len UI.

## 10. Checklist Accountant

Dang nhap bang account `ACCOUNTANT`.

1. Vao `/finance/dashboard`.
2. Kiem tra cong no.
3. Kiem tra dashboard tai chinh.

Ket qua mong doi:

- Lay invoice debt tu `/api/invoices/debt`.
- Tinh tong cong no tu danh sach invoice.

## 11. Loi thuong gap

### Frontend bao network error

Kiem tra backend co dang chay khong:

```powershell
Invoke-WebRequest -UseBasicParsing "http://localhost:8080/api/courses"
```

Kiem tra `VITE_API_BASE_URL` co dung khong.

Neu dang mo frontend tu `http://26.150.15.154:3000`, request API khong nen la `http://localhost:8080/...`; no phai la `http://26.150.15.154:8080/...`.

### Login duoc nhung bi day ve login

Kiem tra token trong DevTools > Application > Local Storage:

- `token`
- `refreshToken`
- `userId`

Neu token cu, logout roi login lai.

### Manager vao trang users bi 403

Kiem tra role trong database phai la `MANAGER`, khong phai `ADMIN`.

### Supabase khong ket noi duoc

Kiem tra:

- Host/port dung
- Password dung
- `sslmode=require`
- Supabase database cho phep ket noi tu IP hien tai

## 12. Lenh tong hop hay dung

Chay backend:

```powershell
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://<SUPABASE_HOST>:5432/postgres?sslmode=require"
$env:SPRING_DATASOURCE_USERNAME="postgres"
$env:SPRING_DATASOURCE_PASSWORD="<SUPABASE_DB_PASSWORD>"
.\backend\mvnw.cmd -f .\backend\pom.xml spring-boot:run
```

Chay frontend:

```powershell
npm --prefix ".\frontend" run dev -- --host 127.0.0.1 --port 5173
```

Build/test:

```powershell
npm --prefix ".\frontend" run build
.\backend\mvnw.cmd -f .\backend\pom.xml test
```
