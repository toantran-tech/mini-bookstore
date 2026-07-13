-- Baseline schema for a new Mini Bookstore MySQL database.
-- Existing non-empty databases are baselined at version 1 and start with V2.

CREATE TABLE category (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NULL,
    full_name VARCHAR(255) NULL,
    phone VARCHAR(255) NULL,
    address VARCHAR(255) NULL,
    avatar_url LONGTEXT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_users_username UNIQUE (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE book (
    id BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(255) NULL,
    price DOUBLE NOT NULL,
    category_id BIGINT NULL,
    stock INT NOT NULL,
    image_url VARCHAR(255) NULL,
    description TEXT NULL,
    sold_count INT NOT NULL DEFAULT 0,
    view_count INT NOT NULL DEFAULT 0,
    image_urls TEXT NULL,
    created_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_book_isbn UNIQUE (isbn),
    CONSTRAINT fk_book_category
        FOREIGN KEY (category_id) REFERENCES category (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE coupons (
    id BIGINT NOT NULL AUTO_INCREMENT,
    code VARCHAR(255) NOT NULL,
    discount_type VARCHAR(255) NULL,
    discount_value DOUBLE NOT NULL,
    min_order_value DOUBLE NOT NULL,
    max_discount DOUBLE NOT NULL,
    max_usage INT NOT NULL,
    used_count INT NOT NULL,
    expires_at DATETIME(6) NULL,
    active BIT(1) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_coupons_code UNIQUE (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE orders (
    id BIGINT NOT NULL AUTO_INCREMENT,
    order_date DATETIME(6) NULL,
    status VARCHAR(255) NULL,
    user_id BIGINT NULL,
    shipping_address VARCHAR(255) NULL,
    shipping_method VARCHAR(255) NULL,
    coupon_code VARCHAR(255) NULL,
    discount_amount DOUBLE NOT NULL,
    subtotal DOUBLE NOT NULL,
    total_amount DOUBLE NOT NULL,
    shipping_fee DOUBLE NOT NULL,
    payment_method VARCHAR(255) NULL,
    payment_status VARCHAR(255) NULL,
    vnpay_txn_ref VARCHAR(100) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE order_detail (
    id BIGINT NOT NULL AUTO_INCREMENT,
    order_id BIGINT NULL,
    book_id BIGINT NULL,
    quantity INT NOT NULL,
    price DOUBLE NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_order_detail_order
        FOREIGN KEY (order_id) REFERENCES orders (id),
    CONSTRAINT fk_order_detail_book
        FOREIGN KEY (book_id) REFERENCES book (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cart (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_cart_user UNIQUE (user_id),
    CONSTRAINT fk_cart_user
        FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cart_item (
    id BIGINT NOT NULL AUTO_INCREMENT,
    cart_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    quantity INT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_cart_item_cart
        FOREIGN KEY (cart_id) REFERENCES cart (id),
    CONSTRAINT fk_cart_item_book
        FOREIGN KEY (book_id) REFERENCES book (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reviews (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    rating INT NOT NULL,
    comment TEXT NULL,
    created_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_reviews_user
        FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_reviews_book
        FOREIGN KEY (book_id) REFERENCES book (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE refresh_tokens (
    id BIGINT NOT NULL AUTO_INCREMENT,
    token VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    revoked BIT(1) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_refresh_tokens_token UNIQUE (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_favorite_books (
    user_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    CONSTRAINT fk_favorite_books_user
        FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_favorite_books_book
        FOREIGN KEY (book_id) REFERENCES book (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;