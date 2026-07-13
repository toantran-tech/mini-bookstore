-- Payment callbacks use this reference as their idempotency key.
-- Legacy databases baselined at V1 may not have the column yet, while new
-- databases created by V1 already do. Add/normalize it for both cases.
SET @vnpay_column_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'orders'
      AND column_name = 'vnpay_txn_ref'
);

SET @vnpay_column_sql = IF(
    @vnpay_column_exists = 0,
    'ALTER TABLE orders ADD COLUMN vnpay_txn_ref VARCHAR(100) NULL',
    'ALTER TABLE orders MODIFY COLUMN vnpay_txn_ref VARCHAR(100) NULL'
);

PREPARE vnpay_column_statement FROM @vnpay_column_sql;
EXECUTE vnpay_column_statement;
DEALLOCATE PREPARE vnpay_column_statement;

SET @vnpay_unique_index_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'orders'
      AND column_name = 'vnpay_txn_ref'
      AND non_unique = 0
);

SET @vnpay_unique_index_sql = IF(
    @vnpay_unique_index_exists = 0,
    'ALTER TABLE orders ADD CONSTRAINT uq_orders_vnpay_txn_ref UNIQUE (vnpay_txn_ref)',
    'SELECT 1'
);

PREPARE vnpay_unique_index_statement FROM @vnpay_unique_index_sql;
EXECUTE vnpay_unique_index_statement;
DEALLOCATE PREPARE vnpay_unique_index_statement;
