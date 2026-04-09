# Spring Boot Backend Development Guide - ELC System

Tài liệu này hướng dẫn cách phát triển Backend bằng **Spring Boot** để làm việc hiệu quả với kiến trúc Database đã thiết kế.

## 1. Xác thực & Bảo mật (Spring Security)

- **Password Hashing**: Sử dụng `BCryptPasswordEncoder` (bean trong `SecurityConfig`) để mã hóa mật khẩu. Cột `password_hash` trong DB sẽ lưu trữ chuỗi này.
- **JWT Authentication**: Vì đây là Custom Backend, bạn nên triển khai `OncePerRequestFilter` để xác thực JWT Token từ Frontend.
- **RBAC**: Trạng thái `user_role` trong DB nên được map vào `GrantedAuthority` của Spring Security (ví dụ: `ROLE_MANAGER`, `ROLE_TEACHER`).

## 2. Java Persistence API (JPA) / Hibernate Mapping

### Ánh xạ kiểu dữ liệu (Data Mapping):
- **Enums**: Sử dụng `@Enumerated(EnumType.STRING)` cho tất cả các Enum (UserRole, CourseLevel, v.v.) để Hibernate lưu đúng giá trị chuỗi vào Postgres.
- **Currency (Tiền tệ)**: Luôn sử dụng `java.math.BigDecimal` cho các cột `DECIMAL(12,2)`. Tuyệt đối không dùng `Double`.
- **Date/Time**: Sử dụng `java.time.ZonedDateTime` hoặc `java.time.OffsetDateTime` cho các cột `TIMESTAMPTZ`.
- **UUID**: Sử dụng `java.util.UUID`. Hibernate sẽ tự động nhận diện kiểu này với Postgres.

### Xử lý JSONB (Equipment):
Để làm việc với cột `JSONB` trong Spring Boot, bạn nên thêm thư viện `hypersistence-utils` và sử dụng:
```java
@Type(JsonBinaryType.class)
@Column(columnDefinition = "jsonb")
private Map<String, Object> equipment;
```

## 3. Cấu hình Kết nối (application.yml)

Sử dụng **HikariCP** (mặc định của Spring Boot) để quản lý Connection Pool tới Supabase:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://[db-host]:5432/postgres
    username: postgres
    password: [your-db-password]
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      idle-timeout: 300000
      connection-timeout: 20000
```

## 4. Đặc điểm DB cần lưu ý trong code Java

- **Triggers**: DB đã có trigger tự đếm `current_students` trong bảng `classes` khi có records mới trong `enrollments`. Bạn không cần viết code đếm lại trong Service layer (nhưng cần `refresh` entity nếu muốn lấy giá trị mới nhất ngay lập tức).
- **Audit**: Database sẽ tự cập nhật `updated_at`. Tuy nhiên, bạn vẫn có thể dùng `@LastModifiedDate` của Spring Data JPA nếu muốn quản lý đồng bộ ở cả hai phía.
- **Constraint Violations**: Hãy sử dụng `@ControllerAdvice` để bắt các ngoại lệ `DataIntegrityViolationException`, đặc biệt là lỗi trùng Email (Unique Constraint).

## 5. Transaction Management

Sử dụng `@Transactional` của Spring cho các nghiệp vụ tài chính hoặc đăng ký lớp để đảm bảo tính nguyên tử (Atomicity). Ví dụ: Khi tạo một `Enrollment`, đồng thời phải tạo một `Invoice` tương ứng trong cùng một Transaction.