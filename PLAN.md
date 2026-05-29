# 📚 Mini Bookstore — Full-Stack Implementation Plan

## Tổng quan

Xây dựng ứng dụng **Mini Bookstore** full-stack hoàn chỉnh để apply intern:
- **Backend**: Spring Boot 3 + Spring Security + JWT + MySQL *(đã có nền tảng)*
- **Frontend**: React 18 + Vite + Tailwind CSS v3

---

## 🔍 Hiện trạng Backend

| ✅ Đã có | ❌ Còn thiếu / lỗi |
|---|---|
| JWT Auth (Register/Login) | CORS config → FE bị block |
| Book CRUD (partial) | `POST /api/books` thiếu phân quyền ADMIN |
| Order + OrderDetail | `userId` lấy từ body thay vì JWT (bảo mật kém) |
| Category entity | Không có CategoryController/Service |
| Pagination + Search | Global Exception Handler (lỗi trả về HTML) |
| Spring Security stateless | Validation (`@Valid`) chưa có |
| — | `imageUrl` cho Book chưa có |
| — | Swagger/OpenAPI chưa có |
| — | Unit tests gần như trống |

---

## 🗺️ Kế hoạch thực hiện

### Phase 1 — Fix & Hardening Backend

**Mục tiêu**: Backend sạch, bảo mật, sẵn sàng cho FE gọi

#### 1.1 CORS Configuration
#### [MODIFY] SecurityConfig.java  →  src/main/java/com/amigoscode/security/SecurityConfig.java
- Thêm `CorsConfigurationSource` bean
- Allow origin: `http://localhost:5173` (Vite dev server)
- Allow methods: GET, POST, PUT, DELETE
- Allow header: Authorization, Content-Type

#### 1.2 Fix phân quyền & Security
#### [MODIFY] SecurityConfig.java
- `POST/PUT/DELETE /api/books` → chỉ `ROLE_ADMIN`
- `POST /api/orders` → chỉ user đã login

#### [MODIFY] OrderController.java + OrderServiceImpl.java
- Lấy `userId` từ JWT token (`SecurityContextHolder.getContext().getAuthentication()`)
- Bỏ `userId` khỏi `OrderRequest`

#### 1.3 Global Exception Handler
#### [NEW] src/main/java/com/amigoscode/exception/GlobalExceptionHandler.java
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handle(...) { ... }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiError> handle(...) { ... }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handle(...) { ... }
}
```
#### [NEW] src/main/java/com/amigoscode/exception/ApiError.java
- Fields: `int status`, `String message`, `LocalDateTime timestamp`

#### 1.4 Validation
#### [MODIFY] src/main/java/com/amigoscode/dto/AuthRequest.java
- Thêm `@NotBlank` cho `username`, `password`

#### [MODIFY] src/main/java/com/amigoscode/controller/AuthController.java
- Thêm `@Valid` vào `@RequestBody AuthRequest`

#### 1.5 Book Image & Category API
#### [MODIFY] src/main/java/com/amigoscode/Entity/Book.java
- Thêm field: `private String imageUrl;`
- Thêm field: `private String description;`

#### [MODIFY] src/main/java/com/amigoscode/dto/BookResponse.java
- Thêm field: `imageUrl`, `description`

#### [MODIFY] src/main/java/com/amigoscode/service/impl/BookServiceImpl.java
- Map thêm 2 field mới vào `mapToBookResponse()`

#### [NEW] src/main/java/com/amigoscode/controller/CategoryController.java
- `GET /api/categories` — lấy all categories (public)

#### [NEW] src/main/java/com/amigoscode/service/CategoryService.java  (interface)
#### [NEW] src/main/java/com/amigoscode/service/impl/CategoryServiceImpl.java

#### 1.6 Refactor & Cleanup
#### [MOVE] controller/OrderHistoryResponse.java → dto/OrderHistoryResponse.java
#### [MOVE] controller/OrderItemResponse.java   → dto/OrderItemResponse.java
- Sửa lại các import trong `OrderController` và `OrderServiceImpl` sau khi move

#### 1.7 Swagger / OpenAPI
#### [MODIFY] pom.xml
- Thêm dependency:
```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.8.9</version>
</dependency>
```
#### [MODIFY] SecurityConfig.java
- Permit `/swagger-ui/**` và `/v3/api-docs/**`
- Test tại: http://localhost:8080/swagger-ui.html

#### 1.8 Book CRUD đầy đủ (cho Admin dùng)
#### [MODIFY] src/main/java/com/amigoscode/controller/BookController.java
- `GET  /api/books/{id}` — lấy chi tiết 1 sách
- `PUT  /api/books/{id}` — sửa thông tin sách (ADMIN only)
- `DELETE /api/books/{id}` — xóa sách (ADMIN only)

#### [MODIFY] src/main/java/com/amigoscode/service/BookService.java  (interface)
- Thêm: `BookResponse getBookById(Long id)`
- Thêm: `BookResponse updateBook(Long id, Book book)`
- Thêm: `void deleteBook(Long id)`

#### [MODIFY] src/main/java/com/amigoscode/service/impl/BookServiceImpl.java
- Implement 3 method mới trên

---

### Phase 2 — Build Frontend (React + Vite + Tailwind CSS v3)

**Vị trí**: `ticket-booking/frontend/`

#### 2.1 Setup Project
```bash
# Chạy trong thư mục ticket-booking/
npx create-vite@latest frontend -- --template react
cd frontend
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
npm install react-router-dom axios react-hot-toast
```

#### 2.2 Cấu trúc thư mục (đã tạo sẵn)
```
frontend/src/
├── api/
│   ├── axiosConfig.js       # Axios instance + interceptor tự gắn JWT vào header
│   ├── authApi.js           # login(), register()
│   ├── bookApi.js           # getBooks(), getBookById(), addBook(), updateBook(), deleteBook()
│   ├── categoryApi.js       # getCategories()
│   └── orderApi.js          # placeOrder(), getOrderHistory(), getAllOrders(), updateStatus()
│
├── components/
│   ├── Navbar.jsx            # Logo, nav links, cart icon badge, login/logout
│   ├── BookCard.jsx          # Ảnh bìa, tên, tác giả, giá, nút "Thêm giỏ"
│   ├── CartItem.jsx          # 1 dòng trong giỏ: ảnh nhỏ, tên, số lượng, subtotal
│   ├── Pagination.jsx        # Prev/Next + số trang
│   ├── SearchBar.jsx         # Input tìm kiếm có debounce
│   ├── CategoryFilter.jsx    # Danh sách nút lọc theo category
│   └── ProtectedRoute.jsx    # Wrapper check JWT trước khi vào trang
│
├── context/
│   ├── AuthContext.jsx        # Lưu JWT + thông tin user, hàm login/logout
│   └── CartContext.jsx        # Lưu giỏ hàng vào localStorage, addItem/removeItem/clear
│
├── pages/
│   ├── Home.jsx              # Grid sách + SearchBar + CategoryFilter + Pagination
│   ├── BookDetail.jsx        # Ảnh lớn, mô tả đầy đủ, nút Thêm giỏ hàng
│   ├── Cart.jsx              # Danh sách CartItem, tổng tiền, nút Đặt hàng
│   ├── Login.jsx             # Form email + password, redirect sau login
│   ├── Register.jsx          # Form username + password
│   ├── OrderHistory.jsx      # Danh sách đơn hàng của user đang login
│   └── admin/
│       ├── AdminLayout.jsx   # Sidebar + outlet cho admin pages
│       ├── ManageBooks.jsx   # Bảng sách + Modal thêm/sửa + nút xóa
│       └── ManageOrders.jsx  # Bảng đơn hàng + dropdown cập nhật status
│
├── App.jsx                   # Khai báo toàn bộ Routes
└── main.jsx                  # Bọc AuthProvider + CartProvider + Router
```

#### 2.3 Các trang & route

| Trang | Route | Cần login? | Ghi chú |
|---|---|---|---|
| Trang chủ | `/` | ❌ | Grid sách, search, filter |
| Chi tiết sách | `/books/:id` | ❌ | Ảnh, mô tả, thêm giỏ |
| Giỏ hàng | `/cart` | ✅ | Chỉnh số lượng, đặt hàng |
| Đăng nhập | `/login` | ❌ | |
| Đăng ký | `/register` | ❌ | |
| Lịch sử đơn | `/orders` | ✅ | |
| Admin - Sách | `/admin/books` | ✅ ADMIN | CRUD sách |
| Admin - Đơn hàng | `/admin/orders` | ✅ ADMIN | Xem + cập nhật status |

#### 2.4 axiosConfig.js — quan trọng
```js
// Interceptor tự động gắn token vào mọi request
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
```

#### 2.5 AuthContext.jsx — lưu ý
```js
// Sau khi login thành công:
localStorage.setItem('token', response.data.token);
// Decode JWT để lấy role (dùng thư viện jwt-decode)
// Lưu { username, role } vào state
```

#### 2.6 Design System (Tailwind)
```
Màu chủ đạo:
- Primary:    amber-500 / amber-600
- Background: slate-900 / slate-800  (dark mode)
- Card:       slate-800, border slate-700
- Text:       white / slate-300
- Accent:     amber-400

Font: 'Inter' từ Google Fonts (thêm vào index.html)
```

---

### Phase 3 — Admin Panel

**Chỉ ROLE_ADMIN mới truy cập được** (check trong `ProtectedRoute.jsx`)

#### 3.1 ManageBooks.jsx
- Bảng: tên | tác giả | giá | tồn kho | category | actions
- Nút **Thêm** → mở Modal (form trống)
- Nút **Sửa** → mở Modal (form điền sẵn data)
- Nút **Xóa** → confirm dialog → gọi `DELETE /api/books/{id}`

#### 3.2 ManageOrders.jsx
- Bảng: id | user | ngày đặt | tổng tiền | status | actions
- Dropdown cập nhật status: `Pending → Processing → Shipped → Delivered`

#### Backend cần thêm cho Phase 3:
#### [NEW] `GET /api/orders/all`  (ADMIN only) — xem tất cả đơn hàng
#### [NEW] `PATCH /api/orders/{id}/status`  (ADMIN only) — cập nhật trạng thái

---

### Phase 4 — Deploy lên Cloud

#### Backend → Railway
1. Push code lên GitHub
2. Tạo project trên [railway.app](https://railway.app)
3. Add service: **MySQL** + **Spring Boot** (từ GitHub repo)
4. Set environment variables:

```
SPRING_DATASOURCE_URL=jdbc:mysql://<host>:<port>/<db>
SPRING_DATASOURCE_USERNAME=...
SPRING_DATASOURCE_PASSWORD=...
```

5. Tạo file `src/main/resources/application-prod.properties`:
```properties
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
spring.jpa.hibernate.ddl-auto=update
```

#### Frontend → Vercel
1. Push `frontend/` lên GitHub (có thể cùng repo, subfolder)
2. Import vào [vercel.com](https://vercel.com), chỉ root directory là `frontend/`
3. Set environment variable:
```
VITE_API_URL=https://<tên-app>.railway.app
```
4. Trong `axiosConfig.js`:
```js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
```

---

## 📊 Tech Stack tổng thể

```
┌────────────────────────────────────────────┐
│              FRONTEND                      │
│   React 18 + Vite + Tailwind CSS v3       │
│   React Router v6 | Axios | Context API   │
│   Deploy: Vercel  (localhost:5173 dev)    │
└─────────────────┬──────────────────────────┘
                  │  REST API / JSON
                  │  Authorization: Bearer <JWT>
┌─────────────────▼──────────────────────────┐
│              BACKEND                       │
│   Spring Boot 3 + Spring Security 6       │
│   JWT (jjwt 0.11.5) | Lombok | JPA       │
│   Swagger UI (springdoc-openapi)          │
│   Deploy: Railway  (localhost:8080 dev)   │
└─────────────────┬──────────────────────────┘
                  │  JPA / Hibernate ORM
┌─────────────────▼──────────────────────────┐
│              DATABASE                      │
│   MySQL 8                                  │
│   (local dev / Railway prod)              │
└────────────────────────────────────────────┘
```

---

## 📋 Thứ tự ưu tiên

| # | Việc cần làm | Mức độ |
|---|---|---|
| 1 | Fix CORS trong SecurityConfig | 🔴 Critical |
| 2 | GlobalExceptionHandler + ApiError | 🔴 Critical |
| 3 | Fix lấy userId từ JWT trong Order | 🔴 Critical |
| 4 | Phân quyền ADMIN cho Book CRUD | 🔴 Critical |
| 5 | FE: Setup project + axiosConfig + Context | 🟠 High |
| 6 | FE: Login / Register | 🟠 High |
| 7 | FE: Trang chủ danh sách sách | 🟠 High |
| 8 | FE: Giỏ hàng + Đặt hàng | 🟠 High |
| 9 | CategoryController + FE filter category | 🟡 Medium |
| 10 | FE: Lịch sử đơn hàng | 🟡 Medium |
| 11 | Book thêm imageUrl + description | 🟡 Medium |
| 12 | Admin Panel (CRUD sách + đơn hàng) | 🟡 Medium |
| 13 | Validation @Valid + @NotBlank | 🟡 Medium |
| 14 | Swagger UI | 🟢 Nice-to-have |
| 15 | Deploy Railway + Vercel | 🟢 Nice-to-have |
| 16 | Unit Tests | 🟢 Nice-to-have |
