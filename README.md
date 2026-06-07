<br/>
<div align="center">
  <h1 align="center">📚 Mini Bookstore E-Commerce</h1>
  <p align="center">
    A full-stack modern E-Commerce web application built with <strong>Spring Boot 3</strong> & <strong>React (Vite)</strong>.
    <br/>
    Features robust JWT authentication, advanced search algorithms, cart management, and an interactive admin dashboard.
  </p>
</div>

## ✨ Features

### 🛍️ Customer Experience
- **Authentication:** Secure Login/Register with JWT. Registration includes **Email OTP Verification**.
- **Product Browsing:** Infinite scroll and lazy-loaded images.
- **Advanced Search:** Multi-criteria filtering by **ISBN, Author, Category, and Price Range**.
- **Shopping Cart & Checkout:** Real-time total calculation with **Discount Coupons** support.
- **Order Tracking:** Track order status and receive **Email Confirmations** after checkout.
- **Reviews & Ratings:** Users can rate and review books they have successfully purchased.
- **Wishlist:** Save favorite books for later.

### 🛡️ Admin Dashboard (Role-based Access)
- **Visual Analytics:** Interactive charts (using *Recharts*) for Monthly Revenue, Orders by Status, and Top-Selling Books.
- **Inventory Management:** Full CRUD operations for Books, Categories, and Coupons.
- **Order Processing:** Update order statuses (Pending -> Processing -> Shipped -> Delivered) with automated system updates.

### ⚡ Performance & Security
- **Caching:** API routes like `/top-books` and `/categories` are aggressively cached via **Spring Cache (ConcurrentMapCache/Redis)** for `<10ms` response times.
- **Security:** CSRF & CORS protected. Passwords hashed using `BCrypt`. JWT stored in HttpOnly cookies/Local storage. No recursive JSON serialization (Circular Reference handled via `@JsonIgnore`).

---

## 💻 Tech Stack

**Frontend:**
- React 19 (Vite)
- Tailwind CSS 4
- React Router v7
- Recharts (Analytics)
- Lucide React (Icons)
- Axios (API Client)

**Backend:**
- Java 17 + Spring Boot 3.4
- Spring Security + JWT (jjwt)
- Spring Data JPA (Hibernate)
- Spring Mail (Thymeleaf Templates)
- Spring Cache
- MySQL 9.x Database

---

## 🚀 Getting Started

### Prerequisites
- JDK 17+
- Node.js 18+
- MySQL Server 8+

### 1. Database Setup
Create a new MySQL database named `mini_bookstore`.
```sql
CREATE DATABASE mini_bookstore;
```

### 2. Backend Setup
Navigate to the root directory and update your `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/mini_bookstore
spring.datasource.username=root
spring.datasource.password=your_password
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
```
Run the Spring Boot application:
```bash
mvn spring-boot:run
```
*(Hibernate will automatically generate all tables via `ddl-auto=update`)*

### 3. Frontend Setup
Open a new terminal and navigate to the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```
Access the application at `http://localhost:5173`.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
