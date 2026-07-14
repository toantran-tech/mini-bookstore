-- Bring databases created before Flyway in line with the current entity model.
-- Fresh databases already contain these columns and tables through V1, so each
-- operation must also be safe when the schema is already current.
SET @payment_method_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'orders'
      AND column_name = 'payment_method'
);

SET @payment_method_sql = IF(
    @payment_method_exists = 0,
    'ALTER TABLE orders ADD COLUMN payment_method VARCHAR(255) NULL',
    'SELECT 1'
);

PREPARE payment_method_statement FROM @payment_method_sql;
EXECUTE payment_method_statement;
DEALLOCATE PREPARE payment_method_statement;

SET @payment_status_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'orders'
      AND column_name = 'payment_status'
);

SET @payment_status_sql = IF(
    @payment_status_exists = 0,
    'ALTER TABLE orders ADD COLUMN payment_status VARCHAR(255) NULL',
    'SELECT 1'
);

PREPARE payment_status_statement FROM @payment_status_sql;
EXECUTE payment_status_statement;
DEALLOCATE PREPARE payment_status_statement;

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT NOT NULL AUTO_INCREMENT,
    token VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    revoked BIT(1) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_refresh_tokens_token UNIQUE (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_favorite_books (
    user_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, book_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
