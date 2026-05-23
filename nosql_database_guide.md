# Hướng dẫn Thiết kế và Triển khai CSDL NoSQL (Firebase Firestore)

Vì hệ thống sử dụng **NoSQL (Firebase Cloud Firestore)**, cách chúng ta thiết kế cơ sở dữ liệu sẽ khác biệt so với SQL truyền thống (như MySQL/SQL Server). Thay vì chuẩn hóa (Normalization) bằng nhiều bảng và dùng `JOIN`, chúng ta sẽ thiết kế hướng tới **Collection** (Tập hợp) và **Document** (Tài liệu JSON) sao cho tối ưu số lần đọc (Read) nhất.

Dưới đây là từng bước thực hiện chi tiết cho dự án InvSmart.

---

## BƯỚC 1: Lập mô hình dữ liệu (NoSQL ERD)

Trong Firestore, chúng ta sử dụng phương pháp **Tham chiếu (Referencing)** thông qua ID và **Nhúng (Embedding)** các dữ liệu tĩnh.

**Sơ đồ liên kết (Logical Relational Mapping):**
*   **1 Chain (Chuỗi)** sẽ có nhiều **Store (Chi nhánh)**. (Liên kết `chainId`).
*   **1 Chain** sẽ có 1 danh mục **Product (Sản phẩm)** dùng chung. (Liên kết `chainId`).
*   **1 User** có thể thuộc về 1 `chainId` (nếu là Master) và 1 `storeId` (nếu là Manager/Staff).
*   **1 Order (Hóa đơn)** được tạo tại 1 `storeId` bởi 1 `staffUid`. Để tối ưu việc hiển thị lịch sử đơn, các sản phẩm trong đơn sẽ được **Nhúng (Embed)** trực tiếp vào document Order dưới dạng một mảng (List) thay vì tạo sub-collection.

---

## BƯỚC 2: Chi tiết Cấu trúc JSON (Schema)

Dựa trên mã nguồn hiện hành, dưới đây là cấu trúc chi tiết bạn cần triển khai cho từng Collection ở root (gốc).

### 1. Collection: `users`
*   **Key (Document ID):** `uid` (được sinh ra từ Firebase Auth)
*   **Fields:**
    *   `email` (String)
    *   `fullName` (String)
    *   `roleGlobal` (String): "master", "manager", "staff", hoặc "unassigned"
    *   `chainId` (String): ID chuỗi mà user thuộc về
    *   `storeId` (String): ID chi nhánh (dành cho manager/staff)
    *   `status` (String): "active" hoặc "blocked"
    *   `createdAt` / `updatedAt` (Timestamp)

### 2. Collection: `chains`
*   **Key:** Tự động sinh bởi Firestore (`chainId`)
*   **Fields:**
    *   `name` (String): Tên chuỗi (VD: "Chuỗi Mixue")
    *   `masterUid` (String): ID của chủ chuỗi
    *   `description` (String)
    *   `createdAt` (Timestamp)

### 3. Collection: `stores`
*   **Key:** Tự động sinh (`storeId`)
*   **Fields:**
    *   `chainId` (String): ID của chuỗi cha
    *   `name` (String): Tên chi nhánh (VD: "Cơ sở Cầu Giấy")
    *   `address` (String)
    *   `masterUid` (String): ID của chủ chuỗi
    *   `managerUid` (String): ID của quản lý cửa hàng
    *   `managerName` (String): Lưu sẵn tên quản lý để load giao diện nhanh
    *   `status` (String): "active" hoặc "suspended"
    *   `createdAt` (Timestamp)

### 4. Collection: `products`
*   **Key:** `productId`
*   **Fields:**
    *   `sku` (String): Mã vạch/Mã định danh
    *   `name` (String): Tên sản phẩm
    *   `chainId` (String) / `storeId` (String)
    *   `stockQty` (Number): Số lượng tồn kho
    *   `price` (Number): Giá bán
    *   `imageUrl` (String): Link ảnh (Cloudinary)
    *   `active` (Boolean): Trạng thái bán
    *   `category` (String)

### 5. Collection: `orders`
*   **Key:** `orderId`
*   **Fields:**
    *   `orderCode` (String): Mã đơn sinh tự động cho user dễ nhìn (VD: `ORD-1234`)
    *   `orderType` (String): "sale" (bán hàng) hoặc "import" (nhập kho)
    *   `status` (String): "pending_payment" hoặc "paid"
    *   `paymentMethod` (String): "qr" hoặc "cash"
    *   `totalAmount` (Number) / `totalQuantity` (Number)
    *   `chainId` (String) / `storeId` (String) / `staffUid` (String)
    *   **`items` (Array):** Nhúng (Embed) mảng sản phẩm. Mỗi item gồm:
        *   `productId` (String)
        *   `productName` (String)
        *   `quantity` (Number)
        *   `priceAtTime` (Number) - Bắt buộc lưu giá trị tại thời điểm bán để không bị sai doanh thu khi giá gốc sản phẩm đổi.

### 6. Collection: `inventory_logs` (Lịch sử Kho)
*   **Key:** Tự động sinh
*   **Fields:** `product_id`, `storeId`, `user_id`, `type` ("IN"/"OUT"), `quantity_change`, `timestamp`

---

## BƯỚC 3: Triển khai vào Firebase Console

1.  **Tạo dự án Firebase:** Truy cập [Firebase Console](https://console.firebase.google.com/), chọn dự án của bạn.
2.  **Bật Firestore:** Ở menu trái, chọn **Firestore Database** -> Bấm **Create database**.
3.  **Chọn Location:** Chọn region gần bạn nhất (VD: `asia-southeast1` - Singapore).
4.  **Chế độ (Mode):** Bắt đầu với **Start in production mode** (để cấu hình Security Rules bảo mật ngay từ đầu).
5.  **Tạo Collection đầu tiên:** Nhấn "Start collection", điền tên là `users` và tạo 1 Document mẫu (Mock data) khớp với Schema ở Bước 2.

---

## BƯỚC 4: Thiết lập Composite Indexes (Chỉ mục kép)

Firestore tự động tạo index đơn cho tất cả các field. Tuy nhiên, khi truy vấn lọc kết hợp sắp xếp (ví dụ: "Lấy tất cả đơn hàng của `storeId = X`, sắp xếp theo `createdAt` giảm dần"), bạn bắt buộc phải tạo **Composite Index**.

Bạn tạo file `firestore.indexes.json` trong source code với nội dung sau, sau đó dùng Firebase CLI để deploy (`firebase deploy --only firestore:indexes`):

```json
{
  "indexes": [
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "storeId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "chainId", "order": "ASCENDING" },
        { "fieldPath": "active", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## BƯỚC 5: Thiết lập Security Rules (Bảo mật)

Đây là bước cực kỳ quan trọng cho NoSQL trên client. Phải chặn user thay đổi quyền hoặc xem dữ liệu của chuỗi khác. Trong Firebase Console (tab Rules) hoặc file `firestore.rules`, cấu hình:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Hàm kiểm tra người dùng đã đăng nhập chưa
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Hàm lấy data của người dùng đang gửi request
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    match /users/{userId} {
      // Bất kỳ ai login cũng đọc được user (cần để phân quyền)
      allow read: if isAuthenticated();
      // Chỉ user đó mới được tự sửa thông tin của mình
      // KHÔNG cho phép tự sửa trường roleGlobal để hack quyền
      allow update: if request.auth.uid == userId 
                    && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['roleGlobal', 'chainId', 'storeId']);
    }

    match /products/{productId} {
      allow read: if isAuthenticated();
      // Chỉ Master/Manager mới được tạo sản phẩm
      allow write: if isAuthenticated() && (getUserData().roleGlobal == 'master' || getUserData().roleGlobal == 'manager');
    }
    
    match /orders/{orderId} {
      // Bất kỳ ai trong hệ thống (Staff/Manager/Master) đều đọc/ghi được đơn hàng 
      // (Trong thực tế cần filter kỹ hơn bằng storeId)
      allow read, write: if isAuthenticated();
    }
  }
}
```

## Tổng Kết
Quá trình làm NoSQL: **Hiểu UI cần hiện gì -> Thiết kế Collection chứa đủ dữ liệu cho UI đó -> Nhúng mảng nếu ít đổi (như Order Items) -> Cài đặt Rule chặn ghi bậy bạ -> Thiết lập Index để query nhanh.**
