# Bao cao chuc nang Chatbot trong he thong ELC

## 1. Thong tin chung

**Ten de tai:** Tich hop chatbot tu van va ho tro nguoi dung cho he thong quan ly trung tam tieng Anh ELC.

**Pham vi bao cao:** Bao cao nay chi trinh bay rieng ve phan chatbot, bao gom muc tieu, kien truc, luong xu ly, backend, frontend, API, cau hinh, bao mat, cach kiem thu va dinh huong phat trien.

**He thong lien quan:** ELC Management System.

**Cong nghe chinh cua module chatbot:**

- Backend: Java 21, Spring Boot 3.3.5, Spring Web, Spring Security, Spring Validation, Spring Data JPA.
- Frontend: React, TypeScript, Material UI, Redux, Axios.
- Database context: PostgreSQL thong qua JPA repository.
- AI provider: OpenAI Responses API.
- Co che du phong: local fallback khi OpenAI chua cau hinh hoac goi API that bai.

## 2. Ly do xay dung chatbot

Trong mot he thong quan ly trung tam tieng Anh, nguoi dung co nhieu nhom khac nhau nhu khach vang lai, hoc vien, giao vien, ke toan va quan ly. Moi nhom nguoi dung co nhu cau hoi dap khac nhau. Khach vang lai thuong can hoi ve khoa hoc, hoc phi, thoi luong, chi nhanh, cach lien he. Hoc vien can hoi ve lich hoc, lop hoc, bai tap, diem danh va thanh toan. Nhan vien va quan ly can he thong co mot diem ho tro nhanh de dieu huong nguoi dung toi dung chuc nang.

Truoc khi co chatbot, nguoi dung phai tu tim thong tin trong giao dien hoac lien he truc tiep voi trung tam. Cach nay lam tang thoi gian tim kiem, tang ti le bo cuoc cua khach vang lai va tang khoi luong ho tro thu cong cho nhan vien. Vi vay, chatbot duoc bo sung nhu mot thanh phan ho tro nhanh, co the tra loi cac cau hoi co tinh lap lai va dieu huong nguoi dung den dung khu vuc trong he thong.

Muc tieu cua chatbot khong phai thay the hoan toan nhan vien tu van, ma la dong vai tro tro ly ao cua ELC. Chatbot giup nguoi dung nam thong tin co ban, giai thich cac chuc nang trong he thong va de xuat buoc tiep theo phu hop. Khi cau hoi can xu ly boi nhan vien, chatbot se huong dan nguoi dung de lai thong tin lien he hoac truy cap dung man hinh.

## 3. Muc tieu chuc nang

Chatbot duoc thiet ke voi cac muc tieu chinh sau:

1. Ho tro tra loi cau hoi ve khoa hoc, cap do, hoc phi, thoi luong va mo ta khoa hoc.
2. Ho tro tra loi cau hoi ve chi nhanh, dia chi va lien he.
3. Huong dan nguoi dung dang nhap de xem thong tin ca nhan nhu lich hoc, lop hoc, diem danh, bai tap, hoa don va thanh toan.
4. Cho phep khach vang lai van co the hoi dap ma khong can dang nhap.
5. Su dung du lieu that tu he thong de lam ngu canh tra loi, tranh tra loi tuy tien.
6. Bao ve API key va cac thong tin nhay cam o backend.
7. Co co che fallback khi OpenAI khong san sang, dam bao nguoi dung van nhan duoc phan hoi co ban.
8. Cung cap giao dien chat hien dai, de doc, phan biet ro tin nhan cua nguoi dung va tro ly.
9. Luu lich su chat ngan han tren trinh duyet de cai thien trai nghiem khi nguoi dung dong mo widget.

## 4. Vi tri cua chatbot trong kien truc he thong

Module chatbot duoc chia thanh hai phan lon:

- Frontend widget: hien thi hop chat, quan ly input, lich su chat cuc bo, loading, loi va hien thi cau tra loi.
- Backend chatbot API: tiep nhan cau hoi, lay ngu canh tu database, goi OpenAI neu co cau hinh, fallback neu can, tra ket qua ve frontend.

Luồng tong quat:

```text
Nguoi dung
  |
  | nhap cau hoi
  v
ChatWidget React
  |
  | POST /api/public/chatbot/messages
  v
ChatbotController
  |
  v
ChatbotService
  |
  | lay courses, branches tu database
  v
OpenAiChatClient
  |
  | goi OpenAI Responses API neu OPENAI_API_KEY hop le
  v
Tra loi AI hoac fallback
  |
  v
Frontend hien thi message
```

Thiet ke nay giup phan frontend khong can biet API key, khong goi truc tiep OpenAI va khong phu thuoc vao cau truc noi bo cua database. Moi xu ly quan trong duoc dat o backend de de bao tri va de kiem soat bao mat.

## 5. Cac file lien quan

### 5.1. Backend

**`backend/src/main/java/com/elc/system/modules/chatbot/controller/ChatbotController.java`**

File controller cua chatbot. Controller dinh nghia endpoint:

```text
POST /api/public/chatbot/messages
```

Controller nhan request tu frontend, lay thong tin nguoi dung dang dang nhap neu co thong qua `@AuthenticationPrincipal`, sau do goi `ChatbotService.reply(...)` de xu ly nghiep vu.

**`backend/src/main/java/com/elc/system/modules/chatbot/dto/ChatbotDto.java`**

File khai bao DTO cho chatbot:

- `ChatMessageRequest`: du lieu gui len tu frontend.
- `ChatHistoryMessage`: mot message trong lich su hoi thoai gan day.
- `ChatMessageResponse`: du lieu backend tra ve cho frontend.

DTO giup API co cau truc ro rang va de validate. Tin nhan nguoi dung duoc gioi han do dai de tranh payload qua lon.

**`backend/src/main/java/com/elc/system/modules/chatbot/service/ChatbotService.java`**

File service chinh cua chatbot. Day la noi xu ly nghiep vu:

- Lay du lieu course tu `CourseRepository`.
- Lay du lieu branch tu `BranchRepository`.
- Tao instructions cho AI.
- Tao input gom lich su gan day va tin nhan moi.
- Goi `OpenAiChatClient`.
- Xu ly fallback khi OpenAI loi hoac chua cau hinh.
- Tra ve `ChatMessageResponse`.

**`backend/src/main/java/com/elc/system/modules/chatbot/service/OpenAiChatClient.java`**

File client goi OpenAI Responses API bang Java `HttpClient`. File nay chiu trach nhiem:

- Doc API key tu bien moi truong.
- Tao payload gui len OpenAI.
- Cau hinh model, timeout, max output tokens, reasoning effort.
- Xu ly response cua OpenAI.
- Tach text tra loi tu response JSON.
- Nem loi co thong tin ngan gon khi request that bai.

**`backend/src/main/resources/application.yml`**

File cau hinh backend. Phan chatbot doc cac bien moi truong:

```yaml
openai:
  api-key: ${OPENAI_API_KEY:}
  model: ${OPENAI_MODEL:gpt-5-mini}
  responses-url: ${OPENAI_RESPONSES_URL:https://api.openai.com/v1/responses}
  timeout-seconds: ${OPENAI_TIMEOUT_SECONDS:20}
  max-output-tokens: ${OPENAI_MAX_OUTPUT_TOKENS:2000}
  reasoning-effort: ${OPENAI_REASONING_EFFORT:low}
```

**`backend/.env.example`**

File mau huong dan cac bien moi truong can co. File nay khong chua secret that. Khi chay local, lap trinh vien tao `backend/.env` rieng va dien `OPENAI_API_KEY`.

### 5.2. Frontend

**`frontend/src/app/components/ChatWidget.tsx`**

Component widget chinh cua chatbot. Component nay hien thi nut chat noi o goc man hinh, hop chat, header, danh sach tin nhan, input, nut gui, loading va error.

**`frontend/src/app/components/chat-message-list.tsx`**

Component render danh sach message. File nay phan biet message cua user va bot, hien thi avatar, bubble, thoi gian gui va typing indicator khi bot dang tra loi.

**`frontend/src/app/components/chat-message-content.tsx`**

Component render noi dung message. File nay ho tro mot so markdown co ban nhu:

- Doan van.
- Xuong dong.
- Bullet list.
- Numbered list.
- Inline bold.
- Inline code.
- Link.
- Code block.

**`frontend/src/services/chatbot-api.ts`**

Service goi API chatbot tu frontend. File nay dong goi request:

```text
POST public/chatbot/messages
```

Do `api.ts` da cau hinh base URL la `/api`, request day tuong ung voi:

```text
POST /api/public/chatbot/messages
```

**`frontend/src/app/components/layouts/PublicLayout.tsx`**

Layout public co gan `ChatWidget`, giup khach vang lai co the dung chatbot o cac trang cong khai.

**`frontend/src/app/components/layouts/DashboardLayout.tsx`**

Layout dashboard co gan `ChatWidget`, giup nguoi dung da dang nhap van co the hoi tro ly trong luc su dung he thong.

## 6. Thiet ke API chatbot

### 6.1. Endpoint

```http
POST /api/public/chatbot/messages
```

Endpoint nam trong nhom `/api/public/**`, vi vay duoc phep truy cap ma khong bat buoc dang nhap. Tuy nhien, neu request co JWT hop le, backend van co the doc thong tin nguoi dung hien tai qua security context.

### 6.2. Request body

```json
{
  "message": "Em muon hoc IELTS thi co khoa nao phu hop?",
  "history": [
    {
      "role": "user",
      "content": "Em can tu van khoa hoc"
    },
    {
      "role": "assistant",
      "content": "Ban muon hoc IELTS, TOEIC hay giao tiep?"
    }
  ],
  "currentPath": "/courses"
}
```

Y nghia cac truong:

- `message`: cau hoi moi cua nguoi dung. Truong nay bat buoc va toi da 1200 ky tu.
- `history`: lich su hoi thoai gan day. Backend gioi han toi da 12 message trong DTO va service chi su dung toi da 8 message de tranh prompt qua dai.
- `currentPath`: duong dan hien tai cua frontend, giup AI hieu nguoi dung dang o man hinh nao.

### 6.3. Response body

```json
{
  "message": "ELC hien co cac khoa IELTS Foundation, TOEIC va Communication Mastery. Ban co the cho toi biet muc tieu diem hoac thoi gian du kien hoc de duoc tu van lo trinh phu hop hon.",
  "source": "OPENAI",
  "timestamp": "2026-05-14T10:30:00+07:00"
}
```

Y nghia cac truong:

- `message`: cau tra loi hien thi cho nguoi dung.
- `source`: nguon tra loi, co the la `OPENAI` hoac `LOCAL_FALLBACK`.
- `timestamp`: thoi diem backend tao cau tra loi.

## 7. Luong xu ly backend chi tiet

Khi frontend gui tin nhan, backend xu ly theo cac buoc:

1. `ChatbotController` nhan request tai `/api/public/chatbot/messages`.
2. Spring validate request body dua tren annotation trong DTO.
3. Neu request co JWT hop le, `@AuthenticationPrincipal` cung cap thong tin user hien tai.
4. `ChatbotService` lay danh sach course tu `CourseRepository`.
5. `ChatbotService` lay danh sach branch tu `BranchRepository`.
6. Service gioi han so luong context toi da 8 course va 8 branch de prompt gon hon.
7. Service tao phan instructions cho AI, trong do co quy tac tra loi va du lieu he thong.
8. Service tao phan input gom lich su gan day va tin nhan moi.
9. Neu `OPENAI_API_KEY` co cau hinh, service goi `OpenAiChatClient.createReply(...)`.
10. `OpenAiChatClient` tao HTTP request toi OpenAI Responses API.
11. Neu OpenAI tra ve hop le, backend lay text tra loi va dat `source = OPENAI`.
12. Neu OpenAI loi, timeout, response sai format hoac chua cau hinh API key, service dung fallback.
13. Backend tra response cho frontend.

## 8. Du lieu ngu canh cua chatbot

Chatbot khong tra loi hoan toan dua vao tri thuc tu do. Backend dua du lieu noi bo cua he thong vao prompt de AI tra loi dung voi noi dung hien co.

### 8.1. Du lieu khoa hoc

Chatbot lay du lieu course tu `CourseRepository`. Moi course co the co nhieu level. Khi build context, service tom tat moi course theo dang:

```text
- Ten khoa hoc | cap do: ten level, hoc phi, thoi luong | mo ta: ...
```

Vi du ve thong tin co the duoc dua vao prompt:

```text
- IELTS Foundation | cap do: Foundation (3000000 VND, 12 tuan) | mo ta: Khoa hoc nen tang IELTS
```

Nho do, khi nguoi dung hoi ve khoa hoc, hoc phi hoac thoi luong, chatbot co the dua ra cau tra loi dua tren du lieu dang co trong database.

### 8.2. Du lieu chi nhanh

Chatbot lay du lieu branch tu `BranchRepository`. Moi branch duoc tom tat gom:

```text
- Ten chi nhanh | dia chi: ... | dien thoai: ...
```

Thong tin nay phu hop cho cac cau hoi nhu:

- Trung tam co chi nhanh nao?
- Dia chi ELC o dau?
- Hotline lien he la gi?
- Em muon den trung tam de tu van truc tiep thi den dau?

### 8.3. Thong tin nguoi dung hien tai

Neu nguoi dung da dang nhap, backend dua vao instructions thong tin co ban:

```text
Ten nguoi dung - role ROLE
```

Vi du:

```text
Nguyen Van A - role STUDENT
```

Neu chua dang nhap, backend ghi:

```text
Khach truy cap chua dang nhap
```

Chi dua thong tin toi thieu vao prompt giup chatbot hieu ngu canh ma khong lam lo qua nhieu du lieu ca nhan.

## 9. Thiet ke prompt va quy tac tra loi

Trong `ChatbotService`, prompt duoc chia thanh hai phan:

- Instructions: vai tro, quy tac, du lieu he thong.
- Input: lich su gan day va tin nhan moi.

Phan instructions yeu cau AI:

1. Dong vai tro tro ly ao cua ELC English Center.
2. Tra loi bang tieng Viet.
3. Tra loi ngan gon, than thien va dung ngu canh.
4. Chi tu van dua tren du lieu he thong va cac luong hien co.
5. Khong tu bia gia, lich hoc, khuyen mai, ket qua hoc tap, hoa don hoac thong tin ca nhan.
6. Khong hoi mat khau, token, API key hoac thong tin nhay cam.
7. Neu cau hoi can nhan vien xu ly, huong dan nguoi dung de lai thong tin lien he hoac vao dung man hinh.

Day la cach thiet ke prompt an toan cho he thong quan ly. Chatbot co the tu van, nhung khong duoc tu tao thong tin quan trong neu database khong co.

## 10. Co che fallback

Mot diem quan trong cua chatbot la khong phu thuoc tuyet doi vao OpenAI. Neu OpenAI khong hoat dong, backend van co the tra loi bang local fallback.

Fallback duoc kich hoat khi:

- `OPENAI_API_KEY` chua duoc cau hinh.
- API key sai hoac het han.
- OpenAI API tra ve HTTP status loi.
- Response cua OpenAI khong co text hop le.
- Network timeout.
- Co exception khi goi API.

Trong cac truong hop nay, `ChatbotService` log warning va goi `buildFallbackReply(...)`.

Fallback dua tren keyword trong cau hoi. Mot so nhom keyword:

- Khoa hoc, course, IELTS, business, hoc phi, gia.
- Chi nhanh, dia chi, lien he, hotline.
- Lich, lop, diem danh, bai tap.
- Thanh toan, hoa don, hoc phi, cong no.

Vi du, neu nguoi dung hoi "Hoc phi IELTS bao nhieu?", fallback se tra loi theo huong:

```text
Hien tai ban co the xem cac khoa hoc trong muc Khoa hoc. Mot so khoa hoc hien co: IELTS Foundation, TOEIC, Communication Mastery. Neu can tu van lo trinh, hay de lai so dien thoai trong form lien he.
```

Co che fallback giup he thong co tinh san sang cao hon. Du AI provider bi loi, chatbot van khong bi im lang hoan toan.

## 11. Cau hinh OpenAI

Backend doc cau hinh OpenAI tu bien moi truong. Cac bien quan trong:

```properties
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
OPENAI_MAX_OUTPUT_TOKENS=2000
OPENAI_REASONING_EFFORT=low
```

Trong `application.yml`, cac bien nay duoc map vao:

```yaml
openai:
  api-key: ${OPENAI_API_KEY:}
  model: ${OPENAI_MODEL:gpt-5-mini}
  responses-url: ${OPENAI_RESPONSES_URL:https://api.openai.com/v1/responses}
  timeout-seconds: ${OPENAI_TIMEOUT_SECONDS:20}
  max-output-tokens: ${OPENAI_MAX_OUTPUT_TOKENS:2000}
  reasoning-effort: ${OPENAI_REASONING_EFFORT:low}
```

Khi chay local, lap trinh vien tao file:

```text
backend/.env
```

Va dien:

```properties
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5-mini
OPENAI_MAX_OUTPUT_TOKENS=2000
OPENAI_REASONING_EFFORT=low
```

File `.env` that khong nen commit len Git. File `.env.example` chi dung de huong dan cau hinh va khong chua secret.

## 12. Bao mat

Chatbot duoc thiet ke de tranh lo thong tin nhay cam.

### 12.1. Bao ve API key

Frontend khong bao gio goi truc tiep OpenAI. Moi request den OpenAI deu di qua backend. Nho do:

- API key khong nam trong JavaScript bundle.
- API key khong bi lo tren DevTools cua trinh duyet.
- Backend co the kiem soat timeout, token, model va fallback.
- Backend co the log loi ma khong tra secret ve client.

### 12.2. Public endpoint co kiem soat

Endpoint chatbot nam trong `/api/public/chatbot/messages`, cho phep khach vang lai hoi dap. Tuy nhien request van duoc validate:

- `message` bat buoc.
- `message` toi da 1200 ky tu.
- `history` toi da 12 message.
- Moi history content toi da 1200 ky tu.
- `currentPath` toi da 200 ky tu.

Gioi han nay giup giam nguy co spam payload qua lon, giam chi phi API va tranh prompt qua dai.

### 12.3. Giam thieu lo du lieu ca nhan

Backend chi dua thong tin user toi thieu vao prompt: ho ten va role. Chatbot khong dua toan bo ho so ca nhan, hoa don, diem so hay du lieu nhay cam vao prompt.

### 12.4. Quy tac trong prompt

Instructions yeu cau chatbot:

- Khong hoi mat khau.
- Khong hoi token.
- Khong hoi API key.
- Khong hoi thong tin bao mat.
- Khong bia thong tin ca nhan, hoa don, lich hoc hay ket qua hoc tap.

Day la lop bao ve ve mat hanh vi cua AI, bo sung cho validation va kien truc backend.

## 13. Thiet ke frontend

Frontend chatbot duoc cai dat duoi dang widget noi o goc man hinh. Cach dat nay phu hop vi chatbot la chuc nang ho tro, khong phai man hinh nghiep vu chinh.

### 13.1. ChatWidget

`ChatWidget.tsx` quan ly cac state:

- `isOpen`: mo hoac dong cua so chat.
- `messages`: danh sach message dang hien thi.
- `inputText`: noi dung nguoi dung dang nhap.
- `isSending`: trang thai dang gui va cho bot tra loi.
- `errorText`: loi hien thi than thien khi API that bai.

Component hien thi:

- Floating action button co icon chat.
- Header mau primary voi ten "Tro ly ELC".
- Avatar bot.
- Subtitle thay doi theo trang thai.
- Khu vuc danh sach tin nhan.
- Text field nhap tin nhan.
- Nut gui.
- Alert loi.

### 13.2. Message list

`chat-message-list.tsx` phan biet hai loai message:

- User message: canh phai, nen primary, chu mau trang.
- Bot message: canh trai, nen trang, co border va avatar bot.

Moi message co:

- Bubble rieng.
- Avatar.
- Thoi gian gui.
- Chieu rong toi da de khong bi trai ngang.
- Khoang cach giua cac message.

Khi bot dang tra loi, component hien typing indicator voi ba cham dong va chu "Dang soan". Dieu nay giup nguoi dung biet he thong dang xu ly.

### 13.3. Message content va markdown co ban

`chat-message-content.tsx` xu ly noi dung message theo dang block:

- Paragraph.
- Unordered list.
- Ordered list.
- Code block.

Component cung ho tro inline markdown:

- `**bold**`
- `` `inline code` ``
- `[label](https://example.com)`

Link duoc kiem tra bang `safeHref`, chi cho phep:

- `http://`
- `https://`
- `mailto:`
- `tel:`

Cach nay giup tranh render link nguy hiem nhu `javascript:`.

### 13.4. Responsive

Chat window co kich thuoc:

- Mobile: `width: calc(100vw - 32px)`, height 480.
- Desktop: width 380, height 520.

Bubble message gioi han chieu rong:

- Mobile: 82%.
- Desktop: 76%.

Nho do noi dung khong bi dan qua rong, de doc hon va phu hop ca man hinh nho.

## 14. Quan ly lich su chat o frontend

Frontend luu lich su chat vao `localStorage` voi prefix:

```text
elc-chatbot-history
```

Key duoc tach theo user:

```text
elc-chatbot-history:<userId>
```

Neu chua dang nhap:

```text
elc-chatbot-history:guest
```

So message luu toi da:

```text
30 message
```

Khi gui request len backend, frontend chi gui 8 message gan nhat lam `history`. Dieu nay can bang giua trai nghiem hoi thoai lien tuc va chi phi prompt.

Lich su duoc luu o localStorage nen:

- Khong can tao bang database rieng cho chat history.
- Khong lam tang do phuc tap backend.
- Khong lam phat sinh rui ro luu tru hoi thoai dai han.
- Phu hop voi muc tieu chatbot ho tro nhanh.

## 15. Tich hop vao layout

Chatbot duoc gan vao ca hai layout:

1. `PublicLayout`: ho tro khach vang lai, nguoi chua dang nhap.
2. `DashboardLayout`: ho tro nguoi dung da dang nhap trong qua trinh dung he thong.

Dieu nay giup chatbot xuat hien o dung diem can thiet:

- O trang public, chatbot co vai tro tu van tuyen sinh.
- O dashboard, chatbot co vai tro huong dan su dung he thong.

## 16. Ly do khong tao bang database chat history

Trong pham vi hien tai, chatbot khong tao bang database de luu lich su chat. Ly do:

1. Muc tieu chinh la ho tro hoi dap nhanh, khong phai quan ly ticket ho tro.
2. Luu chat history dai han co the phat sinh van de bao mat va quyen rieng tu.
3. Neu luu database, can bo sung chinh sach xoa du lieu, phan quyen xem lich su va man hinh quan tri.
4. Frontend localStorage da du de giu ngu canh ngan han.
5. Cach lam hien tai it xam lan kien truc va de review pull request.

Trong tuong lai, neu trung tam can quan ly hoi thoai nhu CRM, co the bo sung bang `chat_sessions` va `chat_messages`. Tuy nhien o giai doan hien tai, chua can thiet.

## 17. Cac truong hop su dung chinh

### 17.1. Khach hoi ve khoa hoc

Nguoi dung:

```text
Em muon hoc IELTS thi trung tam co khoa nao?
```

Chatbot xu ly:

- Nhan dien cau hoi lien quan khoa hoc.
- Lay danh sach course va level trong database.
- Neu OpenAI san sang, tra loi theo ngu canh that.
- Neu OpenAI loi, fallback liet ke mot so khoa hoc hien co.

Ket qua mong muon:

```text
ELC hien co cac khoa hoc IELTS Foundation, TOEIC va Communication Mastery. Ban co the cho toi biet muc tieu diem va thoi gian du kien hoc de toi goi y lo trinh phu hop hon.
```

### 17.2. Khach hoi ve hoc phi

Nguoi dung:

```text
Hoc phi khoa TOEIC la bao nhieu?
```

Chatbot xu ly:

- Lay du lieu level co `basePrice`.
- Neu co gia trong database, tra loi dua tren gia do.
- Neu khong co gia, khong tu bia, huong dan lien he tu van.

### 17.3. Nguoi dung hoi ve chi nhanh

Nguoi dung:

```text
Trung tam co chi nhanh nao?
```

Chatbot xu ly:

- Lay branch tu database.
- Tra loi ten chi nhanh, dia chi, so dien thoai neu co.

### 17.4. Hoc vien hoi ve lich hoc

Nguoi dung:

```text
Em xem lich hoc o dau?
```

Chatbot xu ly:

- Nhan dien cau hoi lien quan lich hoc.
- Huong dan nguoi dung dang nhap va vao khu vuc hoc vien.
- Khong tu tao lich hoc neu khong lay du lieu lich hoc ca nhan.

### 17.5. Nguoi dung hoi ve thanh toan

Nguoi dung:

```text
Em xem hoa don o dau?
```

Chatbot xu ly:

- Huong dan vao khu vuc hoc vien hoac tai chinh sau khi dang nhap.
- Khong hoi mat khau, ma bao mat hay thong tin nhay cam.

## 18. Kiem thu bang Postman

### 18.1. Test chatbot khong dang nhap

Request:

```http
POST http://localhost:8080/api/public/chatbot/messages
Content-Type: application/json
```

Body:

```json
{
  "message": "ELC co nhung khoa hoc nao?",
  "history": [],
  "currentPath": "/"
}
```

Ket qua mong muon:

- HTTP status `200 OK`.
- Response co `message`.
- `source` la `OPENAI` neu OpenAI cau hinh dung.
- `source` la `LOCAL_FALLBACK` neu khong co API key hoac OpenAI loi.

### 18.2. Test chatbot co dang nhap

Buoc 1: Login de lay token.

```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json
```

Body:

```json
{
  "email": "admin@elc.com",
  "password": "password123"
}
```

Buoc 2: Goi chatbot voi header:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Body:

```json
{
  "message": "Toi dang o dashboard, toi co the xem lop hoc o dau?",
  "history": [],
  "currentPath": "/dashboard"
}
```

Ket qua mong muon:

- HTTP status `200 OK`.
- Chatbot tra loi theo ngu canh nguoi dung da dang nhap.

### 18.3. Test validation message rong

Body:

```json
{
  "message": "",
  "history": [],
  "currentPath": "/"
}
```

Ket qua mong muon:

- Backend tra loi loi validation.
- Khong goi OpenAI.

### 18.4. Test message qua dai

Gui `message` dai hon 1200 ky tu.

Ket qua mong muon:

- Backend chan request.
- Khong goi OpenAI.
- He thong tranh payload qua lon.

### 18.5. Test fallback khi tat API key

Trong `backend/.env`, de:

```properties
OPENAI_API_KEY=
```

Khoi dong lai backend va goi:

```json
{
  "message": "Hoc phi IELTS bao nhieu?",
  "history": [],
  "currentPath": "/courses"
}
```

Ket qua mong muon:

- HTTP status `200 OK`.
- `source` la `LOCAL_FALLBACK`.
- Log backend co thong bao OpenAI chatbot fallback activated.

### 18.6. Test OpenAI thanh cong

Trong `backend/.env`, cau hinh:

```properties
OPENAI_API_KEY=<api-key-hop-le>
OPENAI_MODEL=gpt-5-mini
```

Khoi dong lai backend va goi chatbot.

Ket qua mong muon:

- HTTP status `200 OK`.
- `source` la `OPENAI`.
- Cau tra loi tu nhien hon fallback.
- Cau tra loi khong bia thong tin ngoai database.

## 19. Kiem thu tren giao dien web

Quy trinh test giao dien:

1. Chay backend:

```powershell
.\backend\mvnw.cmd -f .\backend\pom.xml spring-boot:run
```

2. Chay frontend:

```powershell
npm --prefix .\frontend run dev
```

3. Mo web tren trinh duyet theo URL Vite hien thi.
4. Bam nut chat o goc phai man hinh.
5. Kiem tra welcome message.
6. Gui cau hoi ve khoa hoc.
7. Kiem tra typing indicator.
8. Kiem tra message cua user canh phai, message cua bot canh trai.
9. Gui cau hoi co yeu cau danh sach, vi du:

```text
Liet ke cac khoa hoc hien co theo tung y
```

10. Kiem tra bot response co xuong dong va bullet list de doc.
11. Tat mo widget, kiem tra localStorage co giu lich su.
12. Dang nhap tai khoan khac, kiem tra lich su chat tach theo user.

## 20. Cac test case de bao cao

| Ma test | Muc tieu | Du lieu test | Ket qua mong muon |
| --- | --- | --- | --- |
| TC-CB-01 | Gui cau hoi public | Khong co token | Tra loi 200 OK |
| TC-CB-02 | Gui cau hoi co token | Token user hop le | Tra loi co ngu canh user |
| TC-CB-03 | Message rong | `message=""` | Bi chan validation |
| TC-CB-04 | Message qua dai | Hon 1200 ky tu | Bi chan validation |
| TC-CB-05 | Khong co API key | `OPENAI_API_KEY` rong | Tra loi fallback |
| TC-CB-06 | API key hop le | Co key dung | Tra loi source OPENAI |
| TC-CB-07 | Hoi khoa hoc | "Co khoa IELTS khong?" | Tra loi dua tren course data |
| TC-CB-08 | Hoi chi nhanh | "Dia chi trung tam o dau?" | Tra loi dua tren branch data |
| TC-CB-09 | Hoi thanh toan | "Xem hoa don o dau?" | Huong dan vao khu vuc phu hop |
| TC-CB-10 | Markdown list | Cau hoi yeu cau liet ke | UI hien bullet/numbered list de doc |
| TC-CB-11 | Loading state | Gui tin nhan | Hien typing indicator |
| TC-CB-12 | Network error | Tat backend khi frontend dang chay | Hien error than thien |

## 21. Diem manh cua thiet ke hien tai

1. **Tach bach frontend va backend:** Frontend chi goi API noi bo, khong biet OpenAI key.
2. **Bao mat hon:** API key nam o backend, doc tu bien moi truong.
3. **Co fallback:** He thong van co phan hoi khi OpenAI loi.
4. **Dung du lieu that:** Chatbot dua course va branch tu database vao ngu canh.
5. **Khong xam lan kien truc:** Module chatbot duoc tao rieng trong `modules/chatbot`.
6. **Public nhung co validate:** Khach vang lai dung duoc, nhung request bi gioi han.
7. **UI than thien:** Co bubble, avatar, typing indicator, markdown co ban.
8. **Luu lich su cuc bo:** Cai thien trai nghiem ma khong can database moi.
9. **De mo rong:** Co the them context tu class, invoice, assignment trong tuong lai.
10. **De test:** API don gian, co the test bang Postman va tren web.

## 22. Han che hien tai

Mac du chatbot da hoat dong, van con mot so han che:

1. Chat history chi luu tren localStorage, chua dong bo giua cac thiet bi.
2. Chatbot moi lay context tu course va branch, chua lay lich hoc ca nhan, hoa don ca nhan hay bai tap ca nhan.
3. Chua co rate limit rieng cho endpoint chatbot.
4. Chua co bang log hoi thoai de quan ly chat theo CRM.
5. Fallback con don gian, dua tren keyword.
6. Chua co streaming response, nguoi dung phai doi den khi co ca cau tra loi.
7. Chua co dashboard thong ke so cau hoi chatbot.
8. Chua co co che danh gia cau tra loi huu ich hay khong huu ich.

Nhung han che nay khong phai loi nghiep vu. Day la nhung diem co the cai tien sau khi he thong can muc do chatbot nang cao hon.

## 23. De xuat phat trien tiep theo

Neu tiep tuc phat trien chatbot, co the xem xet cac huong sau:

### 23.1. Bo sung rate limiting

Vi endpoint chatbot public, nen co the bo sung rate limit theo IP hoac user ID. Muc tieu la tranh spam request va kiem soat chi phi OpenAI.

### 23.2. Streaming response

Hien tai backend tra ve sau khi OpenAI hoan tat. Co the nang cap sang streaming de nguoi dung thay cau tra loi xuat hien dan dan. Trai nghiem nay tu nhien hon voi chatbot.

### 23.3. Context ca nhan hoa

Voi nguoi dung da dang nhap, co the bo sung context theo role:

- Hoc vien: lop dang hoc, lich hoc sap toi, hoa don gan nhat, bai tap chua nop.
- Giao vien: lop phu trach, lich day, bai tap can cham.
- Ke toan: hoa don, thanh toan, cong no.
- Quan ly: thong ke tong quan va canh bao nghiep vu.

Can luu y chi dua du lieu toi thieu can thiet vao prompt de bao ve rieng tu.

### 23.4. Chat history trong database

Neu trung tam muon quan ly tu van nhu CRM, co the tao:

```text
chat_sessions
chat_messages
```

Bang `chat_sessions` luu phien chat, user hoac guest, trang thai, thoi gian tao. Bang `chat_messages` luu tung message. Khi do nhan vien co the xem lai lich su tu van.

### 23.5. Cong cu danh gia cau tra loi

Co the them nut "Huu ich" va "Khong huu ich" cho moi cau tra loi. Du lieu nay giup cai thien prompt va context.

### 23.6. Kho tri thuc noi bo

Co the them knowledge base cho cac cau hoi thuong gap:

- Chinh sach hoc lai.
- Chinh sach bao luu.
- Cach dang ky khoa hoc.
- Quy trinh thanh toan.
- Quy trinh nop bai tap.

Khi do chatbot co the tra loi nhieu hon ma van theo du lieu kiem soat.

## 24. Ket luan

Chuc nang chatbot trong he thong ELC duoc xay dung theo huong thuc te, an toan va phu hop voi kien truc hien co. Chatbot khong chi la mot o chat giao dien, ma gom day du cac thanh phan backend, frontend, API, validation, prompt, du lieu ngu canh, fallback va cau hinh bao mat.

O backend, chatbot duoc dat trong module rieng `modules/chatbot`, co controller, DTO, service va OpenAI client ro rang. Service lay du lieu course va branch tu database de tao ngu canh, giup cau tra loi gan voi du lieu that cua trung tam. OpenAI API key duoc bao ve trong backend va doc tu bien moi truong, khong de lo ra frontend. Khi OpenAI khong san sang, fallback dam bao nguoi dung van nhan duoc ho tro co ban.

O frontend, chatbot duoc tich hop vao ca public layout va dashboard layout, giup ca khach vang lai va nguoi dung da dang nhap deu co the su dung. Giao dien chat co bubble rieng cho user va bot, avatar, typing indicator, error message than thien, localStorage history va ho tro markdown co ban. Cach hien thi nay giup cau tra loi de doc hon, khong bi thanh mot khoi chu dai.

Ve mat nghiep vu, chatbot phu hop voi muc tieu cua trung tam tieng Anh: tu van khoa hoc, hoc phi, chi nhanh, dieu huong nguoi dung den cac khu vuc nhu lich hoc, bai tap, hoa don va thanh toan. Thiet ke hien tai uu tien it xam lan, de review, de test va co the mo rong trong tuong lai.

Tong ket lai, chatbot la mot thanh phan ho tro quan trong trong he thong ELC. No giup tang trai nghiem nguoi dung, giam tai cho nhan vien tu van, dong thoi tao nen mot giao dien hien dai va than thien hon cho web.

## 25. Phu luc: Cau lenh chay va test nhanh

Chay backend:

```powershell
.\backend\mvnw.cmd -f .\backend\pom.xml spring-boot:run
```

Chay frontend:

```powershell
npm --prefix .\frontend run dev
```

Test nhanh chatbot bang PowerShell:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:8080/api/public/chatbot/messages" `
  -ContentType "application/json" `
  -Body '{"message":"ELC co khoa hoc nao?","history":[],"currentPath":"/"}'
```

Bien moi truong can cau hinh:

```properties
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
OPENAI_MAX_OUTPUT_TOKENS=2000
OPENAI_REASONING_EFFORT=low
```

Luu y quan trong:

- Khong commit `backend/.env`.
- Khong dua API key that vao bao cao, anh chup man hinh hoac Git.
- Neu response co `source = LOCAL_FALLBACK`, can kiem tra lai `OPENAI_API_KEY`, model, network va log backend.
- Neu response co `source = OPENAI`, chatbot da goi AI provider thanh cong.
