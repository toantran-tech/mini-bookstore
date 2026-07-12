<div align="center">
  <h1>📚 Mini Bookstore E-Commerce</h1>
  <p>A full-stack e-commerce application built with Spring Boot 3 and React (Vite).</p>
</div>

## Features

### Customer experience

- JWT authentication with email OTP registration and refresh-token revocation.
- Book browsing, infinite scroll, lazy-loaded images and multi-criteria search.
- Cart, checkout, discount coupons and VNPay sandbox payments.
- Order history with email confirmations and real-time status notifications.
- Reviews, ratings and wishlist.

### Admin dashboard

- Revenue, order-status and top-selling-book charts.
- Book, category, coupon and user management.
- Role-protected order processing and inventory management.

### Performance and security

- Spring Cache is used for top-book and category queries with invalidation after updates.
- Passwords are hashed with BCrypt and protected endpoints use Spring Security authorization.
- HTTP and WebSocket origins are restricted through the `FRONTEND_URL` allowlist.
- Access and refresh tokens are currently stored in browser local storage. CSRF is disabled because authentication uses the `Authorization` header; hardening token storage against XSS remains future work.
- Auth endpoints are rate-limited per IP in each application instance.

## Tech stack

**Frontend:** React 19, Vite, Tailwind CSS 4, Redux Toolkit, React Router, Recharts, Axios, STOMP/WebSocket.

**Backend:** Java 17, Spring Boot 3.4, Spring Security, Spring Data JPA, MySQL, Spring Mail, Spring Cache, Bucket4j and Cloudinary.

## Getting started

### Prerequisites

- JDK 17+
- Node.js 20+
- MySQL 8+

### 1. Database

```sql
CREATE DATABASE minibookstore;
```

### 2. Environment variables

The repository intentionally contains no production credentials. Copy the variable names from `.env.example` into your IDE/run configuration or operating-system environment.

Required backend variables:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` | MySQL connection |
| `JWT_SECRET` | JWT signing key; use a random secret of at least 32 bytes |
| `FRONTEND_URL` | Comma-separated trusted origins, for example `http://localhost:5173` |
| `MAIL_USERNAME`, `MAIL_PASSWORD` | SMTP credentials for OTP/order email |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Image storage |
| `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`, `VNPAY_RETURN_URL`, `FRONTEND_PAYMENT_RETURN_URL` | VNPay sandbox callback and verified-result redirect |

Never commit a populated `.env` file or real credentials.

### 3. Backend

```bash
mvn spring-boot:run
```

Swagger UI is available at `http://localhost:8080/swagger-ui/index.html`.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Tests

```bash
mvn test
cd frontend
npm run build
```

The current database schema is created by Hibernate with `ddl-auto=update`; versioned migrations are planned before production use.